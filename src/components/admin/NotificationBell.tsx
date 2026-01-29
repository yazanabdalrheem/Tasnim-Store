import { useState, useRef, useEffect } from 'react';
import { Bell, Check, ExternalLink } from 'lucide-react';
import { useNotifications } from '../../context/NotificationsContext';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

export default function NotificationBell() {
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleNotificationClick = (n: any) => {
        if (!n.is_read) markAsRead(n.id);
        setIsOpen(false);
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'order': return 'text-blue-600 bg-blue-50';
            case 'booking': return 'text-purple-600 bg-purple-50';
            case 'question': return 'text-orange-600 bg-orange-50';
            case 'status_change': return 'text-green-600 bg-green-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            >
                <Bell size={22} />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-2 w-80 md:w-96 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 origin-top-right"
                    >
                        <div className="p-4 border-b flex items-center justify-between bg-gray-50/50">
                            <h3 className="font-semibold text-gray-900">Notifications</h3>
                            {unreadCount > 0 && (
                                <button
                                    onClick={() => markAllAsRead()}
                                    className="text-xs text-primary hover:text-primary-dark font-medium flex items-center gap-1"
                                >
                                    <Check size={12} /> Mark all read
                                </button>
                            )}
                        </div>

                        <div className="max-h-[70vh] overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="p-8 text-center text-gray-500 text-sm">
                                    <Bell size={24} className="mx-auto mb-2 opacity-20" />
                                    No notifications yet
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-50">
                                    {notifications.slice(0, 5).map((n) => (
                                        <div
                                            key={n.id}
                                            className={clsx(
                                                "p-4 hover:bg-gray-50 transition-colors block relative group",
                                                !n.is_read ? "bg-blue-50/30" : ""
                                            )}
                                        >
                                            <div className="flex gap-3">
                                                <div className={clsx("h-8 w-8 rounded-full flex items-center justify-center shrink-0 mt-1", getTypeColor(n.type))}>
                                                    {/* Simple logic for icon can be added here if needed */}
                                                    <div className="w-2 h-2 rounded-full bg-current" />
                                                </div>
                                                <div className="flex-1 min-w-0 space-y-1">
                                                    <div className="flex justify-between items-start">
                                                        <p className={clsx("text-sm font-medium truncate", !n.is_read ? "text-gray-900" : "text-gray-600")}>
                                                            {n.title}
                                                        </p>
                                                        <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2">
                                                            {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-gray-500 line-clamp-2">{n.body}</p>

                                                    {n.url && (
                                                        <Link
                                                            to={n.url}
                                                            onClick={() => handleNotificationClick(n)}
                                                            className="text-xs text-primary hover:underline mt-2 inline-flex items-center gap-1"
                                                        >
                                                            View Details <ExternalLink size={10} />
                                                        </Link>
                                                    )}
                                                </div>
                                            </div>
                                            {!n.is_read && (
                                                <button
                                                    onClick={() => markAsRead(n.id)}
                                                    className="absolute top-1/2 right-2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1 hover:bg-blue-100 rounded text-blue-600 transition-all"
                                                    title="Mark as read"
                                                >
                                                    <Check size={14} />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="p-3 border-t bg-gray-50 text-center">
                            <Link
                                to="/admin/notifications"
                                onClick={() => setIsOpen(false)}
                                className="text-sm font-medium text-gray-600 hover:text-primary transition-colors"
                            >
                                View All Notifications
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
