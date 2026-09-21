import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, List, Search, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Printer } from 'lucide-react';
import Button from '@/Components/Button';
import { useInstitute } from '@/hooks/useInstitute';

interface Teacher {
    id: number;
    name: string;
    employee_id: string;
    designation?: string;
    department?: string;
    attendance: Record<number, { status: string | null; in_time: string | null; out_time: string | null }>;
    present_count: number;
}

interface Props {
    teachers: Teacher[];
    year: number;
    month: number;
    daysInMonth: number;
    filters: {
        search?: string;
        department?: string;
    };
}

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function Calendar({ teachers, year, month, daysInMonth, filters }: Props) {
    const institute = useInstitute();
    const [search, setSearch] = useState(filters.search || '');

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
        router.get('/teacher-attendance/calendar', { year: newYear, month: newMonth, search });
    };

    const handleNextMonth = () => {
        let newMonth = month + 1;
        let newYear = year;
        if (newMonth > 12) {
            newMonth = 1;
            newYear++;
        }
        router.get('/teacher-attendance/calendar', { year: newYear, month: newMonth, search });
    };

    const handleSearch = () => {
        router.get('/teacher-attendance/calendar', { year, month, search });
    };

    const getStatusBadge = (status: string | null) => {
        const badges = {
            present: { bg: 'bg-green-100', text: 'text-green-800', label: 'P' },
            absent: { bg: 'bg-red-100', text: 'text-red-800', label: 'A' },
            late: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'L' },
            leave: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'LV' },
            holiday: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'H' },
            weekend: { bg: 'bg-cyan-100', text: 'text-cyan-800', label: 'W' },
        };

        if (!status) {
            return <span className="text-gray-400 font-medium">-</span>;
        }

        const badge = badges[status as keyof typeof badges] || badges.absent;
        return (
            <div className={`${badge.bg} ${badge.text} w-full h-full flex items-center justify-center font-semibold text-[10px] rounded`}>
                {badge.label}
            </div>
        );
    };

    return (
        <AuthenticatedLayout>
            <Head title="Teacher Attendance Calendar">
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
                        .space-y-6 {
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
                        .rounded-xl {
                            border-radius: 0 !important;
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
            <div className="space-y-6 animate-fade-in print:hidden">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent print:text-blue-600">
                            Teacher Attendance Calendar
                        </h1>
                        <p className="text-gray-600 mt-1">Monthly grid view of teacher attendance</p>
                    </div>
                    <div className="flex gap-3 print:hidden">
                        <Button onClick={handlePrint} variant="primary" icon={<Printer className="w-5 h-5" />}>
                            Print Calendar
                        </Button>
                        <Link href="/teacher-attendance">
                            <Button variant="outline" icon={<List className="w-5 h-5" />}>
                                List View
                            </Button>
                        </Link>
                        <Link href="/teacher-attendance">
                            <Button variant="ghost" icon={<ArrowLeft className="w-5 h-5" />}>
                                Back
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 print:hidden">
                    <h3 className="text-xs font-semibold text-gray-700 mb-2">Filters</h3>
                    <div className="flex gap-3">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by name or employee ID..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <Button onClick={handleSearch}>Search</Button>
                    </div>
                </div>

                {/* Legend */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 print:p-2">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1.5">
                                <div className="w-6 h-6 bg-green-100 text-green-800 rounded flex items-center justify-center font-semibold text-xs">P</div>
                                <span className="text-xs text-gray-600">Present</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="w-6 h-6 bg-red-100 text-red-800 rounded flex items-center justify-center font-semibold text-xs">A</div>
                                <span className="text-xs text-gray-600">Absent</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="w-6 h-6 bg-yellow-100 text-yellow-800 rounded flex items-center justify-center font-semibold text-xs">L</div>
                                <span className="text-xs text-gray-600">Late</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="w-6 h-6 bg-orange-100 text-orange-800 rounded flex items-center justify-center font-semibold text-xs">LV</div>
                                <span className="text-xs text-gray-600">Leave</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="w-6 h-6 bg-purple-100 text-purple-800 rounded flex items-center justify-center font-semibold text-xs">H</div>
                                <span className="text-xs text-gray-600">Holiday</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="w-6 h-6 bg-cyan-100 text-cyan-800 rounded flex items-center justify-center font-semibold text-xs">W</div>
                                <span className="text-xs text-gray-600">Weekend</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="w-6 h-6 bg-white border-2 border-gray-300 rounded flex items-center justify-center text-gray-400 font-semibold text-xs">-</div>
                                <span className="text-xs text-gray-600">No Record</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Calendar Grid */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {/* Month Navigation */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <CalendarIcon className="h-5 w-5 text-blue-600" />
                                <h3 className="text-lg font-semibold text-gray-900">
                                    {months[month - 1]} {year}
                                </h3>
                            </div>
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={handlePrevMonth}
                                    className="p-2 hover:bg-white rounded-lg transition-colors border border-gray-300"
                                >
                                    <ChevronLeft className="h-5 w-5 text-gray-600" />
                                </button>
                                <button
                                    onClick={handleNextMonth}
                                    className="p-2 hover:bg-white rounded-lg transition-colors border border-gray-300"
                                >
                                    <ChevronRight className="h-5 w-5 text-gray-600" />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead className="bg-gray-50 sticky top-0 z-10">
                                <tr>
                                    <th className="px-2 py-1 text-left text-[9px] font-semibold text-gray-600 uppercase border-b-2 border-r border-gray-200 bg-gray-50 sticky left-0 z-20" style={{ minWidth: '140px' }}>
                                        Teacher
                                    </th>
                                    {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => (
                                        <th key={day} className="px-0.5 py-1 text-center text-[9px] font-semibold text-gray-600 border-b-2 border-gray-200" style={{ minWidth: '28px', width: '28px' }}>
                                            {day}
                                        </th>
                                    ))}
                                    <th className="px-2 py-1 text-center text-[9px] font-semibold text-gray-600 uppercase border-b-2 border-l border-gray-200 bg-gray-50" style={{ minWidth: '45px' }}>
                                        Total
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {teachers.length > 0 ? (
                                    teachers.map((teacher) => (
                                        <tr key={teacher.id} className="hover:bg-blue-50/50 transition-colors">
                                            <td className="px-2 py-1 border-b border-r border-gray-200 bg-white sticky left-0 z-10">
                                                <div>
                                                    <p className="text-[10px] font-semibold text-gray-900 leading-tight">{teacher.name}</p>
                                                    <p className="text-[8px] text-gray-500 leading-tight">{teacher.employee_id}</p>
                                                    {teacher.designation && (
                                                        <p className="text-[8px] text-gray-400 leading-tight">{teacher.designation}</p>
                                                    )}
                                                </div>
                                            </td>
                                            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => (
                                                <td key={day} className="px-0.5 py-0.5 border-b border-gray-200" style={{ minWidth: '28px', width: '28px', height: '35px' }}>
                                                    {getStatusBadge(teacher.attendance[day]?.status)}
                                                </td>
                                            ))}
                                            <td className="px-2 py-1 text-center border-b border-l border-gray-200 bg-gray-50">
                                                <span className="text-[10px] font-bold text-green-600">{teacher.present_count}</span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={daysInMonth + 2} className="px-6 py-12 text-center text-gray-500">
                                            No teachers found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Print View */}
            <div className="hidden print:block print-container">
                {/* Header */}
                <div className="text-center mb-3 pb-2 border-b-2 border-black" style={{ marginBottom: '12px', paddingBottom: '8px', borderBottom: '2px solid #000' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '4px' }}>
                        <img src={institute.logo_url || '/logo.png'} alt="Logo" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
                        <h1 style={{ fontSize: '20px', fontWeight: 'bold', color: '#111', margin: 0 }}>{institute.name}</h1>
                    </div>
                    <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#333', marginBottom: '4px' }}>TEACHER ATTENDANCE CALENDAR</h2>
                    <p style={{ fontSize: '14px', fontWeight: '600', color: '#555' }}>{months[month - 1]} {year}</p>
                </div>

                {/* Table */}
                <table className="w-full border-collapse" style={{ borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            <th className="border-2 border-black px-3 py-2 text-left font-bold bg-gray-100" style={{ fontSize: '11px', minWidth: '180px' }}>
                                Teacher
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
                        {teachers.map((teacher) => (
                            <tr key={teacher.id}>
                                <td className="border border-black px-3 py-2" style={{ fontSize: '10px' }}>
                                    <div>
                                        <p className="font-semibold leading-tight">{teacher.name}</p>
                                        <p className="text-gray-600 leading-tight" style={{ fontSize: '9px' }}>{teacher.employee_id}</p>
                                    </div>
                                </td>
                                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                                    const status = teacher.attendance[day]?.status;
                                    const badges: Record<string, { bg: string; text: string; label: string }> = {
                                        present: { bg: '#dcfce7', text: '#166534', label: 'P' },
                                        absent: { bg: '#fee2e2', text: '#991b1b', label: 'A' },
                                        late: { bg: '#fef3c7', text: '#854d0e', label: 'L' },
                                        leave: { bg: '#fed7aa', text: '#9a3412', label: 'LV' },
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
                                    {teacher.present_count}
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
                    <span><strong style={{ color: '#9a3412' }}>LV</strong>=Leave</span>
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
