import { forwardRef, type InputHTMLAttributes } from 'react';
import clsx from 'clsx';


interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: React.ReactNode;
    error?: string;
    icon?: React.ReactNode;
    containerClassName?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className, containerClassName, label, error, icon, ...props }, ref) => {
        return (
            <div className={clsx("w-full", containerClassName)}>
                {label && (
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        {label}
                    </label>
                )}
                <div className="relative">
                    {icon && (
                        <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none text-slate-400">
                            {icon}
                        </div>
                    )}
                    <input
                        ref={ref}
                        className={clsx(
                            "w-full py-2.5 rounded-xl border transition-all duration-200 outline-none bg-white",
                            icon ? "ps-10 pe-4" : "px-4",
                            error
                                ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 text-red-900 placeholder:text-red-300"
                                : "border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 text-slate-900 placeholder:text-gray-400 hover:border-gray-300",
                            className
                        )}
                        {...props}
                    />
                </div>
                {error && (
                    <p className="mt-1 text-sm text-red-500">{error}</p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';

export { Input };
