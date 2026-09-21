import React from 'react';
import { Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface IndexPaginationProps {
    links?: PaginationLink[];
    from?: number;
    to?: number;
    total?: number;
    lastPage?: number;
}

export default function IndexPagination({ links = [], from, to, total = 0, lastPage = 1 }: IndexPaginationProps) {
    if (total === 0) return null;

    // Clean up label text or render chevrons
    const renderLabel = (label: string) => {
        if (label.includes('Previous') || label.includes('laquo')) {
            return <ChevronLeft className="w-3.5 h-3.5" />;
        }
        if (label.includes('Next') || label.includes('raquo')) {
            return <ChevronRight className="w-3.5 h-3.5" />;
        }
        return <span dangerouslySetInnerHTML={{ __html: label }} />;
    };

    const prevLink = links.length > 0 ? links[0] : null;
    const nextLink = links.length > 1 ? links[links.length - 1] : null;
    const activeLink = links.find((l) => l.active);
    const currentPageStr = activeLink ? activeLink.label.replace(/[^0-9]/g, '') || '1' : '1';

    return (
        <div className="bg-slate-50/75 border-t border-slate-200/80 px-3.5 py-2 sm:px-4 sm:py-2.5 flex flex-col sm:flex-row items-center justify-between gap-2.5 rounded-b-xl select-none">
            <span className="text-[11px] sm:text-xs font-medium text-slate-500 text-center sm:text-left">
                {from != null && to != null ? (
                    <>
                        Showing <span className="font-semibold text-slate-800">{from}</span> to{' '}
                        <span className="font-semibold text-slate-800">{to}</span> of{' '}
                        <span className="font-semibold text-slate-800">{total}</span> records
                    </>
                ) : (
                    <>
                        Total <span className="font-semibold text-slate-800">{total}</span> records
                    </>
                )}
            </span>

            {lastPage > 1 && links.length > 0 ? (
                <>
                    {/* Mobile Compact Pagination (< 640px) */}
                    <div className="flex sm:hidden items-center justify-between w-full max-w-[260px] gap-2">
                        {prevLink && prevLink.url ? (
                            <Link
                                href={prevLink.url}
                                preserveState
                                preserveScroll
                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 text-xs font-semibold active:scale-95 transition"
                            >
                                <ChevronLeft className="w-3.5 h-3.5" />
                                <span>Prev</span>
                            </Link>
                        ) : (
                            <span className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-100 text-slate-400 text-xs font-semibold cursor-not-allowed">
                                <ChevronLeft className="w-3.5 h-3.5" />
                                <span>Prev</span>
                            </span>
                        )}

                        <span className="text-xs font-bold text-slate-800">
                            {currentPageStr} / {lastPage}
                        </span>

                        {nextLink && nextLink.url ? (
                            <Link
                                href={nextLink.url}
                                preserveState
                                preserveScroll
                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 text-xs font-semibold active:scale-95 transition"
                            >
                                <span>Next</span>
                                <ChevronRight className="w-3.5 h-3.5" />
                            </Link>
                        ) : (
                            <span className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-100 text-slate-400 text-xs font-semibold cursor-not-allowed">
                                <span>Next</span>
                                <ChevronRight className="w-3.5 h-3.5" />
                            </span>
                        )}
                    </div>

                    {/* Desktop Full Numbered Links (>= 640px) */}
                    <div className="hidden sm:flex items-center gap-1">
                        {links.map((link, i) => {
                            if (link.url) {
                                return (
                                    <Link
                                        key={i}
                                        href={link.url}
                                        preserveState
                                        preserveScroll
                                        className={`flex items-center justify-center min-w-[28px] h-7 px-2 text-xs font-semibold rounded-lg transition-colors ${
                                            link.active
                                                ? 'bg-slate-900 text-white shadow-xs'
                                                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                                        }`}
                                    >
                                        {renderLabel(link.label)}
                                    </Link>
                                );
                            } else {
                                return (
                                    <span
                                        key={i}
                                        className="flex items-center justify-center min-w-[28px] h-7 px-2 text-xs text-slate-300 border border-slate-100 bg-slate-50 rounded-lg cursor-not-allowed"
                                    >
                                        {renderLabel(link.label)}
                                    </span>
                                );
                            }
                        })}
                    </div>
                </>
            ) : (
                <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-medium text-slate-400">Page 1 of 1</span>
                </div>
            )}
        </div>
    );
}
