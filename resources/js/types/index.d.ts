export interface Auth {
    user: User | null;
    /** Super Admin only; Admin role is view/create without editing or deleting records */
    can_edit_or_delete?: boolean;
}

export interface Institute {
    name: string;
    short_name?: string;
    code?: string;
    email?: string;
    phone?: string;
    address?: string;
    website?: string;
    logo_url?: string;
    favicon_url?: string;
    established_year?: string;
    currency_symbol?: string;
    invoice_footer_text?: string;
    type?: 'school' | 'coaching' | 'hybrid';
}

export interface SharedData {
    name: string;
    institute: Institute;
    quote: { message: string; author: string };
    auth: Auth;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}

// Global route helper function (Ziggy)
declare global {
    function route(name: string, params?: any): string;
}
