<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\AcademicYear;
use App\Models\FeeCollection;
use App\Models\FeeStructure;
use App\Models\SchoolClass;
use App\Models\Section;
use App\Models\Student;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class StudentController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('view_students');

        $students = Student::with(['user', 'academicYear', 'schoolClass', 'section'])
            ->when($request->search, function ($q) use ($request) {
                $q->where('admission_number', 'like', "%{$request->search}%")
                    ->orWhere('roll_number', 'like', "%{$request->search}%")
                    ->orWhereHas('user', fn ($q) => $q->where('name', 'like', "%{$request->search}%"));
            })
            ->when($request->class_id, fn ($q) => $q->where('class_id', $request->class_id))
            ->when($request->section_id, fn ($q) => $q->where('section_id', $request->section_id))
            ->when($request->academic_year_id, fn ($q) => $q->where('academic_year_id', $request->academic_year_id))
            ->when($request->status, fn ($q) => $q->where('status', $request->status))
            ->latest('admission_date')
            ->paginate(20)->withQueryString();

        return Inertia::render('Students/Index', [
            'students' => $students,
            'filters' => $request->only(['search', 'class_id', 'section_id', 'academic_year_id', 'status']),
            'classes' => SchoolClass::where('status', 'active')->get(),
            'academicYears' => AcademicYear::all(),
            'canToggleStatus' => $request->user()->can('edit_students'),
        ]);
    }

    public function create()
    {
        $this->authorize('create_students');

        // Get classes with fee structures tagged by academic year
        $classes = SchoolClass::where('status', 'active')
            ->with(['feeStructures.feeType'])
            ->get()
            ->map(function ($class) {
                return [
                    'id' => $class->id,
                    'name' => $class->name,
                    'fee_structures' => $class->feeStructures->map(function ($fee) {
                        return [
                            'id' => $fee->id,
                            'fee_type_id' => $fee->fee_type_id,
                            'academic_year_id' => $fee->academic_year_id,
                            'fee_type_name' => $fee->feeType->name,
                            'frequency' => $fee->feeType->frequency,
                            'amount' => (float) $fee->amount,
                        ];
                    }),
                ];
            });

        // Include upcoming years so next-session (e.g. 2027) admissions are possible now
        return Inertia::render('Students/Create', [
            'academicYears' => AcademicYear::whereIn('status', ['active', 'upcoming'])
                ->orderByDesc('is_current')
                ->orderByDesc('start_date')
                ->get(),
            'classes' => $classes,
        ]);
    }

    public function store(Request $request)
    {
        $this->authorize('create_students');

        $validated = $request->validate([
            // Academic Info
            'academic_year_id' => 'required|exists:academic_years,id',
            'class_id' => 'required|exists:classes,id',
            'section_id' => 'required|exists:sections,id',
            'parent_id' => 'nullable|exists:users,id',
            'admission_number' => 'required|string|unique:students',
            'student_id' => 'nullable|string|unique:students,student_id',
            'form_number' => 'nullable|string|unique:students,form_number',
            'monthly_fee' => 'nullable|numeric',
            'roll_number' => 'nullable|string',
            'class_role' => 'nullable|string|max:255',
            'admission_date' => 'required|date',

            // Basic Info
            'first_name' => 'required|string|max:100',
            'last_name' => 'required|string|max:100',
            'first_name_bengali' => 'nullable|string|max:100',
            'last_name_bengali' => 'nullable|string|max:100',
            'name_bn' => 'nullable|string|max:255',
            'name_en' => 'nullable|string|max:255',
            'date_of_birth' => 'required|date',
            'birth_place_district' => 'nullable|string|max:255',
            'gender' => 'required|in:male,female,other,Male,Female,Other',
            'blood_group' => 'nullable|string|max:10',
            'birth_certificate_no' => 'nullable|string|max:100',
            'birth_certificate_number' => 'nullable|string|max:255',
            'religion' => 'nullable|string|max:255',
            'nationality' => 'nullable|string|max:255',
            'minorities' => 'nullable|boolean',
            'minority_name' => 'nullable|string|max:255',
            'handicap' => 'nullable|string|max:255',

            // Contact Info
            'email' => 'required|email|unique:users',
            'phone' => 'nullable|string|max:20',
            'password' => 'required|string|min:8',
            'present_address' => 'nullable|string',
            'permanent_address' => 'nullable|string',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|max:20',

            // Present Address Detailed
            'present_address_division' => 'nullable|string|max:255',
            'present_address_district' => 'nullable|string|max:255',
            'present_address_upazila' => 'nullable|string|max:255',
            'present_address_city' => 'nullable|string|max:255',
            'present_address_ward' => 'nullable|string|max:255',
            'present_address_village' => 'nullable|string|max:255',
            'present_address_house_number' => 'nullable|string|max:255',
            'present_address_post' => 'nullable|string|max:255',
            'present_address_post_code' => 'nullable|string|max:255',

            // Permanent Address Detailed
            'permanent_address_division' => 'nullable|string|max:255',
            'permanent_address_district' => 'nullable|string|max:255',
            'permanent_address_upazila' => 'nullable|string|max:255',
            'permanent_address_city' => 'nullable|string|max:255',
            'permanent_address_ward' => 'nullable|string|max:255',
            'permanent_address_village' => 'nullable|string|max:255',
            'permanent_address_house_number' => 'nullable|string|max:255',
            'permanent_address_post' => 'nullable|string|max:255',
            'permanent_address_post_code' => 'nullable|string|max:255',

            // Parent/Guardian Info - Father
            'father_name' => 'nullable|string|max:100',
            'father_name_bn' => 'nullable|string|max:255',
            'father_name_en' => 'nullable|string|max:255',
            'father_phone' => 'nullable|string|max:20',
            'father_mobile' => 'nullable|string|max:255',
            'father_nid' => 'nullable|string|max:255',
            'father_dob' => 'nullable|date',
            'father_occupation' => 'nullable|string|max:255',
            'father_dead' => 'nullable|boolean',

            // Parent/Guardian Info - Mother
            'mother_name' => 'nullable|string|max:100',
            'mother_name_bn' => 'nullable|string|max:255',
            'mother_name_en' => 'nullable|string|max:255',
            'mother_phone' => 'nullable|string|max:20',
            'mother_mobile' => 'nullable|string|max:255',
            'mother_nid' => 'nullable|string|max:255',
            'mother_dob' => 'nullable|date',
            'mother_occupation' => 'nullable|string|max:255',
            'mother_dead' => 'nullable|boolean',

            // Guardian Info
            'guardian_name' => 'nullable|string|max:100',
            'guardian_phone' => 'nullable|string|max:20',
            'guardian_relation' => 'nullable|in:father,mother,uncle,aunt,grandfather,grandmother,other',

            // Previous Academic Info
            'previous_school' => 'nullable|string|max:255',
            'previous_class' => 'nullable|string|max:50',
            'previous_exam_result' => 'nullable|string',

            // Medical & Special Info
            'medical_conditions' => 'nullable|string',
            'allergies' => 'nullable|string',
            'special_notes' => 'nullable|string',
            'information_correct' => 'nullable|boolean',

            // Status
            'status' => 'required|in:active,passed,transferred,dropped,suspended',

            // Photo
            'photo' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        DB::beginTransaction();
        try {
            // Create full name from first and last name
            $fullName = $validated['first_name'].' '.$validated['last_name'];

            // Create user
            $user = User::create([
                'name' => $fullName,
                'email' => $validated['email'],
                'phone' => $validated['phone'] ?? null,
                'password' => Hash::make($validated['password']),
                'status' => 'active',
            ]);

            $user->assignRole('Student');

            // Handle photo upload
            $photoPath = null;
            if ($request->hasFile('photo')) {
                $photoPath = $request->file('photo')->store('students/photos', 'public');
            }

            // Normalize gender to lowercase
            $gender = strtolower($validated['gender']);

            // Create student with all fields
            $student = Student::create([
                'user_id' => $user->id,
                'academic_year_id' => $validated['academic_year_id'],
                'class_id' => $validated['class_id'],
                'section_id' => $validated['section_id'],
                'parent_id' => $validated['parent_id'] ?? null,
                'admission_number' => $validated['admission_number'],
                'student_id' => $validated['student_id'] ?? null,
                'form_number' => $validated['form_number'] ?? null,
                'monthly_fee' => $validated['monthly_fee'] ?? null,
                'roll_number' => $validated['roll_number'] ?? null,
                'class_role' => $validated['class_role'] ?? null,
                'admission_date' => $validated['admission_date'],

                // Basic Info
                'first_name' => $validated['first_name'],
                'last_name' => $validated['last_name'],
                'first_name_bengali' => $validated['first_name_bengali'] ?? null,
                'last_name_bengali' => $validated['last_name_bengali'] ?? null,
                'name_bn' => $validated['name_bn'] ?? null,
                'name_en' => $validated['name_en'] ?? $fullName,
                'date_of_birth' => $validated['date_of_birth'],
                'birth_place_district' => $validated['birth_place_district'] ?? null,
                'gender' => $gender,
                'blood_group' => $validated['blood_group'] ?? null,
                'birth_certificate_no' => $validated['birth_certificate_no'] ?? null,
                'birth_certificate_number' => $validated['birth_certificate_number'] ?? null,
                'religion' => $validated['religion'] ?? null,
                'nationality' => $validated['nationality'] ?? 'Bangladeshi',
                'minorities' => $validated['minorities'] ?? false,
                'minority_name' => $validated['minority_name'] ?? null,
                'handicap' => $validated['handicap'] ?? null,

                // Contact Info
                'phone' => $validated['phone'] ?? null,
                'email' => $validated['email'],
                'present_address' => $validated['present_address'] ?? null,
                'permanent_address' => $validated['permanent_address'] ?? null,
                'city' => $validated['city'] ?? null,
                'state' => $validated['state'] ?? null,
                'postal_code' => $validated['postal_code'] ?? null,

                // Present Address Detailed
                'present_address_division' => $validated['present_address_division'] ?? null,
                'present_address_district' => $validated['present_address_district'] ?? null,
                'present_address_upazila' => $validated['present_address_upazila'] ?? null,
                'present_address_city' => $validated['present_address_city'] ?? null,
                'present_address_ward' => $validated['present_address_ward'] ?? null,
                'present_address_village' => $validated['present_address_village'] ?? null,
                'present_address_house_number' => $validated['present_address_house_number'] ?? null,
                'present_address_post' => $validated['present_address_post'] ?? null,
                'present_address_post_code' => $validated['present_address_post_code'] ?? null,

                // Permanent Address Detailed
                'permanent_address_division' => $validated['permanent_address_division'] ?? null,
                'permanent_address_district' => $validated['permanent_address_district'] ?? null,
                'permanent_address_upazila' => $validated['permanent_address_upazila'] ?? null,
                'permanent_address_city' => $validated['permanent_address_city'] ?? null,
                'permanent_address_ward' => $validated['permanent_address_ward'] ?? null,
                'permanent_address_village' => $validated['permanent_address_village'] ?? null,
                'permanent_address_house_number' => $validated['permanent_address_house_number'] ?? null,
                'permanent_address_post' => $validated['permanent_address_post'] ?? null,
                'permanent_address_post_code' => $validated['permanent_address_post_code'] ?? null,

                // Parent/Guardian Info - Father
                'father_name' => $validated['father_name'] ?? null,
                'father_name_bn' => $validated['father_name_bn'] ?? null,
                'father_name_en' => $validated['father_name_en'] ?? null,
                'father_phone' => $validated['father_phone'] ?? null,
                'father_mobile' => $validated['father_mobile'] ?? null,
                'father_nid' => $validated['father_nid'] ?? null,
                'father_dob' => $validated['father_dob'] ?? null,
                'father_occupation' => $validated['father_occupation'] ?? null,
                'father_dead' => $validated['father_dead'] ?? false,

                // Parent/Guardian Info - Mother
                'mother_name' => $validated['mother_name'] ?? null,
                'mother_name_bn' => $validated['mother_name_bn'] ?? null,
                'mother_name_en' => $validated['mother_name_en'] ?? null,
                'mother_phone' => $validated['mother_phone'] ?? null,
                'mother_mobile' => $validated['mother_mobile'] ?? null,
                'mother_nid' => $validated['mother_nid'] ?? null,
                'mother_dob' => $validated['mother_dob'] ?? null,
                'mother_occupation' => $validated['mother_occupation'] ?? null,
                'mother_dead' => $validated['mother_dead'] ?? false,

                // Guardian Info
                'guardian_name' => $validated['guardian_name'] ?? null,
                'guardian_phone' => $validated['guardian_phone'] ?? null,
                'guardian_relation' => $validated['guardian_relation'] ?? 'father',

                // Previous Academic Info
                'previous_school' => $validated['previous_school'] ?? null,
                'previous_class' => $validated['previous_class'] ?? null,
                'previous_exam_result' => $validated['previous_exam_result'] ?? null,

                // Medical & Special Info
                'medical_conditions' => $validated['medical_conditions'] ?? null,
                'allergies' => $validated['allergies'] ?? null,
                'special_notes' => $validated['special_notes'] ?? null,
                'information_correct' => $validated['information_correct'] ?? false,

                // Photo & Status
                'photo' => $photoPath,
                'status' => $validated['status'],
            ]);

            DB::commit();

            // Auto-generate pending fees for this student based on class fee structures
            $this->autoGenerateStudentFees($student);

            logActivity('create', "Created student: {$fullName}", Student::class, $student->id);

            return redirect()->route('students.index')
                ->with('success', 'Student created successfully');

        } catch (\Exception $e) {
            DB::rollBack();

            return back()->withInput()->with('error', 'Failed to create student: '.$e->getMessage());
        }
    }

    /**
     * Auto-generate pending fees for new student (enrollment).
     * Only Admission & Session fee types are auto-created here.
     * Other fee types (monthly, exam, etc.) are added monthly or manually.
     */
    private function autoGenerateStudentFees(Student $student)
    {
        try {
            // Only Admission & Session fee types (by name) — never auto-create monthly on admission
            $feeStructures = FeeStructure::with('feeType')
                ->where('class_id', $student->class_id)
                ->where('academic_year_id', $student->academic_year_id)
                ->whereHas('feeType', function ($q) {
                    $q->where('status', 'active')
                        ->where(function ($q2) {
                            $q2->whereRaw('LOWER(name) LIKE ?', ['%admission%'])
                                ->orWhereRaw('LOWER(name) LIKE ?', ['%session%']);
                        });
                })
                ->get();

            $admissionDate = $student->admission_date
                ? Carbon::parse($student->admission_date)
                : now();

            foreach ($feeStructures as $feeStructure) {
                $existingFee = FeeCollection::where('student_id', $student->id)
                    ->where('fee_type_id', $feeStructure->fee_type_id)
                    ->where('academic_year_id', $student->academic_year_id)
                    ->where('status', '!=', 'cancelled')
                    ->first();

                if ($existingFee) {
                    continue;
                }

                // One-time / admission fees bill against admission date (payment can be taken now as advance)
                $month = $admissionDate->month;
                $year = $admissionDate->year;
                $dueDate = $admissionDate;

                FeeCollection::createPendingIfAbsent([
                    'receipt_number' => 'FEE-'.date('Ymd').'-'.str_pad(
                        FeeCollection::whereDate('created_at', today())->count() + 1,
                        6,
                        '0',
                        STR_PAD_LEFT
                    ),
                    'student_id' => $student->id,
                    'fee_type_id' => $feeStructure->fee_type_id,
                    'academic_year_id' => $student->academic_year_id,
                    'month' => $month,
                    'year' => $year,
                    'amount' => $feeStructure->amount,
                    'late_fee' => 0,
                    'discount' => 0,
                    'total_amount' => $feeStructure->amount,
                    'paid_amount' => 0,
                    'payment_date' => $dueDate,
                    'status' => 'pending',
                    'remarks' => 'Auto-generated on student admission',
                    'collected_by' => auth()->id() ?? 1,
                ]);
            }
        } catch (\Exception $e) {
            \Log::error('Failed to auto-generate fees for student: '.$e->getMessage());
        }
    }

    public function show(Student $student)
    {
        $this->authorize('view_students');

        $student->load([
            'user',
            'academicYear',
            'schoolClass',
            'section',
            'parents.user',
            'documents',
            'attendance' => fn ($q) => $q->latest()->limit(30),
            'feeCollections',
            'batchEnrollments.batch.course',
            'batchEnrollments.batch.teacher',
        ]);

        // Add photo URL
        if ($student->photo) {
            $student->photo_url = asset('storage/'.$student->photo);
        }

        return Inertia::render('Students/Show', [
            'student' => $student,
        ]);
    }

    public function edit(Student $student)
    {
        $this->authorize('edit_students');

        $student->load(['user', 'schoolClass', 'section']);

        // Get classes with their monthly fee from fee structures
        $classes = SchoolClass::where('status', 'active')
            ->with(['feeStructures.feeType'])
            ->get()
            ->map(function ($class) {
                // Try to find monthly fee - check various naming conventions
                $monthlyFee = $class->feeStructures->first(function ($fee) {
                    $name = strtolower($fee->feeType->name ?? '');

                    return str_contains($name, 'monthly') ||
                           str_contains($name, 'tuition') ||
                           $name === 'monthly fee';
                });

                // If no specific monthly fee found, use first available fee structure
                $feeStructure = $monthlyFee ?? $class->feeStructures->first();

                return [
                    'id' => $class->id,
                    'name' => $class->name,
                    'fee_amount' => $feeStructure ? (float) $feeStructure->amount : 0,
                ];
            });

        return Inertia::render('Students/Edit', [
            'student' => $student,
            'academicYears' => AcademicYear::where('status', 'active')->get(),
            'classes' => $classes,
            'sections' => Section::where('class_id', $student->class_id)->get(),
        ]);
    }

    public function update(Request $request, Student $student)
    {
        $this->authorize('edit_students');

        \Log::info('=== STUDENT UPDATE START ===');
        \Log::info('Student ID: '.$student->id);
        \Log::info('Request Data:', $request->all());
        \Log::info('Has Photo File: '.($request->hasFile('photo') ? 'YES' : 'NO'));

        $validated = $request->validate([
            // Academic Info
            'academic_year_id' => 'required|exists:academic_years,id',
            'class_id' => 'required|exists:classes,id',
            'section_id' => 'required|exists:sections,id',
            'parent_id' => 'nullable|exists:users,id',
            'admission_number' => 'required|string|unique:students,admission_number,'.$student->id,
            'student_id' => 'nullable|string|unique:students,student_id,'.$student->id,
            'form_number' => 'nullable|string|unique:students,form_number,'.$student->id,
            'monthly_fee' => 'nullable|numeric',
            'roll_number' => 'nullable|string',
            'class_role' => 'nullable|string|max:255',
            'admission_date' => 'required|date',

            // Basic Info
            'name' => 'required|string|max:255',
            'first_name' => 'required|string|max:100',
            'last_name' => 'required|string|max:100',
            'first_name_bengali' => 'nullable|string|max:100',
            'last_name_bengali' => 'nullable|string|max:100',
            'name_bn' => 'nullable|string|max:255',
            'name_en' => 'nullable|string|max:255',
            'date_of_birth' => 'required|date',
            'birth_place_district' => 'nullable|string|max:255',
            'gender' => 'required|in:male,female,other,Male,Female,Other',
            'blood_group' => 'nullable|string|max:10',
            'birth_certificate_no' => 'nullable|string|max:100',
            'birth_certificate_number' => 'nullable|string|max:255',
            'religion' => 'nullable|string|max:255',
            'nationality' => 'nullable|string|max:255',
            'minorities' => 'nullable|boolean',
            'minority_name' => 'nullable|string|max:255',
            'handicap' => 'nullable|string|max:255',

            // Contact Info
            'email' => 'required|email|unique:users,email,'.$student->user_id,
            'phone' => 'nullable|string|max:20',
            'present_address' => 'nullable|string',
            'permanent_address' => 'nullable|string',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|max:20',

            // Present Address Detailed
            'present_address_division' => 'nullable|string|max:255',
            'present_address_district' => 'nullable|string|max:255',
            'present_address_upazila' => 'nullable|string|max:255',
            'present_address_city' => 'nullable|string|max:255',
            'present_address_ward' => 'nullable|string|max:255',
            'present_address_village' => 'nullable|string|max:255',
            'present_address_house_number' => 'nullable|string|max:255',
            'present_address_post' => 'nullable|string|max:255',
            'present_address_post_code' => 'nullable|string|max:255',

            // Permanent Address Detailed
            'permanent_address_division' => 'nullable|string|max:255',
            'permanent_address_district' => 'nullable|string|max:255',
            'permanent_address_upazila' => 'nullable|string|max:255',
            'permanent_address_city' => 'nullable|string|max:255',
            'permanent_address_ward' => 'nullable|string|max:255',
            'permanent_address_village' => 'nullable|string|max:255',
            'permanent_address_house_number' => 'nullable|string|max:255',
            'permanent_address_post' => 'nullable|string|max:255',
            'permanent_address_post_code' => 'nullable|string|max:255',

            // Parent/Guardian Info - Father
            'father_name' => 'nullable|string|max:100',
            'father_name_bn' => 'nullable|string|max:255',
            'father_name_en' => 'nullable|string|max:255',
            'father_phone' => 'nullable|string|max:20',
            'father_mobile' => 'nullable|string|max:255',
            'father_nid' => 'nullable|string|max:255',
            'father_dob' => 'nullable|date',
            'father_occupation' => 'nullable|string|max:255',
            'father_dead' => 'nullable|boolean',

            // Parent/Guardian Info - Mother
            'mother_name' => 'nullable|string|max:100',
            'mother_name_bn' => 'nullable|string|max:255',
            'mother_name_en' => 'nullable|string|max:255',
            'mother_phone' => 'nullable|string|max:20',
            'mother_mobile' => 'nullable|string|max:255',
            'mother_nid' => 'nullable|string|max:255',
            'mother_dob' => 'nullable|date',
            'mother_occupation' => 'nullable|string|max:255',
            'mother_dead' => 'nullable|boolean',

            // Guardian Info
            'guardian_name' => 'nullable|string|max:100',
            'guardian_phone' => 'nullable|string|max:20',
            'guardian_relation' => 'nullable|in:father,mother,uncle,aunt,grandfather,grandmother,other',

            // Previous Academic Info
            'previous_school' => 'nullable|string|max:255',
            'previous_class' => 'nullable|string|max:50',
            'previous_exam_result' => 'nullable|string',

            // Medical & Special Info
            'medical_conditions' => 'nullable|string',
            'allergies' => 'nullable|string',
            'special_notes' => 'nullable|string',
            'information_correct' => 'nullable|boolean',

            // Status
            'status' => 'required|in:active,passed,transferred,dropped,suspended',

            // Photo
            'photo' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        // Validate photo separately if uploaded
        if ($request->hasFile('photo')) {
            $request->validate([
                'photo' => 'image|mimes:jpeg,png,jpg,gif|max:2048',
            ]);
        }

        DB::beginTransaction();
        try {
            // Update user
            $student->user->update([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'phone' => $validated['phone'],
            ]);

            \Log::info('User updated successfully');

            // Handle photo upload
            $photoPath = $student->photo; // Keep existing photo
            if ($request->hasFile('photo')) {
                // Delete old photo if exists
                if ($student->photo && \Storage::disk('public')->exists($student->photo)) {
                    \Storage::disk('public')->delete($student->photo);
                }
                $photoPath = $request->file('photo')->store('students/photos', 'public');
                \Log::info('Photo uploaded: '.$photoPath);
            }

            // Update student with all comprehensive fields
            $gender = strtolower($validated['gender']);

            $updated = $student->update([
                'academic_year_id' => $validated['academic_year_id'],
                'class_id' => $validated['class_id'],
                'section_id' => $validated['section_id'],
                'parent_id' => $validated['parent_id'] ?? null,
                'admission_number' => $validated['admission_number'],
                'student_id' => $validated['student_id'] ?? null,
                'form_number' => $validated['form_number'] ?? null,
                'monthly_fee' => $validated['monthly_fee'] ?? null,
                'roll_number' => $validated['roll_number'] ?? null,
                'class_role' => $validated['class_role'] ?? null,
                'admission_date' => $validated['admission_date'],

                // Basic Info
                'first_name' => $validated['first_name'],
                'last_name' => $validated['last_name'],
                'first_name_bengali' => $validated['first_name_bengali'] ?? null,
                'last_name_bengali' => $validated['last_name_bengali'] ?? null,
                'name_bn' => $validated['name_bn'] ?? null,
                'name_en' => $validated['name_en'] ?? null,
                'date_of_birth' => $validated['date_of_birth'],
                'birth_place_district' => $validated['birth_place_district'] ?? null,
                'gender' => $gender,
                'blood_group' => $validated['blood_group'] ?? null,
                'birth_certificate_no' => $validated['birth_certificate_no'] ?? null,
                'birth_certificate_number' => $validated['birth_certificate_number'] ?? null,
                'religion' => $validated['religion'] ?? null,
                'nationality' => $validated['nationality'] ?? 'Bangladeshi',
                'minorities' => $validated['minorities'] ?? false,
                'minority_name' => $validated['minority_name'] ?? null,
                'handicap' => $validated['handicap'] ?? null,

                // Contact Info
                'phone' => $validated['phone'] ?? null,
                'email' => $validated['email'],
                'present_address' => $validated['present_address'] ?? null,
                'permanent_address' => $validated['permanent_address'] ?? null,
                'city' => $validated['city'] ?? null,
                'state' => $validated['state'] ?? null,
                'postal_code' => $validated['postal_code'] ?? null,

                // Present Address Detailed
                'present_address_division' => $validated['present_address_division'] ?? null,
                'present_address_district' => $validated['present_address_district'] ?? null,
                'present_address_upazila' => $validated['present_address_upazila'] ?? null,
                'present_address_city' => $validated['present_address_city'] ?? null,
                'present_address_ward' => $validated['present_address_ward'] ?? null,
                'present_address_village' => $validated['present_address_village'] ?? null,
                'present_address_house_number' => $validated['present_address_house_number'] ?? null,
                'present_address_post' => $validated['present_address_post'] ?? null,
                'present_address_post_code' => $validated['present_address_post_code'] ?? null,

                // Permanent Address Detailed
                'permanent_address_division' => $validated['permanent_address_division'] ?? null,
                'permanent_address_district' => $validated['permanent_address_district'] ?? null,
                'permanent_address_upazila' => $validated['permanent_address_upazila'] ?? null,
                'permanent_address_city' => $validated['permanent_address_city'] ?? null,
                'permanent_address_ward' => $validated['permanent_address_ward'] ?? null,
                'permanent_address_village' => $validated['permanent_address_village'] ?? null,
                'permanent_address_house_number' => $validated['permanent_address_house_number'] ?? null,
                'permanent_address_post' => $validated['permanent_address_post'] ?? null,
                'permanent_address_post_code' => $validated['permanent_address_post_code'] ?? null,

                // Parent/Guardian Info - Father
                'father_name' => $validated['father_name'] ?? null,
                'father_name_bn' => $validated['father_name_bn'] ?? null,
                'father_name_en' => $validated['father_name_en'] ?? null,
                'father_phone' => $validated['father_phone'] ?? null,
                'father_mobile' => $validated['father_mobile'] ?? null,
                'father_nid' => $validated['father_nid'] ?? null,
                'father_dob' => $validated['father_dob'] ?? null,
                'father_occupation' => $validated['father_occupation'] ?? null,
                'father_dead' => $validated['father_dead'] ?? false,

                // Parent/Guardian Info - Mother
                'mother_name' => $validated['mother_name'] ?? null,
                'mother_name_bn' => $validated['mother_name_bn'] ?? null,
                'mother_name_en' => $validated['mother_name_en'] ?? null,
                'mother_phone' => $validated['mother_phone'] ?? null,
                'mother_mobile' => $validated['mother_mobile'] ?? null,
                'mother_nid' => $validated['mother_nid'] ?? null,
                'mother_dob' => $validated['mother_dob'] ?? null,
                'mother_occupation' => $validated['mother_occupation'] ?? null,
                'mother_dead' => $validated['mother_dead'] ?? false,

                // Guardian Info
                'guardian_name' => $validated['guardian_name'] ?? null,
                'guardian_phone' => $validated['guardian_phone'] ?? null,
                'guardian_relation' => $validated['guardian_relation'] ?? 'father',

                // Previous Academic Info
                'previous_school' => $validated['previous_school'] ?? null,
                'previous_class' => $validated['previous_class'] ?? null,
                'previous_exam_result' => $validated['previous_exam_result'] ?? null,

                // Medical & Special Info
                'medical_conditions' => $validated['medical_conditions'] ?? null,
                'allergies' => $validated['allergies'] ?? null,
                'special_notes' => $validated['special_notes'] ?? null,
                'information_correct' => $validated['information_correct'] ?? false,

                // Photo & Status
                'photo' => $photoPath,
                'status' => $validated['status'],
            ]);

            \Log::info('Student update result: '.($updated ? 'SUCCESS' : 'FAILED'));
            \Log::info('Updated student data:', $student->fresh()->toArray());

            DB::commit();

            \Log::info('=== STUDENT UPDATE COMPLETED ===');

            logActivity('update', "Updated student: {$student->user->name}", Student::class, $student->id);

            return redirect()->route('students.index')
                ->with('success', 'Student updated successfully');

        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('=== STUDENT UPDATE FAILED ===');
            \Log::error('Error: '.$e->getMessage());
            \Log::error('Stack trace: '.$e->getTraceAsString());

            return back()->withInput()->with('error', 'Failed to update student: '.$e->getMessage());
        }
    }

    public function toggleStatus(Student $student)
    {
        $this->authorize('edit_students');

        if (! in_array($student->status, ['active', 'suspended'], true)) {
            return back()->with('error', 'Only active or inactive students can be toggled from this page.');
        }

        $newStatus = $student->status === 'active' ? 'suspended' : 'active';

        $student->update([
            'status' => $newStatus,
            'status_changed_at' => now(),
        ]);

        if ($student->user) {
            $student->user->update([
                'status' => $newStatus === 'active' ? 'active' : 'inactive',
            ]);
        }

        $label = $newStatus === 'active' ? 'activated' : 'deactivated';
        logActivity('update', "Student {$student->full_name} {$label}", Student::class, $student->id);

        return back()->with('success', 'Student status updated successfully.');
    }

    public function destroy(Student $student)
    {
        $this->authorize('delete_students');

        DB::beginTransaction();
        try {
            $studentName = $student->user->name;
            $userId = $student->user_id;

            $student->delete();
            User::find($userId)?->delete();

            DB::commit();

            logActivity('delete', "Deleted student: {$studentName}", Student::class, $student->id);

            return redirect()->route('students.index')
                ->with('success', 'Student deleted successfully');

        } catch (\Exception $e) {
            DB::rollBack();

            return back()->with('error', 'Failed to delete student: '.$e->getMessage());
        }
    }

    public function getSections($classId)
    {
        $sections = Section::where('class_id', $classId)
            ->where('status', 'active')
            ->get();

        return response()->json($sections);
    }
}
