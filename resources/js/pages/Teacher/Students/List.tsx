import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, Link } from '@inertiajs/react';
import { Search, Eye, Phone, Mail, User, ChevronRight } from 'lucide-react';
import FormPageHeader from '@/Components/FormPageHeader';

interface Student {
    id: number;
    full_name: string;
    admission_number: string;
    roll_number: string;
    photo: string | null;
    date_of_birth: string;
    gender: string;
    phone: string | null;
    email: string | null;
    guardian_name: string;
    guardian_phone: string;
}

interface Section {
    id: number;
    name: string;
    class_name: string;
}

interface Props {
    section: Section;
    students: Student[];
    filters: {
        search: string;
    };
}

export default function List({ section, students = [], filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');

    const handleSearch = (value: string) => {
        setSearch(value);
        router.get(
            `/teacher/students/list?section_id=${section.id}`,
            { search: value },
            { preserveState: true, replace: true }
        );
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Students - Class ${section.class_name} (${section.name})`} />

            <div className="space-y-4 pb-8">
                {/* 1. STANDARDIZED PAGE HEADER */}
                <FormPageHeader
                    title={`Class ${section.class_name} (${section.name}) - Student Roster`}
                    subtitle={`Enrolled students, academic credentials, and guardian emergency contact details`}
                    backUrl="/teacher/students"
                    badges={[
                        { label: `${students.length} Students`, variant: 'neutral' }
                    ]}
                />

                {/* 2. SEARCH STRIP */}
                <div className="bg-white rounded-xl border border-slate-200/80 p-3 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="relative w-full sm:w-80">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                            type="text"
                            placeholder="Search by student name or roll number..."
                            value={search}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="w-full text-xs py-2 pl-9 pr-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white"
                        />
                    </div>

                    <span className="text-xs font-semibold text-slate-500 self-end sm:self-center">
                        Enrolled in Section {section.name}: {students.length}
                    </span>
                </div>

                {/* 3. DUAL VIEW: MOBILE CARDS & DESKTOP TABLE */}
                <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
                    {students && students.length > 0 ? (
                        <>
                            {/* Mobile Card Feed */}
                            <div className="md:hidden divide-y divide-slate-100">
                                {students.map((student) => (
                                    <div key={student.id} className="p-3.5 space-y-2">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex items-center gap-3">
                                                {student.photo ? (
                                                    <img
                                                        src={`/storage/${student.photo}`}
                                                        alt={student.full_name}
                                                        className="w-10 h-10 rounded-lg object-cover ring-1 ring-slate-200"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-700 font-bold flex items-center justify-center text-xs ring-1 ring-indigo-200">
                                                        {student.full_name.charAt(0)}
                                                    </div>
                                                )}
                                                <div>
                                                    <h4 className="text-xs font-bold text-slate-900">{student.full_name}</h4>
                                                    <p className="text-[11px] text-slate-500 font-mono mt-0.5">Roll #{student.roll_number} • ID: {student.admission_number}</p>
                                                </div>
                                            </div>

                                            <Link
                                                href={`/teacher/students/${student.id}`}
                                                className="p-1.5 rounded-lg border border-slate-200 text-indigo-600 hover:bg-slate-50"
                                                title="View 360 Profile"
                                            >
                                                <Eye className="w-3.5 h-3.5" />
                                            </Link>
                                        </div>

                                        <div className="p-2 bg-slate-50 rounded-lg text-[11px] text-slate-600 space-y-0.5">
                                            <p>Guardian: <strong className="text-slate-800">{student.guardian_name || 'N/A'}</strong></p>
                                            <p>Contact: <strong className="text-slate-800">{student.guardian_phone || student.phone || 'No phone'}</strong></p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Desktop High-Density Table */}
                            <div className="hidden md:block overflow-x-auto">
                                <table className="w-full text-left border-collapse text-xs">
                                    <thead>
                                        <tr className="bg-slate-50/80 border-b border-slate-200/80">
                                            <th className="px-4 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Roll No</th>
                                            <th className="px-4 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Student Name</th>
                                            <th className="px-4 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Student ID</th>
                                            <th className="px-4 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Gender</th>
                                            <th className="px-4 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Guardian Name</th>
                                            <th className="px-4 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Contact Phone</th>
                                            <th className="px-4 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {students.map((student) => (
                                            <tr key={student.id} className="hover:bg-slate-50/60 transition-colors">
                                                <td className="px-4 py-3 font-mono font-bold text-slate-800">
                                                    #{student.roll_number}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2.5">
                                                        {student.photo ? (
                                                            <img
                                                                src={`/storage/${student.photo}`}
                                                                alt={student.full_name}
                                                                className="w-7 h-7 rounded-lg object-cover ring-1 ring-slate-200"
                                                            />
                                                        ) : (
                                                            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-[10px] ring-1 ring-indigo-200">
                                                                {student.full_name.charAt(0)}
                                                            </div>
                                                        )}
                                                        <span className="font-semibold text-slate-900">{student.full_name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 font-mono text-slate-600">{student.admission_number}</td>
                                                <td className="px-4 py-3 text-slate-600 capitalize">{student.gender}</td>
                                                <td className="px-4 py-3 font-medium text-slate-800">{student.guardian_name || '—'}</td>
                                                <td className="px-4 py-3 text-slate-600 font-mono text-[11px]">{student.guardian_phone || student.phone || '—'}</td>
                                                <td className="px-4 py-3 text-right">
                                                    <Link
                                                        href={`/teacher/students/${student.id}`}
                                                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 transition-colors"
                                                    >
                                                        Profile <ChevronRight className="w-3.5 h-3.5" />
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-12">
                            <Search className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                            <p className="text-xs font-medium text-slate-600">No students found matching your search</p>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
