import React from 'react';

interface StatusToggleProps {
    checked: boolean;
    onChange: () => void;
    disabled?: boolean;
    loading?: boolean;
    activeLabel?: string;
    inactiveLabel?: string;
}

export default function StatusToggle({
    checked,
    onChange,
    disabled = false,
    loading = false,
    activeLabel = 'Active',
    inactiveLabel = 'Inactive',
}: StatusToggleProps) {
    return (
        <div className="flex items-center gap-2">
            <button
                type="button"
                role="switch"
                aria-checked={checked}
                aria-label={checked ? activeLabel : inactiveLabel}
                disabled={disabled || loading}
                onClick={onChange}
                className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1 ${
                    disabled || loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                } ${checked ? 'bg-emerald-500' : 'bg-gray-300'}`}
            >
                <span
                    className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                        checked ? 'translate-x-[18px]' : 'translate-x-0.5'
                    }`}
                />
            </button>
            <span className={`text-xs font-medium ${checked ? 'text-emerald-700' : 'text-gray-500'}`}>
                {checked ? activeLabel : inactiveLabel}
            </span>
        </div>
    );
}
