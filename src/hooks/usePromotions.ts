import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Promotion } from '../types';
import { useToast } from '../context/ToastContext';
import { useTranslation } from 'react-i18next';

export function usePromotions() {
    const { t } = useTranslation();
    const { addToast } = useToast();
    const [promotions, setPromotions] = useState<Promotion[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchPromotions = useCallback(async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('promotions')
                .select('*, products:promotion_products(product_id)')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setPromotions(data || []);
        } catch (err: any) {
            console.error('Error fetching promotions:', err);
            setError(err.message);
            addToast(t('common.error'), 'error');
        } finally {
            setLoading(false);
        }
    }, [t, addToast]);

    const createPromotion = async (promotion: Partial<Promotion>, productIds: string[]): Promise<boolean> => {
        try {
            // 1. Create Promotion
            const { data: promoData, error: promoError } = await supabase
                .from('promotions')
                .insert([promotion])
                .select()
                .single();

            if (promoError) throw promoError;
            if (!promoData) throw new Error('No data returned');

            // 2. Link Products
            if (productIds.length > 0) {
                const links = productIds.map(pid => ({
                    promotion_id: promoData.id,
                    product_id: pid
                }));
                const { error: linksError } = await supabase
                    .from('promotion_products')
                    .insert(links);

                if (linksError) throw linksError;
            }

            addToast(t('promotions.createdSuccess'), 'success');
            fetchPromotions();
            return true;
        } catch (err: any) {
            console.error('Error creating promotion:', err);
            addToast(err.message || t('common.error'), 'error');
            return false;
        }
    };

    const updatePromotion = async (id: string, updates: Partial<Promotion>, productIds?: string[]): Promise<boolean> => {
        try {
            // 1. Update Promotion Details
            const { error: updateError } = await supabase
                .from('promotions')
                .update(updates)
                .eq('id', id);

            if (updateError) throw updateError;

            // 2. Update Products if provided
            if (productIds) {
                // Delete existing links
                const { error: deleteError } = await supabase
                    .from('promotion_products')
                    .delete()
                    .eq('promotion_id', id);

                if (deleteError) throw deleteError;

                // Insert new links
                if (productIds.length > 0) {
                    const links = productIds.map(pid => ({
                        promotion_id: id,
                        product_id: pid
                    }));
                    const { error: insertError } = await supabase
                        .from('promotion_products')
                        .insert(links);

                    if (insertError) throw insertError;
                }
            }

            addToast(t('promotions.updatedSuccess'), 'success');
            fetchPromotions();
            return true;
        } catch (err: any) {
            console.error('Error updating promotion:', err);
            addToast(err.message, 'error');
            return false;
        }
    };

    const deletePromotion = async (id: string) => {
        try {
            const { error } = await supabase
                .from('promotions')
                .delete()
                .eq('id', id);

            if (error) throw error;
            addToast(t('promotions.deletedSuccess'), 'success');
            fetchPromotions();
        } catch (err: any) {
            console.error('Error deleting promotion:', err);
            addToast(err.message, 'error');
        }
    };

    const toggleActive = async (id: string, isActive: boolean) => {
        try {
            const { error } = await supabase
                .from('promotions')
                .update({ is_active: isActive })
                .eq('id', id);

            if (error) throw error;
            // Optimistic update
            setPromotions(prev => prev.map(p => p.id === id ? { ...p, is_active: isActive } : p));
            addToast(isActive ? t('promotions.activated') : t('promotions.deactivated'), 'success');
        } catch (err: any) {
            addToast(err.message, 'error');
            fetchPromotions(); // Revert on error
        }
    };

    useEffect(() => {
        fetchPromotions();
    }, [fetchPromotions]);

    return {
        promotions,
        loading,
        error,
        fetchPromotions,
        createPromotion,
        updatePromotion,
        deletePromotion,
        toggleActive
    };
}
