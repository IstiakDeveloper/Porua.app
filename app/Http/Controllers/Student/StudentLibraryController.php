<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use App\Models\Student;
use App\Models\Book;
use App\Models\BookIssue;
use Carbon\Carbon;

class StudentLibraryController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $student = Student::where('user_id', $user->id)->firstOrFail();

        // Get all issued books (both current and returned)
        $allBookIssues = BookIssue::with('book')
            ->where('issueable_type', Student::class)
            ->where('issueable_id', $student->id)
            ->orderBy('issue_date', 'desc')
            ->get()
            ->map(function($issue) {
                $isOverdue = $issue->status === 'issued' && Carbon::parse($issue->due_date)->isPast();
                $daysOverdue = $isOverdue ? Carbon::parse($issue->due_date)->diffInDays(Carbon::now()) : 0;

                return [
                    'id' => $issue->id,
                    'book_title' => $issue->book->title ?? 'N/A',
                    'book_author' => $issue->book->author ?? 'N/A',
                    'isbn' => $issue->book->isbn ?? 'N/A',
                    'accession_number' => $issue->book->accession_number ?? 'N/A',
                    'issue_date' => $issue->issue_date?->format('d M Y'),
                    'due_date' => $issue->due_date?->format('d M Y'),
                    'return_date' => $issue->return_date?->format('d M Y'),
                    'fine_amount' => $issue->fine_amount ?? 0,
                    'status' => $issue->status,
                    'is_overdue' => $isOverdue,
                    'days_overdue' => $daysOverdue,
                ];
            });

        // Calculate statistics
        $totalIssued = $allBookIssues->where('status', 'issued')->count();
        $totalReturned = $allBookIssues->where('status', 'returned')->count();
        $totalOverdue = $allBookIssues->where('is_overdue', true)->count();
        $totalFine = $allBookIssues->where('status', 'issued')->sum('fine_amount');

        // Calculate statistics
        $totalIssued = $allBookIssues->where('status', 'issued')->count();
        $totalReturned = $allBookIssues->where('status', 'returned')->count();
        $totalOverdue = $allBookIssues->where('is_overdue', true)->count();
        $totalFine = $allBookIssues->where('status', 'issued')->sum('fine_amount');

        return Inertia::render('Student/Library/Index', [
            'student' => [
                'id' => $student->id,
                'full_name' => $student->full_name,
                'class_name' => $student->schoolClass->name ?? 'N/A',
                'section_name' => $student->section->name ?? 'N/A',
                'roll_number' => $student->roll_number,
            ],
            'issuedBooks' => $allBookIssues,
            'summary' => [
                'currently_issued' => $totalIssued,
                'total_returned' => $totalReturned,
                'overdue_count' => $totalOverdue,
                'total_fines' => round($totalFine, 2),
            ],
        ]);
    }

    public function books(Request $request)
    {
        // Search available books in library
        $search = $request->input('search');

        $books = Book::where('status', 'available')
            ->when($search, function($query, $search) {
                $query->where('title', 'like', "%{$search}%")
                    ->orWhere('author', 'like', "%{$search}%")
                    ->orWhere('isbn', 'like', "%{$search}%");
            })
            ->orderBy('title', 'asc')
            ->paginate(20)->withQueryString()
            ->through(function($book) {
                return [
                    'id' => $book->id,
                    'title' => $book->title,
                    'author' => $book->author,
                    'isbn' => $book->isbn,
                    'publisher' => $book->publisher,
                    'category' => $book->category,
                    'total_copies' => $book->total_copies,
                    'available_copies' => $book->available_copies,
                    'shelf_location' => $book->shelf_location,
                ];
            });

        $user = Auth::user();
        $student = Student::where('user_id', $user->id)->firstOrFail();

        return Inertia::render('Student/Library/Books', [
            'student' => [
                'id' => $student->id,
                'full_name' => $student->full_name,
            ],
            'books' => $books,
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    public function issued()
    {
        $user = Auth::user();
        $student = Student::where('user_id', $user->id)->firstOrFail();

        // Get all issued books (current + history)
        $allIssued = BookIssue::with('book')
            ->where('issueable_type', Student::class)
            ->where('issueable_id', $student->id)
            ->orderBy('issue_date', 'desc')
            ->get()
            ->map(function($issue) {
                $isReturned = $issue->status === 'returned';
                $isOverdue = !$isReturned && Carbon::parse($issue->due_date)->isPast();

                return [
                    'id' => $issue->id,
                    'book_title' => $issue->book->title ?? 'N/A',
                    'book_author' => $issue->book->author ?? 'N/A',
                    'book_isbn' => $issue->book->isbn ?? 'N/A',
                    'issue_date' => $issue->issue_date?->format('d M Y'),
                    'due_date' => $issue->due_date?->format('d M Y'),
                    'returned_at' => $issue->return_date?->format('d M Y'),
                    'is_returned' => $isReturned,
                    'is_overdue' => $isOverdue,
                    'fine_amount' => $issue->fine_amount,
                    'fine_paid' => $issue->fine_paid,
                ];
            });

        return Inertia::render('Student/Library/Issued', [
            'student' => [
                'id' => $student->id,
                'full_name' => $student->full_name,
            ],
            'books' => $allIssued,
        ]);
    }
}
