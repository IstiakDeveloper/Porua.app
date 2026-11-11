interface PersonAvatarProps {
    name: string;
    src?: string | null;
    size?: 'sm' | 'md' | 'lg';
}

function initials(name: string): string {
    const letters = name
        .split(' ')
        .map((part) => part.trim())
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? '');
    return letters.join('') || '?';
}

const sizes = {
    sm: 'h-10 w-10 text-xs',
    md: 'h-14 w-14 text-sm',
    lg: 'h-20 w-20 text-lg',
};

export default function PersonAvatar({ name, src, size = 'md' }: PersonAvatarProps) {
    if (src) {
        return (
            <img
                src={src}
                alt={name}
                className={`${sizes[size]} rounded-full object-cover border-2 border-white shadow-sm shrink-0`}
            />
        );
    }

    return (
        <span
            className={`${sizes[size]} rounded-full bg-emerald-100 text-emerald-800 font-semibold inline-flex items-center justify-center shrink-0`}
            aria-hidden
        >
            {initials(name)}
        </span>
    );
}
