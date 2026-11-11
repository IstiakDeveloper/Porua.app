import { formatTaka } from './format';

export default function Money({
    amount,
    tone = 'default',
}: {
    amount: number;
    tone?: 'default' | 'due' | 'paid' | 'overdue';
}) {
    const color = {
        default: 'text-slate-900',
        due: 'text-amber-700',
        paid: 'text-emerald-700',
        overdue: 'text-rose-700',
    }[tone];

    return <span className={`tabular-nums font-semibold ${color}`}>{formatTaka(amount)}</span>;
}
