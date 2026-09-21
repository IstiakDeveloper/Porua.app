import { FormEvent, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import FormPageHeader from '@/Components/FormPageHeader';
import FormCard from '@/Components/FormCard';
import PresetPills from '@/Components/PresetPills';
import { BookOpen, Save, Sparkles, Hash, Layers, MapPin, Calendar, DollarSign, Bookmark } from 'lucide-react';

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

export default function Create() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [formData, setFormData] = useState({
        title: '',
        author: '',
        isbn: '',
        publisher: '',
        publication_year: new Date().getFullYear().toString(),
        category: '',
        quantity: '1',
        available_quantity: '1',
        price: '',
        shelf_location: '',
        description: '',
        status: 'available',
    });

    // Auto-generate ISBN/Accession code
    const handleGenerateIsbn = () => {
        const rand = Math.floor(100000 + Math.random() * 900000);
        const code = `978-984-${rand}`;
        setFormData(prev => ({ ...prev, isbn: code }));
    };

    const handleGenerateAccession = () => {
        const year = new Date().getFullYear();
        const rand = Math.floor(1000 + Math.random() * 9000);
        const code = `LIB-${year}-${rand}`;
        setFormData(prev => ({ ...prev, isbn: code }));
    };

    // When quantity changes, auto default available copies if user hasn't diverged
    const handleQuantityChange = (val: string) => {
        setFormData(prev => ({
            ...prev,
            quantity: val,
            available_quantity: val,
        }));
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        router.post('/books', formData, {
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
            <Head title="Add New Book" />

            <div className="max-w-5xl mx-auto space-y-6">
                <FormPageHeader
                    badge="Library Management"
                    title="Catalog New Book"
                    subtitle="Register a new book title into the school library system with automatic stock and code generators"
                    backUrl="/books"
                    backLabel="Back to Books"
                />

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Presets Card */}
                    <div className="bg-emerald-50/60 rounded-2xl border border-emerald-100/90 p-5 shadow-xs">
                        <PresetPills
                            title="1-Click Category Presets"
                            subtitle="Select a standard subject or genre category to populate instantly"
                            presets={CATEGORY_PRESETS}
                            activeValue={formData.category}
                            onSelect={(cat) => setFormData(prev => ({ ...prev, category: cat }))}
                        />
                    </div>

                    {/* Book Basic Info */}
                    <FormCard
                        icon={BookOpen}
                        title="Book Information"
                        description="Core bibliographic details of the publication"
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
                                    placeholder="e.g. Higher Secondary Mathematics 1st Paper"
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
                                    placeholder="e.g. Prof. S. U. Ahammad"
                                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800"
                                />
                                {errors.author && <p className="text-xs text-rose-500 mt-1">{errors.author}</p>}
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                                        ISBN / Accession Code <span className="text-rose-500">*</span>
                                    </label>
                                    <div className="flex items-center gap-1.5 text-xs text-emerald-700">
                                        <button
                                            type="button"
                                            onClick={handleGenerateIsbn}
                                            className="hover:underline flex items-center gap-0.5"
                                        >
                                            <Sparkles className="w-3 h-3" /> Auto ISBN
                                        </button>
                                        <span className="text-slate-300">|</span>
                                        <button
                                            type="button"
                                            onClick={handleGenerateAccession}
                                            className="hover:underline flex items-center gap-0.5"
                                        >
                                            Accession
                                        </button>
                                    </div>
                                </div>
                                <input
                                    type="text"
                                    required
                                    value={formData.isbn}
                                    onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                                    placeholder="e.g. 978-984-123456 or LIB-2026-101"
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
                                    placeholder="e.g. National Curriculum and Textbook Board (NCTB)"
                                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800"
                                />
                                {errors.publisher && <p className="text-xs text-rose-500 mt-1">{errors.publisher}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Publication Year
                                </label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        min="1900"
                                        max={new Date().getFullYear()}
                                        value={formData.publication_year}
                                        onChange={(e) => setFormData({ ...formData, publication_year: e.target.value })}
                                        placeholder="e.g. 2026"
                                        className="w-full px-3.5 py-2.5 text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800"
                                    />
                                    <div className="flex items-center gap-1 shrink-0">
                                        {[2026, 2025, 2024].map(yr => (
                                            <button
                                                key={yr}
                                                type="button"
                                                onClick={() => setFormData(p => ({ ...p, publication_year: yr.toString() }))}
                                                className="px-2 py-1 text-xs rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 font-mono transition-all"
                                            >
                                                {yr}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                {errors.publication_year && <p className="text-xs text-rose-500 mt-1">{errors.publication_year}</p>}
                            </div>
                        </div>
                    </FormCard>

                    {/* Stock, Location & Pricing */}
                    <FormCard
                        icon={Layers}
                        title="Inventory, Location & Pricing"
                        description="Manage stock quantities, shelf placement, and procurement cost"
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
                                    onChange={(e) => handleQuantityChange(e.target.value)}
                                    className="w-full px-3.5 py-2.5 text-sm font-bold bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800"
                                />
                                <span className="text-[11px] text-slate-400 mt-1 block">⚡ Auto-syncs available copies</span>
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
                                    placeholder="e.g. 350.00"
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
                                    placeholder="e.g. Shelf A-1 or Reference Section Rack 4"
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
                                    placeholder="Optional summary, edition details, volume numbers, or keywords..."
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
                            {isSubmitting ? 'Cataloging Book...' : 'Save Book to Catalog'}
                        </button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
