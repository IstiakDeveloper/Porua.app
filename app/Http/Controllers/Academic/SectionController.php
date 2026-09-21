<?php

namespace App\Http\Controllers\Academic;

use App\Http\Controllers\Controller;
use App\Models\SchoolClass;
use App\Models\Section;
use App\Models\Teacher;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SectionController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('view_classes');

        $sections = Section::with('schoolClass')
            ->withCount('students')
            ->when($request->class_id, fn ($q) => $q->where('class_id', $request->class_id))
            ->orderBy('name')
            ->paginate(20)->withQueryString();

        return Inertia::render('Academic/Sections/Index', [
            'sections' => $sections,
            'classes' => SchoolClass::where('status', 'active')->get(),
            'filters' => $request->only(['class_id']),
        ]);
    }

    public function create()
    {
        $this->authorize('create_classes');

        return Inertia::render('Academic/Sections/Create', [
            'classes' => SchoolClass::where('status', 'active')->get(),
            'teachers' => Teacher::with('user')->where('status', 'active')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $this->authorize('create_classes');

        $validated = $request->validate([
            'class_id' => 'required|exists:classes,id',
            'name' => 'required|string|max:255',
            'teacher_id' => 'nullable|exists:teachers,id',
            'room_number' => 'nullable|string|max:50',
            'capacity' => 'nullable|integer|min:1',
            'status' => 'required|in:active,inactive',
        ]);

        $section = Section::create($validated);

        logActivity('create', "Created section: {$section->name}", Section::class, $section->id);

        return redirect()->route('sections.index')
            ->with('success', 'Section created successfully');
    }

    public function show(Section $section)
    {
        $this->authorize('view_classes');

        $section->loadCount('students');
        $section->load([
            'schoolClass',
            'teacher.user',
            'students' => function ($query) {
                $query->select('id', 'section_id', 'first_name', 'last_name', 'roll_number', 'email', 'phone');
            },
        ]);

        return Inertia::render('Academic/Sections/Show', [
            'section' => $section,
        ]);
    }

    public function edit(Section $section)
    {
        $this->authorize('edit_classes');

        $section->load(['schoolClass', 'teacher']);

        return Inertia::render('Academic/Sections/Edit', [
            'section' => $section,
            'classes' => SchoolClass::where('status', 'active')->get(),
            'teachers' => Teacher::with('user')->where('status', 'active')->get(),
        ]);
    }

    public function update(Request $request, Section $section)
    {
        $this->authorize('edit_classes');

        $validated = $request->validate([
            'class_id' => 'required|exists:classes,id',
            'name' => 'required|string|max:255',
            'teacher_id' => 'nullable|exists:teachers,id',
            'room_number' => 'nullable|string|max:50',
            'capacity' => 'nullable|integer|min:1',
            'status' => 'required|in:active,inactive',
        ]);

        $section->update($validated);

        logActivity('update', "Updated section: {$section->name}", Section::class, $section->id);

        return redirect()->route('sections.index')
            ->with('success', 'Section updated successfully');
    }

    public function destroy(Section $section)
    {
        $this->authorize('delete_classes');

        if ($section->students()->count() > 0) {
            return back()->with('error', 'Cannot delete section with enrolled students');
        }

        $sectionName = $section->name;
        $section->delete();

        logActivity('delete', "Deleted section: {$sectionName}", Section::class, $section->id);

        return redirect()->route('sections.index')
            ->with('success', 'Section deleted successfully');
    }
}
