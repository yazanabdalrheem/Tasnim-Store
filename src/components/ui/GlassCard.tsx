import type { ReactNode } from 'react';
import clsx from 'clsx';

interface GlassCardProps {
    children: ReactNode;
    className?: string;
    hoverEffect?: boolean;
    onClick?: () => void;
}

export default function GlassCard({ children, className, hoverEffect = false, onClick }: GlassCardProps) {
    return (
        <div
            onClick={onClick}
            className={clsx(
                'glass rounded-2xl p-6 transition-all duration-300',
                hoverEffect && 'hover:scale-[1.02] hover:shadow-2xl cursor-pointer hover:border-primary/30',
                className
            )}
        >
            {children}
        </div>
    );
}
