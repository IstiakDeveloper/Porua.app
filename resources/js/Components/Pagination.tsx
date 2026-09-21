import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
    currentPage: number;
    lastPage: number;
    total: number;
    perPage: number;
    onPageChange: (page: number) => void;
}

export default function Pagination({
    currentPage,
    lastPage,
    total,
    perPage,
    onPageChange,
}: PaginationProps) {
    const from = (currentPage - 1) * perPage + 1;
    const to = Math.min(currentPage * perPage, total);

    const getPageNumbers = () => {
        const pages = [];
        const showPages = 5;
        let startPage = Math.max(1, currentPage - Math.floor(showPages / 2));
        let endPage = Math.min(lastPage, startPage + showPages - 1);

        if (endPage - startPage < showPages - 1) {
            startPage = Math.max(1, endPage - showPages + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }

        return pages;
    };

    if (lastPage <= 1) return null;

    return (
        <div className="bg-white/90 backdrop-blur-sm border-t border-emerald-50 px-3 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row items-center justify-between gap-3 rounded-b-xl">
            <div className="text-[11px] sm:text-xs font-medium text-emerald-800/80 text-center sm:text-left">
                Showing <span className="font-semibold text-emerald-950">{from}</span> to{' '}
                <span className="font-semibold text-emerald-950">{to}</span> of{' '}
                <span className="font-semibold text-emerald-950">{total}</span> results
            </div>

            {/* Mobile Compact Pagination (< 640px) */}
            <div className="flex sm:hidden items-center justify-between w-full max-w-[280px] gap-2">
                <button
                    type="button"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-emerald-200 bg-white text-emerald-800 text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition"
                >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Prev</span>
                </button>
                <span className="text-xs font-bold text-emerald-950">
                    {currentPage} / {lastPage}
                </span>
                <button
                    type="button"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === lastPage}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-emerald-200 bg-white text-emerald-800 text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition"
                >
                    <span>Next</span>
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>

            {/* Desktop Full Numbered Pagination (>= 640px) */}
            <div className="hidden sm:flex items-center gap-1.5">
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="flex items-center justify-center w-8 h-8 rounded-lg border border-emerald-100 bg-emerald-50/40 text-emerald-800 hover:bg-emerald-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 active:scale-95"
                >
                    <ChevronLeft className="w-4 h-4" />
                </button>

                {getPageNumbers().map((page) => (
                    <button
                        key={page}
                        onClick={() => onPageChange(page)}
                        className={`flex items-center justify-center min-w-[32px] h-8 px-2 text-xs font-semibold rounded-lg transition-all duration-200 active:scale-95 ${
                            page === currentPage
                                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/20 hover:bg-emerald-700'
                                : 'bg-emerald-50/40 text-emerald-800 border border-emerald-100 hover:bg-emerald-50 hover:border-emerald-200 hover:-translate-y-0.5'
                        }`}
                    >
                        {page}
                    </button>
                ))}

                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === lastPage}
                    className="flex items-center justify-center w-8 h-8 rounded-lg border border-emerald-100 bg-emerald-50/40 text-emerald-800 hover:bg-emerald-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 active:scale-95"
                >
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}

