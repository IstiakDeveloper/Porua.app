import { ReactNode } from 'react';

export interface RecordColumn<T> {
    key: string;
    label: string;
    render: (row: T) => ReactNode;
}

export default function RecordCards<T extends { id?: number | string }>({
    rows,
    columns,
    empty,
}: {
    rows: T[];
    columns: RecordColumn<T>[];
    empty: string;
}) {
    if (rows.length === 0) {
        return <p className="py-8 text-center text-sm text-slate-500">{empty}</p>;
    }

    return (
        <>
            <div className="space-y-3 md:hidden">
                {rows.map((row, index) => (
                    <div key={row.id ?? index} className="rounded-2xl border border-slate-200/80 bg-white p-4">
                        <dl className="space-y-2">
                            {columns.map((column) => (
                                <div key={column.key} className="flex items-start justify-between gap-3 text-sm">
                                    <dt className="text-slate-500">{column.label}</dt>
                                    <dd className="text-right font-medium text-slate-900">{column.render(row)}</dd>
                                </div>
                            ))}
                        </dl>
                    </div>
                ))}
            </div>
            <div className="hidden overflow-hidden rounded-2xl border border-slate-200/80 bg-white md:block">
                <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                        <tr>
                            {columns.map((column) => (
                                <th key={column.key} className="px-4 py-3 font-semibold">
                                    {column.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row, index) => (
                            <tr key={row.id ?? index} className="border-t border-slate-100">
                                {columns.map((column) => (
                                    <td key={column.key} className="px-4 py-3 text-slate-800">
                                        {column.render(row)}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
}
