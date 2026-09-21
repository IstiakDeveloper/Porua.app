<?php

namespace App\Http\Controllers\Library;

use App\Http\Controllers\Controller;
use App\Models\BookIssue;
use App\Models\Book;
use App\Models\Student;
use App\Models\Teacher;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class BookIssueController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('manage_library');

        $issues = BookIssue::with(['book', 'student.user', 'teacher.user', 'issuer'])
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->when($request->borrower_type, fn($q) => $q->where('borrower_type', $request->borrower_type))
            ->latest('issue_date')
            ->paginate(20)->withQueryString();

        return Inertia::render('Library/Issues/Index', [
            'issues' => $issues,
            'filters' => $request->only(['status', 'borrower_type']),
        ]);
    }

    public function create()
    {
        $this->authorize('manage_library');

        return Inertia::render('Library/Issues/Create', [
            'books' => Book::where('status', 'available')->where('available_copies', '>', 0)->get(),
            'students' => Student::with('user')->where('status', 'active')->get(),
            'teachers' => Teacher::with('user')->where('status', 'active')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $this->authorize('manage_library');

        $validated = $request->validate([
            'book_id' => 'required|exists:books,id',
            'borrower_type' => 'required|in:student,teacher',
            'borrower_id' => 'required|integer',
            'issue_date' => 'required|date',
            'due_date' => 'required|date|after:issue_date',
            'remarks' => 'nullable|string',
        ]);

        DB::beginTransaction();
        try {
            $book = Book::findOrFail($validated['book_id']);

            if ($book->available_copies <= 0) {
                return back()->withInput()->with('error', 'Book is not available for issue');
            }

            // Verify borrower exists
            $borrowerModel = $validated['borrower_type'] === 'student' ? Student::class : Teacher::class;
            if (!$borrowerModel::find($validated['borrower_id'])) {
                return back()->withInput()->with('error', 'Borrower not found');
            }

            $issue = BookIssue::create([
                'book_id' => $validated['book_id'],
                'issueable_type' => $borrowerModel,
                'issueable_id' => $validated['borrower_id'],
                'issue_date' => $validated['issue_date'],
                'due_date' => $validated['due_date'],
                'remarks' => $validated['remarks'],
                'status' => 'issued',
                'issued_by' => auth()->id(),
            ]);

            // Decrease available quantity
            $book->decrement('available_copies');

            DB::commit();

            logActivity('create', "Issued book: {$book->title}", BookIssue::class, $issue->id);

            return redirect()->route('book-issues.index')
                ->with('success', 'Book issued successfully');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withInput()->with('error', 'Failed to issue book: ' . $e->getMessage());
        }
    }

    public function return(Request $request, BookIssue $bookIssue)
    {
        $this->authorize('manage_library');

        $validated = $request->validate([
            'return_date' => 'required|date',
            'fine_amount' => 'nullable|numeric|min:0',
            'condition' => 'nullable|in:good,damaged,lost',
            'return_remarks' => 'nullable|string',
        ]);

        DB::beginTransaction();
        try {
            $bookIssue->update([
                'return_date' => $validated['return_date'],
                'fine_amount' => $validated['fine_amount'] ?? 0,
                'condition' => $validated['condition'] ?? 'good',
                'return_remarks' => $validated['return_remarks'],
                'status' => 'returned',
            ]);

            // Increase available quantity
            $bookIssue->book->increment('available_copies');

            DB::commit();

            logActivity('update', "Returned book: {$bookIssue->book->title}", BookIssue::class, $bookIssue->id);

            return back()->with('success', 'Book returned successfully');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Failed to return book: ' . $e->getMessage());
        }
    }

    public function show(BookIssue $bookIssue)
    {
        $this->authorize('manage_library');

        $bookIssue->load(['book', 'student.user', 'teacher.user', 'issuer']);

        return Inertia::render('Library/Issues/Show', [
            'issue' => $bookIssue,
        ]);
    }

    public function destroy(BookIssue $bookIssue)
    {
        $this->authorize('manage_library');

        if ($bookIssue->status === 'issued') {
            // Increase available quantity if deleting an active issue
            $bookIssue->book->increment('available_copies');
        }

        $bookIssue->delete();

        logActivity('delete', "Deleted book issue", BookIssue::class, $bookIssue->id);

        return redirect()->route('book-issues.index')
            ->with('success', 'Book issue deleted successfully');
    }

    public function overdueBooks()
    {
        $this->authorize('manage_library');

        $issues = BookIssue::with(['book', 'student.user', 'teacher.user'])
            ->where('status', 'issued')
            ->where('due_date', '<', now())
            ->latest('due_date')
            ->paginate(50)->withQueryString();

        return Inertia::render('Library/Issues/Overdue', [
            'issues' => $issues,
        ]);
    }
}
