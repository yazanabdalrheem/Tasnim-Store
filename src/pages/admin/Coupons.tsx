import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useToast } from '../../context/ToastContext';
import { Plus, Trash2, Edit2, CheckCircle, XCircle, Tag, Search } from 'lucide-react';
import Card from '../../components/ui/Card';
import clsx from 'clsx';

interface Coupon {
    id: string;
    code: string;
    type: 'percent' | 'fixed';
    value: number;
    start_at: string | null;
    end_at: string | null;
    is_active: boolean;
    min_subtotal: number | null;
    max_uses: number | null;
    used_count: number;
    max_uses_per_user: number | null;
}

export default function Coupons() {
    const { t } = useTranslation();
    const { addToast } = useToast();
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Form State
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<Partial<Coupon>>({
        code: '',
        type: 'percent',
        value: 0,
        is_active: true,
        min_subtotal: 0,
        max_uses: null,
        max_uses_per_user: 1
    });

    useEffect(() => {
        fetchCoupons();
    }, []);

    async function fetchCoupons() {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('coupons')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setCoupons(data || []);
        } catch (error) {
            console.error('Error fetching coupons:', error);
            addToast('Failed to load coupons', 'error');
        } finally {
            setLoading(false);
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                code: formData.code?.toUpperCase().trim()
            };

            if (editingId) {
                const { error } = await supabase
                    .from('coupons')
                    .update(payload)
                    .eq('id', editingId);
                if (error) throw error;
                addToast('Coupon updated', 'success');
            } else {
                const { error } = await supabase
                    .from('coupons')
                    .insert([payload]);
                if (error) throw error;
                addToast('Coupon created', 'success');
            }

            setShowModal(false);
            resetForm();
            fetchCoupons();
        } catch (error: any) {
            addToast(error.message || 'Error saving coupon', 'error');
        }
    }

    async function deleteCoupon(id: string) {
        if (!confirm('Are you sure you want to delete this coupon?')) return;
        try {
            const { error } = await supabase.from('coupons').delete().eq('id', id);
            if (error) throw error;
            addToast('Coupon deleted', 'success');
            fetchCoupons();
        } catch (error) {
            addToast('Error deleting coupon', 'error');
        }
    }

    async function toggleActive(id: string, currentStatus: boolean) {
        try {
            const { error } = await supabase
                .from('coupons')
                .update({ is_active: !currentStatus })
                .eq('id', id);
            if (error) throw error;
            setCoupons(coupons.map(c => c.id === id ? { ...c, is_active: !c.is_active } : c));
        } catch (error) {
            addToast('Error updating status', 'error');
        }
    }

    function resetForm() {
        setEditingId(null);
        setFormData({
            code: '',
            type: 'percent',
            value: 0,
            is_active: true,
            min_subtotal: 0,
            max_uses: null,
            max_uses_per_user: 1
        });
    }

    function openEdit(coupon: Coupon) {
        setEditingId(coupon.id);
        const { id, used_count, ...data } = coupon;
        setFormData(data);
        setShowModal(true);
    }

    const filteredCoupons = coupons.filter(c =>
        c.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <Tag className="text-primary" /> Coupons
                </h1>
                <Button onClick={() => { resetForm(); setShowModal(true); }}>
                    <Plus size={18} className="mr-2" />
                    New Coupon
                </Button>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                    type="text"
                    placeholder="Search coupons..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>

            {/* List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100 text-xs uppercase text-gray-500 font-medium">
                        <tr>
                            <th className="px-6 py-4">Code</th>
                            <th className="px-6 py-4">Discount</th>
                            <th className="px-6 py-4">Usage</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr><td colSpan={5} className="p-8 text-center text-gray-500">Loading...</td></tr>
                        ) : filteredCoupons.length === 0 ? (
                            <tr><td colSpan={5} className="p-8 text-center text-gray-500">No coupons found.</td></tr>
                        ) : (
                            filteredCoupons.map(coupon => (
                                <tr key={coupon.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 font-mono font-bold text-slate-800">{coupon.code}</td>
                                    <td className="px-6 py-4">
                                        {coupon.type === 'percent' ? `${coupon.value}%` : `₪${coupon.value}`}
                                        {coupon.min_subtotal && coupon.min_subtotal > 0 && <span className="text-xs text-slate-400 block">Min: ₪{coupon.min_subtotal}</span>}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="font-medium text-slate-900">{coupon.used_count}</span>
                                        {coupon.max_uses && <span className="text-slate-400 font-normal"> / {coupon.max_uses}</span>}
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => toggleActive(coupon.id, coupon.is_active)}
                                            className={clsx("flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all",
                                                coupon.is_active ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-red-100 text-red-700 hover:bg-red-200")}
                                        >
                                            {coupon.is_active ? <CheckCircle size={12} /> : <XCircle size={12} />}
                                            {coupon.is_active ? t('common.active', 'Active') : t('common.inactive', 'Inactive')}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                        <button onClick={() => openEdit(coupon)} className="text-slate-400 hover:text-primary transition-colors">
                                            <Edit2 size={18} />
                                        </button>
                                        <button onClick={() => deleteCoupon(coupon.id)} className="text-slate-400 hover:text-red-500 transition-colors">
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <Card className="max-w-md w-full p-6 animate-fade-in-up">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">{editingId ? 'Edit Coupon' : 'New Coupon'}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <Input
                                label="Code"
                                value={formData.code}
                                onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                required
                                placeholder="SAVE20"
                                className="font-mono uppercase"
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                    <select
                                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                                        value={formData.type}
                                        onChange={e => setFormData({ ...formData, type: e.target.value as 'percent' | 'fixed' })}
                                    >
                                        <option value="percent">Percentage (%)</option>
                                        <option value="fixed">Fixed Amount</option>
                                    </select>
                                </div>
                                <Input
                                    label="Value"
                                    type="number"
                                    value={formData.value}
                                    onChange={e => setFormData({ ...formData, value: parseFloat(e.target.value) })}
                                    required
                                    min="0"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    label="Min Subtotal"
                                    type="number"
                                    value={formData.min_subtotal || ''}
                                    onChange={e => setFormData({ ...formData, min_subtotal: parseFloat(e.target.value) })}
                                    placeholder="0"
                                    min="0"
                                />
                                <Input
                                    label="Max Uses (Total)"
                                    type="number"
                                    value={formData.max_uses || ''}
                                    onChange={e => setFormData({ ...formData, max_uses: parseInt(e.target.value) || null })}
                                    placeholder="Unlimited"
                                    min="1"
                                />
                            </div>

                            <Input
                                label="Max Uses Per User"
                                type="number"
                                value={formData.max_uses_per_user || ''}
                                onChange={e => setFormData({ ...formData, max_uses_per_user: parseInt(e.target.value) || null })}
                                placeholder="Unlimited"
                                min="1"
                            />

                            <div className="flex gap-4 pt-4">
                                <Button type="button" onClick={() => setShowModal(false)} className="bg-slate-100 text-slate-700 hover:bg-slate-200">Cancel</Button>
                                <Button type="submit" className="flex-1">{editingId ? 'Update' : 'Create'}</Button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}
        </div>
    );
}
