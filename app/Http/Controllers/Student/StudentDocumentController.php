<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\StudentDocument;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class StudentDocumentController extends Controller
{
    public function index(Student $student)
    {
        $this->authorize('view_students');

        $documents = StudentDocument::where('student_id', $student->id)
            ->latest()
            ->get()
            ->map(function ($doc) {
                $doc->file_path = asset('storage/' . $doc->file_path);
                return $doc;
            });

        return Inertia::render('Students/Documents/Index', [
            'student' => $student,
            'documents' => $documents,
        ]);
    }

    public function store(Request $request, Student $student)
    {
        $this->authorize('edit_students');

        $validated = $request->validate([
            'document_type' => 'required|string|max:100',
            'file' => 'required|file|max:10240',
            'title' => 'nullable|string|max:255',
        ]);

        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $path = $file->store('student-documents', 'public');

            StudentDocument::create([
                'student_id' => $student->id,
                'type' => $validated['document_type'],
                'title' => $validated['title'] ?? $file->getClientOriginalName(),
                'file_path' => $path,
                'file_name' => $file->getClientOriginalName(),
                'file_size' => round($file->getSize() / 1024), // Convert to KB
                'file_type' => $file->getClientOriginalExtension(),
                'uploaded_by' => auth()->id(),
            ]);

            logActivity('create', "Uploaded document for student: {$student->user->name}", StudentDocument::class, $student->id);

            return back()->with('success', 'Document uploaded successfully');
        }

        return back()->with('error', 'File upload failed');
    }

    public function destroy(StudentDocument $studentDocument)
    {
        $this->authorize('delete_students');

        if (Storage::disk('public')->exists($studentDocument->file_path)) {
            Storage::disk('public')->delete($studentDocument->file_path);
        }

        $studentDocument->delete();

        logActivity('delete', "Deleted document: {$studentDocument->title}", StudentDocument::class, $studentDocument->id);

        return back()->with('success', 'Document deleted successfully');
    }

    public function download(StudentDocument $studentDocument)
    {
        $this->authorize('view_students');

        if (!Storage::disk('public')->exists($studentDocument->file_path)) {
            return back()->with('error', 'File not found');
        }

        return response()->download(storage_path('app/public/' . $studentDocument->file_path), $studentDocument->file_name);
    }
}
