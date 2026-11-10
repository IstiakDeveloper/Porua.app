import React, { ReactNode, useState, useEffect } from 'react';
import Sidebar from '@/Components/Sidebar';
import Navbar from '@/Components/Navbar';
import MobileBottomNav from '@/Components/MobileBottomNav';
import FlashMessage from '@/Components/FlashMessage';
import { usePage, router } from '@inertiajs/react';

interface AuthenticatedLayoutProps {
    children: ReactNode;
    header?: ReactNode;
}

export default function AuthenticatedLayout({ children, header }: AuthenticatedLayoutProps) {
    const { url, component } = usePage();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    
    // Automatically close mobile menu drawer on route change
    useEffect(() => {
        const unregister = router.on('navigate', () => {
            setMobileMenuOpen(false);
        });
        return () => unregister();
    }, []);

    // Check if the current page is an attendance page or report page
    const isAttendancePage = url.includes('attendance') || /attendance/i.test(component);
    const isReportPage = url.includes('/reports') || /report/i.test(component);

    let layoutClass = 'index-premium-layout';
    if (isAttendancePage) {
        layoutClass = 'attendance-module-layout';
    } else if (isReportPage) {
        layoutClass = 'report-page-layout';
    }

    return (
        <div className={`min-h-screen ${isAttendancePage ? 'bg-slate-50/80 text-slate-900' : 'bg-emerald-50/40'}`}>
            <FlashMessage />
            <Sidebar
                mobileOpen={mobileMenuOpen}
                onCloseMobile={() => setMobileMenuOpen(false)}
            />
            <div className="md:ml-56 ml-0 transition-all duration-200 min-w-0">
                <Navbar
                    onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
                    isMobileMenuOpen={mobileMenuOpen}
                />
                <main className={`pt-[max(3.5rem,env(safe-area-inset-top))] pb-[max(6rem,calc(env(safe-area-inset-bottom)+5rem))] md:pb-6 px-3 sm:px-6 ${layoutClass}`}>
                    <div className="max-w-[1600px] mx-auto">
                        {children}
                    </div>
                </main>
            </div>
            {/* Mobile Native App-like Bottom Dock */}
            <MobileBottomNav
                onOpenMenu={() => setMobileMenuOpen(true)}
                isMobileMenuOpen={mobileMenuOpen}
            />
        </div>
    );
}

