<?php

namespace App\Http\Controllers\Academic;

use App\Http\Controllers\Controller;
use App\Models\Subject;
use App\Models\SchoolClass;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SubjectController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('view_subjects');

        $subjects = Subject::withCount('classes')
            ->when($request->search, fn($q) => $q->where('name', 'like', "%{$request->search}%"))
            ->when($request->type, fn($q) => $q->where('type', $request->type))
            ->latest()
            ->paginate(20)->withQueryString();

        return Inertia::render('Academic/Subjects/Index', [
            'subjects' => $subjects,
            'filters' => $request->only(['search', 'type']),
        ]);
    }

    public function create()
    {
        $this->authorize('create_subjects');

        return Inertia::render('Academic/Subjects/Create', [
            'classes' => SchoolClass::where('status', 'active')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $this->authorize('create_subjects');

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'name_bengali' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:subjects',
            'type' => 'required|in:theory,practical,both',
            'total_marks' => 'required|integer|min:1',
            'pass_marks' => 'required|integer|min:1',
            'description' => 'nullable|string',
            'status' => 'required|in:active,inactive',
            'classes' => 'array',
            'classes.*' => 'exists:classes,id',
        ]);

        $classes = $validated['classes'] ?? [];
        unset($validated['classes']);

        $subject = Subject::create($validated);

        if (!empty($classes)) {
            $subject->classes()->sync($classes);
        }

        logActivity('create', "Created subject: {$subject->name}", Subject::class, $subject->id);

        return redirect()->route('subjects.index')
            ->with('success', 'Subject created successfully');
    }

    public function show(Subject $subject)
    {
        $this->authorize('view_subjects');

        $subject->loadCount('classes');
        $subject->load([
            'classes',
            'teachers.teacher.user'
        ]);

        // Transform teachers data to include teacher details
        $teachers = $subject->teachers->map(function($teacherSubject) {
            return [
                'id' => $teacherSubject->teacher->id,
                'name' => $teacherSubject->teacher->user->name ?? 'N/A',
                'email' => $teacherSubject->teacher->user->email ?? 'N/A',
                'phone' => $teacherSubject->teacher->phone ?? 'N/A',
            ];
        })->unique('id')->values();

        $subject->setRelation('teachers', $teachers);

        return Inertia::render('Academic/Subjects/Show', [
            'subject' => $subject,
        ]);
    }

    public function edit(Subject $subject)
    {
        $this->authorize('edit_subjects');

        $subject->load('classes');

        return Inertia::render('Academic/Subjects/Edit', [
            'subject' => $subject,
            'classes' => SchoolClass::where('status', 'active')->get(),
        ]);
    }

    public function update(Request $request, Subject $subject)
    {
        $this->authorize('edit_subjects');

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'name_bengali' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:subjects,code,' . $subject->id,
            'type' => 'required|in:theory,practical,both',
            'total_marks' => 'required|integer|min:1',
            'pass_marks' => 'required|integer|min:1',
            'description' => 'nullable|string',
            'status' => 'required|in:active,inactive',
            'classes' => 'array',
            'classes.*' => 'exists:classes,id',
        ]);

        $classes = $validated['classes'] ?? [];
        unset($validated['classes']);

        $subject->update($validated);
        $subject->classes()->sync($classes);

        logActivity('update', "Updated subject: {$subject->name}", Subject::class, $subject->id);

        return redirect()->route('subjects.index')
            ->with('success', 'Subject updated successfully');
    }

    public function destroy(Subject $subject)
    {
        $this->authorize('delete_subjects');

        if ($subject->teachers()->count() > 0) {
            return back()->with('error', 'Cannot delete subject assigned to teachers');
        }

        $subjectName = $subject->name;
        $subject->delete();

        logActivity('delete', "Deleted subject: {$subjectName}", Subject::class, $subject->id);

        return redirect()->route('subjects.index')
            ->with('success', 'Subject deleted successfully');
    }
}
