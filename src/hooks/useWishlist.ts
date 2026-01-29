import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useToast } from '../context/ToastContext';
import { useTranslation } from 'react-i18next';

export function useWishlist() {
    const { addToast } = useToast();
    const { t } = useTranslation();
    const [wishlistItems, setWishlistItems] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchWishlist();

        // Subscribe to changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
            fetchWishlist();
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const fetchWishlist = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setWishlistItems([]);
                setLoading(false);
                return;
            }

            const { data, error } = await supabase
                .from('wishlist')
                .select('product_id')
                .eq('user_id', user.id);

            if (error) throw error;
            setWishlistItems(data.map(item => item.product_id));
        } catch (error) {
            console.error('Error fetching wishlist:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleWishlist = async (productId: string) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                addToast(t('wishlist.loginRequired'), 'error');
                return false;
            }

            const isFavorited = wishlistItems.includes(productId);

            if (isFavorited) {
                // Remove
                const { error } = await supabase
                    .from('wishlist')
                    .delete()
                    .eq('user_id', user.id)
                    .eq('product_id', productId);

                if (error) throw error;

                setWishlistItems(prev => prev.filter(id => id !== productId));
                addToast(t('wishlist.removed'), 'success');
            } else {
                // Add
                const { error } = await supabase
                    .from('wishlist')
                    .insert([{ user_id: user.id, product_id: productId }]);

                if (error) throw error;

                setWishlistItems(prev => [...prev, productId]);
                addToast(t('wishlist.added'), 'success');
            }
            return true;
        } catch (error) {
            console.error('Error toggling wishlist:', error);
            addToast(t('common.error'), 'error');
            return false;
        }
    };

    const isFavorited = (productId: string) => wishlistItems.includes(productId);

    return {
        wishlistItems,
        loading,
        toggleWishlist,
        isFavorited,
        refreshWishlist: fetchWishlist
    };
}
