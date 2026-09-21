import { router, Head, useForm } from '@inertiajs/react';
import { Save, ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/Button';
import Select from '@/Components/Select';
import Card from '@/Components/Card';

interface Props {
    teachers: Array<{ id: number; user: { name: string }; employee_id: string }>;
    classes: Array<{ id: number; name: string }>;
    subjects: Array<{ id: number; name: string; code: string }>;
    sections: Array<{ id: number; name: string; class_id: number }>;
    currentAcademicYear: { id: number; year: string; name: string } | null;
}

export default function Create({ teachers, classes, subjects, sections, currentAcademicYear }: Props) {

    const { data, setData, post, errors, processing } = useForm({
        teacher_id: '',
        subject_ids: [] as number[],
        class_ids: [] as number[],
        section_ids: [] as number[],
    });

    // Filter sections based on selected classes
    const availableSections = data.class_ids.length > 0
        ? sections.filter(s => data.class_ids.includes(s.class_id))
        : [];

    const handleClassToggle = (classId: number) => {
        const currentClasses = [...data.class_ids];
        const index = currentClasses.indexOf(classId);

        if (index > -1) {
            currentClasses.splice(index, 1);
            // Remove sections of this class
            const sectionsToRemove = sections
                .filter(s => s.class_id === classId)
                .map(s => s.id);
            const newSections = data.section_ids.filter(id => !sectionsToRemove.includes(id));
            setData({ ...data, class_ids: currentClasses, section_ids: newSections });
        } else {
            currentClasses.push(classId);
            setData('class_ids', currentClasses);
        }
    };

    const handleSectionToggle = (sectionId: number) => {
        const currentSections = [...data.section_ids];
        const index = currentSections.indexOf(sectionId);

        if (index > -1) {
            currentSections.splice(index, 1);
        } else {
            currentSections.push(sectionId);
        }

        setData('section_ids', currentSections);
    };

    const handleSubjectToggle = (subjectId: number) => {
        const currentSubjects = [...data.subject_ids];
        const index = currentSubjects.indexOf(subjectId);

        if (index > -1) {
            currentSubjects.splice(index, 1);
        } else {
            currentSubjects.push(subjectId);
        }

        setData('subject_ids', currentSubjects);
    };

    const handleSelectAllSubjects = () => {
        if (data.subject_ids.length === subjects.length) {
            setData('subject_ids', []);
        } else {
            setData('subject_ids', subjects.map(s => s.id));
        }
    };

    const handleSelectAllClasses = () => {
        if (data.class_ids.length === classes.length) {
            setData({ ...data, class_ids: [], section_ids: [] });
        } else {
            setData('class_ids', classes.map(c => c.id));
        }
    };

    const handleSelectAllSections = () => {
        if (data.section_ids.length === availableSections.length) {
            setData('section_ids', []);
        } else {
            setData('section_ids', availableSections.map(s => s.id));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/teacher-subjects');
    };

    return (
        <AuthenticatedLayout>
            <Head title="Assign Subject" />

            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Assign Subject to Teacher</h1>
                        <p className="text-sm text-gray-600 mt-1">Create a new subject assignment</p>
                    </div>
                    <Button variant="secondary" onClick={() => router.get('/teacher-subjects')}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                    </Button>
                </div>

                {currentAcademicYear && (
                    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-blue-900">
                                📅 Academic Year: <strong>{currentAcademicYear.year}</strong> ({currentAcademicYear.name})
                            </span>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <Card title="Assignment Details">
                        <div className="space-y-6">
                            {/* Teacher Selection */}
                            <Select
                                label="Teacher"
                                value={data.teacher_id}
                                onChange={(e) => setData('teacher_id', e.target.value)}
                                options={[
                                    { value: '', label: 'Select Teacher' },
                                    ...teachers.map(t => ({
                                        value: t.id.toString(),
                                        label: `${t.user.name} (${t.employee_id})`,
                                    })),
                                ]}
                                error={errors.teacher_id}
                                required
                            />

                            {/* Subjects Selection with Checkboxes */}
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Subjects * <span className="text-gray-500 font-normal">({data.subject_ids.length} selected)</span>
                                    </label>
                                    <button
                                        type="button"
                                        onClick={handleSelectAllSubjects}
                                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                                    >
                                        {data.subject_ids.length === subjects.length ? 'Deselect All' : 'Select All'}
                                    </button>
                                </div>
                                <div className="border border-gray-300 rounded-lg p-4 max-h-64 overflow-y-auto bg-gray-50">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {subjects.map((subject) => (
                                            <label
                                                key={subject.id}
                                                className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                                                    data.subject_ids.includes(subject.id)
                                                        ? 'bg-blue-50 border-blue-500 shadow-sm'
                                                        : 'bg-white border-gray-200 hover:border-blue-300'
                                                }`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={data.subject_ids.includes(subject.id)}
                                                    onChange={() => handleSubjectToggle(subject.id)}
                                                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                />
                                                <div className="flex-1">
                                                    <div className="font-medium text-gray-900">{subject.name}</div>
                                                    <div className="text-sm text-gray-500">{subject.code}</div>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                {errors.subject_ids && <p className="text-red-600 text-sm mt-1">{errors.subject_ids}</p>}
                            </div>

                            {/* Class and Section Selection */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Classes Selection */}
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Classes * <span className="text-gray-500 font-normal">({data.class_ids.length} selected)</span>
                                        </label>
                                        <button
                                            type="button"
                                            onClick={handleSelectAllClasses}
                                            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                                        >
                                            {data.class_ids.length === classes.length ? 'Deselect All' : 'Select All'}
                                        </button>
                                    </div>
                                    <div className="border border-gray-300 rounded-lg p-4 max-h-64 overflow-y-auto bg-gray-50">
                                        <div className="space-y-2">
                                            {classes.map((cls) => (
                                                <label
                                                    key={cls.id}
                                                    className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                                                        data.class_ids.includes(cls.id)
                                                            ? 'bg-green-50 border-green-500 shadow-sm'
                                                            : 'bg-white border-gray-200 hover:border-green-300'
                                                    }`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={data.class_ids.includes(cls.id)}
                                                        onChange={() => handleClassToggle(cls.id)}
                                                        className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                                                    />
                                                    <div className="font-medium text-gray-900">Class {cls.name}</div>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                    {errors.class_ids && <p className="text-red-600 text-sm mt-1">{errors.class_ids}</p>}
                                </div>

                                {/* Sections Selection */}
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Sections (Optional) <span className="text-gray-500 font-normal">({data.section_ids.length} selected)</span>
                                        </label>
                                        {availableSections.length > 0 && (
                                            <button
                                                type="button"
                                                onClick={handleSelectAllSections}
                                                className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                                            >
                                                {data.section_ids.length === availableSections.length ? 'Deselect All' : 'Select All'}
                                            </button>
                                        )}
                                    </div>
                                    <div className="border border-gray-300 rounded-lg p-4 max-h-64 overflow-y-auto bg-gray-50">
                                        {availableSections.length === 0 ? (
                                            <p className="text-gray-500 text-sm text-center py-8">
                                                {data.class_ids.length === 0 ? 'Select classes first' : 'No sections available'}
                                            </p>
                                        ) : (
                                            <div className="space-y-2">
                                                {availableSections.map((section) => (
                                                    <label
                                                        key={section.id}
                                                        className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                                                            data.section_ids.includes(section.id)
                                                                ? 'bg-purple-50 border-purple-500 shadow-sm'
                                                                : 'bg-white border-gray-200 hover:border-purple-300'
                                                        }`}
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={data.section_ids.includes(section.id)}
                                                            onChange={() => handleSectionToggle(section.id)}
                                                            className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                                                        />
                                                        <div>
                                                            <div className="font-medium text-gray-900">Section {section.name}</div>
                                                            <div className="text-xs text-gray-500">
                                                                {classes.find(c => c.id === section.class_id)?.name}
                                                            </div>
                                                        </div>
                                                    </label>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    {errors.section_ids && <p className="text-red-600 text-sm mt-1">{errors.section_ids}</p>}
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end space-x-4">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => router.get('/teacher-subjects')}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={processing}>
                                <Save className="h-4 w-4 mr-2" />
                                {processing ? 'Assigning...' : 'Assign Subject'}
                            </Button>
                        </div>
                    </Card>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
