import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ComboSelectItem = {
    value: string;
    label: string;
    keywords?: string;
};

interface ComboSelectProps {
    value?: string | null;
    onChange: (value: string | null) => void;
    items: ComboSelectItem[];
    placeholder?: string;
    disabled?: boolean;
    clearable?: boolean;
    className?: string;
}

export default function ComboSelect({
    value,
    onChange,
    items,
    placeholder = 'Search and select…',
    disabled = false,
    clearable = true,
    className,
}: ComboSelectProps) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [highlight, setHighlight] = useState(0);
    const rootRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const selected = useMemo(() => items.find((item) => item.value === value) ?? null, [items, value]);

    const filtered = useMemo(() => {
        const tokens = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
        if (tokens.length === 0) return items;

        return items.filter((item) => {
            const hay = `${item.label} ${item.keywords ?? ''}`.toLowerCase();
            return tokens.every((token) => hay.includes(token));
        });
    }, [items, query]);

    useEffect(() => {
        const onClick = (event: MouseEvent) => {
            if (!rootRef.current?.contains(event.target as Node)) {
                setOpen(false);
                setQuery('');
            }
        };
        document.addEventListener('mousedown', onClick);
        return () => document.removeEventListener('mousedown', onClick);
    }, []);

    useEffect(() => {
        setHighlight(0);
    }, [query, open]);

    const selectItem = (item: ComboSelectItem | null) => {
        onChange(item?.value ?? null);
        setQuery('');
        setOpen(false);
    };

    const displayValue = open ? query : (selected?.label ?? '');

    return (
        <div ref={rootRef} className={cn('relative w-full min-w-[11rem]', className)}>
            <div
                className={cn(
                    'flex h-9 items-center gap-2 rounded-lg border bg-white px-2.5 text-sm shadow-sm transition-all',
                    open
                        ? 'border-emerald-500 ring-2 ring-emerald-500/15'
                        : 'border-slate-200 hover:border-slate-300 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/15',
                    disabled && 'pointer-events-none bg-slate-50 opacity-60',
                )}
            >
                <Search className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                <input
                    ref={inputRef}
                    value={displayValue}
                    disabled={disabled}
                    placeholder={placeholder}
                    className="min-w-0 flex-1 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
                    onFocus={() => {
                        setOpen(true);
                        setQuery('');
                    }}
                    onChange={(event) => {
                        setQuery(event.target.value);
                        if (!open) setOpen(true);
                    }}
                    onKeyDown={(event) => {
                        if (event.key === 'ArrowDown') {
                            event.preventDefault();
                            setOpen(true);
                            setHighlight((index) => Math.min(index + 1, Math.max(filtered.length - 1, 0)));
                        } else if (event.key === 'ArrowUp') {
                            event.preventDefault();
                            setHighlight((index) => Math.max(index - 1, 0));
                        } else if (event.key === 'Enter') {
                            event.preventDefault();
                            if (open && filtered[highlight]) selectItem(filtered[highlight]);
                        } else if (event.key === 'Escape') {
                            setOpen(false);
                            setQuery('');
                        }
                    }}
                />
                {clearable && selected && !disabled && (
                    <button
                        type="button"
                        className="flex h-5 w-5 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                        onClick={(event) => {
                            event.stopPropagation();
                            selectItem(null);
                            inputRef.current?.focus();
                        }}
                        title="Clear"
                    >
                        <X className="h-3 w-3" />
                    </button>
                )}
                <button
                    type="button"
                    className="flex items-center text-slate-400"
                    onClick={() => {
                        setOpen((current) => !current);
                        inputRef.current?.focus();
                    }}
                >
                    <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', open && 'rotate-180 text-emerald-600')} />
                </button>
            </div>

            {open && (
                <div className="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-slate-200 bg-white p-1 shadow-lg">
                    {filtered.length === 0 ? (
                        <div className="px-3 py-3 text-center text-xs text-slate-400">No results found</div>
                    ) : (
                        filtered.map((item, index) => {
                            const isSelected = item.value === value;
                            const isHighlighted = index === highlight;

                            return (
                                <button
                                    key={item.value}
                                    type="button"
                                    className={cn(
                                        'flex w-full items-center justify-between rounded-md px-2.5 py-2 text-left text-sm',
                                        isHighlighted && 'bg-emerald-50 text-emerald-900',
                                        isSelected && 'font-medium text-emerald-800',
                                    )}
                                    onMouseEnter={() => setHighlight(index)}
                                    onClick={() => selectItem(item)}
                                >
                                    <span className="truncate">{item.label}</span>
                                    {isSelected && <Check className="h-3.5 w-3.5 shrink-0 text-emerald-600" />}
                                </button>
                            );
                        })
                    )}
                </div>
            )}
        </div>
    );
}
