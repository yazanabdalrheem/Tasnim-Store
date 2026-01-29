import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "../../lib/supabase";
import { Link } from "react-router-dom";
import { ShoppingBag, Heart, Trash2, ShoppingCart } from "lucide-react";
import Card from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { useWishlist } from "../../hooks/useWishlist";
import { useCart } from "../../context/CartContext";
import { useToast } from "../../context/ToastContext";
import type { Product } from "../../types";


export default function Wishlist() {
    const { t, i18n } = useTranslation();
    const { wishlistItems, toggleWishlist, loading: wishlistLoading } = useWishlist();
    const { addToCart } = useCart();
    const { addToast } = useToast();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    const lang = (i18n.language || 'en') as 'he' | 'ar' | 'en';

    useEffect(() => {
        if (wishlistItems.length > 0) {
            fetchWishlistProducts();
        } else {
            setProducts([]);
            setLoading(false);
        }
    }, [wishlistItems]);

    const fetchWishlistProducts = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*, product_images(*)')
                .in('id', wishlistItems);

            if (error) throw error;

            // Sort images
            const prods = (data || []).map((p: any) => ({
                ...p,
                product_images: p.product_images?.sort((a: any, b: any) => a.sort_order - b.sort_order) || []
            }));

            setProducts(prods as Product[]);
        } catch (error) {
            console.error("Error fetching wishlist products:", error);
            addToast(t("common.error"), "error");
        } finally {
            setLoading(false);
        }
    };

    const getLocalizedName = (p: Product) => {
        const key = `name_${lang}` as keyof Product;
        // @ts-ignore
        return (p[key] as string) || p.name_en || p.name_he || '';
    };

    if (loading || wishlistLoading) return (
        <div className="flex items-center justify-center p-12">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
    );

    if (products.length === 0) {
        return (
            <div className="animate-fade-in">
                <h1 className="text-3xl font-bold text-slate-900 mb-2 font-heading">{t("wishlist.title")}</h1>
                <div className="text-center py-20 bg-white rounded-[24px] border border-dashed border-slate-200 mt-6">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                        <Heart size={32} />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 mb-2">{t("wishlist.emptyTitle")}</h2>
                    <p className="text-slate-500 mb-6">{t("wishlist.emptyDesc")}</p>
                    <Link to="/shop" className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary-600 transition-colors shadow-lg shadow-primary/20">
                        <ShoppingBag size={20} className="mr-2 rtl:ml-2 rtl:mr-0" />
                        {t("common.backToShop")}
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-slate-900 font-heading">{t("wishlist.title")}</h1>
                <span className="bg-primary/10 text-primary font-bold px-3 py-1 rounded-full text-sm">
                    {products.length} {t("common.items", "Items")}
                </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => {
                    const displayImage = product.main_image_url || product.product_images?.[0]?.url || (Array.isArray(product.images) ? product.images[0] : null);

                    return (
                        <Card key={product.id} className="group !p-0 overflow-hidden relative" hoverEffect={true}>
                            <Link to={`/product/${product.id}`} className="block relative aspect-[4/3] bg-[#F7F8FA] overflow-hidden">
                                {displayImage ? (
                                    <img
                                        src={displayImage}
                                        alt={getLocalizedName(product)}
                                        className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                                        <ShoppingBag size={48} className="opacity-20" />
                                    </div>
                                )}

                                {product.discount_price && (
                                    <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md shadow-sm pointer-events-none">
                                        Sale
                                    </span>
                                )}
                            </Link>

                            <div className="p-4">
                                <h3 className="font-bold text-slate-900 mb-1 line-clamp-1 group-hover:text-primary transition-colors">
                                    <Link to={`/product/${product.id}`}>{getLocalizedName(product)}</Link>
                                </h3>

                                <div className="flex items-center gap-2 mb-4">
                                    <span className="text-lg font-bold text-primary">₪{product.discount_price || product.price}</span>
                                    {product.discount_price && (
                                        <span className="text-sm text-slate-400 line-through">₪{product.price}</span>
                                    )}
                                </div>

                                <div className="flex gap-2">
                                    <Button
                                        className="flex-1 gap-2"
                                        size="sm"
                                        onClick={() => {
                                            addToCart(product);
                                            addToast(t("cart.added"), "success");
                                        }}
                                        disabled={product.stock_quantity === 0}
                                    >
                                        <ShoppingCart size={16} />
                                        {t("product.addToCart")}
                                    </Button>
                                    <button
                                        onClick={() => toggleWishlist(product.id)}
                                        className="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:border-red-200 hover:bg-red-50 hover:text-red-500 transition-colors"
                                        title={t("common.remove")}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
