import { useState, FormEvent, useMemo } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/Button';
import { GraduationCap, ArrowRight, Users, Check, X, ArrowLeft } from 'lucide-react';

function route(name: string, params?: Record<string, any>): string {
    const baseUrl = (window as any).route ? (window as any).route(name, params) : `/${name.replace('.', '/')}`;
    if (params && !((window as any).route)) {
        const query = new URLSearchParams(params).toString();
        return query ? `${baseUrl}?${query}` : baseUrl;
    }
    return baseUrl;
}

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

interface Student {
    id: number;
    admission_number: string;
    roll_number: string;
    first_name: string;
    last_name: string;
    photo_url: string | null;
    current_class_id: number;
    current_section_id: number;
}

interface Props {
    academicYears: AcademicYear[];
    classes: SchoolClass[];
}

export default function Create({ academicYears, classes }: Props) {
    // Search filters
    const [currentAcademicYearId, setCurrentAcademicYearId] = useState('');
    const [currentClassId, setCurrentClassId] = useState('');
    const [currentSectionId, setCurrentSectionId] = useState('');

    // Target promotion data
    const [targetAcademicYearId, setTargetAcademicYearId] = useState('');
    const [targetClassId, setTargetClassId] = useState('');
    const [targetSectionId, setTargetSectionId] = useState('');
    const [promotionDate, setPromotionDate] = useState(new Date().toISOString().split('T')[0]);
    const [status, setStatus] = useState('promoted');
    const [remarks, setRemarks] = useState('');

    // Students data
    const [students, setStudents] = useState<Student[]>([]);
    const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
    const [loadingStudents, setLoadingStudents] = useState(false);
    const [processing, setProcessing] = useState(false);

    // Get current sections based on selected class
    const currentSections = useMemo(() => {
        if (!currentClassId) return [];
        const selectedClass = classes.find(c => c.id === parseInt(currentClassId));
        return selectedClass?.sections || [];
    }, [currentClassId, classes]);

    // Get target sections based on selected target class
    const targetSections = useMemo(() => {
        if (!targetClassId) return [];
        const selectedClass = classes.find(c => c.id === parseInt(targetClassId));
        return selectedClass?.sections || [];
    }, [targetClassId, classes]);

    // Fetch students based on filters
    const handleSearch = async (e: FormEvent) => {
        e.preventDefault();

        if (!currentAcademicYearId || !currentClassId || !currentSectionId) {
            alert('Please select academic year, class, and section');
            return;
        }

        setLoadingStudents(true);

        try {
            const url = `/student-promotions/students?academic_year_id=${currentAcademicYearId}&class_id=${currentClassId}&section_id=${currentSectionId}`;
            console.log('Fetching from:', url);

            const response = await fetch(url);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Server error:', errorText);
                throw new Error(`Server error: ${response.status}`);
            }

            const data = await response.json();
            console.log('Students loaded:', data);
            setStudents(data);
            setSelectedStudents([]);
        } catch (error) {
            console.error('Error fetching students:', error);
            alert('Failed to load students. Please check console for details.');
        } finally {
            setLoadingStudents(false);
        }
    };

    // Reset search filters
    const handleReset = () => {
        setCurrentAcademicYearId('');
        setCurrentClassId('');
        setCurrentSectionId('');
        setStudents([]);
        setSelectedStudents([]);
    };

    // Toggle student selection
    const toggleStudent = (studentId: number) => {
        setSelectedStudents(prev =>
            prev.includes(studentId)
                ? prev.filter(id => id !== studentId)
                : [...prev, studentId]
        );
    };

    // Toggle all students
    const toggleAll = () => {
        if (selectedStudents.length === students.length) {
            setSelectedStudents([]);
        } else {
            setSelectedStudents(students.map(s => s.id));
        }
    };

    // Handle promotion submission
    const handlePromote = async (e: FormEvent) => {
        e.preventDefault();

        if (selectedStudents.length === 0) {
            alert('Please select at least one student');
            return;
        }

        if (!targetAcademicYearId || !targetClassId || !targetSectionId) {
            alert('Please select target academic year, class, and section');
            return;
        }

        if (confirm(`Are you sure you want to promote ${selectedStudents.length} student(s)?`)) {
            setProcessing(true);

            router.post(
                '/student-promotions',
                {
                    student_ids: selectedStudents,
                    from_academic_year_id: currentAcademicYearId,
                    from_class_id: currentClassId,
                    from_section_id: currentSectionId,
                    to_academic_year_id: targetAcademicYearId,
                    to_class_id: targetClassId,
                    to_section_id: targetSectionId,
                    promotion_date: promotionDate,
                    status: status,
                    remarks: remarks,
                },
                {
                    onSuccess: () => {
                        setSelectedStudents([]);
                        setStudents([]);
                        setTargetAcademicYearId('');
                        setTargetClassId('');
                        setTargetSectionId('');
                        setRemarks('');
                    },
                    onFinish: () => setProcessing(false),
                }
            );
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Promote Students" />

            <div className="space-y-6 animate-fade-in">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={route('student-promotions.index')}>
                            <Button variant="ghost" size="sm" icon={<ArrowLeft className="w-4 h-4" />}>
                                Back
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                                Promote Students
                            </h1>
                            <p className="text-gray-600 mt-1">Select and promote students to next academic year</p>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto">
                    <div className="space-y-6">
                    {/* Search Filters */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <GraduationCap className="w-5 h-5 text-blue-600" />
                            Find Students
                        </h3>

                        <form onSubmit={handleSearch}>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Current Academic Year *
                                    </label>
                                    <select
                                        value={currentAcademicYearId}
                                        onChange={(e) => setCurrentAcademicYearId(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                    >
                                        <option value="">Select Year</option>
                                        {academicYears.map(year => (
                                            <option key={year.id} value={year.id}>{year.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Current Class *
                                    </label>
                                    <select
                                        value={currentClassId}
                                        onChange={(e) => {
                                            setCurrentClassId(e.target.value);
                                            setCurrentSectionId('');
                                        }}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                    >
                                        <option value="">Select Class</option>
                                        {classes.map(cls => (
                                            <option key={cls.id} value={cls.id}>{cls.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Current Section *
                                    </label>
                                    <select
                                        value={currentSectionId}
                                        onChange={(e) => setCurrentSectionId(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                        disabled={!currentClassId}
                                    >
                                        <option value="">Select Section</option>
                                        {currentSections.map(section => (
                                            <option key={section.id} value={section.id}>{section.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex items-end gap-2">
                                    <Button type="submit" className="flex-1" disabled={loadingStudents}>
                                        {loadingStudents ? 'Loading...' : 'Search'}
                                    </Button>
                                    <Button type="button" variant="ghost" onClick={handleReset}>
                                        Reset
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </div>

                    {students.length > 0 && (
                        <>
                            {/* Student Selection */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                        <Users className="w-5 h-5 text-blue-600" />
                                        Select Students ({selectedStudents.length} selected)
                                    </h3>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={toggleAll}
                                        icon={selectedStudents.length === students.length ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                                    >
                                        {selectedStudents.length === students.length ? 'Deselect All' : 'Select All'}
                                    </Button>
                                </div>

                                <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50 sticky top-0">
                                            <tr>
                                                <th className="px-6 py-3 text-left">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedStudents.length === students.length}
                                                        onChange={toggleAll}
                                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                    />
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Photo
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Admission #
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Roll #
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Name
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {students.map((student) => (
                                                <tr
                                                    key={student.id}
                                                    className={`hover:bg-gray-50 cursor-pointer ${selectedStudents.includes(student.id) ? 'bg-blue-50' : ''}`}
                                                    onClick={() => toggleStudent(student.id)}
                                                >
                                                    <td className="px-6 py-4">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedStudents.includes(student.id)}
                                                            onChange={() => toggleStudent(student.id)}
                                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                            onClick={(e) => e.stopPropagation()}
                                                        />
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {student.photo_url ? (
                                                            <img
                                                                src={student.photo_url}
                                                                alt={student.first_name}
                                                                className="w-10 h-10 rounded-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center">
                                                                <span className="text-white font-semibold text-xs">
                                                                    {student.first_name.charAt(0)}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-900">
                                                        {student.admission_number}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-900">
                                                        {student.roll_number}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                                        {student.first_name} {student.last_name}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Promotion Details */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                    <ArrowRight className="w-5 h-5 text-blue-600" />
                                    Promotion Details
                                </h3>

                                <form onSubmit={handlePromote}>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Target Academic Year *
                                            </label>
                                            <select
                                                value={targetAcademicYearId}
                                                onChange={(e) => setTargetAcademicYearId(e.target.value)}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                required
                                            >
                                                <option value="">Select Year</option>
                                                {academicYears.map(year => (
                                                    <option key={year.id} value={year.id}>{year.name}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Target Class *
                                            </label>
                                            <select
                                                value={targetClassId}
                                                onChange={(e) => {
                                                    setTargetClassId(e.target.value);
                                                    setTargetSectionId('');
                                                }}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                required
                                            >
                                                <option value="">Select Class</option>
                                                {classes.map(cls => (
                                                    <option key={cls.id} value={cls.id}>{cls.name}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Target Section *
                                            </label>
                                            <select
                                                value={targetSectionId}
                                                onChange={(e) => setTargetSectionId(e.target.value)}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                required
                                                disabled={!targetClassId}
                                            >
                                                <option value="">Select Section</option>
                                                {targetSections.map(section => (
                                                    <option key={section.id} value={section.id}>{section.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Promotion Date *
                                            </label>
                                            <input
                                                type="date"
                                                value={promotionDate}
                                                onChange={(e) => setPromotionDate(e.target.value)}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Status *
                                            </label>
                                            <select
                                                value={status}
                                                onChange={(e) => setStatus(e.target.value)}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                required
                                            >
                                                <option value="promoted">Promoted</option>
                                                <option value="detained">Detained</option>
                                                <option value="passed_out">Passed Out</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Remarks
                                            </label>
                                            <input
                                                type="text"
                                                value={remarks}
                                                onChange={(e) => setRemarks(e.target.value)}
                                                placeholder="Optional remarks"
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>
                                    </div>

                                    {selectedStudents.length > 0 && (
                                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                                            <p className="text-sm text-blue-900">
                                                <strong>{selectedStudents.length}</strong> student(s) will be promoted
                                            </p>
                                        </div>
                                    )}

                                    <div className="flex justify-end gap-3">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            onClick={() => {
                                                setSelectedStudents([]);
                                                setTargetAcademicYearId('');
                                                setTargetClassId('');
                                                setTargetSectionId('');
                                                setRemarks('');
                                            }}
                                        >
                                            Clear Selection
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={processing || selectedStudents.length === 0}
                                            className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white"
                                            icon={<ArrowRight className="w-5 h-5" />}
                                        >
                                            {processing ? 'Processing...' : `Promote ${selectedStudents.length} Student(s)`}
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </>
                    )}

                    {students.length === 0 && !loadingStudents && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                            <GraduationCap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                Search for Students
                            </h3>
                            <p className="text-gray-600">
                                Use the filters above to find students for promotion.
                            </p>
                        </div>
                    )}
                </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
