import React, { FormEvent, useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ParentPage from '@/Components/Parent/ParentPage';
import ChildSwitcher, { ChildOption } from '@/Components/Parent/ChildSwitcher';
import EmptyState from '@/Components/Parent/EmptyState';
import { attendanceLabel, formatClock, formatWhen } from '@/Components/Parent/format';
import { route } from '@/Components/Parent/route';
import {
    CalendarDays,
    Calendar,
    Clock,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Send,
    MessageSquare,
    User,
    ChevronRight,
    Sparkles
} from 'lucide-react';

interface ContactPerson {
    id: number;
    name: string;
}

interface Contact {
    student_id: number;
    student_name: string;
    teacher: ContactPerson | null;
    office: ContactPerson | null;
}

interface Props {
    student: (ChildOption & { class_name: string; section_name: string; roll_number: string | null }) | null;
    children: ChildOption[];
    selectedDate: string;
    attendanceRecord: {
        status: string;
        in_time: string | null;
        out_time: string | null;
        reason: string | null;
    } | null;
    monthlySummary: { present: number; absent: number; late: number; half_day: number; total_days: number };
    yearlySummary: { present: number; absent: number; late: number; total_days: number };
    contact: Contact | null;
}

function rate(present: number, total: number): number {
    if (!total) return 0;
    return Math.round((present / total) * 100);
}

export default function Index({ student, children, selectedDate, attendanceRecord, monthlySummary, yearlySummary, contact }: Props) {
    const [openNote, setOpenNote] = useState(false);
    const receiverId = contact?.teacher?.id || contact?.office?.id || '';
    const { data, setData, post, processing, errors, reset, transform } = useForm({
        receiver_id: receiverId,
        subject: student ? `Absence Notice: ${student.full_name}` : 'Absence Notice',
        message: '',
        absent_on: selectedDate?.slice(0, 10) || new Date().toISOString().slice(0, 10),
        reason: '',
    });

    const submitNote = (event: FormEvent) => {
        event.preventDefault();
        transform((payload) => ({
            receiver_id: contact?.teacher?.id || contact?.office?.id || '',
            subject: `Absence Notice: ${student?.full_name ?? 'Student'}`,
            message: `${student?.full_name ?? 'My child'} will be absent on ${payload.absent_on}. Reason: ${payload.reason}`.trim(),
        }));
        post(route('parent.messages.send'), {
            preserveScroll: true,
            onSuccess: () => {
                reset('reason', 'message');
                setOpenNote(false);
            },
        });
    };

    const getDailyStatusBadge = (status?: string | null) => {
        switch (status) {
            case 'present':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        Present in School
                    </span>
                );
            case 'absent':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200/80">
                        <span className="w-2 h-2 rounded-full bg-rose-500" />
                        Recorded Absent
                    </span>
                );
            case 'late':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200/80">
                        <span className="w-2 h-2 rounded-full bg-amber-500" />
                        Late Arrival
                    </span>
                );
            case 'half_day':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200/80">
                        Half Day
                    </span>
                );
            case 'leave':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200/80">
                        Approved Leave
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
                        Not Marked / No Record
                    </span>
                );
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Attendance Record" />

            <ParentPage
                title="Student Attendance"
                subtitle="Track daily campus attendance, check-in timestamps, and monthly progress"
            >
                {!student ? (
                    <EmptyState
                        icon={<Calendar className="h-7 w-7 text-indigo-500" />}
                        title="No student linked yet"
                        body="Ask the school administration to link your student profile before attendance data can be accessed."
                    />
                ) : (
                    <>
                        {/* 1. Interactive Filter Toolbar */}
                        <div className="bg-white rounded-xl border border-slate-200/80 p-3 sm:p-4 shadow-2xs">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div>
                                    <ChildSwitcher
                                        children={children}
                                        student={student}
                                        href={route('parent.attendance.index')}
                                        extra={{ date: selectedDate }}
                                    />
                                </div>

                                <div className="flex items-center gap-2">
                                    <label htmlFor="attendance-date" className="text-xs font-semibold text-slate-600 shrink-0">
                                        Date:
                                    </label>
                                    <input
                                        id="attendance-date"
                                        type="date"
                                        className="h-9 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-mono font-medium text-slate-800 shadow-2xs focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                                        value={selectedDate?.slice(0, 10) || ''}
                                        max={new Date().toISOString().slice(0, 10)}
                                        onChange={(event) => {
                                            router.get(route('parent.attendance.index'), {
                                                student_id: student.id,
                                                date: event.target.value
                                            }, { preserveScroll: true });
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 2. Selected Day Attendance Card */}
                        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs text-center space-y-3">
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                {formatWhen(selectedDate)}
                            </p>
                            <div>
                                {getDailyStatusBadge(attendanceRecord?.status)}
                            </div>
                            {attendanceRecord?.reason && (
                                <p className="text-xs text-slate-600 max-w-md mx-auto bg-slate-50 p-2 rounded-lg border border-slate-100">
                                    <span className="font-semibold text-slate-700">Remarks:</span> {attendanceRecord.reason}
                                </p>
                            )}
                        </div>

                        {/* 3. Check-in & Check-out Timestamps */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs flex items-center justify-between">
                                <div>
                                    <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Check-in Time</p>
                                    <p className="text-xl font-bold font-mono text-slate-900 mt-0.5">
                                        {formatClock(attendanceRecord?.in_time)}
                                    </p>
                                    <p className="text-[11px] text-slate-400 mt-0.5">Campus Gate Entry</p>
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100/60 flex items-center justify-center text-emerald-600">
                                    <Clock className="w-5 h-5" />
                                </div>
                            </div>

                            <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs flex items-center justify-between">
                                <div>
                                    <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Check-out Time</p>
                                    <p className="text-xl font-bold font-mono text-slate-900 mt-0.5">
                                        {formatClock(attendanceRecord?.out_time)}
                                    </p>
                                    <p className="text-[11px] text-slate-400 mt-0.5">Campus Gate Departure</p>
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100/60 flex items-center justify-center text-indigo-600">
                                    <Clock className="w-5 h-5" />
                                </div>
                            </div>
                        </div>

                        {/* 4. Month & Academic Year Progression */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <SummaryCard
                                title="This Month Attendance"
                                present={monthlySummary.present}
                                total={monthlySummary.total_days}
                                absent={monthlySummary.absent}
                                late={monthlySummary.late}
                            />
                            <SummaryCard
                                title="Academic Session Attendance"
                                present={yearlySummary.present}
                                total={yearlySummary.total_days}
                                absent={yearlySummary.absent}
                                late={yearlySummary.late}
                            />
                        </div>

                        {/* 5. Absence Note to School */}
                        <div className="bg-white rounded-xl border border-slate-200/80 p-4 sm:p-5 shadow-2xs space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                                <div>
                                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                                        <MessageSquare className="w-4 h-4 text-indigo-600" />
                                        Send Absence Notice to School
                                    </h3>
                                    <p className="text-[11px] text-slate-500 mt-0.5">
                                        Notify the class teacher or school office in advance if {student.full_name.split(' ')[0]} will be absent.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setOpenNote((open) => !open)}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors shadow-2xs self-start sm:self-auto"
                                >
                                    {openNote ? 'Close Notice Form' : 'Compose Absence Note'}
                                </button>
                            </div>

                            {openNote && (
                                receiverId ? (
                                    <form onSubmit={submitNote} className="space-y-3 pt-1 animate-fade-in">
                                        <div className="p-2.5 rounded-lg bg-indigo-50/60 border border-indigo-100/80 text-xs text-indigo-900">
                                            Will be delivered to: <strong>{contact?.teacher ? `Class Teacher (${contact.teacher.name})` : `School Office (${contact?.office?.name || 'Admin'})`}</strong>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                                    Absence Date <span className="text-rose-500">*</span>
                                                </label>
                                                <input
                                                    type="date"
                                                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400"
                                                    value={data.absent_on}
                                                    onChange={(event) => setData('absent_on', event.target.value)}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                                Reason for Absence <span className="text-rose-500">*</span>
                                            </label>
                                            <textarea
                                                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 h-24"
                                                value={data.reason}
                                                onChange={(event) => setData('reason', event.target.value)}
                                                placeholder="e.g. Suffering from viral fever; doctor recommended 2 days rest."
                                                required
                                            />
                                            {errors.reason && <p className="text-xs text-rose-600 mt-1">{errors.reason}</p>}
                                        </div>

                                        <div className="flex justify-end gap-2 pt-2">
                                            <button
                                                type="submit"
                                                disabled={processing}
                                                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors shadow-xs disabled:opacity-60"
                                            >
                                                <Send className="w-3.5 h-3.5" />
                                                {processing ? 'Sending Notice...' : 'Submit Absence Notice'}
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <p className="text-xs text-slate-500 py-2">
                                        The school has not assigned a designated teacher contact for this class section yet.
                                    </p>
                                )
                            )}
                        </div>
                    </>
                )}
            </ParentPage>
        </AuthenticatedLayout>
    );
}

function SummaryCard({ title, present, total, absent, late }: { title: string; present: number; total: number; absent: number; late: number }) {
    const value = rate(present, total);
    return (
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs space-y-2.5">
            <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-slate-900 uppercase tracking-wider">{title}</p>
                <span className="font-mono font-bold text-sm text-slate-900">{total ? `${value}%` : '—'}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${value}%` }} />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                <span className="text-emerald-700 font-semibold">{present} Present</span>
                <span className="text-rose-700 font-semibold">{absent} Absent</span>
                <span className="text-amber-700 font-semibold">{late} Late</span>
                <span className="text-slate-400">Total {total} Days</span>
            </div>
        </div>
    );
}
