// Exam Module Types

export interface AcademicYear {
    id: number;
    name: string;
    start_date: string;
    end_date: string;
    status: 'active' | 'inactive';
}

export interface SchoolClass {
    id: number;
    name: string;
    status: 'active' | 'inactive';
}

export interface Section {
    id: number;
    name: string;
    class_id: number;
}

export interface Subject {
    id: number;
    name: string;
    code: string;
    status: 'active' | 'inactive';
}

export interface Teacher {
    id: number;
    employee_id: string;
    user: {
        name: string;
        email: string;
    };
    status: 'active' | 'inactive';
}

export interface Exam {
    id: number;
    academic_year_id: number;
    name: string;
    exam_type: 'first_term' | 'mid_term' | 'final' | 'test' | 'practical';
    start_date: string;
    end_date: string;
    result_publish_date?: string;
    status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
    description?: string;
    created_at: string;
    updated_at: string;
    academicYear?: AcademicYear;
    classes?: SchoolClass[];
    schedules?: ExamSchedule[];
}

export interface ExamSchedule {
    id: number;
    exam_id: number;
    class_id: number;
    subject_id: number;
    date: string;
    start_time: string;
    end_time: string;
    full_marks: number;
    pass_marks: number;
    room_number?: string;
    instructions?: string;
    created_at: string;
    updated_at: string;
    exam?: Exam;
    schoolClass?: SchoolClass;
    subject?: Subject;
    invigilators?: ExamInvigilator[];
}

export interface Mark {
    id: number;
    exam_id: number;
    student_id: number;
    class_id: number;
    subject_id: number;
    theory_marks?: number;
    practical_marks?: number;
    total_marks: number;
    grade?: string;
    remarks?: string;
    marked_by: number;
    created_at: string;
    updated_at: string;
    student?: Student;
    exam?: Exam;
    schoolClass?: SchoolClass;
    subject?: Subject;
}

export interface Result {
    id: number;
    exam_id: number;
    student_id: number;
    class_id: number;
    total_marks: number;
    obtained_marks: number;
    percentage: number;
    grade: string;
    gpa: number;
    status: 'pass' | 'fail';
    remarks?: string;
    is_published: boolean;
    created_at: string;
    updated_at: string;
    student?: Student;
    exam?: Exam;
    schoolClass?: SchoolClass;
}

export interface Student {
    id: number;
    admission_number: string;
    roll_number: string;
    full_name: string;
    class_id: number;
    section_id?: number;
    status: 'active' | 'inactive' | 'graduated';
    user?: {
        name: string;
        email: string;
    };
    marks?: Mark[];
}

export interface GradeSetting {
    id: number;
    grade_name: string;
    grade_point: number;
    min_marks: number;
    max_marks: number;
    remarks?: string;
    created_at: string;
    updated_at: string;
}

export interface ExamHall {
    id: number;
    name: string;
    code: string;
    capacity: number;
    location?: string;
    facilities?: string;
    status: 'active' | 'inactive' | 'maintenance';
    created_at: string;
    updated_at: string;
}

export interface ExamSeatPlan {
    id: number;
    exam_id: number;
    student_id: number;
    class_id: number;
    hall_id: number;
    seat_number: number;
    row_number: number;
    column_number: number;
    created_at: string;
    updated_at: string;
    exam?: Exam;
    student?: Student;
    schoolClass?: SchoolClass;
    examHall?: ExamHall;
}

export interface ExamInvigilator {
    id: number;
    exam_id: number;
    teacher_id: number;
    exam_schedule_id?: number;
    hall_id?: number;
    duty_date: string;
    duty_time: string;
    remarks?: string;
    created_at: string;
    updated_at: string;
    exam?: Exam;
    teacher?: Teacher;
    examSchedule?: ExamSchedule;
    examHall?: ExamHall;
}

export interface PaginatedData<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

export interface ExamFilters {
    academic_year_id?: string;
    exam_type?: string;
}

export interface ScheduleFilters {
    exam_id?: string;
    class_id?: string;
}

export interface MarkFilters {
    exam_id?: string;
    class_id?: string;
    subject_id?: string;
}

export interface ResultFilters {
    exam_id?: string;
    class_id?: string;
    student_id?: string;
}

export interface InvigilatorFilters {
    exam_id?: string;
    teacher_id?: string;
}

export interface SeatPlanFilters {
    exam_id?: string;
    hall_id?: string;
}
