import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import Button from './Button';

interface DeleteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    itemName?: string;
    isDeleting?: boolean;
}

export default function DeleteModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    itemName,
    isDeleting = false,
}: DeleteModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            {/* Background overlay */}
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Modal panel */}
            <div className="relative bg-white max-sm:rounded-b-none max-sm:rounded-t-2xl sm:rounded-2xl shadow-2xl max-w-lg w-full animate-fade-in z-10 overflow-hidden">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <div className="sm:flex sm:items-start">
                        <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                            <AlertTriangle className="h-6 w-6 text-red-600" />
                        </div>
                        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left flex-1">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg leading-6 font-medium text-gray-900">
                                    {title}
                                </h3>
                                <button
                                    onClick={onClose}
                                    disabled={isDeleting}
                                    className="text-gray-400 hover:text-gray-500 transition-colors disabled:opacity-50"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                            <div className="mt-2">
                                <p className="text-sm text-gray-500">
                                    {message}
                                </p>
                                {itemName && (
                                    <p className="mt-2 text-sm font-semibold text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                                        {itemName}
                                    </p>
                                )}
                                <p className="mt-3 text-sm text-red-600 font-medium">
                                    This action cannot be undone.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-3">
                    <Button
                        variant="danger"
                        onClick={onConfirm}
                        disabled={isDeleting}
                        className="w-full sm:w-auto"
                    >
                        {isDeleting ? 'Deleting...' : 'Delete'}
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        disabled={isDeleting}
                        className="w-full sm:w-auto mt-3 sm:mt-0"
                    >
                        Cancel
                    </Button>
                </div>
            </div>
        </div>
    );
}
