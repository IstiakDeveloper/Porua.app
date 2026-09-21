import { usePage } from '@inertiajs/react';
import { SharedData, Institute } from '@/types';

const defaultInstitute: Institute = {
    name: 'Porua',
    short_name: 'Porua',
    code: 'PORUA-01',
    email: 'info@porua.app',
    phone: '01700-000000',
    address: 'Dhaka, Bangladesh',
    website: 'https://porua.app',
    logo_url: '/logo.png',
    favicon_url: '/favicon.svg',
    established_year: '2026',
    currency_symbol: '৳',
    invoice_footer_text: 'Thank you for choosing Porua.',
    type: 'hybrid',
};

export function useInstitute(): Institute {
    try {
        const page = usePage<SharedData>();
        const institute = page.props?.institute;

        if (institute) {
            return institute;
        }

        if (page.props?.name) {
            return {
                ...defaultInstitute,
                name: page.props.name,
            };
        }
    } catch {
        // Fallback when called outside the Inertia component tree
        try {
            if (typeof document !== 'undefined') {
                const el = document.getElementById('app');
                if (el?.dataset?.page) {
                    const initialPage = JSON.parse(el.dataset.page);
                    if (initialPage?.props?.institute) {
                        return initialPage.props.institute;
                    }
                }
            }
        } catch {
            // Ignore parse errors
        }
    }

    return defaultInstitute;
}
