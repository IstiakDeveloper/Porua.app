import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import { useInstitute } from '@/hooks/useInstitute';
import { useTerminology, Terminology } from '@/hooks/useTerminology';
import {
    LayoutDashboard,
    Users,
    GraduationCap,
    BookOpen,
    Calendar,
    ClipboardCheck,
    FileText,
    DollarSign,
    Library,
    Bell,
    BarChart3,
    Settings,
    ChevronRight,
    Wallet,
    Building2,
    TrendingUp,
    TrendingDown,
    UserPlus,
    Briefcase,
    User,
    Award,
    ShieldCheck,
    KeyRound,
    Layers,
    LayoutList,
    BookMarked,
    UserCircle2,
    PenLine,
    Trophy,
    Tag,
    Banknote,
    AlertCircle,
    HandCoins,
    Landmark,
    Receipt,
    PieChart,
    Scale,
    Megaphone,
    CalendarDays,
    Cpu,
    UserCheck,
    ClipboardList,
    CalendarClock,
    BookCopy,
    ArrowLeftRight,
    Calculator,
    X,
} from 'lucide-react';

interface User {
    id: number;
    name: string;
    email: string;
    roles?: Array<{ name: string }>;
}

interface MenuItem {
    name: string;
    href?: string;
    icon: React.ReactNode;
    roles?: string[];
    modes?: Array<'school' | 'coaching' | 'hybrid'>;
    children?: MenuItem[];
}

export interface MenuCategory {
    title?: string;
    roles?: string[];
    modes?: Array<'school' | 'coaching' | 'hybrid'>;
    items: MenuItem[];
}

const iconClass = 'w-4 h-4 shrink-0';

const getMenuCategories = (t: Terminology): MenuCategory[] => [
    {
        items: [
            { name: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard className={iconClass} />, roles: ['Super Admin', 'Admin', 'Principal'] },
            { name: 'Dashboard', href: '/teacher/dashboard', icon: <LayoutDashboard className={iconClass} />, roles: ['Teacher'] },
            { name: 'Dashboard', href: '/student/dashboard', icon: <LayoutDashboard className={iconClass} />, roles: ['Student'] },
            { name: 'Dashboard', href: '/parent/dashboard', icon: <LayoutDashboard className={iconClass} />, roles: ['Parent'] },
        ],
    },
    {
        title: 'Academic & Learning',
        items: [
            {
                name: t.isCoaching ? 'Courses & Batches' : (t.isHybrid ? 'Academic & Coaching' : 'Academic'),
                icon: <BookOpen className={iconClass} />,
                roles: ['Super Admin', 'Admin', 'Principal'],
                children: [
                    { name: t.sessionsLabel, href: '/academic-years', icon: <Calendar className={iconClass} />, roles: ['Super Admin', 'Admin', 'Principal'] },
                    { name: t.isHybrid ? 'Classes (School)' : t.classesLabel, href: '/classes', icon: <Layers className={iconClass} />, roles: ['Super Admin', 'Admin', 'Principal'], modes: ['school', 'hybrid'] },
                    { name: t.isHybrid ? 'Sections (School)' : t.sectionsLabel, href: '/sections', icon: <LayoutList className={iconClass} />, roles: ['Super Admin', 'Admin', 'Principal'], modes: ['school', 'hybrid'] },
                    { name: t.isHybrid ? 'Courses (Coaching)' : 'Courses', href: '/courses', icon: <BookCopy className={iconClass} />, roles: ['Super Admin', 'Admin', 'Principal'], modes: ['coaching', 'hybrid'] },
                    { name: t.isHybrid ? 'Batches (Coaching)' : 'Batches', href: '/batches', icon: <LayoutList className={iconClass} />, roles: ['Super Admin', 'Admin', 'Principal'], modes: ['coaching', 'hybrid'] },
                    { name: 'Class Routine', href: '/coaching/routine', icon: <CalendarDays className={iconClass} />, roles: ['Super Admin', 'Admin', 'Principal', 'Teacher'], modes: ['coaching', 'hybrid'] },
                    { name: t.subjectsLabel, href: '/subjects', icon: <BookMarked className={iconClass} />, roles: ['Super Admin', 'Admin', 'Principal'] },
                ],
            },
            {
                name: t.studentsLabel,
                icon: <GraduationCap className={iconClass} />,
                roles: ['Super Admin', 'Admin', 'Principal', 'Teacher'],
                children: [
                    { name: `All ${t.studentsLabel}`, href: '/students', icon: <GraduationCap className={iconClass} />, roles: ['Super Admin', 'Admin', 'Principal'] },
                    { name: `My ${t.studentsLabel}`, href: '/teacher/students', icon: <Users className={iconClass} />, roles: ['Teacher'] },
                    { name: t.promotionLabel, href: '/student-promotions', icon: <ArrowLeftRight className={iconClass} />, roles: ['Super Admin', 'Admin', 'Principal'], modes: ['school', 'hybrid'] },
                    { name: 'Parents', href: '/student-parents', icon: <UserCircle2 className={iconClass} />, roles: ['Super Admin', 'Admin', 'Principal'] },
                ],
            },
            {
                name: 'Exams',
                icon: <FileText className={iconClass} />,
                roles: ['Super Admin', 'Admin', 'Principal', 'Teacher'],
                children: [
                    { name: 'All Exams', href: '/exams', icon: <FileText className={iconClass} />, roles: ['Super Admin', 'Admin', 'Principal'] },
                    { name: 'Model Tests & Quizzes', href: '/model-tests', icon: <Award className={iconClass} />, roles: ['Super Admin', 'Admin', 'Principal', 'Teacher'], modes: ['coaching', 'hybrid'] },
                    { name: 'My Exams', href: '/teacher/exams', icon: <BookCopy className={iconClass} />, roles: ['Teacher'] },
                    { name: 'Schedules', href: '/exam-schedules', icon: <Calendar className={iconClass} />, roles: ['Super Admin', 'Admin', 'Principal'] },
                    { name: 'Marks', href: '/marks', icon: <PenLine className={iconClass} />, roles: ['Super Admin', 'Admin', 'Principal'] },
                    { name: 'Results', href: '/results', icon: <Trophy className={iconClass} />, roles: ['Super Admin', 'Admin', 'Principal'] },
                ],
            },
        ],
    },
    {
        title: 'Employee Management',
        roles: ['Super Admin', 'Admin', 'Principal', 'Teacher'],
        items: [
            {
                name: 'Teachers',
                icon: <GraduationCap className={iconClass} />,
                roles: ['Super Admin', 'Admin', 'Principal'],
                children: [
                    { name: 'All Teachers', href: '/teachers', icon: <GraduationCap className={iconClass} />, roles: ['Super Admin', 'Admin', 'Principal'] },
                    { name: 'Teacher Subjects', href: '/teacher-subjects', icon: <BookMarked className={iconClass} />, roles: ['Super Admin', 'Admin', 'Principal'] },
                ],
            },
            {
                name: 'Attendance',
                icon: <ClipboardCheck className={iconClass} />,
                roles: ['Super Admin', 'Admin', 'Principal', 'Teacher'],
                children: [
                    { name: 'Batch Attendance', href: '/coaching/attendance', icon: <UserCheck className={iconClass} />, roles: ['Super Admin', 'Admin', 'Principal', 'Teacher'], modes: ['coaching', 'hybrid'] },
                    { name: 'View Attendance', href: '/teacher/attendance', icon: <ClipboardList className={iconClass} />, roles: ['Teacher'] },
                    { name: 'My Attendance', href: '/teacher/attendance/my', icon: <UserCheck className={iconClass} />, roles: ['Teacher'] },
                    { name: 'Daily Attendance', href: '/teacher-attendance', icon: <ClipboardCheck className={iconClass} />, roles: ['Super Admin', 'Admin', 'Principal'] },
                    { name: 'Monthly View', href: '/teacher-attendance/monthly', icon: <CalendarDays className={iconClass} />, roles: ['Super Admin', 'Admin', 'Principal'] },
                    { name: 'Attendance Report', href: '/teacher-attendance/report', icon: <FileText className={iconClass} />, roles: ['Super Admin', 'Admin', 'Principal'] },
                    { name: 'Attendance Sheet Report', href: '/teacher-attendance/sheet-report', icon: <ClipboardList className={iconClass} />, roles: ['Super Admin', 'Admin', 'Principal'] },
                    { name: 'Device Settings', href: '/device-settings', icon: <Cpu className={iconClass} />, roles: ['Super Admin', 'Admin', 'Principal'] },
                ],
            },
            {
                name: 'Leave Management',
                icon: <CalendarClock className={iconClass} />,
                roles: ['Super Admin', 'Admin', 'Principal'],
                children: [
                    { name: 'Leave Applications', href: '/leave-applications', icon: <ClipboardList className={iconClass} />, roles: ['Super Admin', 'Admin', 'Principal'] },
                    { name: 'Leave Types & Quotas', href: '/leave-types', icon: <Tag className={iconClass} />, roles: ['Super Admin', 'Admin'] },
                    { name: 'Leave Reports', href: '/leave-reports', icon: <FileText className={iconClass} />, roles: ['Super Admin', 'Admin', 'Principal'] },
                ],
            },
            {
                name: 'My Leaves',
                href: '/teacher/leaves',
                icon: <CalendarClock className={iconClass} />,
                roles: ['Teacher'],
            },
            {
                name: 'Staff & Salary',
                icon: <Briefcase className={iconClass} />,
                roles: ['Super Admin', 'Admin', 'Principal'],
                children: [
                    { name: 'Salary Payments', href: '/salary-payments', icon: <DollarSign className={iconClass} />, roles: ['Super Admin', 'Admin', 'Principal'] },
                    { name: 'Provident Fund', href: '/provident-fund', icon: <Wallet className={iconClass} />, roles: ['Super Admin', 'Admin', 'Principal'] },
                ],
            },
            {
                name: 'Other Staff',
                icon: <Users className={iconClass} />,
                roles: ['Super Admin'],
                children: [
                    { name: 'All Staff', href: '/other-staff', icon: <Users className={iconClass} />, roles: ['Super Admin'] },
                    { name: 'Attendance Logs', href: '/other-staff-attendance', icon: <ClipboardCheck className={iconClass} />, roles: ['Super Admin'] },
                    { name: 'Attendance Calculator', href: '/other-staff-attendance?tab=calculator', icon: <Calculator className={iconClass} />, roles: ['Super Admin'] },
                ],
            },
        ],
    },
    {
        title: 'Finance & Accounts',
        roles: ['Super Admin', 'Admin', 'Principal', 'Accountant'],
        items: [
            {
                name: 'Fees',
                icon: <DollarSign className={iconClass} />,
                roles: ['Super Admin', 'Admin', 'Principal', 'Accountant'],
                children: [
                    { name: 'Collect Fee (POS)', href: '/fee-collections/create', icon: <Receipt className={iconClass} />, roles: ['Super Admin', 'Admin', 'Principal', 'Accountant'] },
                    { name: 'Collections', href: '/fee-collections', icon: <Banknote className={iconClass} />, roles: ['Super Admin', 'Admin', 'Principal', 'Accountant'] },
                    { name: 'Batch Fees (Coaching)', href: '/coaching/fees', icon: <Layers className={iconClass} />, roles: ['Super Admin', 'Admin', 'Principal', 'Accountant'], modes: ['coaching', 'hybrid'] },
                    { name: 'Teacher Payouts', href: '/teacher-payouts', icon: <Calculator className={iconClass} />, roles: ['Super Admin', 'Admin', 'Principal', 'Accountant'], modes: ['coaching', 'hybrid'] },
                    { name: 'Fee Types', href: '/fee-types', icon: <Tag className={iconClass} />, roles: ['Super Admin', 'Admin', 'Principal', 'Accountant'] },
                    { name: 'Overdue Fees', href: '/overdue-fees', icon: <AlertCircle className={iconClass} />, roles: ['Super Admin', 'Admin', 'Principal', 'Accountant'] },
                ],
            },
            {
                name: 'Accounting',
                icon: <Wallet className={iconClass} />,
                roles: ['Super Admin', 'Admin', 'Principal', 'Accountant'],
                children: [
                    { name: 'Dashboard', href: '/accounting/dashboard', icon: <LayoutDashboard className={iconClass} />, roles: ['Super Admin', 'Admin', 'Principal', 'Accountant'] },
                    { name: 'Accounts', href: '/accounting/accounts', icon: <Landmark className={iconClass} />, roles: ['Super Admin', 'Admin', 'Principal', 'Accountant'] },
                    { name: 'Transactions', href: '/accounting/transactions', icon: <ArrowLeftRight className={iconClass} />, roles: ['Super Admin', 'Admin', 'Principal', 'Accountant'] },
                    { name: 'Fixed Assets', href: '/accounting/fixed-assets', icon: <Building2 className={iconClass} />, roles: ['Super Admin', 'Admin', 'Principal', 'Accountant'] },
                    { name: 'Investors', href: '/accounting/investors', icon: <UserPlus className={iconClass} />, roles: ['Super Admin', 'Admin', 'Principal', 'Accountant'] },
                    { name: 'Funds', href: '/accounting/funds', icon: <Briefcase className={iconClass} />, roles: ['Super Admin', 'Admin', 'Principal', 'Accountant'] },
                    { name: 'Welfare Loans', href: '/accounting/welfare-loans', icon: <HandCoins className={iconClass} />, roles: ['Super Admin', 'Admin', 'Principal', 'Accountant'] },
                    { name: 'Income Categories', href: '/accounting/income-categories', icon: <TrendingUp className={iconClass} />, roles: ['Super Admin', 'Admin', 'Principal', 'Accountant'] },
                    { name: 'Expense Categories', href: '/accounting/expense-categories', icon: <TrendingDown className={iconClass} />, roles: ['Super Admin', 'Admin', 'Principal', 'Accountant'] },
                ],
            },
        ],
    },
    {
        title: 'Student Portal',
        roles: ['Student'],
        items: [
            { name: 'My Profile', href: '/student/profile', icon: <User className={iconClass} />, roles: ['Student'] },
            { name: 'Attendance', href: '/student/attendance', icon: <ClipboardCheck className={iconClass} />, roles: ['Student'] },
            {
                name: 'Exams & Results',
                icon: <Award className={iconClass} />,
                roles: ['Student'],
                children: [
                    { name: 'My Exams', href: '/student/exams', icon: <FileText className={iconClass} />, roles: ['Student'] },
                    { name: 'My Results', href: '/student/results', icon: <Trophy className={iconClass} />, roles: ['Student'] },
                ],
            },
            { name: 'Fees & Invoices', href: '/student/fees', icon: <DollarSign className={iconClass} />, roles: ['Student'] },
            { name: 'Library', href: '/student/library', icon: <Library className={iconClass} />, roles: ['Student'] },
            { name: 'Notices', href: '/student/notices', icon: <Megaphone className={iconClass} />, roles: ['Student'] },
            { name: 'Events', href: '/student/events', icon: <CalendarDays className={iconClass} />, roles: ['Student'] },
            { name: 'Messages', href: '/student/messages', icon: <Bell className={iconClass} />, roles: ['Student'] },
        ],
    },
    {
        title: 'Family Portal',
        roles: ['Parent'],
        items: [
            { name: 'My Children', href: '/parent/children', icon: <Users className={iconClass} />, roles: ['Parent'] },
            { name: 'Attendance', href: '/parent/attendance', icon: <ClipboardCheck className={iconClass} />, roles: ['Parent'] },
            { name: 'Exams & Results', href: '/parent/exams', icon: <Award className={iconClass} />, roles: ['Parent'] },
            { name: 'Fees & Invoices', href: '/parent/fees', icon: <DollarSign className={iconClass} />, roles: ['Parent'] },
            { name: 'Notices', href: '/parent/notices', icon: <Megaphone className={iconClass} />, roles: ['Parent'] },
            { name: 'Messages', href: '/parent/messages', icon: <Bell className={iconClass} />, roles: ['Parent'] },
            { name: 'My Profile', href: '/parent/profile', icon: <User className={iconClass} />, roles: ['Parent'] },
        ],
    },
    {
        title: 'Communication & Library',
        roles: ['Super Admin', 'Admin', 'Principal', 'Teacher', 'Librarian'],
        items: [
            {
                name: 'Library',
                icon: <Library className={iconClass} />,
                roles: ['Super Admin', 'Admin', 'Principal', 'Librarian'],
                children: [
                    { name: 'Books', href: '/books', icon: <BookCopy className={iconClass} />, roles: ['Super Admin', 'Admin', 'Principal', 'Librarian'] },
                    { name: 'Issue/Return', href: '/book-issues', icon: <ArrowLeftRight className={iconClass} />, roles: ['Super Admin', 'Admin', 'Principal', 'Librarian'] },
                ],
            },
            { name: 'Notices', href: '/notices', icon: <Megaphone className={iconClass} />, roles: ['Super Admin', 'Admin', 'Principal'] },
            { name: 'Notices', href: '/teacher/notices', icon: <Megaphone className={iconClass} />, roles: ['Teacher'] },
            { name: 'Messages', href: '/teacher/messages', icon: <Bell className={iconClass} />, roles: ['Teacher'] },
        ],
    },
    {
        title: 'Reports & Analytics',
        roles: ['Super Admin', 'Admin', 'Principal', 'Accountant'],
        items: [
            {
                name: 'Financial Reports',
                icon: <BarChart3 className={iconClass} />,
                roles: ['Super Admin', 'Admin', 'Principal', 'Accountant'],
                children: [
                    { name: 'Due Report', href: '/accounting/reports/due-report', icon: <CalendarClock className={iconClass} />, roles: ['Super Admin', 'Admin', 'Principal', 'Accountant'] },
                    { name: 'Welfare Loan Ledger', href: '/accounting/reports/staff-welfare-loan-ledger', icon: <HandCoins className={iconClass} />, roles: ['Super Admin', 'Admin', 'Principal', 'Accountant'] },
                    { name: 'Bank Report', href: '/accounting/reports/bank-report', icon: <Landmark className={iconClass} />, roles: ['Super Admin', 'Admin', 'Principal', 'Accountant'] },
                    { name: 'Receipt Payment', href: '/accounting/reports/receipt-payment', icon: <Receipt className={iconClass} />, roles: ['Super Admin', 'Admin', 'Principal', 'Accountant'] },
                    { name: 'Income Expenditure', href: '/accounting/reports/income-expenditure', icon: <PieChart className={iconClass} />, roles: ['Super Admin', 'Admin', 'Principal', 'Accountant'] },
                    { name: 'Balance Sheet', href: '/accounting/reports/balance-sheet', icon: <Scale className={iconClass} />, roles: ['Super Admin', 'Admin', 'Principal', 'Accountant'] },
                ],
            },
        ],
    },
    {
        title: 'System & Settings',
        roles: ['Super Admin', 'Admin', 'Principal'],
        items: [
            {
                name: 'Users',
                icon: <Users className={iconClass} />,
                roles: ['Super Admin', 'Admin'],
                children: [
                    { name: 'All Users', href: '/users', icon: <Users className={iconClass} />, roles: ['Super Admin', 'Admin'] },
                    { name: 'Roles', href: '/roles', icon: <ShieldCheck className={iconClass} />, roles: ['Super Admin', 'Admin'] },
                    { name: 'Permissions', href: '/permissions', icon: <KeyRound className={iconClass} />, roles: ['Super Admin', 'Admin'] },
                ],
            },
            { name: 'Settings', href: '/settings', icon: <Settings className={iconClass} />, roles: ['Super Admin', 'Admin', 'Principal'] },
        ],
    },
];

interface SidebarProps {
    mobileOpen?: boolean;
    onCloseMobile?: () => void;
}

export default function Sidebar({ mobileOpen = false, onCloseMobile }: SidebarProps = {}) {
    const institute = useInstitute();
    const terminology = useTerminology();
    const { url, props } = usePage<{ auth: { user: User } }>();
    const [openMenus, setOpenMenus] = React.useState<string[]>([]);

    const user = props.auth?.user;
    const userRoles = user?.roles?.map(role => role.name) || [];

    const categories = React.useMemo(() => getMenuCategories(terminology), [terminology]);

    const hasAccess = React.useCallback((itemRoles?: string[], itemModes?: Array<'school' | 'coaching' | 'hybrid'>) => {
        if (itemModes && itemModes.length > 0 && !itemModes.includes(terminology.instituteType)) {
            return false;
        }
        if (!itemRoles || itemRoles.length === 0) return true;
        return itemRoles.some(role => userRoles.includes(role));
    }, [terminology.instituteType, userRoles]);

    const filteredCategories = React.useMemo(() => {
        return categories
            .filter(category => hasAccess(category.roles, category.modes))
            .map(category => {
                const filteredItems = category.items
                    .filter(item => hasAccess(item.roles, item.modes))
                    .map(item => {
                        if (item.children) {
                            return {
                                ...item,
                                children: item.children.filter(child => hasAccess(child.roles, child.modes)),
                            };
                        }
                        return item;
                    })
                    .filter(item => !item.children || item.children.length > 0);

                return {
                    ...category,
                    items: filteredItems,
                };
            })
            .filter(category => category.items.length > 0);
    }, [categories, hasAccess]);

    const allItems = React.useMemo(() => {
        return filteredCategories.flatMap(c => c.items);
    }, [filteredCategories]);

    const collectHrefs = (items: MenuItem[]): string[] => {
        return items.flatMap((item) => {
            const own = item.href ? [item.href.split('?')[0]] : [];
            return item.children ? [...own, ...collectHrefs(item.children)] : own;
        });
    };

    const menuPaths = React.useMemo(() => collectHrefs(allItems), [allItems]);

    const isActive = (href?: string) => {
        if (!href) return false;
        if (href === '/dashboard') return url === '/dashboard';

        const [currentPath, currentQuery] = url.split('?');
        const [targetPath, targetQuery] = href.split('?');

        const isExact = currentPath === targetPath;
        const isPrefix = currentPath.startsWith(`${targetPath}/`);
        if (!isExact && !isPrefix) return false;

        // Prefer the most specific sidebar item
        if (isPrefix) {
            const hasMoreSpecific = menuPaths.some((otherPath) => {
                if (otherPath === targetPath) return false;
                const matches = currentPath === otherPath || currentPath.startsWith(`${otherPath}/`);
                return matches && otherPath.length > targetPath.length;
            });
            if (hasMoreSpecific) return false;
        }

        if (targetQuery) {
            return currentQuery ? currentQuery.includes(targetQuery) : false;
        }

        if (currentQuery && currentQuery.includes('tab=calculator')) {
            return false;
        }

        return true;
    };

    React.useEffect(() => {
        allItems.forEach((item) => {
            if (item.children) {
                const hasActiveChild = item.children.some((child) => child.href && isActive(child.href));
                if (hasActiveChild && !openMenus.includes(item.name)) {
                    setOpenMenus((prev) => [...prev, item.name]);
                }
            }
        });
    }, [url, allItems]);

    const toggleMenu = (name: string) => {
        setOpenMenus((prev) =>
            prev.includes(name) ? prev.filter((m) => m !== name) : [...prev, name]
        );
    };

    return (
        <>
            {/* Mobile Backdrop Overlay */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 md:hidden transition-opacity"
                    onClick={onCloseMobile}
                    aria-hidden="true"
                />
            )}

            <aside
                className={`w-64 md:w-56 bg-white border-r border-emerald-200/80 h-screen fixed left-0 top-0 flex flex-col z-50 md:z-30 shadow-xl md:shadow-sm transition-transform duration-300 ease-in-out ${
                    mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
                }`}
            >
                <div className="p-3 border-b border-emerald-100 shrink-0 bg-emerald-600 flex items-center justify-between">
                    <Link
                        href="/"
                        onClick={() => onCloseMobile?.()}
                        className="flex items-center gap-2.5 group transition-all duration-150 hover:opacity-95 min-w-0"
                        title="Go to Home / Website"
                    >
                        <div className="w-9 h-9 bg-white rounded-lg p-1 shadow-sm flex items-center justify-center shrink-0 overflow-hidden group-hover:scale-105 transition-transform">
                            <img 
                                src={institute.logo_url || '/logo.png'} 
                                alt={institute.name} 
                                className="w-full h-full object-contain" 
                            />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs font-bold text-white truncate leading-tight tracking-tight group-hover:text-emerald-50 transition-colors" title={institute.name}>
                                {institute.name}
                            </p>
                            <div className="flex items-center gap-1 mt-0.5">
                                <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-semibold bg-emerald-700/80 text-emerald-100 border border-emerald-500/40">
                                    {terminology.modeBadgeTitle}
                                </span>
                            </div>
                        </div>
                    </Link>
                    <button
                        type="button"
                        onClick={onCloseMobile}
                        className="md:hidden p-1.5 rounded-lg text-emerald-100 hover:text-white hover:bg-emerald-700/80 transition-colors ml-1 shrink-0 cursor-pointer"
                        aria-label="Close menu"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <nav className="flex-1 overflow-y-auto py-2 px-2 bg-white space-y-3">
                    {filteredCategories.map((category, catIdx) => (
                        <div key={category.title || `cat-${catIdx}`} className="space-y-0.5">
                            {category.title && (
                                <div className="px-2 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 select-none">
                                    {category.title}
                                </div>
                            )}
                            <ul className="space-y-0.5">
                                {category.items.map((item) => (
                                    <li key={item.href || item.name}>
                                        {item.children ? (
                                            <>
                                                <button
                                                    type="button"
                                                    onClick={() => toggleMenu(item.name)}
                                                    className="w-full flex items-center justify-between gap-2 py-1.5 px-2 rounded-lg text-left text-gray-700 hover:bg-emerald-50 hover:text-emerald-800 transition-colors"
                                                >
                                                    <div className="flex items-center gap-2 min-w-0">
                                                        {item.icon}
                                                        <span className="text-xs font-medium truncate">{item.name}</span>
                                                    </div>
                                                    <ChevronRight
                                                        className={`w-3.5 h-3.5 text-gray-400 shrink-0 transition-transform ${
                                                            openMenus.includes(item.name) ? 'rotate-90' : ''
                                                        }`}
                                                    />
                                                </button>
                                                {openMenus.includes(item.name) && (
                                                    <ul className="mt-0.5 ml-4 pl-2 border-l-2 border-emerald-200 space-y-0.5">
                                                        {item.children.map((child) => (
                                                            <li key={child.href || child.name}>
                                                                <Link
                                                                    href={child.href!}
                                                                    onClick={() => onCloseMobile?.()}
                                                                    className={`flex items-center gap-2 py-1.5 px-2 rounded-lg text-xs transition-colors ${
                                                                        isActive(child.href)
                                                                            ? 'bg-emerald-50 text-emerald-800 font-medium border-l-2 -ml-0.5 pl-2.5 border-emerald-600'
                                                                            : 'text-gray-600 hover:bg-emerald-50/70 hover:text-emerald-700'
                                                                    }`}
                                                                >
                                                                    {child.icon}
                                                                    <span className="truncate">{child.name}</span>
                                                                </Link>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </>
                                        ) : (
                                            <Link
                                                href={item.href!}
                                                onClick={() => onCloseMobile?.()}
                                                className={`flex items-center gap-2 py-1.5 px-2 rounded-lg text-xs transition-colors ${
                                                    isActive(item.href)
                                                        ? 'bg-emerald-50 text-emerald-800 font-medium border-l-2 border-emerald-600 -ml-0.5 pl-2.5'
                                                        : 'text-gray-600 hover:bg-emerald-50/70 hover:text-emerald-700'
                                                }`}
                                            >
                                                {item.icon}
                                                <span className="truncate">{item.name}</span>
                                            </Link>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </nav>
            </aside>
        </>
    );
}
