import React, { ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
    show: boolean;
    onClose: () => void;
    title?: string;
    children: ReactNode;
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export default function Modal({
    show,
    onClose,
    title,
    children,
    maxWidth = 'lg',
}: ModalProps) {
    useEffect(() => {
        if (show) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [show]);

    const maxWidths = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
        '2xl': 'max-w-2xl',
    };

    if (!show) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
                onClick={onClose}
                aria-hidden="true"
            />
            <div
                className={`relative bg-white max-sm:rounded-b-none max-sm:rounded-t-2xl sm:rounded-2xl shadow-2xl w-full ${maxWidths[maxWidth]} max-h-[92vh] sm:max-h-[88vh] flex flex-col overflow-hidden animate-fade-in z-10`}
            >
                {title && (
                    <div className="flex items-center justify-between px-4 py-3.5 sm:px-6 sm:py-4 border-b border-gray-100 bg-slate-50/60 shrink-0">
                        <div className="flex items-center gap-2">
                            {/* Mobile drag pill indicator */}
                            <div className="w-8 h-1 bg-slate-300 rounded-full mx-auto sm:hidden absolute top-2 left-1/2 -translate-x-1/2" />
                            <h3 className="text-base sm:text-lg font-bold text-gray-900 leading-tight">{title}</h3>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                            aria-label="Close modal"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                )}
                <div className="px-4 py-4 sm:px-6 sm:py-5 overflow-y-auto flex-1 overscroll-contain">
                    {children}
                </div>
            </div>
        </div>
    );
}
