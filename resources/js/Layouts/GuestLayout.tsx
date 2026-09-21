import React, { ReactNode } from 'react';
import { useInstitute } from '@/hooks/useInstitute';

interface GuestLayoutProps {
    children: ReactNode;
}

export default function GuestLayout({ children }: GuestLayoutProps) {
    const institute = useInstitute();

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center px-3 py-6 sm:p-6">
            <div className="w-full max-w-md">
                <div className="text-center mb-6 sm:mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-white p-2 rounded-2xl shadow-md mb-3 sm:mb-4 border border-slate-100">
                        <img 
                            src={institute.logo_url || '/logo.png'} 
                            alt={institute.name} 
                            className="w-full h-full object-contain" 
                        />
                    </div>
                    <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{institute.name}</h1>
                    <p className="text-slate-500 mt-1 text-xs sm:text-sm">
                        {institute.type === 'coaching' ? 'Coaching Management System' : (institute.type === 'hybrid' ? 'Education Management ERP' : 'School Management System')}
                    </p>
                </div>
                <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl shadow-slate-200/50 p-5 sm:p-8 border border-slate-100">
                    {children}
                </div>
            </div>
        </div>
    );
}
