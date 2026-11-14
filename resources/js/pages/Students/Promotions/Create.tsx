import React, { useMemo, useState, FormEvent } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/Button';
import FormPageHeader from '@/Components/FormPageHeader';
import {
    GraduationCap,
    ArrowRight,
    Search,
    RotateCcw,
    AlertCircle,
    CheckCircle2,
} from 'lucide-react';

interface AcademicYear {
    id: number;
    name: string;
    start_date: string;
    end_date: string;
    is_current: boolean;
}

interface SchoolClass {
    id: number;
    name: string;
    sections: Section[];
}

interface Section {
    id: number;
    name: string;
    class_id: number;
}

interface PromotionStudent {
    id: number;
    admission_number: string;
    roll_number: string | null;
    first_name: string;
    last_name: string;
    photo_url: string | null;
    class_id: number;
    class_name: string | null;
    section_id: number | null;
    section_name: string | null;
    next_class_id: number | null;
    next_class_name: string | null;
    default_section_id: number | null;
    result_status: string | null;
    result_summary: string | null;
    suggested_roll?: string | null;
    already_promoted: boolean;
}

interface ClassOption {
    id: number;
    name: string;
    sections: Array<{ id: number; name: string }>;
}

interface Preview {
    students: PromotionStudent[];
    next_class: ClassOption | null;
    source_class: ClassOption | null;
    fee_structure_class_ids: number[];
    taken_rolls: Record<string, number[]>;
    source_year_is_current: boolean;
}

interface Decision {
    status: string;
    sectionId: string;
}

interface Props {
    academicYears: AcademicYear[];
    classes: SchoolClass[];
}

function initialDecision(student: PromotionStudent): Decision {
    if (student.next_class_id && student.default_section_id) {
        return { status: 'promoted', sectionId: String(student.default_section_id) };
    }

    return { status: 'passed_out', sectionId: '' };
}

function sectionForStatus(student: PromotionStudent, status: string): string {
    if (status === 'promoted') {
        return student.default_section_id ? String(student.default_section_id) : '';
    }
    if (status === 'detained') {
        return student.section_id ? String(student.section_id) : '';
    }
    return '';
}

function assignRolls(
    students: PromotionStudent[],
    decisions: Record<number, Decision>,
    selectedIds: number[],
    takenRolls: Record<string, number[]>,
): Record<number, string> {
    const groups = new Map<string, PromotionStudent[]>();

    selectedIds.forEach((id) => {
        const student = students.find((item) => item.id === id);
        const decision = decisions[id];
        if (!student || !decision || !decision.sectionId || decision.status === '' || decision.status === 'passed_out') {
            return;
        }
        const list = groups.get(decision.sectionId) ?? [];
        list.push(student);
        groups.set(decision.sectionId, list);
    });

    const rolls: Record<number, string> = {};
    groups.forEach((group, sectionId) => {
        const used = new Set((takenRolls[sectionId] || []).map((roll) => Number(roll)));
        const sorted = [...group].sort((a, b) => {
            const left = `${a.first_name} ${a.last_name}`.trim().toLocaleLowerCase();
            const right = `${b.first_name} ${b.last_name}`.trim().toLocaleLowerCase();
            if (left < right) return -1;
            if (left > right) return 1;
            return 0;
        });

        let number = 1;
        sorted.forEach((student) => {
            while (used.has(number)) number += 1;
            rolls[student.id] = String(number);
            used.add(number);
            number += 1;
        });
    });

    return rolls;
}

function formatDate(value: string): string {
    const [year, month, day] = value.split('-').map(Number);
    if (!year || !month || !day) return value;
    return new Date(year, month - 1, day).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}

export default function Create({ academicYears, classes }: Props) {
    const [currentAcademicYearId, setCurrentAcademicYearId] = useState('');
    const [currentClassId, setCurrentClassId] = useState('');
    const [currentSectionId, setCurrentSectionId] = useState('');
    const [targetAcademicYearId, setTargetAcademicYearId] = useState('');
    const [promotionDate, setPromotionDate] = useState(new Date().toISOString().split('T')[0]);
    const [remarks, setRemarks] = useState('');
    const [preview, setPreview] = useState<Preview | null>(null);
    const [decisions, setDecisions] = useState<Record<number, Decision>>({});
    const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
    const [studentSearchFilter, setStudentSearchFilter] = useState('');
    const [loadingStudents, setLoadingStudents] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    const currentSections = useMemo(() => {
        if (!currentClassId) return [];
        return classes.find((item) => item.id === parseInt(currentClassId, 10))?.sections || [];
    }, [currentClassId, classes]);

    const students = preview?.students ?? [];

    const filteredStudents = useMemo(() => {
        if (!studentSearchFilter.trim()) return students;
        const query = studentSearchFilter.toLowerCase();
        return students.filter((student) =>
            student.first_name.toLowerCase().includes(query) ||
            student.last_name.toLowerCase().includes(query) ||
            student.admission_number.toLowerCase().includes(query) ||
            (student.class_name && student.class_name.toLowerCase().includes(query)) ||
            (student.section_name && student.section_name.toLowerCase().includes(query)) ||
            (student.roll_number && student.roll_number.toLowerCase().includes(query))
        );
    }, [students, studentSearchFilter]);

    const eligibleFiltered = filteredStudents.filter((student) => !student.already_promoted);

    const rolls = useMemo(() => {
        if (!preview) return {};
        return assignRolls(preview.students, decisions, selectedStudents, preview.taken_rolls);
    }, [preview, decisions, selectedStudents]);

    const missingFeeClasses = useMemo(() => {
        if (!preview) return [];
        const names = new Map<number, string>();
        selectedStudents.forEach((id) => {
            const student = preview.students.find((item) => item.id === id);
            const status = decisions[id]?.status;
            if (!student || !status || status === 'passed_out') return;
            const classId = status === 'detained' ? student.class_id : student.next_class_id;
            const className = status === 'detained' ? student.class_name : student.next_class_name;
            if (!classId || !className || preview.fee_structure_class_ids.includes(classId)) return;
            names.set(classId, className);
        });
        return [...names.values()];
    }, [preview, decisions, selectedStudents]);

    const counts = useMemo(() => {
        const tally = { promoted: 0, detained: 0, passed_out: 0 };
        selectedStudents.forEach((id) => {
            const status = decisions[id]?.status;
            if (status === 'promoted' || status === 'detained' || status === 'passed_out') {
                tally[status] += 1;
            }
        });
        return tally;
    }, [selectedStudents, decisions]);

    const selectedFromClass = classes.find((item) => item.id === parseInt(currentClassId, 10));
    const selectedFromSection = currentSections.find((item) => item.id === parseInt(currentSectionId, 10));
    const selectedFromYear = academicYears.find((item) => item.id === parseInt(currentAcademicYearId, 10));
    const selectedToYear = academicYears.find((item) => item.id === parseInt(targetAcademicYearId, 10));

    const clearCohort = () => {
        setPreview(null);
        setDecisions({});
        setSelectedStudents([]);
        setStudentSearchFilter('');
    };

    const handleSearch = async (event?: FormEvent) => {
        event?.preventDefault();
        setErrorMessage(null);

        if (!currentAcademicYearId || !targetAcademicYearId) {
            setErrorMessage('Select the current session and the target session.');
            return;
        }

        if (currentAcademicYearId === targetAcademicYearId) {
            setErrorMessage('The target session has to be a different academic year.');
            return;
        }

        setLoadingStudents(true);
        try {
            const params = new URLSearchParams({
                academic_year_id: currentAcademicYearId,
                to_academic_year_id: targetAcademicYearId,
            });
            if (currentClassId) params.set('class_id', currentClassId);
            if (currentSectionId) params.set('section_id', currentSectionId);
            const response = await fetch(`/student-promotions/students?${params.toString()}`, {
                headers: {
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });

            if (!response.ok) {
                const body = await response.json().catch(() => null);
                const message = body?.errors
                    ? (Object.values(body.errors).flat()[0] as string)
                    : 'Failed to load students for the selected class.';
                throw new Error(message);
            }

            const data = await response.json() as Preview;
            const nextDecisions: Record<number, Decision> = {};
            const nextSelected: number[] = [];

            data.students.forEach((student) => {
                const decision = initialDecision(student);
                nextDecisions[student.id] = decision;
                if (!student.already_promoted && decision.status === 'promoted') {
                    nextSelected.push(student.id);
                }
            });

            setPreview(data);
            setDecisions(nextDecisions);
            setSelectedStudents(nextSelected);
            setStudentSearchFilter('');
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : 'Failed to load students for the selected class.');
        } finally {
            setLoadingStudents(false);
        }
    };

    const handleReset = () => {
        setCurrentAcademicYearId('');
        setCurrentClassId('');
        setCurrentSectionId('');
        setTargetAcademicYearId('');
        setRemarks('');
        setErrorMessage(null);
        clearCohort();
    };

    const toggleStudent = (studentId: number) => {
        setSelectedStudents((current) =>
            current.includes(studentId)
                ? current.filter((id) => id !== studentId)
                : [...current, studentId]
        );
    };

    const toggleAll = () => {
        const eligibleIds = eligibleFiltered.map((student) => student.id);
        const allSelected = eligibleIds.length > 0 && eligibleIds.every((id) => selectedStudents.includes(id));
        setSelectedStudents(allSelected ? [] : eligibleIds);
    };

    const updateDecision = (student: PromotionStudent, patch: Partial<Decision>) => {
        setDecisions((current) => {
            const existing = current[student.id] ?? { status: '', sectionId: '' };
            const next = { ...existing, ...patch };
            if (patch.status) {
                next.sectionId = sectionForStatus(student, patch.status);
            }
            return { ...current, [student.id]: next };
        });
    };

    const sectionsFor = (student: PromotionStudent, status: string): Array<{ id: number; name: string }> => {
        const classId = status === 'promoted' ? student.next_class_id : status === 'detained' ? student.class_id : null;
        if (!classId) return [];
        return classes.find((item) => item.id === classId)?.sections ?? [];
    };

    const destinationName = (student: PromotionStudent, status: string): string => {
        if (status === 'passed_out') return 'Passed out';
        if (status === 'detained') return student.class_name || 'Same class';
        if (status === 'promoted') return student.next_class_name || 'No next class';
        return '—';
    };

    const handlePromoteClick = (event: FormEvent) => {
        event.preventDefault();
        setErrorMessage(null);

        if (selectedStudents.length === 0) {
            setErrorMessage('Select at least one student.');
            return;
        }

        const missingDecision = selectedStudents.filter((id) => !decisions[id]?.status);
        if (missingDecision.length > 0) {
            setErrorMessage('Choose Promoted, Detained, or Passed out for every selected student.');
            return;
        }

        const missingSection = selectedStudents.filter((id) => {
            const decision = decisions[id];
            return decision?.status !== 'passed_out' && !decision?.sectionId;
        });
        if (missingSection.length > 0) {
            setErrorMessage('Choose a section for every promoted or detained student.');
            return;
        }

        setShowConfirmModal(true);
    };

    const handlePromoteConfirm = () => {
        setProcessing(true);
        setShowConfirmModal(false);

        router.post(
            '/student-promotions',
            {
                from_academic_year_id: currentAcademicYearId,
                from_class_id: currentClassId || null,
                from_section_id: currentSectionId || null,
                to_academic_year_id: targetAcademicYearId,
                promotion_date: promotionDate,
                remarks,
                decisions: selectedStudents.map((id) => ({
                    student_id: id,
                    status: decisions[id].status,
                    to_section_id: decisions[id].status === 'passed_out' ? null : Number(decisions[id].sectionId),
                })),
            },
            {
                onError: (errors) => {
                    const first = Object.values(errors)[0];
                    const message = Array.isArray(first) ? first[0] : first;
                    setErrorMessage(message || 'Promotion request failed.');
                },
                onFinish: () => setProcessing(false),
            }
        );
    };

    return (
        <AuthenticatedLayout>
            <Head title="Promote Students" />

            <div className="space-y-4">
                <FormPageHeader
                    title="Promote Students"
                    subtitle="Move the same students into the next session. New admission is only for students who are new to the school."
                    backUrl="/student-promotions"
                    backLabel="Promotions History"
                    badge="Year-end Promotion"
                    badgeIcon={GraduationCap}
                />

                {errorMessage && (
                    <div className="bg-rose-50 border border-rose-200/80 rounded-xl p-3 flex items-start gap-2.5 text-xs text-rose-800">
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <span className="font-semibold">Action Required:</span> {errorMessage}
                        </div>
                        <button type="button" onClick={() => setErrorMessage(null)} className="text-rose-500 hover:text-rose-700">
                            ×
                        </button>
                    </div>
                )}

                <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs">
                    <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
                        <div className="w-6 h-6 rounded-md bg-indigo-50 border border-indigo-100/60 flex items-center justify-center text-indigo-600 font-bold text-xs">1</div>
                        <div>
                            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Select The Class</h3>
                            <p className="text-[11px] text-slate-500">Leave class and section on All, or narrow the list. Everyone loads as Promoted.</p>
                        </div>
                    </div>

                    <form onSubmit={handleSearch}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">Current Session <span className="text-rose-500">*</span></label>
                                <select
                                    value={currentAcademicYearId}
                                    onChange={(event) => { setCurrentAcademicYearId(event.target.value); clearCohort(); }}
                                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white"
                                    required
                                >
                                    <option value="">Choose Year</option>
                                    {academicYears.map((year) => (
                                        <option key={year.id} value={year.id}>{year.name} {year.is_current ? '(Current)' : ''}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">Current Class</label>
                                <select
                                    value={currentClassId}
                                    onChange={(event) => { setCurrentClassId(event.target.value); setCurrentSectionId(''); clearCohort(); }}
                                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white"
                                >
                                    <option value="">All Classes</option>
                                    {classes.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">Current Section</label>
                                <select
                                    value={currentSectionId}
                                    onChange={(event) => { setCurrentSectionId(event.target.value); clearCohort(); }}
                                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white"
                                >
                                    <option value="">All Sections</option>
                                    {currentSections.map((section) => <option key={section.id} value={section.id}>{section.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">Target Session <span className="text-rose-500">*</span></label>
                                <select
                                    value={targetAcademicYearId}
                                    onChange={(event) => { setTargetAcademicYearId(event.target.value); clearCohort(); }}
                                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white"
                                    required
                                >
                                    <option value="">Choose Year</option>
                                    {academicYears.map((year) => (
                                        <option key={year.id} value={year.id}>{year.name} {year.is_current ? '(Current)' : ''}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex items-end gap-2">
                                <Button type="submit" size="sm" disabled={loadingStudents} className="flex-1 justify-center" icon={<Search className="w-3.5 h-3.5" />}>
                                    {loadingStudents ? 'Fetching...' : 'Find Students'}
                                </Button>
                                <Button type="button" size="sm" variant="secondary" onClick={handleReset} icon={<RotateCcw className="w-3.5 h-3.5" />}>
                                    Reset
                                </Button>
                            </div>
                        </div>
                    </form>
                </div>

                {preview && students.length > 0 ? (
                    <div className="space-y-4">
                        {preview.source_year_is_current && (
                            <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-3 text-xs text-amber-900">
                                <span className="font-semibold">{selectedFromYear?.name} is still the current session.</span> Generate that year's last monthly fees before promoting, otherwise these students drop out of the current fee run.
                            </div>
                        )}
                        {missingFeeClasses.length > 0 && (
                            <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-3 text-xs text-amber-900">
                                <span className="font-semibold">No fee structure for {missingFeeClasses.join(', ')} in {selectedToYear?.name}.</span> Promotion can still be saved. Monthly fees for that class will not generate until a structure is added.
                            </div>
                        )}

                        <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
                            <div className="p-3.5 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-md bg-indigo-50 border border-indigo-100/60 flex items-center justify-center text-indigo-600 font-bold text-xs">2</div>
                                    <div>
                                        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Decide Each Student</h3>
                                        <p className="text-[11px] text-slate-500">
                                            {selectedFromClass?.name ?? 'All classes'} ({selectedFromSection?.name ?? 'All sections'}) · {selectedStudents.length} of {students.length} selected as promoted
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="relative">
                                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                        <input
                                            type="text"
                                            value={studentSearchFilter}
                                            onChange={(event) => setStudentSearchFilter(event.target.value)}
                                            placeholder="Search to change one student"
                                            className="text-xs pl-7 pr-2 py-1 border border-slate-200 rounded-lg w-36 sm:w-44 focus:ring-1 focus:ring-indigo-300"
                                        />
                                    </div>
                                    <button type="button" onClick={toggleAll} className="text-xs font-semibold px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700">
                                        {eligibleFiltered.length > 0 && eligibleFiltered.every((student) => selectedStudents.includes(student.id)) ? 'Deselect All' : 'Select All'}
                                    </button>
                                </div>
                            </div>

                            <div className="divide-y divide-slate-100">
                                {filteredStudents.map((student) => {
                                    const decision = decisions[student.id] ?? { status: '', sectionId: '' };
                                    const selected = selectedStudents.includes(student.id);
                                    const sectionOptions = sectionsFor(student, decision.status);
                                    return (
                                        <div key={student.id} className={`p-3 ${selected ? 'bg-indigo-50/40' : ''} ${student.already_promoted ? 'opacity-60' : ''}`}>
                                            <div className="flex flex-col lg:flex-row lg:items-center gap-3">
                                                <div className="flex items-center gap-3 min-w-0 lg:w-64">
                                                    <input
                                                        type="checkbox"
                                                        checked={selected}
                                                        disabled={student.already_promoted}
                                                        onChange={() => toggleStudent(student.id)}
                                                        className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 disabled:opacity-40"
                                                    />
                                                    {student.photo_url ? (
                                                        <img src={student.photo_url} alt="" className="w-8 h-8 rounded-full object-cover border border-slate-100 shrink-0" />
                                                    ) : (
                                                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0">
                                                            {student.first_name.charAt(0)}
                                                        </div>
                                                    )}
                                                    <div className="min-w-0">
                                                        <p className="text-xs font-semibold text-slate-900 truncate">{student.first_name} {student.last_name}</p>
                                                        <p className="text-[11px] text-slate-400 font-mono truncate">
                                                            {student.class_name || 'No class'}{student.section_name ? ` · ${student.section_name}` : ''} · Adm: {student.admission_number}{student.roll_number ? ` · Roll ${student.roll_number}` : ''}{student.suggested_roll ? ` · Next roll ${student.suggested_roll}` : ''}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="lg:w-40">
                                                    {student.already_promoted ? (
                                                        <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600">Already promoted</span>
                                                    ) : student.result_summary ? (
                                                        <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-semibold ${student.result_status === 'fail' ? 'bg-amber-50 text-amber-800' : student.result_status === 'pass' ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>
                                                            {student.result_summary}
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-500">No published annual result</span>
                                                    )}
                                                </div>

                                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 flex-1">
                                                    <select
                                                        value={decision.status}
                                                        disabled={student.already_promoted}
                                                        onChange={(event) => updateDecision(student, { status: event.target.value })}
                                                        className="text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white disabled:bg-slate-50"
                                                    >
                                                        <option value="">Choose decision</option>
                                                        <option value="promoted" disabled={!student.next_class_id}>Promoted</option>
                                                        <option value="detained">Detained</option>
                                                        <option value="passed_out">Passed out</option>
                                                    </select>
                                                    <div className="text-xs px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-100 text-slate-700">
                                                        <span className="text-slate-400">To </span>{destinationName(student, decision.status)}
                                                    </div>
                                                    {decision.status === 'promoted' || decision.status === 'detained' ? (
                                                        <select
                                                            value={decision.sectionId}
                                                            onChange={(event) => updateDecision(student, { sectionId: event.target.value })}
                                                            className="text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
                                                        >
                                                            <option value="">Section</option>
                                                            {sectionOptions.map((section) => (
                                                                <option key={section.id} value={section.id}>{section.name}</option>
                                                            ))}
                                                        </select>
                                                    ) : (
                                                        <div className="text-xs px-2.5 py-1.5 text-slate-400">
                                                            {decision.status === 'passed_out' ? 'Stays in this class' : 'New roll —'}
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="lg:w-24 text-xs">
                                                    <p className="text-[10px] uppercase text-slate-400">New roll</p>
                                                    <p className="font-mono font-semibold text-slate-800">
                                                        {selected && rolls[student.id] ? rolls[student.id] : '—'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <form id="promotion-form" onSubmit={handlePromoteClick} className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs space-y-3">
                            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                                <div className="w-6 h-6 rounded-md bg-indigo-50 border border-indigo-100/60 flex items-center justify-center text-indigo-600 font-bold text-xs">3</div>
                                <div>
                                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Confirm The Move</h3>
                                    <p className="text-[11px] text-slate-500">
                                        {counts.promoted} promoted · {counts.detained} detained · {counts.passed_out} passed out
                                    </p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">Promotion Date <span className="text-rose-500">*</span></label>
                                    <input
                                        type="date"
                                        value={promotionDate}
                                        onChange={(event) => setPromotionDate(event.target.value)}
                                        className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">Remarks <span className="text-slate-400 font-normal">(Optional)</span></label>
                                    <input
                                        type="text"
                                        value={remarks}
                                        onChange={(event) => setRemarks(event.target.value)}
                                        placeholder="Annual promotion"
                                        className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400"
                                    />
                                </div>
                            </div>
                            <div className="flex items-center justify-between gap-3 pt-1">
                                <p className="text-[11px] text-slate-500">
                                    {selectedFromYear?.name} <ArrowRight className="w-3 h-3 inline mx-1" /> {selectedToYear?.name}. Admission numbers stay the same.
                                </p>
                                <Button type="submit" size="sm" disabled={processing || selectedStudents.length === 0} icon={<ArrowRight className="w-4 h-4" />}>
                                    {processing ? 'Processing...' : `Update ${selectedStudents.length} Student(s)`}
                                </Button>
                            </div>
                        </form>
                    </div>
                ) : !loadingStudents ? (
                    <div className="bg-white rounded-xl border border-slate-200/80 p-12 text-center shadow-2xs">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
                            <GraduationCap className="w-6 h-6" />
                        </div>
                        <h3 className="text-sm font-semibold text-slate-900 mb-1">Select a session and search</h3>
                        <p className="text-xs text-slate-500 max-w-sm mx-auto">
                            Choose the current session and the next session. Class and section can stay on All.
                        </p>
                    </div>
                ) : null}
            </div>

            {showConfirmModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden">
                        <div className="p-5 space-y-3">
                            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100/60 flex items-center justify-center text-indigo-600 mx-auto">
                                <GraduationCap className="w-5 h-5" />
                            </div>
                            <div className="text-center">
                                <h3 className="text-sm font-bold text-slate-900">Confirm promotion</h3>
                                <p className="text-xs text-slate-500 mt-1">
                                    {selectedStudents.length} student(s) from {selectedFromClass?.name ?? 'all classes'} ({selectedFromSection?.name ?? 'all sections'}) move on {formatDate(promotionDate)}.
                                </p>
                            </div>
                            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/70 text-xs space-y-1">
                                <div className="flex justify-between"><span className="text-slate-500">Promoted</span><span className="font-semibold text-slate-800">{counts.promoted} to the next class</span></div>
                                <div className="flex justify-between"><span className="text-slate-500">Detained</span><span className="font-semibold text-slate-800">{counts.detained} stay in their class</span></div>
                                <div className="flex justify-between"><span className="text-slate-500">Passed out</span><span className="font-semibold text-slate-800">{counts.passed_out}</span></div>
                                <div className="flex justify-between"><span className="text-slate-500">Target session</span><span className="font-semibold text-slate-800">{selectedToYear?.name}</span></div>
                            </div>
                            {preview?.source_year_is_current && (
                                <p className="text-[11px] text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-2">
                                    {selectedFromYear?.name} is still current. Generate its last monthly fees before this promotion, or these students will be left out of that fee run.
                                </p>
                            )}
                            {missingFeeClasses.length > 0 && (
                                <p className="text-[11px] text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-2">
                                    No fee structure for {missingFeeClasses.join(', ')} in {selectedToYear?.name}. Saving is allowed.
                                </p>
                            )}
                        </div>
                        <div className="bg-slate-50/70 px-5 py-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                            <Button type="button" variant="ghost" size="sm" onClick={() => setShowConfirmModal(false)}>Cancel</Button>
                            <Button type="button" size="sm" onClick={handlePromoteConfirm} icon={<CheckCircle2 className="w-4 h-4" />}>Confirm</Button>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
