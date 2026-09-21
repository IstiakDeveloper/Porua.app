import { FormEvent, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import FormPageHeader from '@/Components/FormPageHeader';
import FormCard from '@/Components/FormCard';
import PresetPills from '@/Components/PresetPills';
import { BookOpen, User, Calendar, Save, Sparkles, Clock, CheckCircle2 } from 'lucide-react';
import { Book } from '@/types/library';

interface CreateProps {
    books: Book[];
    students: Array<{
        id: number;
        admission_number: string;
        full_name: string;
        user?: { name: string; email: string };
    }>;
    teachers: Array<{
        id: number;
        employee_id: string;
        user?: { name: string; email: string };
    }>;
}

const DURATION_PRESETS = [
    { label: '7 Days (1 Week)', days: 7 },
    { label: '14 Days (2 Weeks)', days: 14 },
    { label: '21 Days (3 Weeks)', days: 21 },
    { label: '30 Days (1 Month)', days: 30 },
];

export default function Create({ books, students, teachers }: CreateProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const today = new Date().toISOString().split('T')[0];

    const [formData, setFormData] = useState({
        book_id: '',
        borrower_type: 'student' as 'student' | 'teacher',
        borrower_id: '',
        issue_date: today,
        due_date: (() => {
            const d = new Date();
            d.setDate(d.getDate() + 14);
            return d.toISOString().split('T')[0];
        })(),
        remarks: '',
    });

    const handleApplyDuration = (days: number) => {
        const base = formData.issue_date ? new Date(formData.issue_date) : new Date();
        base.setDate(base.getDate() + days);
        setFormData(prev => ({
            ...prev,
            due_date: base.toISOString().split('T')[0]
        }));
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        router.post('/book-issues', formData, {
            onError: (errs) => {
                setErrors(errs as Record<string, string>);
                setIsSubmitting(false);
            },
            onSuccess: () => {
                setIsSubmitting(false);
            },
        });
    };

    const selectedBook = books.find(b => b.id.toString() === formData.book_id);
    const borrowers = formData.borrower_type === 'student' ? students : teachers;

    return (
        <AuthenticatedLayout>
            <Head title="Issue Book" />

            <div className="max-w-4xl mx-auto space-y-6">
                <FormPageHeader
                    badge="Library Circulation"
                    title="Issue Book"
                    subtitle="Lend a library book to a registered student or faculty member with auto due-date calculation"
                    backUrl="/book-issues"
                    backLabel="Back to Issues"
                />

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Book & Borrower Selection */}
                    <FormCard
                        icon={BookOpen}
                        title="Book & Borrower Details"
                        description="Select the book title to lend and specify the borrower"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="md:col-span-2">
                                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Select Book from Catalog <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    value={formData.book_id}
                                    onChange={(e) => setFormData({ ...formData, book_id: e.target.value })}
                                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800"
                                    required
                                >
                                    <option value="">-- Choose Available Book --</option>
                                    {books.map(book => (
                                        <option key={book.id} value={book.id}>
                                            {book.title} (By {book.author}) • ISBN: {book.isbn} • [Available: {book.available_copies ?? book.available_quantity}]
                                        </option>
                                    ))}
                                </select>
                                {errors.book_id && <p className="text-xs text-rose-500 mt-1">{errors.book_id}</p>}

                                {selectedBook && (
                                    <div className="mt-2.5 p-3 rounded-xl bg-emerald-50/70 border border-emerald-100 flex items-center justify-between text-xs">
                                        <span className="text-emerald-800 font-medium">
                                            📍 Shelf: {selectedBook.shelf_location || 'Not Specified'} • Category: {selectedBook.category}
                                        </span>
                                        <span className="font-bold text-emerald-700">
                                            ✓ {selectedBook.available_copies ?? selectedBook.available_quantity} copies ready in stock
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Borrower Type */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Borrower Classification <span className="text-rose-500">*</span>
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setFormData(p => ({ ...p, borrower_type: 'student', borrower_id: '' }))}
                                        className={`py-2.5 rounded-xl border text-xs font-bold transition-all ${
                                            formData.borrower_type === 'student'
                                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                                                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                                        }`}
                                    >
                                        Student
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData(p => ({ ...p, borrower_type: 'teacher', borrower_id: '' }))}
                                        className={`py-2.5 rounded-xl border text-xs font-bold transition-all ${
                                            formData.borrower_type === 'teacher'
                                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                                                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                                        }`}
                                    >
                                        Teacher
                                    </button>
                                </div>
                            </div>

                            {/* Borrower Select */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Select {formData.borrower_type === 'student' ? 'Student' : 'Teacher'} <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    value={formData.borrower_id}
                                    onChange={(e) => setFormData({ ...formData, borrower_id: e.target.value })}
                                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800"
                                    required
                                >
                                    <option value="">-- Choose Borrower --</option>
                                    {formData.borrower_type === 'student'
                                        ? students.map(st => (
                                              <option key={st.id} value={st.id}>
                                                  {st.full_name || st.user?.name} (Admission: {st.admission_number})
                                              </option>
                                          ))
                                        : teachers.map(tc => (
                                              <option key={tc.id} value={tc.id}>
                                                  {tc.user?.name} (Emp ID: {tc.employee_id})
                                              </option>
                                          ))}
                                </select>
                                {errors.borrower_id && <p className="text-xs text-rose-500 mt-1">{errors.borrower_id}</p>}
                            </div>
                        </div>
                    </FormCard>

                    {/* Timeline & Due Date Calculation */}
                    <FormCard
                        icon={Calendar}
                        title="Circulation Timeline"
                        description="Set lending schedule with automatic return due date calculation"
                    >
                        <div className="space-y-5">
                            {/* Duration Presets */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                    ⚡ 1-Click Borrowing Duration Presets
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {DURATION_PRESETS.map((dp) => (
                                        <button
                                            key={dp.days}
                                            type="button"
                                            onClick={() => handleApplyDuration(dp.days)}
                                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 text-xs font-semibold transition-all active:scale-95"
                                        >
                                            <Clock className="w-3.5 h-3.5" />
                                            {dp.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                        Issue Date <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        required
                                        value={formData.issue_date}
                                        onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })}
                                        className="w-full px-3.5 py-2.5 text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800"
                                    />
                                    {errors.issue_date && <p className="text-xs text-rose-500 mt-1">{errors.issue_date}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                        Due Date <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        required
                                        value={formData.due_date}
                                        onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                                        className="w-full px-3.5 py-2.5 text-sm bg-emerald-50/40 border border-emerald-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-semibold text-emerald-800"
                                    />
                                    {errors.due_date && <p className="text-xs text-rose-500 mt-1">{errors.due_date}</p>}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Issue Remarks / Notes
                                </label>
                                <textarea
                                    rows={2}
                                    value={formData.remarks}
                                    onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                                    placeholder="Optional note regarding book physical condition, term exam, etc..."
                                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800"
                                />
                                {errors.remarks && <p className="text-xs text-rose-500 mt-1">{errors.remarks}</p>}
                            </div>
                        </div>
                    </FormCard>

                    {/* Bottom Action */}
                    <div className="flex items-center justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => router.visit('/book-issues')}
                            className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold text-sm transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-semibold text-sm transition-all shadow-sm disabled:opacity-50"
                        >
                            <Save className="w-4 h-4" />
                            {isSubmitting ? 'Issuing Book...' : 'Complete Book Issue'}
                        </button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
