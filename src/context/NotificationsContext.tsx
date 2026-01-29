import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useToast } from './ToastContext';


export interface NotificationItem {
    id: string;
    type: string;
    title: string;
    body: string;
    url?: string;
    is_read: boolean;
    created_at: string;
}

interface NotificationsContextType {
    notifications: NotificationItem[];
    unreadCount: number;
    markAsRead: (id: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    fetchNotifications: () => Promise<void>;
    loading: boolean;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const { info, success, error } = useToast();


    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const { data, error: err } = await supabase
                .from('notifications')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(50);

            if (err) throw err;
            if (data) {
                setNotifications(data as NotificationItem[]);
                setUnreadCount(data.filter((n: any) => !n.is_read).length);
            }
        } catch (e) {
            console.error('Error fetching notifications:', e);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id: string) => {
        // Optimistic UI update
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));

        try {
            const { error: err } = await supabase
                .from('notifications')
                .update({ is_read: true })
                .eq('id', id);
            if (err) throw err;
        } catch (e) {
            console.error('Error marking as read:', e);
            // Revert on error could be implemented here
            error('Failed to mark as read');
        }
    };

    const markAllAsRead = async () => {
        const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
        if (unreadIds.length === 0) return;

        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        setUnreadCount(0);

        try {
            const { error: err } = await supabase
                .from('notifications')
                .update({ is_read: true })
                .in('id', unreadIds);

            if (err) throw err;
            success('All marked as read');
        } catch (e) {
            console.error('Error marking all as read:', e);
            error('Failed to mark all as read');
        }
    };

    useEffect(() => {
        fetchNotifications();

        // Subscribe to real-time changes
        const subscription = supabase
            .channel('public:notifications')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'notifications' },
                (payload) => {
                    const newNotif = payload.new as NotificationItem;
                    setNotifications(prev => [newNotif, ...prev]);
                    setUnreadCount(prev => prev + 1);

                    // Show Toast for new notification
                    info(`New ${newNotif.type}: ${newNotif.title}`);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(subscription);
        };
    }, []);

    return (
        <NotificationsContext.Provider value={{ notifications, unreadCount, markAsRead, markAllAsRead, fetchNotifications, loading }}>
            {children}
        </NotificationsContext.Provider>
    );
}

export function useNotifications() {
    const context = useContext(NotificationsContext);
    if (!context) {
        throw new Error('useNotifications must be used within a NotificationsProvider');
    }
    return context;
}
