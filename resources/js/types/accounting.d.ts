// Accounting Module Types

export interface Account {
    id: number;
    account_name: string;
    account_number: string;
    account_type: 'bank' | 'cash' | 'mobile_banking';
    bank_name?: string;
    branch?: string;
    opening_balance: number;
    current_balance: number;
    description?: string;
    status: 'active' | 'inactive';
    created_at: string;
    updated_at: string;
    transactions?: Transaction[];
    transfersIn?: Transaction[];
}

export interface Transaction {
    id: number;
    account_id: number;
    transaction_number: string;
    type: 'income' | 'expense' | 'transfer' | 'asset_purchase';
    income_category_id?: number;
    expense_category_id?: number;
    transfer_to_account_id?: number;
    amount: number;
    transaction_date: string;
    payment_method?: string;
    reference_number?: string;
    description?: string;
    attachment?: string;
    created_by: number;
    created_at: string;
    updated_at: string;
    account?: Account;
    incomeCategory?: IncomeCategory;
    expenseCategory?: ExpenseCategory;
    transferToAccount?: Account;
    creator?: {
        id: number;
        name: string;
        email: string;
    };
}

export interface FixedAssetItem {
    id?: number;
    fixed_asset_id?: number;
    item_name: string;
    quantity: number;
    unit_price: number;
    amount: number;
    description?: string;
}

export interface FixedAsset {
    id: number;
    asset_name: string;
    asset_code: string;
    category: string;
    account_id?: number;
    purchase_price: number;
    purchase_date: string;
    depreciation_rate: number;
    current_value: number;
    description?: string;
    status: 'active' | 'disposed' | 'damaged';
    items?: FixedAssetItem[];
    total_quantity?: number;
    quantity_summary?: {
        quantity: number;
        amount: number;
        unit_price: number;
    };
    created_at: string;
    updated_at: string;
}

export interface ExpenseCategory {
    id: number;
    name: string;
    code: string;
    description?: string;
    status: 'active' | 'inactive';
    created_at: string;
    updated_at: string;
    transactions_count?: number;
}

export interface IncomeCategory {
    id: number;
    name: string;
    code: string;
    description?: string;
    status: 'active' | 'inactive';
    created_at: string;
    updated_at: string;
    transactions_count?: number;
}

export interface AccountingStats {
    total_balance: number;
    total_income: number;
    total_expense: number;
    total_assets: number;
    monthly_income?: number;
    monthly_expense?: number;
    net_balance?: number;
    total_accounts?: number;
    active_accounts?: number;
    total_value?: number;
}

export interface CategoryBreakdown {
    category: string;
    total: number;
}

export interface AccountSummary {
    id: number;
    name: string;
    type: string;
    balance: number;
}

export interface AccountFilters {
    search?: string;
    type?: string;
    status?: string;
}

export interface TransactionFilters {
    search?: string;
    type?: string;
    account_id?: number;
    date_from?: string;
    date_to?: string;
}

export interface FixedAssetFilters {
    search?: string;
    category?: string;
    status?: string;
}

export interface PaginatedData<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    links: Array<{ url: string | null; label: string; active: boolean }>;
}
