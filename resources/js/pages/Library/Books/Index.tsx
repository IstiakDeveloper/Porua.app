import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/Button';
import Badge from '@/Components/Badge';
import DeleteModal from '@/Components/DeleteModal';
import {
    Plus, Edit, Trash2, Eye, BookOpen, Search,
    Filter, Grid3x3, List, Package, CheckCircle2,
    XCircle, AlertTriangle, Layers, Bookmark, Library
} from 'lucide-react';
import { Book, PaginatedData, BookFilters } from '@/types/library';

interface IndexProps {
    books: PaginatedData<Book>;
    filters?: BookFilters;
}

export default function Index({ books, filters }: IndexProps) {
    const [search, setSearch] = useState(filters?.search || '');
    const [category, setCategory] = useState(filters?.category || '');
    const [status, setStatus] = useState(filters?.status || '');
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: number | null; name: string }>({
        isOpen: false,
        id: null,
        name: '',
    });
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDeleteClick = (id: number, name: string) => {
        setDeleteModal({ isOpen: true, id, name });
    };

    const handleDeleteConfirm = () => {
        if (deleteModal.id) {
            setIsDeleting(true);
            router.delete(`/books/${deleteModal.id}`, {
                onFinish: () => {
                    setIsDeleting(false);
                    setDeleteModal({ isOpen: false, id: null, name: '' });
                },
            });
        }
    };

    const handleDeleteCancel = () => {
        setDeleteModal({ isOpen: false, id: null, name: '' });
    };

    const handleFilter = () => {
        router.get('/books', {
            search,
            category,
            status
        }, { preserveState: true });
    };

    const handleReset = () => {
        setSearch('');
        setCategory('');
        setStatus('');
        router.get('/books');
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'available':
                return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />;
            case 'unavailable':
                return <XCircle className="w-3.5 h-3.5 text-rose-600" />;
            case 'damaged':
                return <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />;
            default:
                return null;
        }
    };

    const totalBooks = books.data.reduce((sum, book) => sum + (book.total_copies || book.quantity || 0), 0);
    const availableBooks = books.data.reduce((sum, book) => sum + (book.available_copies || book.available_quantity || 0), 0);
    const borrowedBooks = Math.max(0, totalBooks - availableBooks);
    const categories = [...new Set(books.data.map(book => book.category).filter(Boolean))];

    return (
        <AuthenticatedLayout>
            <Head title="Library Books" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <Library className="w-3.5 h-3.5" />
                                Library Management
                            </span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-1">
                            Book Collection
                        </h1>
                        <p className="text-sm text-slate-500 mt-0.5">
                            Catalog, inventory, and shelf management for the institution's library
                        </p>
                    </div>
                    <div className="flex items-center gap-2.5 w-full sm:w-auto">
                        <Link
                            href="/book-issues"
                            className="flex-1 sm:flex-none justify-center inline-flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs sm:text-sm font-semibold hover:bg-slate-50 hover:border-slate-300 transition-all shadow-xs"
                        >
                            <Bookmark className="w-4 h-4 text-emerald-600 shrink-0" />
                            Book Issues
                        </Link>
                        <Link
                            href="/books/create"
                            className="flex-1 sm:flex-none justify-center inline-flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold transition-all shadow-sm hover:shadow-md active:scale-95"
                        >
                            <Plus className="w-4 h-4 shrink-0" />
                            Add New Book
                        </Link>
                    </div>
                </div>

                {/* 4 Metric KPI Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Book Titles</span>
                            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                <BookOpen className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-slate-900 mt-2">{books.total || books.data.length}</p>
                        <p className="text-xs text-slate-500 mt-0.5">Cataloged titles</p>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Copies</span>
                            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                <Package className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-slate-900 mt-2">{totalBooks}</p>
                        <p className="text-xs text-slate-500 mt-0.5">Total volume inventory</p>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Available on Shelf</span>
                            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                <CheckCircle2 className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-emerald-700 mt-2">{availableBooks}</p>
                        <p className="text-xs text-slate-500 mt-0.5">Ready for borrowing</p>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Borrowed</span>
                            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                                <Bookmark className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-amber-700 mt-2">{borrowedBooks}</p>
                        <p className="text-xs text-slate-500 mt-0.5">In circulation</p>
                    </div>
                </div>

                {/* Filters and View Mode */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1">
                        <div className="relative">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search by title, author, ISBN..."
                                className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                                onKeyPress={(e) => e.key === 'Enter' && handleFilter()}
                            />
                        </div>

                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="px-3 py-2 text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800"
                        >
                            <option value="">All Categories</option>
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>

                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="px-3 py-2 text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800"
                        >
                            <option value="">All Status</option>
                            <option value="available">Available</option>
                            <option value="unavailable">Unavailable</option>
                            <option value="damaged">Damaged</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                        <button
                            type="button"
                            onClick={handleFilter}
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-all"
                        >
                            <Filter className="w-3.5 h-3.5" />
                            Filter
                        </button>
                        {(search || category || status) && (
                            <button
                                type="button"
                                onClick={handleReset}
                                className="px-3 py-2 rounded-xl text-slate-500 hover:text-slate-800 text-xs font-semibold transition-all hover:bg-slate-100"
                            >
                                Reset
                            </button>
                        )}

                        <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50/70 p-1 ml-1">
                            <button
                                type="button"
                                onClick={() => setViewMode('grid')}
                                className={`p-1.5 rounded-lg transition-all ${
                                    viewMode === 'grid'
                                        ? 'bg-white text-emerald-700 shadow-xs font-semibold'
                                        : 'text-slate-500 hover:text-slate-900'
                                }`}
                                title="Grid View"
                            >
                                <Grid3x3 className="w-4 h-4" />
                            </button>
                            <button
                                type="button"
                                onClick={() => setViewMode('table')}
                                className={`p-1.5 rounded-lg transition-all ${
                                    viewMode === 'table'
                                        ? 'bg-white text-emerald-700 shadow-xs font-semibold'
                                        : 'text-slate-500 hover:text-slate-900'
                                }`}
                                title="Table View"
                            >
                                <List className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Grid View */}
                {viewMode === 'grid' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                        {books.data.map((book) => {
                            const total = book.total_copies || book.quantity || 0;
                            const avail = book.available_copies || book.available_quantity || 0;
                            const pct = total > 0 ? Math.round((avail / total) * 100) : 0;

                            return (
                                <div
                                    key={book.id}
                                    className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md hover:border-emerald-200 transition-all flex flex-col justify-between"
                                >
                                    <div>
                                        <div className="flex items-start justify-between gap-3 mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                                                    <BookOpen className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-slate-900 text-base line-clamp-1">
                                                        {book.title}
                                                    </h3>
                                                    <p className="text-xs text-slate-500 font-medium">By {book.author}</p>
                                                </div>
                                            </div>
                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize bg-slate-100 text-slate-700 border border-slate-200 shrink-0">
                                                {getStatusIcon(book.status)}
                                                {book.status}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2 mb-4">
                                            <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-100 text-xs font-medium">
                                                {book.category}
                                            </span>
                                            {book.shelf_location && (
                                                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-mono">
                                                    📍 {book.shelf_location}
                                                </span>
                                            )}
                                        </div>

                                        {/* Stock Bar */}
                                        <div className="space-y-1.5 mb-4 bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="text-slate-500">Available:</span>
                                                <span className="font-bold text-emerald-700">
                                                    {avail} / {total} Copies ({pct}%)
                                                </span>
                                            </div>
                                            <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all ${
                                                        pct > 50 ? 'bg-emerald-500' : pct > 20 ? 'bg-amber-500' : 'bg-rose-500'
                                                    }`}
                                                    style={{ width: `${pct}%` }}
                                                />
                                            </div>
                                            <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-1">
                                                <span>ISBN: {book.isbn}</span>
                                                {book.publication_year && <span>{book.publication_year}</span>}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                                        <Link
                                            href={`/books/${book.id}`}
                                            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 text-xs font-semibold border border-slate-200/80 hover:border-emerald-200 transition-all"
                                        >
                                            <Eye className="w-3.5 h-3.5" />
                                            Details
                                        </Link>
                                        <Link
                                            href={`/books/${book.id}/edit`}
                                            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200/80 transition-all"
                                        >
                                            <Edit className="w-3.5 h-3.5" />
                                            Edit
                                        </Link>
                                        <button
                                            type="button"
                                            onClick={() => handleDeleteClick(book.id, book.title)}
                                            className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 hover:text-rose-700 border border-transparent hover:border-rose-200 transition-all"
                                            title="Delete Book"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Table View */}
                {viewMode === 'table' && (
                    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-slate-900 border-b-2 border-emerald-500 text-white">
                                    <tr className="text-xs font-bold uppercase tracking-wider text-white">
                                        <th className="px-5 py-4 text-white font-bold">Book Title & Author</th>
                                        <th className="px-5 py-4 text-white font-bold">ISBN / Code</th>
                                        <th className="px-5 py-4 text-white font-bold">Category</th>
                                        <th className="px-5 py-4 text-white font-bold">Shelf / Location</th>
                                        <th className="px-5 py-4 text-center text-white font-bold">Total / Available</th>
                                        <th className="px-5 py-4 text-center text-white font-bold">Status</th>
                                        <th className="px-5 py-4 text-right text-white font-bold">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {books.data.map((book) => {
                                        const total = book.total_copies || book.quantity || 0;
                                        const avail = book.available_copies || book.available_quantity || 0;

                                        return (
                                            <tr key={book.id} className="hover:bg-emerald-50/30 transition-colors group">
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                                                            <BookOpen className="w-4 h-4" />
                                                        </div>
                                                        <div>
                                                            <Link
                                                                href={`/books/${book.id}`}
                                                                className="text-sm font-semibold text-slate-900 hover:text-emerald-700 transition-colors"
                                                            >
                                                                {book.title}
                                                            </Link>
                                                            <p className="text-xs text-slate-500">By {book.author}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4 font-mono text-xs font-semibold text-slate-700">
                                                    <span className="px-2 py-1 rounded-md bg-slate-100 border border-slate-200">
                                                        {book.isbn}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-100 text-xs font-medium">
                                                        {book.category}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4 text-xs font-medium text-slate-600">
                                                    {book.shelf_location || '—'}
                                                </td>
                                                <td className="px-5 py-4 text-center">
                                                    <span className="text-xs font-bold text-emerald-700">{avail}</span>
                                                    <span className="text-xs text-slate-400"> / {total}</span>
                                                </td>
                                                <td className="px-5 py-4 text-center">
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize bg-slate-100 text-slate-700 border border-slate-200">
                                                        {getStatusIcon(book.status)}
                                                        {book.status}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-1.5 opacity-90 group-hover:opacity-100">
                                                        <Link
                                                            href={`/books/${book.id}`}
                                                            className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 transition-all"
                                                            title="View"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </Link>
                                                        <Link
                                                            href={`/books/${book.id}/edit`}
                                                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all"
                                                            title="Edit"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </Link>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDeleteClick(book.id, book.title)}
                                                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all"
                                                            title="Delete"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {books.data.length === 0 && (
                    <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-xs">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                            <BookOpen className="w-6 h-6" />
                        </div>
                        <h4 className="text-base font-bold text-slate-900">No Books Found</h4>
                        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                            No library books match your filter criteria or no books have been added yet.
                        </p>
                        <div className="mt-4">
                            <Link
                                href="/books/create"
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs"
                            >
                                <Plus className="w-4 h-4" />
                                Add First Book
                            </Link>
                        </div>
                    </div>
                )}

                {/* Pagination */}
                {books.last_page > 1 && (
                    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex items-center justify-between">
                        <div className="text-xs text-slate-500">
                            Showing page {books.current_page} of {books.last_page} ({books.total} total books)
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => router.get('/books', { ...filters, page: books.current_page - 1 })}
                                disabled={books.current_page === 1}
                            >
                                Previous
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => router.get('/books', { ...filters, page: books.current_page + 1 })}
                                disabled={books.current_page === books.last_page}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            <DeleteModal
                isOpen={deleteModal.isOpen}
                onClose={handleDeleteCancel}
                onConfirm={handleDeleteConfirm}
                title="Delete Book"
                message="Are you sure you want to remove this book from the library catalog? This action cannot be undone."
                itemName={deleteModal.name}
                isDeleting={isDeleting}
            />
        </AuthenticatedLayout>
    );
}
