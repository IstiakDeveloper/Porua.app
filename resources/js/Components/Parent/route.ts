type RouteParams = number | string | Record<string, string | number | null | undefined>;

export function route(name: string, params?: RouteParams): string {
    const id = params !== undefined && typeof params !== 'object' ? params : undefined;
    const query = params !== undefined && typeof params === 'object' ? params : undefined;

    const paths: Record<string, string> = {
        'parent.dashboard': '/parent/dashboard',
        'parent.children.index': '/parent/children',
        'parent.children.show': `/parent/children/${id ?? ''}`,
        'parent.attendance.index': '/parent/attendance',
        'parent.exams.index': '/parent/exams',
        'parent.exams.result': `/parent/exams/result/${id ?? ''}`,
        'parent.exams.result.print': `/parent/exams/result/${id ?? ''}/print`,
        'parent.fees.index': '/parent/fees',
        'parent.fees.show': `/parent/fees/${id ?? ''}`,
        'parent.fees.receipt': `/parent/fees/${id ?? ''}/receipt`,
        'parent.calendar.index': '/parent/calendar',
        'parent.notices.index': '/parent/notices',
        'parent.notices.show': `/parent/notices/${id ?? ''}`,
        'parent.messages.index': '/parent/messages',
        'parent.messages.show': `/parent/messages/${id ?? ''}`,
        'parent.messages.send': '/parent/messages/send',
        'parent.profile.update': '/parent/profile',
        'parent.profile.photo': '/parent/profile/photo',
        'parent.profile.password': '/parent/profile/password',
    };

    let url = paths[name] ?? '/parent/dashboard';

    if (query) {
        const search = new URLSearchParams();
        Object.entries(query).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                search.set(key, String(value));
            }
        });
        const qs = search.toString();
        if (qs) {
            url += `?${qs}`;
        }
    }

    return url;
}
