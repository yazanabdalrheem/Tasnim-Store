import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { usePromotions } from '../../hooks/usePromotions';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { ArrowRight, ArrowLeft, Save, Search, AlertCircle } from 'lucide-react';
import type { Product, Promotion } from '../../types';
import clsx from 'clsx';

export default function PromotionEditor() {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const { id } = useParams();
    const { createPromotion, updatePromotion, promotions } = usePromotions();

    const isRtl = i18n.language === 'ar' || i18n.language === 'he';
    const Arrow = isRtl ? ArrowLeft : ArrowRight;

    // Form State
    const [formData, setFormData] = useState<Partial<Promotion>>({
        title_en: '',
        title_he: '',
        title_ar: '',
        type: 'percent',
        value: 20,
        badge_text_en: '',
        badge_text_he: '',
        badge_text_ar: '',
        start_at: new Date().toISOString().slice(0, 16),
        end_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16), // +7 days
        is_active: true
    });

    const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loadingProducts, setLoadingProducts] = useState(false);
    const [saving, setSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        // Load existing data if edit mode
        if (id && id !== 'new') {
            const promo = promotions.find(p => p.id === id);
            if (promo) {
                setFormData({
                    title_en: promo.title_en,
                    title_he: promo.title_he,
                    title_ar: promo.title_ar,
                    type: promo.type,
                    value: promo.value,
                    badge_text_en: promo.badge_text_en,
                    badge_text_he: promo.badge_text_he,
                    badge_text_ar: promo.badge_text_ar,
                    start_at: new Date(promo.start_at).toISOString().slice(0, 16),
                    end_at: new Date(promo.end_at).toISOString().slice(0, 16),
                    is_active: promo.is_active
                });

                // Fetch linked products
                const fetchLinks = async () => {
                    const { data } = await supabase
                        .from('promotion_products')
                        .select('product_id')
                        .eq('promotion_id', id);
                    if (data) setSelectedProductIds(data.map(d => d.product_id));
                };
                fetchLinks();
            }
        }
    }, [id, promotions]);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        setLoadingProducts(true);
        const { data } = await supabase
            .from('products')
            .select('*')
            .eq('is_active', true)
            .order('created_at', { ascending: false });
        if (data) setProducts(data as Product[]);
        setLoadingProducts(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        let success = false;
        if (id && id !== 'new') {
            success = await updatePromotion(id, formData, selectedProductIds);
        } else {
            success = await createPromotion(formData as any, selectedProductIds);
        }

        setSaving(false);
        if (success) {
            navigate('/admin/promotions');
        }
    };

    const toggleProduct = (pid: string) => {
        setSelectedProductIds(prev =>
            prev.includes(pid) ? prev.filter(p => p !== pid) : [...prev, pid]
        );
    };

    const filteredProducts = products.filter(p =>
        (p.name_en?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (p.name_he?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (p.name_ar?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );

    return (
        <div className="max-w-5xl mx-auto p-6 animate-fade-in pb-20">
            <div className="flex items-center gap-4 mb-8">
                <Button variant="ghost" className="rounded-full !p-2" onClick={() => navigate('/admin/promotions')}>
                    <Arrow size={24} />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 font-heading">
                        {id === 'new' ? t('admin.promotions.create') : t('admin.promotions.edit')}
                    </h1>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Details */}
                <div className="lg:col-span-1 space-y-6">
                    <Card className="p-6 space-y-4">
                        <h3 className="font-bold text-lg mb-4">{t('admin.promotions.formTitle')}</h3>

                        {/* Validation Error */}
                        {(!formData.title_en && !formData.title_he) && (
                            <div className="bg-amber-50 text-amber-600 p-3 rounded-lg text-sm flex items-start gap-2">
                                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                                Please fill at least one title
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Title (English)</label>
                            <input
                                type="text"
                                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
                                value={formData.title_en || ''}
                                onChange={e => setFormData({ ...formData, title_en: e.target.value })}
                                placeholder="e.g. Summer Sale"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Title (Hebrew)</label>
                            <input
                                type="text"
                                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 text-right"
                                dir="rtl"
                                value={formData.title_he || ''}
                                onChange={e => setFormData({ ...formData, title_he: e.target.value })}
                                placeholder="לדוגמה: מבצע קיץ"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Title (Arabic)</label>
                            <input
                                type="text"
                                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 text-right"
                                dir="rtl"
                                value={formData.title_ar || ''}
                                onChange={e => setFormData({ ...formData, title_ar: e.target.value })}
                                placeholder="مثال: عرض الصيف"
                            />
                        </div>

                        <div className="pt-4 border-t border-slate-100 space-y-4">
                            {/* Type Selection */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">{t('admin.promotions.type')}</label>
                                <div className="flex bg-slate-100 p-1 rounded-xl">
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, type: 'percent', value: 20 })}
                                        className={clsx(
                                            "flex-1 py-2 text-sm font-bold rounded-lg transition-all",
                                            formData.type === 'percent' ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-slate-700"
                                        )}
                                    >
                                        Percent (%)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, type: 'fixed', value: 50 })}
                                        className={clsx(
                                            "flex-1 py-2 text-sm font-bold rounded-lg transition-all",
                                            formData.type === 'fixed' ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-slate-700"
                                        )}
                                    >
                                        Fixed Amount (₪)
                                    </button>
                                </div>
                            </div>

                            {/* Value Input */}
                            <div>
                                <label className="block text-sm font-bold text-slate-900 mb-2 flex justify-between">
                                    {formData.type === 'percent' ? t('admin.promotions.discountPercent') : t('admin.promotions.discountAmount')}
                                    <span className="text-primary text-lg">
                                        {formData.type === 'percent' ? `${formData.value}%` : `₪${formData.value}`}
                                    </span>
                                </label>

                                {formData.type === 'percent' ? (
                                    <input
                                        type="range"
                                        min="1"
                                        max="90"
                                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
                                        value={formData.value}
                                        onChange={e => setFormData({ ...formData, value: parseInt(e.target.value) })}
                                    />
                                ) : (
                                    <input
                                        type="number"
                                        min="1"
                                        className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
                                        value={formData.value}
                                        onChange={e => setFormData({ ...formData, value: parseInt(e.target.value) })}
                                    />
                                )}
                            </div>
                        </div>

                        {/* Custom Badge Text (Optional) */}
                        <div className="pt-4 border-t border-slate-100 space-y-4">
                            <h4 className="font-bold text-sm text-slate-800">Custom Badge Text (Optional)</h4>
                            <div className="grid grid-cols-1 gap-3">
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                                    placeholder="Badge (English)"
                                    value={formData.badge_text_en || ''}
                                    onChange={e => setFormData({ ...formData, badge_text_en: e.target.value })}
                                />
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-right"
                                    dir="rtl"
                                    placeholder="Badge (Hebrew)"
                                    value={formData.badge_text_he || ''}
                                    onChange={e => setFormData({ ...formData, badge_text_he: e.target.value })}
                                />
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-right"
                                    dir="rtl"
                                    placeholder="Badge (Arabic)"
                                    value={formData.badge_text_ar || ''}
                                    onChange={e => setFormData({ ...formData, badge_text_ar: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1">{t('admin.promotions.start')}</label>
                                <input
                                    type="datetime-local"
                                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                                    value={formData.start_at}
                                    onChange={e => setFormData({ ...formData, start_at: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1">{t('admin.promotions.end')}</label>
                                <input
                                    type="datetime-local"
                                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                                    value={formData.end_at}
                                    onChange={e => setFormData({ ...formData, end_at: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-2 pt-2">
                            <input
                                type="checkbox"
                                id="is_active"
                                className="w-5 h-5 rounded text-primary focus:ring-primary"
                                checked={formData.is_active}
                                onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                            />
                            <label htmlFor="is_active" className="text-sm font-medium text-slate-700 select-none cursor-pointer">
                                {t('admin.promotions.active')}
                            </label>
                        </div>
                    </Card>

                    {/* Preview Card */}
                    <div className="bg-slate-50 p-4 rounded-2xl border border-dashed border-slate-200 text-center">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">{t('admin.promotions.preview')}</span>
                        <div className="relative w-40 h-40 bg-white rounded-xl shadow-sm mx-auto border border-slate-100 flex items-center justify-center overflow-hidden">
                            <span className="text-slate-300 text-xs">Product Image</span>

                            {/* Badge Preview */}
                            <div className="absolute top-2 right-2 bg-gradient-to-r from-red-500 to-pink-600 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm flex items-center gap-1">
                                {formData.type === 'percent' ? `${formData.value}% OFF` : `-₪${formData.value}`}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Products */}
                <div className="lg:col-span-2 space-y-4">
                    <Card className="p-6 min-h-[600px] flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-lg">{t('admin.promotions.selectProducts')}</h3>
                            <span className="bg-primary/10 text-primary font-bold px-3 py-1 rounded-full text-sm">
                                {selectedProductIds.length} Selected
                            </span>
                        </div>

                        <div className="relative mb-4">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
                                placeholder={t('admin.promotions.searchProducts')}
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="flex-1 overflow-y-auto pr-2 space-y-2 max-h-[500px]">
                            {loadingProducts ? (
                                <div className="text-center py-10 text-slate-400">{t('common.loading')}</div>
                            ) : (
                                filteredProducts.map(p => {
                                    const selected = selectedProductIds.includes(p.id);
                                    return (
                                        <div
                                            key={p.id}
                                            onClick={() => toggleProduct(p.id)}
                                            className={clsx(
                                                "flex items-center gap-4 p-3 rounded-xl border cursor-pointer transition-all hover:bg-slate-50",
                                                selected ? "border-primary bg-primary/5" : "border-slate-100"
                                            )}
                                        >
                                            <div className="w-6 h-6 rounded-full border border-slate-300 flex items-center justify-center shrink-0 bg-white">
                                                {selected && <div className="w-3 h-3 bg-primary rounded-full" />}
                                            </div>
                                            <div className="w-12 h-12 bg-slate-100 rounded-lg shrink-0 overflow-hidden">
                                                {(p.main_image_url || p.images?.[0]) && (
                                                    <img src={p.main_image_url || p.images?.[0]} className="w-full h-full object-cover" />
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <div className="font-bold text-slate-900 text-sm">{p.name_en || p.name_he}</div>
                                                <div className="text-slate-500 text-xs">₪{p.price}</div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </Card>
                </div>
            </form>

            {/* Sticky Action Footer */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 shadow-lg z-40">
                <div className="container mx-auto flex justify-end gap-4">
                    <Button variant="ghost" onClick={() => navigate('/admin/promotions')}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={saving} className="min-w-[150px] shadow-lg shadow-primary/20">
                        {saving ? 'Saving...' : (
                            <>
                                <Save size={18} className="mr-2 rtl:ml-2 rtl:mr-0" />
                                {t('admin.promotions.save')}
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
