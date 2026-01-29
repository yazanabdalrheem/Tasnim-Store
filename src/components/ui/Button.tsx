import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';
import clsx from 'clsx';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    isLoading?: boolean;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, children, isLoading, variant = 'primary', size = 'md', disabled, ...props }, ref) => {

        const variants = {
            primary: "bg-primary text-white hover:bg-primary-dark shadow-sm hover:shadow-primary/30 border border-transparent",
            secondary: "bg-gray-900 text-white hover:bg-gray-800 shadow-sm border border-transparent",
            outline: "border border-[var(--color-border)] text-[var(--color-text-main)] hover:border-primary hover:text-primary bg-white hover:bg-primary/5",
            ghost: "bg-transparent text-[var(--color-text-muted)] hover:bg-gray-50 hover:text-[var(--color-text-main)]",
            danger: "bg-red-50 text-red-600 hover:bg-red-100 border border-red-100",
        };

        const sizes = {
            sm: "px-4 py-2 text-xs font-medium rounded-[10px]",
            md: "px-6 py-2.5 text-sm font-medium rounded-[12px]",
            lg: "px-8 py-3.5 text-base font-semibold rounded-[14px]",
        };

        return (
            <button
                ref={ref}
                className={clsx(
                    "inline-flex items-center justify-center transition-all duration-300 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed",
                    variants[variant],
                    sizes[size],
                    className
                )}
                disabled={isLoading || disabled}
                {...props}
            >
                {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {children}
            </button>
        );
    }
);

Button.displayName = "Button";

export { Button };
