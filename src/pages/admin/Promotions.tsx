import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { usePromotions } from '../../hooks/usePromotions';
import { Button } from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { Plus, Edit, Trash2, Tag, Calendar, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';
import type { Promotion } from '../../types';

export default function Promotions() {
    const { t, i18n } = useTranslation();
    const { promotions, loading, error, deletePromotion } = usePromotions();
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const lang = (i18n.language || 'en') as 'he' | 'ar' | 'en';

    const getLocalizedTitle = (p: Promotion) => {
        const key = `title_${lang}` as keyof Promotion;
        // @ts-ignore
        return (p[key] as string) || p.title_en || p.title_he || 'Untitled';
    };

    const handleDelete = async (id: string) => {
        if (window.confirm(t("account.confirmCancel", "Are you sure?"))) {
            setDeletingId(id);
            await deletePromotion(id);
            setDeletingId(null);
        }
    };

    // ... (getStatus function kept same)
    const getStatus = (p: Promotion) => {
        if (!p.is_active) return { label: t('admin.promotions.inactive', 'Inactive'), color: 'bg-slate-100 text-slate-500' };

        const now = new Date();
        const start = new Date(p.start_at);
        const end = new Date(p.end_at);

        if (now > end) return { label: t('admin.promotions.expired', 'Expired'), color: 'bg-red-100 text-red-600' };
        if (now < start) return { label: t('admin.promotions.upcoming', 'Upcoming'), color: 'bg-blue-100 text-blue-600' };
        return { label: t('admin.promotions.active', 'Active'), color: 'bg-green-100 text-green-600' };
    };

    if (loading) return <div className="p-8 text-center text-gray-500">{t('common.loading', 'Loading content...')}</div>;

    if (error) {
        return (
            <div className="p-6">
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                    <AlertTriangle className="text-red-500 shrink-0 mt-0.5" />
                    <div>
                        <h3 className="font-bold text-red-700">Database Error</h3>
                        <p className="text-sm text-red-600 mt-1">{error}</p>
                        {error.includes('does not exist') && (
                            <p className="text-xs text-red-500 mt-2 font-mono bg-white/50 p-2 rounded">
                                Tables missing: promotions / promotion_products. Please run migration.
                            </p>
                        )}
                    </div>
                </div>
            </div >
        );
    }

    return (
        <div className="space-y-6 p-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 font-heading mb-2">{t('admin.promotions.title')}</h1>
                    <p className="text-slate-500">Manage your marketing campaigns and discounts</p>
                </div>
                <Link to="/admin/promotions/new">
                    <Button className="gap-2 shadow-lg shadow-primary/20">
                        <Plus size={18} />
                        {t('admin.promotions.create')}
                    </Button>
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {promotions.map((promo) => {
                    const status = getStatus(promo);
                    return (
                        <Card key={promo.id} className="relative overflow-hidden group hover:border-primary/30 transition-all duration-300">
                            <div className="absolute top-0 right-0 p-4 opacity-50 text-[100px] font-bold text-slate-50 -z-10 leading-none rotate-12 translate-x-10 -translate-y-4">
                                %
                            </div>

                            <div className="mb-4 flex justify-between items-start">
                                <div className={`px-2.5 py-1 rounded-full text-xs font-bold ${status.color} flex items-center gap-1.5`}>
                                    {status.color.includes('green') ? <CheckCircle size={12} /> :
                                        status.color.includes('red') ? <XCircle size={12} /> : <Clock size={12} />}
                                    {status.label}
                                </div>
                                <div className="text-2xl font-bold text-primary">
                                    {promo.type === 'percent' ? `${promo.value}%` : `₪${promo.value}`}
                                    <span className="text-sm font-normal text-slate-400 ml-1">OFF</span>
                                </div>
                            </div>

                            <h3 className="text-xl font-bold text-slate-900 mb-2">{getLocalizedTitle(promo)}</h3>

                            <div className="space-y-2 text-sm text-slate-500 mb-6">
                                <div className="flex items-center gap-2">
                                    <Calendar size={14} className="text-slate-400" />
                                    <span>
                                        {new Date(promo.start_at).toLocaleDateString()} - {new Date(promo.end_at).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Tag size={14} className="text-slate-400" />
                                    <span>
                                        {/* @ts-ignore - products join */}
                                        {promo.products?.length || (promo.promotion_products ? promo.promotion_products.length : 0)} {t('admin.promotions.productsCount')}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 pt-4 border-t border-slate-100">
                                <Link to={`/admin/promotions/${promo.id}`} className="flex-1">
                                    <Button variant="outline" size="sm" className="w-full gap-2 hover:bg-slate-50">
                                        <Edit size={14} />
                                        {t('common.edit')}
                                    </Button>
                                </Link>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-500 hover:text-red-600 hover:bg-red-50 px-3"
                                    onClick={() => handleDelete(promo.id)}
                                    disabled={deletingId === promo.id}
                                >
                                    <Trash2 size={16} />
                                </Button>
                            </div>
                        </Card>
                    );
                })}

                {promotions.length === 0 && (
                    <div className="col-span-full py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 text-center">
                        <Tag size={48} className="mx-auto text-slate-300 mb-4" />
                        <h3 className="text-xl font-bold text-slate-700 mb-2">No promotions yet</h3>
                        <p className="text-slate-500 mb-6">Create your first campaign to boost sales</p>
                        <Link to="/admin/promotions/new">
                            <Button variant="outline">Create Promotion</Button>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
