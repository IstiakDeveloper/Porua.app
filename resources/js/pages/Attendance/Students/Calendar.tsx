import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, List, Search, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Printer } from 'lucide-react';
import Button from '@/Components/Button';
import { useInstitute } from '@/hooks/useInstitute';

interface SchoolClass {
    id: number;
    name: string;
}

interface Section {
    id: number;
    name: string;
    class_id: number;
}

interface Student {
    id: number;
    name: string;
    admission_number: string;
    roll_number?: string;
    class_name: string;
    section_name: string;
    attendance: Record<number, { status: string | null; in_time: string | null; out_time: string | null }>;
    present_count: number;
}

interface Props {
    students: Student[];
    year: number;
    month: number;
    daysInMonth: number;
    classes: SchoolClass[];
    sections: Section[];
    filters: {
        class_id?: string;
        section_id?: string;
        search?: string;
    };
}

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function Calendar({ students, year, month, daysInMonth, classes, sections, filters }: Props) {
    const institute = useInstitute();
    const [search, setSearch] = useState(filters.search || '');
    const [selectedClass, setSelectedClass] = useState(filters.class_id || '');
    const [selectedSection, setSelectedSection] = useState(filters.section_id || '');

    const handlePrint = () => {
        window.print();
    };

    const handlePrevMonth = () => {
        let newMonth = month - 1;
        let newYear = year;
        if (newMonth < 1) {
            newMonth = 12;
            newYear--;
        }
        router.get('/student-attendance/calendar', {
            year: newYear,
            month: newMonth,
            class_id: selectedClass || undefined,
            section_id: selectedSection || undefined,
            search
        });
    };

    const handleNextMonth = () => {
        let newMonth = month + 1;
        let newYear = year;
        if (newMonth > 12) {
            newMonth = 1;
            newYear++;
        }
        router.get('/student-attendance/calendar', {
            year: newYear,
            month: newMonth,
            class_id: selectedClass || undefined,
            section_id: selectedSection || undefined,
            search
        });
    };

    const handleApplyFilters = () => {
        router.get('/student-attendance/calendar', {
            year,
            month,
            class_id: selectedClass || undefined,
            section_id: selectedSection || undefined,
            search
        });
    };

    const filteredSections = selectedClass
        ? sections.filter(s => s.class_id.toString() === selectedClass)
        : sections;

    const getStatusBadge = (status: string | null) => {
        const badges: Record<string, { bg: string; text: string; label: string }> = {
            present: { bg: 'bg-emerald-500', text: 'text-white', label: 'P' },
            absent: { bg: 'bg-rose-500', text: 'text-white', label: 'A' },
            late: { bg: 'bg-amber-500', text: 'text-white', label: 'L' },
            excused: { bg: 'bg-sky-500', text: 'text-white', label: 'E' },
            holiday: { bg: 'bg-purple-500', text: 'text-white', label: 'H' },
            weekend: { bg: 'bg-slate-200', text: 'text-slate-700', label: 'W' },
        };

        if (!status) {
            return <span className="text-slate-300 font-medium text-xs">·</span>;
        }

        const badge = badges[status] || badges.absent;
        return (
            <div className={`${badge.bg} ${badge.text} w-5 h-5 mx-auto flex items-center justify-center font-bold text-[10px] rounded-md shadow-2xs transition-transform hover:scale-110`}>
                {badge.label}
            </div>
        );
    };

    return (
        <AuthenticatedLayout>
            <Head title="Student Attendance Calendar">
                <style>{`
                    @media print {
                        @page {
                            size: landscape;
                            margin: 0.3cm;
                        }
                        body {
                            print-color-adjust: exact;
                            -webkit-print-color-adjust: exact;
                            margin: 0 !important;
                            padding: 0 !important;
                        }
                        * {
                            -webkit-print-color-adjust: exact !important;
                            print-color-adjust: exact !important;
                        }
                        .print\\:hidden {
                            display: none !important;
                        }
                        .space-y-5 {
                            gap: 0 !important;
                            margin: 0 !important;
                        }
                        h1, h2, h3, p {
                            display: none !important;
                        }
                        .bg-white {
                            box-shadow: none !important;
                            border: none !important;
                            margin: 0 !important;
                            padding: 0 !important;
                        }
                        table {
                            width: 100% !important;
                            font-size: 7px !important;
                            margin: 0 !important;
                            page-break-inside: avoid !important;
                        }
                        thead th {
                            padding: 2px 1px !important;
                            font-size: 7px !important;
                            font-weight: 600 !important;
                        }
                        tbody td {
                            padding: 1px !important;
                            font-size: 6px !important;
                        }
                        tbody td div {
                            font-size: 6px !important;
                        }
                        tbody td div p {
                            display: block !important;
                            margin: 0 !important;
                            padding: 0 !important;
                            line-height: 1.1 !important;
                        }
                        .sticky {
                            position: static !important;
                        }
                        tr {
                            page-break-inside: avoid !important;
                        }
                    }
                `}</style>
            </Head>

            {/* Screen View */}
            <div className="space-y-5 print:hidden">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-slate-900">Student Attendance Calendar</h1>
                        <p className="text-xs text-slate-500 mt-0.5">Monthly matrix view and performance summary</p>
                    </div>
                    <div className="grid grid-cols-2 sm:flex sm:items-center gap-2">
                        <Button onClick={handlePrint} variant="outline" size="sm" className="w-full rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm justify-center" icon={<Printer className="w-3.5 h-3.5" />}>
                            Print
                        </Button>
                        <Link href="/student-attendance" className="w-full sm:w-auto">
                            <Button variant="outline" size="sm" className="w-full rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm justify-center" icon={<List className="w-3.5 h-3.5" />}>
                                Register View
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Filters */}
                <div className="rounded-2xl border border-slate-200/80 bg-white p-4.5 shadow-sm ring-1 ring-slate-950/[0.02]">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search student name or roll..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleApplyFilters()}
                                className="h-9 w-full rounded-xl border border-slate-200/80 bg-white pl-9 pr-3 text-sm text-slate-800 shadow-sm outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15"
                            />
                        </div>
                        <div>
                            <select
                                value={selectedClass}
                                onChange={(e) => {
                                    setSelectedClass(e.target.value);
                                    setSelectedSection('');
                                }}
                                className="h-9 w-full rounded-xl border border-slate-200/80 bg-white px-3 text-sm text-slate-800 shadow-sm outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15"
                            >
                                <option value="">All Classes</option>
                                {classes.map((cls) => (
                                    <option key={cls.id} value={cls.id}>
                                        Class {cls.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <select
                                value={selectedSection}
                                onChange={(e) => setSelectedSection(e.target.value)}
                                disabled={!selectedClass}
                                className="h-9 w-full rounded-xl border border-slate-200/80 bg-white px-3 text-sm text-slate-800 shadow-sm outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 disabled:bg-slate-50"
                            >
                                <option value="">All Sections</option>
                                {filteredSections.map((section) => (
                                    <option key={section.id} value={section.id}>
                                        Section {section.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <Button size="sm" className="h-9 rounded-xl bg-slate-900 text-white hover:bg-slate-800 shadow-sm" onClick={handleApplyFilters}>
                            Apply Filters
                        </Button>
                    </div>
                </div>

                {/* Legend */}
                <div className="rounded-2xl border border-slate-200/80 bg-white px-4 py-2.5 shadow-sm ring-1 ring-slate-950/[0.02]">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                        <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-600">
                            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Legend:</span>
                            <div className="flex items-center gap-1.5">
                                <span className="inline-flex h-4 w-4 items-center justify-center rounded bg-emerald-500 text-[9px] font-bold text-white">P</span>
                                <span>Present</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="inline-flex h-4 w-4 items-center justify-center rounded bg-rose-500 text-[9px] font-bold text-white">A</span>
                                <span>Absent</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="inline-flex h-4 w-4 items-center justify-center rounded bg-amber-500 text-[9px] font-bold text-white">L</span>
                                <span>Late</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="inline-flex h-4 w-4 items-center justify-center rounded bg-sky-500 text-[9px] font-bold text-white">E</span>
                                <span>Excused</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="inline-flex h-4 w-4 items-center justify-center rounded bg-purple-500 text-[9px] font-bold text-white">H</span>
                                <span>Holiday</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="inline-flex h-4 w-4 items-center justify-center rounded bg-slate-200 text-[9px] font-bold text-slate-700">W</span>
                                <span>Weekend</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Calendar Grid */}
                <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm ring-1 ring-slate-950/[0.02]">
                    {/* Month Navigation */}
                    <div className="border-b border-slate-100 bg-white px-5 py-3.5 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <CalendarIcon className="h-4 w-4 text-slate-500" />
                            <h3 className="text-sm font-semibold text-slate-900">
                                {months[month - 1]} {year}
                            </h3>
                        </div>
                        <div className="flex items-center space-x-1.5">
                            <button
                                onClick={handlePrevMonth}
                                className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200 text-slate-600"
                                title="Previous month"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>
                            <button
                                onClick={handleNextMonth}
                                className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200 text-slate-600"
                                title="Next month"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead className="bg-slate-100/90 border-b border-slate-200 sticky top-0 z-10">
                                <tr>
                                    <th className="px-2.5 py-1.5 text-left text-[10px] font-bold text-slate-700 uppercase border-r border-slate-200 bg-slate-100 sticky left-0 z-20 shadow-[2px_0_4px_-1px_rgba(0,0,0,0.06)]" style={{ minWidth: '150px' }}>
                                        Student
                                    </th>
                                    {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                                        const d = new Date(Number(year), Number(month) - 1, day);
                                        const dayOfWeek = d.getDay();
                                        const dayName = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'][dayOfWeek];
                                        const isWeekend = dayOfWeek === 5 || dayOfWeek === 6;

                                        return (
                                            <th
                                                key={day}
                                                className={`border-r border-slate-200/80 px-0.5 py-1 text-center select-none ${isWeekend ? 'bg-rose-50/70' : 'bg-slate-100/90'}`}
                                                style={{ minWidth: '27px', width: '27px' }}
                                                title={`${dayName}, ${months[month - 1]} ${day}`}
                                            >
                                                <div className={`text-[8px] font-semibold uppercase leading-none ${isWeekend ? 'text-rose-600' : 'text-slate-400'}`}>
                                                    {dayName}
                                                </div>
                                                <div className={`text-[10px] font-bold leading-tight mt-0.5 ${isWeekend ? 'text-rose-700' : 'text-slate-800'}`}>
                                                    {day}
                                                </div>
                                            </th>
                                        );
                                    })}
                                    <th className="px-2 py-1 text-center text-[10px] font-bold text-slate-700 uppercase border-l border-slate-200 bg-slate-200/60" style={{ minWidth: '50px' }}>
                                        Total
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {students.length > 0 ? (
                                    students.map((student) => (
                                        <tr key={student.id} className="border-b border-slate-200/90 hover:bg-slate-50/80 transition-colors">
                                            <td className="px-2.5 py-1.5 border-r border-b border-slate-200 bg-white sticky left-0 z-10 shadow-[2px_0_4px_-1px_rgba(0,0,0,0.06)]">
                                                <div>
                                                    <p className="text-xs font-semibold text-slate-900 leading-tight truncate max-w-[140px]">{student.name}</p>
                                                    <p className="text-[10px] text-slate-500 font-mono leading-tight mt-0.5">
                                                        Adm: {student.admission_number}
                                                        {student.roll_number && ` · Roll ${student.roll_number}`}
                                                    </p>
                                                    <p className="text-[10px] text-slate-400 leading-tight">
                                                        {student.class_name} - {student.section_name}
                                                    </p>
                                                </div>
                                            </td>
                                            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                                                const d = new Date(Number(year), Number(month) - 1, day);
                                                const isWeekend = d.getDay() === 5 || d.getDay() === 6;

                                                return (
                                                    <td key={day} className={`px-0.5 py-1 text-center border-r border-b border-slate-100 ${isWeekend ? 'bg-slate-50/40' : ''}`} style={{ minWidth: '27px', width: '27px', height: '28px' }}>
                                                        {getStatusBadge(student.attendance[day]?.status)}
                                                    </td>
                                                );
                                            })}
                                            <td className="px-2 py-1 text-center border-l border-b border-slate-200/70 bg-slate-50/40 font-semibold text-xs text-emerald-700">
                                                {student.present_count}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={daysInMonth + 2} className="px-6 py-12 text-center text-xs text-slate-500">
                                            No students found for the selected filters
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className="bg-slate-50/75 border-t border-slate-200 px-4 py-2.5 flex items-center justify-between rounded-b-xl select-none">
                        <span className="text-xs font-medium text-slate-500">
                            Total <span className="font-semibold text-slate-800">{students.length}</span> students listed
                        </span>
                        <span className="text-[11px] font-medium text-slate-400">
                            {months[month - 1]} {year}
                        </span>
                    </div>
                </div>
            </div>

            {/* Print View */}
            <div className="hidden print:block print-container">
                {/* Header */}
                <div className="text-center mb-3 pb-2 border-b-2 border-black" style={{ marginBottom: '12px', paddingBottom: '8px', borderBottom: '2px solid #000' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', gap: '8px', marginBottom: '4px' }}>
                        <img src={institute.logo_url || '/logo.png'} alt="Logo" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
                        <h1 style={{ fontSize: '20px', fontWeight: 'bold', color: '#111', margin: 0 }}>{institute.name}</h1>
                    </div>
                    <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#333', marginBottom: '4px' }}>STUDENT ATTENDANCE CALENDAR</h2>
                    <p style={{ fontSize: '14px', fontWeight: '600', color: '#555' }}>{months[month - 1]} {year}</p>
                </div>

                {/* Table */}
                <table className="w-full border-collapse" style={{ borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            <th className="border-2 border-black px-3 py-2 text-left font-bold bg-gray-100" style={{ fontSize: '11px', minWidth: '180px' }}>
                                Student
                            </th>
                            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => (
                                <th key={day} className="border-2 border-black px-2 py-2 text-center font-bold bg-gray-100" style={{ fontSize: '10px', minWidth: '35px' }}>
                                    {day}
                                </th>
                            ))}
                            <th className="border-2 border-black px-3 py-2 text-center font-bold bg-gray-100" style={{ fontSize: '11px', minWidth: '50px' }}>
                                Total
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.map((student) => (
                            <tr key={student.id}>
                                <td className="border border-black px-3 py-2" style={{ fontSize: '10px' }}>
                                    <div>
                                        <p className="font-semibold leading-tight">{student.name}</p>
                                        <p className="text-gray-600 leading-tight" style={{ fontSize: '9px' }}>
                                            Adm: {student.admission_number}
                                            {student.roll_number && ` | Roll: ${student.roll_number}`}
                                        </p>
                                        <p className="text-gray-500 leading-tight" style={{ fontSize: '9px' }}>
                                            {student.class_name} - {student.section_name}
                                        </p>
                                    </div>
                                </td>
                                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                                    const status = student.attendance[day]?.status;
                                    const badges: Record<string, { bg: string; text: string; label: string }> = {
                                        present: { bg: '#dcfce7', text: '#166534', label: 'P' },
                                        absent: { bg: '#fee2e2', text: '#991b1b', label: 'A' },
                                        late: { bg: '#fef3c7', text: '#854d0e', label: 'L' },
                                        excused: { bg: '#dbeafe', text: '#1e40af', label: 'E' },
                                        holiday: { bg: '#e9d5ff', text: '#6b21a8', label: 'H' },
                                        weekend: { bg: '#cffafe', text: '#155e75', label: 'W' },
                                    };
                                    const badge = status ? badges[status] || badges.absent : null;

                                    return (
                                        <td key={day} className="border border-black px-0 py-0 text-center" style={{ minWidth: '35px', height: '40px' }}>
                                            {badge ? (
                                                <div style={{
                                                    backgroundColor: badge.bg,
                                                    color: badge.text,
                                                    fontSize: '9px',
                                                    fontWeight: 'bold',
                                                    width: '100%',
                                                    height: '100%',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}>
                                                    {badge.label}
                                                </div>
                                            ) : <span style={{ fontSize: '9px' }}>-</span>}
                                        </td>
                                    );
                                })}
                                <td className="border border-black px-3 py-2 text-center font-bold bg-gray-50" style={{ fontSize: '11px' }}>
                                    {student.present_count}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Legend */}
                <div className="mt-4 flex justify-center gap-5" style={{ fontSize: '10px' }}>
                    <span><strong style={{ color: '#166534' }}>P</strong>=Present</span>
                    <span><strong style={{ color: '#991b1b' }}>A</strong>=Absent</span>
                    <span><strong style={{ color: '#854d0e' }}>L</strong>=Late</span>
                    <span><strong style={{ color: '#1e40af' }}>E</strong>=Excused</span>
                    <span><strong style={{ color: '#6b21a8' }}>H</strong>=Holiday</span>
                    <span><strong style={{ color: '#155e75' }}>W</strong>=Weekend</span>
                </div>

                {/* Footer */}
                <div className="text-center mt-6 text-gray-600" style={{ fontSize: '9px' }}>
                    <p>Printed on: {new Date().toLocaleString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    })}</p>
                </div>
            </div>

            {/* Print Styles */}
            <style>{`
                @media print {
                    @page {
                        size: A4 landscape;
                        margin: 10mm 8mm;
                    }

                    * {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                        color-adjust: exact !important;
                    }

                    html, body {
                        width: 100%;
                        height: 100%;
                        margin: 0;
                        padding: 0;
                    }

                    body * {
                        visibility: hidden;
                    }

                    .print-container,
                    .print-container * {
                        visibility: visible;
                    }

                    .print-container {
                        position: fixed !important;
                        left: 0 !important;
                        top: 0 !important;
                        right: 0 !important;
                        width: 100% !important;
                        max-width: 100% !important;
                        margin: 0 auto !important;
                        padding: 0 !important;
                        background: white;
                    }

                    table {
                        border-collapse: collapse !important;
                        width: 100%;
                        page-break-inside: auto;
                    }

                    tr {
                        page-break-inside: avoid;
                        page-break-after: auto;
                    }

                    thead {
                        display: table-header-group;
                    }

                    th, td {
                        border: 1px solid #000 !important;
                    }

                    .bg-gray-100 {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                }
            `}</style>
        </AuthenticatedLayout>
    );
}
