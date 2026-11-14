import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/Button';

interface Recheck {
    id: number;
    reason: string;
    status: string;
    review_note: string | null;
    created_at: string;
    exam?: { name: string };
    student?: { full_name?: string; user?: { name: string } };
    subject?: { name: string } | null;
    requester?: { name: string } | null;
}

interface Props {
    rechecks: { data: Recheck[] };
    filters: { status?: string };
}

export default function Index({ rechecks, filters }: Props) {
    const [notes, setNotes] = useState<Record<number, string>>({});
    const rows = rechecks.data ?? [];

    const review = (id: number, status: 'approved' | 'rejected') => {
        router.post(`/mark-rechecks/${id}/review`, {
            status,
            review_note: notes[id] || '',
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Mark rechecks" />
            <div className="mx-auto max-w-5xl space-y-4 pb-10">
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Mark rechecks</h1>
                        <p className="text-sm text-slate-500">Approve a request to unlock that subject, then generate the result again.</p>
                    </div>
                    <select
                        value={filters.status || ''}
                        onChange={(event) => router.get('/mark-rechecks', { status: event.target.value }, { preserveState: true })}
                        className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    >
                        <option value="">All</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                    </select>
                </div>

                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                    {rows.length === 0 ? (
                        <p className="p-6 text-sm text-slate-500">No recheck requests.</p>
                    ) : (
                        <ul className="divide-y divide-slate-100">
                            {rows.map((row) => (
                                <li key={row.id} className="space-y-2 p-4">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <p className="text-sm font-semibold text-slate-900">
                                            {row.student?.full_name || row.student?.user?.name || 'Student'} · {row.subject?.name || 'Subject'}
                                        </p>
                                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold uppercase text-slate-600">
                                            {row.status}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500">{row.exam?.name} · asked by {row.requester?.name || 'user'}</p>
                                    <p className="text-sm text-slate-700">{row.reason}</p>
                                    {row.status === 'pending' && (
                                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                                            <input
                                                value={notes[row.id] || ''}
                                                onChange={(event) => setNotes({ ...notes, [row.id]: event.target.value })}
                                                placeholder="Note for the family"
                                                className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
                                            />
                                            <Button type="button" onClick={() => review(row.id, 'approved')}>
                                                Approve
                                            </Button>
                                            <Button type="button" variant="outline" onClick={() => review(row.id, 'rejected')}>
                                                Reject
                                            </Button>
                                        </div>
                                    )}
                                    {row.review_note && <p className="text-xs text-slate-500">Note: {row.review_note}</p>}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
