// Library Module Types

export interface Book {
    id: number;
    title: string;
    author: string;
    isbn: string;
    publisher?: string;
    publication_year?: number;
    category: string;
    total_copies: number;
    available_copies: number;
    price?: number;
    shelf_location?: string;
    description?: string;
    status: 'available' | 'unavailable' | 'damaged';
    created_at: string;
    updated_at: string;
    issues?: BookIssue[];
}

export interface BookIssue {
    id: number;
    book_id: number;
    borrower_type: 'student' | 'teacher';
    borrower_id: number;
    issue_date: string;
    due_date: string;
    return_date?: string;
    fine_amount?: number;
    condition?: 'good' | 'damaged' | 'lost';
    return_remarks?: string;
    remarks?: string;
    status: 'issued' | 'returned';
    issued_by: number;
    created_at: string;
    updated_at: string;
    book?: Book;
    student?: {
        id: number;
        admission_number: string;
        roll_number: string;
        full_name: string;
        user?: {
            name: string;
            email: string;
        };
    };
    teacher?: {
        id: number;
        employee_id: string;
        user?: {
            name: string;
            email: string;
        };
    };
    issuer?: {
        name: string;
        email: string;
    };
}

export interface PaginatedData<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

export interface BookFilters {
    search?: string;
    category?: string;
    status?: string;
}

export interface BookIssueFilters {
    status?: string;
    borrower_type?: string;
}
