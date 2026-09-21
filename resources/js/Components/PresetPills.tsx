import React from 'react';
import { Sparkles } from 'lucide-react';

export interface PresetOption {
    label: string;
    sublabel?: string;
    onClick: () => void;
    active?: boolean;
}

export interface PresetPillsProps {
    title?: string;
    subtitle?: string;
    options?: PresetOption[];
    // Flexible alternative API:
    presets?: string[];
    activeValue?: string;
    onSelect?: (val: string) => void;
    className?: string;
}

export default function PresetPills({
    title = 'Quick Presets / Auto-Fill',
    subtitle,
    options,
    presets,
    activeValue,
    onSelect,
    className = '',
}: PresetPillsProps) {
    const items: PresetOption[] = [];

    if (Array.isArray(options)) {
        items.push(...options);
    } else if (Array.isArray(presets)) {
        presets.forEach((p) => {
            items.push({
                label: p,
                active: activeValue === p,
                onClick: () => onSelect?.(p),
            });
        });
    }

    if (items.length === 0) {
        return null;
    }

    return (
        <div className={`p-3 bg-emerald-50/60 border border-emerald-100/80 rounded-xl space-y-2 ${className}`}>
            <div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                    <span>{title}</span>
                </div>
                {subtitle && (
                    <p className="text-[11px] text-slate-500 mt-0.5">{subtitle}</p>
                )}
            </div>
            <div className="flex flex-wrap gap-1.5">
                {items.map((opt, i) => (
                    <button
                        key={i}
                        type="button"
                        onClick={opt.onClick}
                        className={`text-xs px-2.5 py-1 rounded-lg border transition-all cursor-pointer font-medium ${
                            opt.active
                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                                : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800'
                        }`}
                    >
                        {opt.label}
                        {opt.sublabel && (
                            <span className="ml-1 opacity-70 text-[10px]">({opt.sublabel})</span>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
}
