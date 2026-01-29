import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Table } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { RefreshCw, Clock, CheckCircle, XCircle, Bell, Database } from 'lucide-react';
import { format } from 'date-fns';
import { useNotifications, type NotificationItem } from '../../context/NotificationsContext';
import { clsx } from 'clsx';
import { Link } from 'react-router-dom';

interface QueueItem {
    id: string;
    type: string;
    recipient_user_id: string | null;
    status: 'pending' | 'processing' | 'sent' | 'failed';
    attempts: number;
    last_error: string;
    next_retry_at: string;
    created_at: string;
    payload: any;
}

export default function Notifications() {
    // Tab state
    const [activeTab, setActiveTab] = useState<'internal' | 'queue'>('internal');

    // Filter state
    const [showUnreadOnly, setShowUnreadOnly] = useState(false);

    // Context for Internal Notifications
    const { notifications, fetchNotifications, loading: notifLoading, markAsRead } = useNotifications();

    const filteredNotifications = notifications.filter(n => !showUnreadOnly || !n.is_read);

    // Local State for Queue
    const [queue, setQueue] = useState<QueueItem[]>([]);
    const [queueLoading, setQueueLoading] = useState(false);

    const fetchQueue = async () => {
        setQueueLoading(true);
        const { data, error } = await supabase
            .from('notification_queue')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(50);

        if (error) console.error(error);
        if (data) setQueue(data as QueueItem[]);
        setQueueLoading(false);
    };

    useEffect(() => {
        if (activeTab === 'queue') {
            fetchQueue();
            const interval = setInterval(fetchQueue, 10000);
            return () => clearInterval(interval);
        }
    }, [activeTab]);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'sent':
                return <span className="text-green-600 bg-green-50 px-2 py-1 rounded text-xs font-bold flex items-center gap-1"><CheckCircle size={12} /> Sent</span>;
            case 'failed':
                return <span className="text-red-600 bg-red-50 px-2 py-1 rounded text-xs font-bold flex items-center gap-1"><XCircle size={12} /> Failed</span>;
            case 'processing':
                return <span className="text-blue-600 bg-blue-50 px-2 py-1 rounded text-xs font-bold flex items-center gap-1"><RefreshCw size={12} className="animate-spin" /> Processing</span>;
            default:
                return <span className="text-yellow-600 bg-yellow-50 px-2 py-1 rounded text-xs font-bold flex items-center gap-1"><Clock size={12} /> Pending</span>;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Notifications Center</h1>
                    <p className="text-sm text-gray-500">Manage internal alerts and push notification queue.</p>
                </div>

                <div className="flex bg-gray-100 p-1 rounded-lg self-start md:self-auto">
                    <button
                        onClick={() => setActiveTab('internal')}
                        className={clsx(
                            "px-4 py-2 text-sm font-medium rounded-md transition-all flex items-center gap-2",
                            activeTab === 'internal' ? "bg-white text-primary shadow-sm" : "text-gray-500 hover:text-gray-900"
                        )}
                    >
                        <Bell size={16} /> Internal
                    </button>
                    <button
                        onClick={() => setActiveTab('queue')}
                        className={clsx(
                            "px-4 py-2 text-sm font-medium rounded-md transition-all flex items-center gap-2",
                            activeTab === 'queue' ? "bg-white text-primary shadow-sm" : "text-gray-500 hover:text-gray-900"
                        )}
                    >
                        <Database size={16} /> Push Queue
                    </button>
                </div>
            </div>

            {activeTab === 'internal' ? (
                /* Internal Notifications Table */
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none">
                            <input
                                type="checkbox"
                                checked={showUnreadOnly}
                                onChange={(e) => setShowUnreadOnly(e.target.checked)}
                                className="rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            Show only unread
                        </label>
                        <Button onClick={() => fetchNotifications()} variant="secondary" size="sm">
                            <RefreshCw size={16} className="mr-2" /> Refresh
                        </Button>
                    </div>
                    <Table
                        isLoading={notifLoading}
                        data={filteredNotifications}
                        columns={[
                            {
                                header: 'Status',
                                accessor: (n: NotificationItem) => (
                                    <div className="flex justify-center">
                                        {n.is_read ? (
                                            <span className="w-2 h-2 rounded-full bg-gray-300" title="Read" />
                                        ) : (
                                            <span className="w-2 h-2 rounded-full bg-blue-500 ring-2 ring-blue-100" title="Unread" />
                                        )}
                                    </div>
                                )
                            },
                            {
                                header: 'Type',
                                accessor: (n: NotificationItem) => (
                                    <span className={clsx(
                                        "capitalize px-2 py-1 rounded text-xs font-bold",
                                        n.type === 'order' ? "bg-blue-50 text-blue-700" :
                                            n.type === 'booking' ? "bg-purple-50 text-purple-700" :
                                                n.type === 'question' ? "bg-orange-50 text-orange-700" :
                                                    "bg-gray-100 text-gray-700"
                                    )}>
                                        {n.type.replace('_', ' ')}
                                    </span>
                                )
                            },
                            { header: 'Title', accessor: (n: NotificationItem) => <span className="font-medium text-gray-900">{n.title}</span> },
                            { header: 'Message', accessor: 'body' },
                            { header: 'Time', accessor: (n: NotificationItem) => format(new Date(n.created_at), 'dd/MM HH:mm') },
                            {
                                header: 'Actions',
                                accessor: (n: NotificationItem) => (
                                    <div className="flex items-center gap-2">
                                        {n.url && (
                                            <Link
                                                to={n.url}
                                                onClick={() => !n.is_read && markAsRead(n.id)}
                                                className="text-xs bg-primary/10 text-primary px-2 py-1 rounded hover:bg-primary/20"
                                            >
                                                Open
                                            </Link>
                                        )}
                                        {!n.is_read && (
                                            <button
                                                onClick={() => markAsRead(n.id)}
                                                className="text-xs text-gray-500 hover:text-gray-900 underline"
                                            >
                                                Mark Read
                                            </button>
                                        )}
                                    </div>
                                )
                            },
                        ]}
                    />
                </div>
            ) : (
                /* Push Queue Table */
                <div className="space-y-4">
                    <div className="flex justify-end">
                        <Button onClick={fetchQueue} variant="secondary" size="sm">
                            <RefreshCw size={16} className="mr-2" /> Refresh
                        </Button>
                    </div>

                    <Table
                        isLoading={queueLoading}
                        data={queue}
                        columns={[
                            { header: 'Type', accessor: 'type' },
                            { header: 'Recipient', accessor: (q) => q.recipient_user_id ? 'Specific User' : 'All Admins' },
                            { header: 'Status', accessor: (q) => getStatusBadge(q.status) },
                            { header: 'Attempts', accessor: 'attempts' },
                            { header: 'Next Retry', accessor: (q) => q.status === 'pending' ? format(new Date(q.next_retry_at), 'HH:mm:ss') : '-' },
                            { header: 'Created', accessor: (q) => format(new Date(q.created_at), 'dd/MM HH:mm') },
                            {
                                header: 'Error',
                                accessor: (q) => <span className="text-xs text-red-500 max-w-[200px] truncate block" title={q.last_error}>{q.last_error || '-'}</span>
                            },
                        ]}
                    />
                </div>
            )}
        </div>
    );
}
