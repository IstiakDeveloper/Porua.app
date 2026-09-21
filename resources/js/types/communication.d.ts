// Communication Module Types

export interface Event {
    id: number;
    title: string;
    description?: string;
    event_type: 'academic' | 'sports' | 'cultural' | 'holiday' | 'meeting' | 'other';
    start_date: string;
    end_date: string;
    location?: string;
    organizer?: string;
    status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
    created_by: number;
    created_at: string;
    updated_at: string;
    createdBy?: {
        name: string;
        email: string;
    };
}

export interface Notice {
    id: number;
    title: string;
    content: string;
    target_role?: string;
    publish_date: string;
    expiry_date?: string;
    priority: 'low' | 'normal' | 'high' | 'urgent';
    status: 'draft' | 'published' | 'expired';
    is_pinned: boolean;
    created_by: number;
    created_at: string;
    updated_at: string;
    createdBy?: {
        name: string;
        email: string;
    };
}

export interface Message {
    id: number;
    subject: string;
    body: string;
    sender_id: number;
    recipient_id: number;
    read_at?: string;
    is_read: boolean;
    created_at: string;
    updated_at: string;
    sender?: {
        name: string;
        email: string;
    };
    recipient?: {
        name: string;
        email: string;
    };
}

export interface Notification {
    id: number;
    type: string;
    notifiable_id: number;
    notifiable_type: string;
    data: {
        title: string;
        message: string;
        url?: string;
        [key: string]: any;
    };
    read_at?: string;
    created_at: string;
    updated_at: string;
}

export interface Role {
    id: number;
    name: string;
    display_name: string;
}

export interface PaginatedData<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

export interface EventFilters {
    event_type?: string;
    status?: string;
}

export interface NoticeFilters {
    target_role?: string;
    status?: string;
}
