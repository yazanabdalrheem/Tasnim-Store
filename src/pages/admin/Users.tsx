import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';
import { Table } from '../../components/ui/Table';
import { Search, UserCog, Lock, Unlock, X } from 'lucide-react';
import { AdminBadge } from '../../components/admin/AdminBadge';
import { useToast } from '../../context/ToastContext';

interface UserProfile {
    id: string;
    email: string;
    full_name?: string;
    phone?: string;
    role: 'customer' | 'admin' | 'super_admin';
    is_blocked: boolean;
    created_at: string;
    last_sign_in_at?: string;
}

export default function Users() {
    const { t, i18n } = useTranslation();
    const { addToast } = useToast();
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isChangeRoleModalOpen, setIsChangeRoleModalOpen] = useState(false);
    const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
    const [newRole, setNewRole] = useState<string>('');
    const [blockReason, setBlockReason] = useState('');

    const isRTL = i18n.language === 'he' || i18n.language === 'ar';

    useEffect(() => {
        fetchUsers();
    }, []);

    async function fetchUsers() {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setUsers(data as UserProfile[]);
        } catch (error) {
            console.error('Error fetching users:', error);
            addToast(t('admin.users.fetchError', 'Error fetching users'), 'error');
        } finally {
            setLoading(false);
        }
    }

    const handleOpenChangeRoleModal = (user: UserProfile) => {
        setSelectedUser(user);
        setNewRole(user.role);
        setIsChangeRoleModalOpen(true);
    };

    const handleChangeRole = async () => {
        if (!selectedUser) return;

        try {
            const { error } = await supabase
                .from('profiles')
                .update({ role: newRole })
                .eq('id', selectedUser.id);

            if (error) throw error;

            addToast(t('admin.users.roleChangeSuccess', 'Role changed successfully'), 'success');
            setIsChangeRoleModalOpen(false);
            fetchUsers();
        } catch (error: any) {
            console.error('Error changing role:', error);
            addToast(error.message || t('admin.users.roleChangeError', 'Error changing role'), 'error');
        }
    };

    const handleOpenBlockModal = (user: UserProfile) => {
        setSelectedUser(user);
        setBlockReason('');
        setIsBlockModalOpen(true);
    };

    const handleToggleBlock = async () => {
        if (!selectedUser) return;

        try {
            const { error } = await supabase
                .from('profiles')
                .update({ is_blocked: !selectedUser.is_blocked })
                .eq('id', selectedUser.id);

            if (error) throw error;

            const action = selectedUser.is_blocked ? 'unblocked' : 'blocked';
            addToast(t(`admin.users.${action}Success`, `User ${action} successfully`), 'success');
            setIsBlockModalOpen(false);
            fetchUsers();
        } catch (error: any) {
            console.error('Error toggling block:', error);
            addToast(error.message || t('admin.users.blockError', 'Error updating user status'), 'error');
        }
    };

    const filteredUsers = users.filter(user => {
        const query = searchQuery.toLowerCase();
        return (
            user.email?.toLowerCase().includes(query) ||
            user.full_name?.toLowerCase().includes(query) ||
            user.phone?.includes(query)
        );
    });

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'super_admin':
                return <AdminBadge variant="info">{t('admin.users.roles.super_admin', 'Super Admin')}</AdminBadge>;
            case 'admin':
                return <AdminBadge variant="info">{t('admin.users.roles.admin', 'Admin')}</AdminBadge>;
            default:
                return <AdminBadge variant="neutral">{t('admin.users.roles.customer', 'Customer')}</AdminBadge>;
        }
    };

    const getRelativeTime = (timestamp?: string) => {
        if (!timestamp) return '-';
        const now = new Date();
        const time = new Date(timestamp);
        const diffMs = now.getTime() - time.getTime();
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffDays === 0) return t('admin.users.today', 'Today');
        if (diffDays === 1) return t('admin.users.yesterday', 'Yesterday');
        if (diffDays < 7) return `${diffDays}${isRTL ? ' ימים' : 'd ago'}`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)}${isRTL ? ' שבועות' : 'w ago'}`;
        return `${Math.floor(diffDays / 30)}${isRTL ? ' חודשים' : 'mo ago'}`;
    };

    return (
        <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">{t('admin.users.title', 'Users Management')}</h1>
                <p className="text-sm text-gray-500 mt-1">{t('admin.users.description', 'View and manage user accounts and permissions')}</p>
            </div>

            {/* Search Bar */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100">
                <div className="relative">
                    <Search className={`absolute top-1/2 -translate-y-1/2 text-gray-400 ${isRTL ? 'right-3' : 'left-3'}`} size={18} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={t('admin.users.searchPlaceholder', 'Search by name, email, or phone...')}
                        className={`w-full h-11 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all ${isRTL ? 'pr-11 pl-4' : 'pl-11 pr-4'}`}
                    />
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <Table
                    isLoading={loading}
                    data={filteredUsers}
                    columns={[
                        {
                            header: t('admin.users.table.email', 'Email'),
                            accessor: 'email',
                            className: 'font-medium'
                        },
                        {
                            header: t('admin.users.table.name', 'Name'),
                            accessor: (u) => u.full_name || '-',
                        },
                        {
                            header: t('admin.users.table.phone', 'Phone'),
                            accessor: (u) => u.phone || '-',
                        },
                        {
                            header: t('admin.users.table.role', 'Role'),
                            accessor: (u) => getRoleBadge(u.role),
                        },
                        {
                            header: t('admin.users.table.joined', 'Joined'),
                            accessor: (u) => getRelativeTime(u.created_at),
                        },
                        {
                            header: t('admin.users.table.status', 'Status'),
                            accessor: (u) => u.is_blocked ? (
                                <AdminBadge variant="danger">{t('admin.users.status.blocked', 'Blocked')}</AdminBadge>
                            ) : (
                                <AdminBadge variant="success">{t('admin.users.status.active', 'Active')}</AdminBadge>
                            ),
                        },
                        {
                            header: t('admin.users.table.actions', 'Actions'),
                            accessor: (u) => (
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleOpenChangeRoleModal(u)}
                                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        title={t('admin.users.actions.changeRole', 'Change Role')}
                                    >
                                        <UserCog size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleOpenBlockModal(u)}
                                        className={`p-1.5 rounded-lg transition-colors ${u.is_blocked ? 'text-green-600 hover:bg-green-50' : 'text-red-600 hover:bg-red-50'}`}
                                        title={u.is_blocked ? t('admin.users.actions.unblock', 'Unblock') : t('admin.users.actions.block', 'Block')}
                                    >
                                        {u.is_blocked ? <Unlock size={16} /> : <Lock size={16} />}
                                    </button>
                                </div>
                            ),
                        },
                    ]}
                />
            </div>

            {/* Change Role Modal */}
            {isChangeRoleModalOpen && selectedUser && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="font-bold text-lg">{t('admin.users.modals.changeRole.title', 'Change User Role')}</h3>
                            <button onClick={() => setIsChangeRoleModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <p className="text-sm text-gray-600">
                                {t('admin.users.modals.changeRole.confirm', `Are you sure you want to change ${selectedUser.email}'s role?`)}
                            </p>
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">{t('admin.users.table.role', 'Role')}</label>
                                <select
                                    value={newRole}
                                    onChange={(e) => setNewRole(e.target.value)}
                                    className="w-full h-11 px-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                >
                                    <option value="customer">{t('admin.users.roles.customer', 'Customer')}</option>
                                    <option value="admin">{t('admin.users.roles.admin', 'Admin')}</option>
                                    <option value="super_admin">{t('admin.users.roles.super_admin', 'Super Admin')}</option>
                                </select>
                            </div>
                        </div>
                        <div className="p-6 pt-0 flex gap-3 justify-end">
                            <Button variant="secondary" onClick={() => setIsChangeRoleModalOpen(false)}>
                                {t('admin.common.cancel', 'Cancel')}
                            </Button>
                            <Button onClick={handleChangeRole}>
                                {t('admin.common.save', 'Save')}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Block/Unblock Modal */}
            {isBlockModalOpen && selectedUser && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="font-bold text-lg">
                                {selectedUser.is_blocked
                                    ? t('admin.users.modals.unblock.title', 'Unblock User')
                                    : t('admin.users.modals.block.title', 'Block User')
                                }
                            </h3>
                            <button onClick={() => setIsBlockModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <p className="text-sm text-gray-600">
                                {selectedUser.is_blocked
                                    ? t('admin.users.modals.unblock.confirm', `Are you sure you want to unblock ${selectedUser.email}?`)
                                    : t('admin.users.modals.block.confirm', `Are you sure you want to block ${selectedUser.email}?`)
                                }
                            </p>
                            {!selectedUser.is_blocked && (
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        {t('admin.users.modals.block.reason', 'Reason (Optional)')}
                                    </label>
                                    <textarea
                                        value={blockReason}
                                        onChange={(e) => setBlockReason(e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                                        rows={3}
                                        placeholder={t('admin.users.modals.block.reasonPlaceholder', 'Enter reason for blocking...')}
                                    />
                                </div>
                            )}
                        </div>
                        <div className="p-6 pt-0 flex gap-3 justify-end">
                            <Button variant="secondary" onClick={() => setIsBlockModalOpen(false)}>
                                {t('admin.common.cancel', 'Cancel')}
                            </Button>
                            <Button onClick={handleToggleBlock} variant={selectedUser.is_blocked ? 'primary' : 'secondary'}>
                                {selectedUser.is_blocked
                                    ? t('admin.users.actions.unblock', 'Unblock')
                                    : t('admin.users.actions.block', 'Block')
                                }
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
