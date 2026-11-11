import { router } from '@inertiajs/react';
import { User } from 'lucide-react';

export interface ChildOption {
    id: number;
    full_name: string;
    class_name?: string;
    section_name?: string;
    roll_number?: string | null;
}

export default function ChildSwitcher({
    children,
    student,
    href,
    extra = {},
}: {
    children: ChildOption[];
    student: ChildOption | null;
    href: string;
    extra?: Record<string, string | number | undefined>;
}) {
    if (!student || children.length === 0) {
        return null;
    }

    if (children.length === 1) {
        return (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50/70 border border-indigo-100/80 text-xs font-semibold text-indigo-800">
                <User className="w-3.5 h-3.5 text-indigo-600" />
                <span>{student.full_name}</span>
                <span className="text-indigo-300">•</span>
                <span className="text-[11px] font-normal text-indigo-600">
                    {student.class_name ? `Class ${student.class_name}` : ''}
                    {student.section_name ? ` (${student.section_name})` : ''}
                    {student.roll_number ? ` • Roll ${student.roll_number}` : ''}
                </span>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2">
            <label htmlFor="child-switcher" className="text-xs font-semibold text-slate-600 shrink-0">
                Active Child:
            </label>
            <select
                id="child-switcher"
                className="h-9 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-800 shadow-2xs focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                value={String(student.id)}
                onChange={(event) => {
                    router.get(href, { ...extra, student_id: event.target.value }, { preserveScroll: true });
                }}
            >
                {children.map((child) => (
                    <option key={child.id} value={child.id}>
                        {child.full_name} {child.class_name ? `(${child.class_name})` : ''}
                    </option>
                ))}
            </select>
        </div>
    );
}
