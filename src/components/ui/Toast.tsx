import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle, Info, X, AlertTriangle } from 'lucide-react';
import { clsx } from 'clsx';
import { useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
    id: string;
    message: string;
    type: ToastType;
    duration?: number;
    onClose: (id: string) => void;
}

const icons = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
};

const styles = {
    success: 'bg-white border-green-200 text-green-800 shadow-green-100',
    error: 'bg-white border-red-200 text-red-800 shadow-red-100',
    warning: 'bg-white border-yellow-200 text-yellow-800 shadow-yellow-100',
    info: 'bg-white border-blue-200 text-blue-800 shadow-blue-100',
};

const iconStyles = {
    success: 'text-green-500 bg-green-50',
    error: 'text-red-500 bg-red-50',
    warning: 'text-yellow-500 bg-yellow-50',
    info: 'text-blue-500 bg-blue-50',
};

export const Toast = ({ id, message, type, duration = 4000, onClose }: ToastProps) => {
    const Icon = icons[type];

    useEffect(() => {
        if (duration > 0) {
            const timer = setTimeout(() => {
                onClose(id);
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [id, duration, onClose]);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className={clsx(
                "pointer-events-auto w-full max-w-sm flex items-start gap-3 p-4 rounded-xl shadow-lg border backdrop-blur-sm transition-all",
                styles[type]
            )}
        >
            <div className={clsx("p-2 rounded-full shrink-0", iconStyles[type])}>
                <Icon size={20} />
            </div>

            <div className="flex-1 pt-1">
                <p className="text-sm font-semibold leading-relaxed">
                    {message}
                </p>
            </div>

            <button
                onClick={() => onClose(id)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-black/5 transition-colors"
                aria-label="Close"
            >
                <X size={16} />
            </button>
        </motion.div>
    );
};
