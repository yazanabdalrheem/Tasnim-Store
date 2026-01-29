import type { ReactNode } from 'react';
import clsx from 'clsx';

interface CardProps {
    children: ReactNode;
    className?: string;
    hoverEffect?: boolean;
    onClick?: () => void;
    id?: string;
}

export default function Card({ children, className, hoverEffect = false, onClick, id }: CardProps) {
    return (
        <div
            id={id}
            onClick={onClick}
            className={clsx(
                'bg-white rounded-[16px] border border-[var(--color-border)] shadow-sm transition-all duration-300',
                hoverEffect && 'hover:shadow-md hover:border-primary/20 hover:-translate-y-[2px] cursor-pointer',
                className
            )}
        >
            {children}
        </div>
    );
}
