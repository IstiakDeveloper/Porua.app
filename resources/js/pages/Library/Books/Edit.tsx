import { FormEvent, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import FormPageHeader from '@/Components/FormPageHeader';
import FormCard from '@/Components/FormCard';
import PresetPills from '@/Components/PresetPills';
import { BookOpen, Save, Layers, Sparkles, MapPin, DollarSign } from 'lucide-react';
import { Book } from '@/types/library';

interface EditProps {
    book: Book;
}

const CATEGORY_PRESETS = [
    'Textbook',
    'Reference',
    'Literature',
    'General Science',
    'Mathematics',
    'Bangla Literature',
    'English Reader',
    'History & Civics',
    'Islamic Studies',
    'ICT & Computing',
    'Fiction',
];

const SHELF_PRESETS = [
    'Shelf A-1',
    'Shelf A-2',
    'Shelf B-1',
    'Shelf B-2',
    'Main Almirah',
    'Reference Rack',
    'Reading Room',
];

export default function Edit({ book }: EditProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [formData, setFormData] = useState({
        title: book.title,
        author: book.author,
        isbn: book.isbn,
        publisher: book.publisher || '',
        publication_year: book.publication_year?.toString() || '',
        category: book.category,
        quantity: (book.total_copies ?? book.quantity ?? 0).toString(),
        available_quantity: (book.available_copies ?? book.available_quantity ?? 0).toString(),
        price: book.price?.toString() || '',
        shelf_location: book.shelf_location || '',
        description: book.description || '',
        status: book.status || 'available',
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        router.put(`/books/${book.id}`, formData, {
            onError: (errs) => {
                setErrors(errs as Record<string, string>);
                setIsSubmitting(false);
            },
            onSuccess: () => {
                setIsSubmitting(false);
            },
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Edit Book - ${book.title}`} />

            <div className="max-w-5xl mx-auto space-y-6">
                <FormPageHeader
                    badge="Library Catalog"
                    title={`Edit Book: ${book.title}`}
                    subtitle="Update bibliographic details, location, and inventory copies"
                    backUrl="/books"
                    backLabel="Back to Books"
                />

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Presets Card */}
                    <div className="bg-emerald-50/60 rounded-2xl border border-emerald-100/90 p-5 shadow-xs">
                        <PresetPills
                            title="Category Presets"
                            subtitle="Quickly adjust the category classification"
                            presets={CATEGORY_PRESETS}
                            activeValue={formData.category}
                            onSelect={(cat) => setFormData(prev => ({ ...prev, category: cat }))}
                        />
                    </div>

                    {/* Book Basic Info */}
                    <FormCard
                        icon={BookOpen}
                        title="Book Information"
                        description="Update core bibliographic details"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="md:col-span-2">
                                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Book Title <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800"
                                />
                                {errors.title && <p className="text-xs text-rose-500 mt-1">{errors.title}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Author / Editor <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.author}
                                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800"
                                />
                                {errors.author && <p className="text-xs text-rose-500 mt-1">{errors.author}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                    ISBN / Accession Code <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.isbn}
                                    onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                                    className="w-full px-3.5 py-2.5 text-sm font-mono bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800"
                                />
                                {errors.isbn && <p className="text-xs text-rose-500 mt-1">{errors.isbn}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Publisher Name
                                </label>
                                <input
                                    type="text"
                                    value={formData.publisher}
                                    onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
                                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800"
                                />
                                {errors.publisher && <p className="text-xs text-rose-500 mt-1">{errors.publisher}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Publication Year
                                </label>
                                <input
                                    type="number"
                                    min="1900"
                                    max={new Date().getFullYear()}
                                    value={formData.publication_year}
                                    onChange={(e) => setFormData({ ...formData, publication_year: e.target.value })}
                                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800"
                                />
                                {errors.publication_year && <p className="text-xs text-rose-500 mt-1">{errors.publication_year}</p>}
                            </div>
                        </div>
                    </FormCard>

                    {/* Stock, Location & Pricing */}
                    <FormCard
                        icon={Layers}
                        title="Inventory, Location & Pricing"
                        description="Manage book stock counts and current physical placement"
                    >
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Total Copies <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    required
                                    value={formData.quantity}
                                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                    className="w-full px-3.5 py-2.5 text-sm font-bold bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800"
                                />
                                {errors.quantity && <p className="text-xs text-rose-500 mt-1">{errors.quantity}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Available Copies <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    max={formData.quantity}
                                    required
                                    value={formData.available_quantity}
                                    onChange={(e) => setFormData({ ...formData, available_quantity: e.target.value })}
                                    className="w-full px-3.5 py-2.5 text-sm font-bold text-emerald-700 bg-emerald-50/40 border border-emerald-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                                />
                                {errors.available_quantity && <p className="text-xs text-rose-500 mt-1">{errors.available_quantity}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Unit Price (BDT)
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800"
                                />
                                {errors.price && <p className="text-xs text-rose-500 mt-1">{errors.price}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Book Status <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800"
                                >
                                    <option value="available">Available</option>
                                    <option value="unavailable">Unavailable</option>
                                    <option value="damaged">Damaged / Repair</option>
                                </select>
                                {errors.status && <p className="text-xs text-rose-500 mt-1">{errors.status}</p>}
                            </div>

                            <div className="sm:col-span-2 lg:col-span-4">
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                                        Shelf / Storage Location
                                    </label>
                                    <div className="flex items-center gap-1">
                                        {SHELF_PRESETS.map((sh) => (
                                            <button
                                                key={sh}
                                                type="button"
                                                onClick={() => setFormData(p => ({ ...p, shelf_location: sh }))}
                                                className={`px-2 py-0.5 text-xs rounded-md transition-all ${
                                                    formData.shelf_location === sh
                                                        ? 'bg-emerald-600 text-white font-semibold'
                                                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                                                }`}
                                            >
                                                {sh}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <input
                                    type="text"
                                    value={formData.shelf_location}
                                    onChange={(e) => setFormData({ ...formData, shelf_location: e.target.value })}
                                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800"
                                />
                                {errors.shelf_location && <p className="text-xs text-rose-500 mt-1">{errors.shelf_location}</p>}
                            </div>

                            <div className="sm:col-span-2 lg:col-span-4">
                                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Description & Keywords
                                </label>
                                <textarea
                                    rows={3}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800"
                                />
                                {errors.description && <p className="text-xs text-rose-500 mt-1">{errors.description}</p>}
                            </div>
                        </div>
                    </FormCard>

                    {/* Bottom Action */}
                    <div className="flex items-center justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => router.visit('/books')}
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
                            {isSubmitting ? 'Saving Changes...' : 'Update Book Catalog'}
                        </button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
