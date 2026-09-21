import React, { useEffect, useState } from 'react';
import { usePage } from '@inertiajs/react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

interface FlashData {
    success?: string;
    error?: string;
    warning?: string;
    info?: string;
}

export default function FlashMessage() {
    const { flash } = usePage().props as { flash: FlashData };
    const [visible, setVisible] = useState(false);
    const [message, setMessage] = useState('');
    const [type, setType] = useState<'success' | 'error' | 'warning' | 'info'>('success');

    useEffect(() => {
        if (flash?.success) {
            setMessage(flash.success);
            setType('success');
            setVisible(true);
        } else if (flash?.error) {
            setMessage(flash.error);
            setType('error');
            setVisible(true);
        } else if (flash?.warning) {
            setMessage(flash.warning);
            setType('warning');
            setVisible(true);
        } else if (flash?.info) {
            setMessage(flash.info);
            setType('info');
            setVisible(true);
        }
    }, [flash]);

    useEffect(() => {
        if (visible) {
            const t = setTimeout(() => setVisible(false), 5000);
            return () => clearTimeout(t);
        }
    }, [visible]);

    if (!visible) return null;

    const config = {
        success: { bg: 'bg-emerald-50 border-emerald-300', text: 'text-emerald-800', icon: CheckCircle, iconCl: 'text-emerald-600' },
        error: { bg: 'bg-red-50 border-red-200', text: 'text-red-800', icon: XCircle, iconCl: 'text-red-600' },
        warning: { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-800', icon: AlertTriangle, iconCl: 'text-amber-600' },
        info: { bg: 'bg-sky-50 border-sky-200', text: 'text-sky-800', icon: Info, iconCl: 'text-sky-600' },
    };
    const { bg, text, icon: Icon, iconCl } = config[type];

    return (
        <div className="fixed top-16 right-4 z-50 max-w-sm">
            <div className={`${bg} border rounded-md shadow-sm flex items-start gap-2 p-3`}>
                <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${iconCl}`} />
                <p className={`text-xs font-medium ${text} flex-1`}>{message}</p>
                <button
                    type="button"
                    onClick={() => setVisible(false)}
                    className={`p-1 rounded hover:bg-black/5 ${text}`}
                    aria-label="Dismiss"
                >
                    <X className="w-3.5 h-3.5" />
                </button>
            </div>
        </div>
    );
}
