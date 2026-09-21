<?php

namespace App\Http\Controllers\Library;

use App\Http\Controllers\Controller;
use App\Models\Book;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BookController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('manage_library');

        $books = Book::query()
            ->when($request->search, fn($q) => $q->where('title', 'like', "%{$request->search}%")
                ->orWhere('author', 'like', "%{$request->search}%")
                ->orWhere('isbn', 'like', "%{$request->search}%"))
            ->when($request->category, fn($q) => $q->where('category', $request->category))
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->latest()
            ->paginate(20)->withQueryString();

        return Inertia::render('Library/Books/Index', [
            'books' => $books,
            'filters' => $request->only(['search', 'category', 'status']),
        ]);
    }

    public function create()
    {
        $this->authorize('manage_library');

        return Inertia::render('Library/Books/Create');
    }

    public function store(Request $request)
    {
        $this->authorize('manage_library');

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'author' => 'required|string|max:255',
            'isbn' => 'required|string|max:50|unique:books',
            'publisher' => 'nullable|string|max:255',
            'publication_year' => 'nullable|integer|min:1900|max:' . date('Y'),
            'category' => 'required|string|max:100',
            'quantity' => 'required|integer|min:1',
            'available_quantity' => 'required|integer|min:0|lte:quantity',
            'price' => 'nullable|numeric|min:0',
            'shelf_location' => 'nullable|string|max:100',
            'description' => 'nullable|string',
            'status' => 'required|in:available,unavailable,damaged',
        ]);

        // Map quantity fields to database column names
        $validated['total_copies'] = $validated['quantity'];
        $validated['available_copies'] = $validated['available_quantity'];
        unset($validated['quantity'], $validated['available_quantity']);

        $book = Book::create($validated);

        logActivity('create', "Added book: {$book->title}", Book::class, $book->id);

        return redirect()->route('books.index')
            ->with('success', 'Book added successfully');
    }

    public function show(Book $book)
    {
        $this->authorize('manage_library');

        $book->load(['issues' => fn($q) => $q->with(['issuer', 'student.user', 'teacher.user'])->latest()]);

        return Inertia::render('Library/Books/Show', [
            'book' => $book,
        ]);
    }

    public function edit(Book $book)
    {
        $this->authorize('manage_library');

        return Inertia::render('Library/Books/Edit', [
            'book' => $book,
        ]);
    }

    public function update(Request $request, Book $book)
    {
        $this->authorize('manage_library');

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'author' => 'required|string|max:255',
            'isbn' => 'required|string|max:50|unique:books,isbn,' . $book->id,
            'publisher' => 'nullable|string|max:255',
            'publication_year' => 'nullable|integer|min:1900|max:' . date('Y'),
            'category' => 'required|string|max:100',
            'quantity' => 'required|integer|min:1',
            'available_quantity' => 'required|integer|min:0|lte:quantity',
            'price' => 'nullable|numeric|min:0',
            'shelf_location' => 'nullable|string|max:100',
            'description' => 'nullable|string',
            'status' => 'required|in:available,unavailable,damaged',
        ]);
        // Map quantity fields to database column names
        $validated['total_copies'] = $validated['quantity'];
        $validated['available_copies'] = $validated['available_quantity'];
        unset($validated['quantity'], $validated['available_quantity']);
        $book->update($validated);

        logActivity('update', "Updated book: {$book->title}", Book::class, $book->id);

        return redirect()->route('books.index')
            ->with('success', 'Book updated successfully');
    }

    public function destroy(Book $book)
    {
        $this->authorize('manage_library');

        if ($book->issues()->where('status', 'issued')->count() > 0) {
            return back()->with('error', 'Cannot delete book with active issues');
        }

        $bookTitle = $book->title;
        $book->delete();

        logActivity('delete', "Deleted book: {$bookTitle}", Book::class, $book->id);

        return redirect()->route('books.index')
            ->with('success', 'Book deleted successfully');
    }
}
