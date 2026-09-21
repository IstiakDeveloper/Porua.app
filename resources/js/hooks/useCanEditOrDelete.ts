import { usePage } from '@inertiajs/react';
import type { SharedData } from '@/types';

/**
 * Super Admin may edit/delete; school Admin and other roles use backend restrictions as applicable.
 */
export function useCanEditOrDelete(): boolean {
    const { auth } = usePage<SharedData>().props;

    return auth.can_edit_or_delete === true;
}
