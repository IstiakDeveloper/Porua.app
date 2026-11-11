import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import {
    LayoutDashboard,
    GraduationCap,
    Receipt,
    ClipboardCheck,
    Menu,
    Wallet,
    Users,
    Award,
    Trophy,
    Megaphone,
} from 'lucide-react';
import { useTerminology } from '@/hooks/useTerminology';
import { triggerHaptic } from '@/utils/haptics';

interface MobileBottomNavProps {
    onOpenMenu: () => void;
    isMobileMenuOpen?: boolean;
}

export default function MobileBottomNav({ onOpenMenu, isMobileMenuOpen = false }: MobileBottomNavProps) {
    const { url, props } = usePage<{
        auth?: { user?: { roles?: Array<{ name: string }> } };
        parentNav?: { urgentNotices?: number; unreadMessages?: number } | null;
    }>();
    const terminology = useTerminology();
    const roles = props.auth?.user?.roles?.map((r) => r.name) || [];

    const isTeacher = roles.includes('Teacher');
    const isStudent = roles.includes('Student');
    const isParent = roles.includes('Parent');

    // 1. Dashboard URL depending on role
    const dashboardHref = isTeacher
        ? '/teacher/dashboard'
        : isStudent
        ? '/student/dashboard'
        : isParent
        ? '/parent/dashboard'
        : '/dashboard';

    // 2. Tab 2 depending on role
    let tab2Href = '/students';
    let tab2Title = terminology.studentsLabel;
    let Tab2Icon = GraduationCap;

    if (isParent) {
        tab2Href = '/parent/attendance';
        tab2Title = 'Attendance';
        Tab2Icon = ClipboardCheck;
    } else if (isStudent) {
        tab2Href = '/student/attendance';
        tab2Title = 'Attendance';
        Tab2Icon = ClipboardCheck;
    } else if (isTeacher) {
        tab2Href = '/teacher/students';
        tab2Title = 'Students';
        Tab2Icon = Users;
    }

    // 3. Center Elevated Quick Action Button
    let quickActionHref = '/fee-collections/create';
    let quickActionTitle = 'Collect Fee';
    let QuickActionIcon = Receipt;

    if (isParent) {
        quickActionHref = '/parent/fees';
        quickActionTitle = 'Fees';
        QuickActionIcon = Wallet;
    } else if (isStudent) {
        quickActionHref = '/student/fees';
        quickActionTitle = 'My Fees';
        QuickActionIcon = Wallet;
    } else if (isTeacher) {
        quickActionHref = '/teacher/attendance';
        quickActionTitle = 'Attendance';
        QuickActionIcon = ClipboardCheck;
    }

    // 4. Tab 4 depending on role
    let tab4Href = '/student-attendance';
    let tab4Title = 'Attendance';
    let Tab4Icon = ClipboardCheck;

    if (isParent) {
        tab4Href = '/parent/notices';
        tab4Title = 'Notices';
        Tab4Icon = Megaphone;
    } else if (isStudent) {
        tab4Href = '/student/results';
        tab4Title = 'Results';
        Tab4Icon = Trophy;
    } else if (isTeacher) {
        tab4Href = '/teacher/exams';
        tab4Title = 'Exams';
        Tab4Icon = Award;
    }

    const isCurrent = (path: string) => {
        if (!path) return false;
        const [cleanUrl] = url.split('?');
        return cleanUrl === path || cleanUrl.startsWith(`${path}/`);
    };

    return (
        <nav
            aria-label="Mobile Navigation Dock"
            className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-emerald-100 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] px-2 pt-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))]"
        >
            <div className="flex items-center justify-around max-w-md mx-auto">
                {/* 1. Dashboard Tab */}
                <Link
                    href={dashboardHref}
                    onClick={() => triggerHaptic(8)}
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

                {/* 2. Secondary Tab */}
                <Link
                    href={tab2Href}
                    onClick={() => triggerHaptic(8)}
                    className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
                        isCurrent(tab2Href)
                            ? 'text-emerald-700 font-bold scale-105'
                            : 'text-slate-500 hover:text-slate-800'
                    }`}
                >
                    <div className={`p-1 rounded-lg ${isCurrent(tab2Href) ? 'bg-emerald-50 text-emerald-700' : ''}`}>
                        <Tab2Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] mt-0.5 tracking-tight">{tab2Title}</span>
                </Link>

                {/* 3. Center Elevated Quick Action Button */}
                <Link
                    href={quickActionHref}
                    onClick={() => triggerHaptic(12)}
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

                {/* 4. Tab 4 (Attendance / Results) */}
                <Link
                    href={tab4Href}
                    onClick={() => triggerHaptic(8)}
                    className={`relative flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
                        isCurrent(tab4Href)
                            ? 'text-emerald-700 font-bold scale-105'
                            : 'text-slate-500 hover:text-slate-800'
                    }`}
                >
                    <div className={`p-1 rounded-lg ${isCurrent(tab4Href) ? 'bg-emerald-50 text-emerald-700' : ''}`}>
                        <Tab4Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] mt-0.5 tracking-tight">{tab4Title}</span>
                    {isParent && (props.parentNav?.urgentNotices ?? 0) > 0 && (
                        <span className="absolute top-0 right-1 min-w-4 h-4 px-1 rounded-full bg-rose-600 text-white text-[9px] font-bold leading-4 text-center">
                            {props.parentNav?.urgentNotices}
                        </span>
                    )}
                </Link>

                {/* 5. More / Menu Drawer Trigger */}
                <button
                    type="button"
                    onClick={() => {
                        triggerHaptic(8);
                        onOpenMenu();
                    }}
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
