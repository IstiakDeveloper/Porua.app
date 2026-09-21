import React, { ReactNode } from 'react';

interface Column {
    key: string;
    label: string | ReactNode;
    sortable?: boolean;
    render?: (value: any, row: any) => ReactNode;
}

interface TableProps {
    columns: Column[];
    data: any[];
    onSort?: (key: string) => void;
    sortKey?: string;
    sortDirection?: 'asc' | 'desc';
    loading?: boolean;
}

export default function Table({
    columns,
    data,
    onSort,
    sortKey,
    sortDirection,
    loading = false,
}: TableProps) {
    return (
        <div className="relative border border-gray-200/90 rounded-xl overflow-hidden shadow-xs bg-white">
            <div className="overflow-x-auto -webkit-overflow-scrolling-touch">
                <table className="w-full min-w-full text-left">
                    <thead className="bg-gray-50/90 border-b border-gray-200">
                        <tr>
                            {columns.map((column) => (
                                <th
                                    key={column.key}
                                    className={`px-3.5 py-3 sm:px-6 sm:py-3.5 text-left text-[11px] sm:text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap ${
                                        column.sortable ? 'cursor-pointer hover:bg-gray-100 transition-colors' : ''
                                    }`}
                                    onClick={() => column.sortable && onSort?.(column.key)}
                                >
                                    <div className="flex items-center gap-1.5 sm:gap-2">
                                        <span>{column.label}</span>
                                        {column.sortable && sortKey === column.key && (
                                            <span className="text-emerald-600 font-bold">
                                                {sortDirection === 'asc' ? '↑' : '↓'}
                                            </span>
                                        )}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                        {loading ? (
                            <tr>
                                <td colSpan={columns.length} className="px-4 py-12 text-center">
                                    <div className="flex justify-center">
                                        <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                                    </div>
                                </td>
                            </tr>
                        ) : data.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length} className="px-4 py-12 text-center text-xs sm:text-sm text-gray-500">
                                    No data found
                                </td>
                            </tr>
                        ) : (
                            data.map((row, rowIndex) => (
                                <tr key={rowIndex} className="hover:bg-slate-50/70 transition-colors">
                                    {columns.map((column) => (
                                        <td key={column.key} className="px-3.5 py-2.5 sm:px-6 sm:py-3.5 text-xs sm:text-sm text-gray-900 align-middle">
                                            {column.render
                                                ? column.render(row[column.key], row)
                                                : row[column.key]}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

