import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import {
    LayoutDashboard,
    GraduationCap,
    Receipt,
    ClipboardCheck,
    Menu,
    CalendarDays,
    Wallet,
} from 'lucide-react';
import { useTerminology } from '@/hooks/useTerminology';

interface MobileBottomNavProps {
    onOpenMenu: () => void;
    isMobileMenuOpen?: boolean;
}

export default function MobileBottomNav({ onOpenMenu, isMobileMenuOpen = false }: MobileBottomNavProps) {
    const { url, props } = usePage<{ auth?: { user?: { roles?: Array<{ name: string }> } } }>();
    const terminology = useTerminology();
    const roles = props.auth?.user?.roles?.map((r) => r.name) || [];

    const isTeacher = roles.includes('Teacher');
    const isStudent = roles.includes('Student');
    const isParent = roles.includes('Parent');

    // Dashboard URL depending on role
    const dashboardHref = isTeacher
        ? '/teacher/dashboard'
        : isStudent
        ? '/student/dashboard'
        : isParent
        ? '/parent/dashboard'
        : '/dashboard';

    // Primary quick action URL
    let quickActionHref = '/fee-collections/create';
    let quickActionTitle = 'Collect Fee';
    let QuickActionIcon = Receipt;

    if (isTeacher) {
        quickActionHref = '/teacher/attendance';
        quickActionTitle = 'Attendance';
        QuickActionIcon = ClipboardCheck;
    } else if (isStudent) {
        quickActionHref = '/student/fees';
        quickActionTitle = 'My Fees';
        QuickActionIcon = Wallet;
    }

    // Secondary items
    const studentsHref = isTeacher ? '/teacher/students' : '/students';
    const attendanceHref = isTeacher ? '/teacher/attendance' : '/student-attendance';

    const isCurrent = (path: string) => {
        if (!path) return false;
        const [cleanUrl] = url.split('?');
        return cleanUrl === path || cleanUrl.startsWith(`${path}/`);
    };

    return (
        <nav
            aria-label="Mobile Navigation Dock"
            className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-emerald-100 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] px-2 py-1.5"
        >
            <div className="flex items-center justify-around max-w-md mx-auto">
                {/* 1. Dashboard Tab */}
                <Link
                    href={dashboardHref}
                    className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
                        isCurrent(dashboardHref)
                            ? 'text-emerald-700 font-bold scale-105'
                            : 'text-slate-500 hover:text-slate-800'
                    }`}
                >
                    <div className={`p-1 rounded-lg ${isCurrent(dashboardHref) ? 'bg-emerald-50 text-emerald-700' : ''}`}>
                        <LayoutDashboard className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] mt-0.5 tracking-tight">Home</span>
                </Link>

                {/* 2. Students / Classes Tab */}
                <Link
                    href={isStudent ? '/student/routine' : studentsHref}
                    className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
                        isCurrent(isStudent ? '/student/routine' : studentsHref)
                            ? 'text-emerald-700 font-bold scale-105'
                            : 'text-slate-500 hover:text-slate-800'
                    }`}
                >
                    <div
                        className={`p-1 rounded-lg ${
                            isCurrent(isStudent ? '/student/routine' : studentsHref)
                                ? 'bg-emerald-50 text-emerald-700'
                                : ''
                        }`}
                    >
                        {isStudent ? <CalendarDays className="w-5 h-5" /> : <GraduationCap className="w-5 h-5" />}
                    </div>
                    <span className="text-[10px] mt-0.5 tracking-tight">
                        {isStudent ? 'Routine' : terminology.studentsLabel}
                    </span>
                </Link>

                {/* 3. Center Elevated Quick Action Button */}
                <Link
                    href={quickActionHref}
                    className="flex flex-col items-center -mt-4 group focus:outline-hidden"
                    title={quickActionTitle}
                >
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-600/30 flex items-center justify-center border-2 border-white group-hover:scale-110 active:scale-95 transition-transform duration-150">
                        <QuickActionIcon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold text-emerald-800 mt-1 tracking-tight">
                        {quickActionTitle}
                    </span>
                </Link>

                {/* 4. Attendance Tab */}
                <Link
                    href={attendanceHref}
                    className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
                        isCurrent(attendanceHref)
                            ? 'text-emerald-700 font-bold scale-105'
                            : 'text-slate-500 hover:text-slate-800'
                    }`}
                >
                    <div className={`p-1 rounded-lg ${isCurrent(attendanceHref) ? 'bg-emerald-50 text-emerald-700' : ''}`}>
                        <ClipboardCheck className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] mt-0.5 tracking-tight">Attendance</span>
                </Link>

                {/* 5. More / Menu Drawer Trigger */}
                <button
                    type="button"
                    onClick={onOpenMenu}
                    className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
                        isMobileMenuOpen ? 'text-emerald-700 font-bold' : 'text-slate-500 hover:text-slate-800'
                    }`}
                    aria-label="Open Navigation Menu"
                >
                    <div className={`p-1 rounded-lg ${isMobileMenuOpen ? 'bg-emerald-50 text-emerald-700' : ''}`}>
                        <Menu className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] mt-0.5 tracking-tight">Menu</span>
                </button>
            </div>
        </nav>
    );
}
