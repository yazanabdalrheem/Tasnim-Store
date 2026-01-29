import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "../lib/supabase";
import { useCart } from "../context/CartContext";
import { Button } from "../components/ui/Button";
import { Minus, Plus, ShoppingBag, Star, Heart, ShieldCheck, Truck } from "lucide-react";
import type { Product } from "../types";
import { useToast } from "../context/ToastContext";
import Card from "../components/ui/Card";
import clsx from "clsx";
import { useWishlist } from "../hooks/useWishlist";
import { formatPrice } from "../lib/utils";

export default function ProductDetails() {
    const { id } = useParams();
    const { t, i18n } = useTranslation();
    const { addToCart } = useCart();
    const { addToast } = useToast();
    const { isFavorited, toggleWishlist } = useWishlist();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

    const lang = (i18n.language || 'en') as 'he' | 'ar' | 'en';
    const isRtl = lang === 'he' || lang === 'ar';

    const getLocalizedName = (p: Product) => {
        const key = `name_${lang}` as keyof Product;
        // @ts-ignore
        return (p[key] as string) || p.name_en || p.name_he || '';
    };

    const getLocalizedDescription = (p: Product) => {
        const key = `description_${lang}` as keyof Product;
        // @ts-ignore
        return (p[key] as string) || p.description_en || p.description_he || '';
    };

    useEffect(() => {
        fetchProduct();
        window.scrollTo(0, 0);
    }, [id]);

    const fetchProduct = async () => {
        try {
            if (!id) return;
            setLoading(true);

            // Fetch product from VIEW with images ordered
            // The view already contains final_price, promotion info, calculated_discount_percent
            const { data, error } = await supabase
                .from("products_view")
                .select("*, category:category_id(*), product_images(*)")
                .eq("id", id)
                .single();

            if (error) throw error;

            // Sort images
            if (data && data.product_images) {
                data.product_images.sort((a: any, b: any) => a.sort_order - b.sort_order);
            }

            setProduct(data);

            // Fetch related
            if (data?.category_id) {
                const { data: related } = await supabase
                    .from("products")
                    .select("*, product_images(*)")
                    .eq("category_id", data.category_id)
                    .neq("id", data.id)
                    .limit(4);

                // Sort related images
                const relatedWithSortedImages = (related || []).map((p: any) => ({
                    ...p,
                    product_images: p.product_images?.sort((a: any, b: any) => a.sort_order - b.sort_order) || []
                }));

                setRelatedProducts(relatedWithSortedImages as Product[]);
            }
        } catch (error) {
            console.error("Error fetching product:", error);
            addToast("Failed to load product", "error");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-white">
            <div className="w-10 h-10 border-4 border-slate-200 border-t-primary rounded-full animate-spin"></div>
        </div>
    );

    if (!product) return <div className="text-center py-20 text-slate-500">{t('common.error')}</div>;

    // Image Logic
    const allImages = [
        product.main_image_url,
        ...(product.product_images?.map(pi => pi.url) || []),
        ...(Array.isArray(product.images) ? product.images : [])
    ].filter(Boolean) as string[];

    const uniqueImages = Array.from(new Set(allImages));
    const displayImage = uniqueImages[selectedImageIndex] || uniqueImages[0];

    // Safe price parsing
    const basePrice = Number(product.price) || 0;
    const calculatedFinalPrice = product.final_price ? Number(product.final_price) : null;
    const discountPrice = product.discount_price ? Number(product.discount_price) : null;

    // final_price from view has priority, then discount_price, then base price
    const finalPrice = calculatedFinalPrice || discountPrice || basePrice;

    // Calculate discount percent safely
    let discountPercent = 0;
    if (basePrice > 0 && finalPrice < basePrice) {
        const viewDiscountPercent = product.calculated_discount_percent
            ? Number(product.calculated_discount_percent)
            : null;

        if (viewDiscountPercent && viewDiscountPercent > 0 && viewDiscountPercent <= 100) {
            discountPercent = Math.round(viewDiscountPercent);
        } else {
            discountPercent = Math.round(((basePrice - finalPrice) / basePrice) * 100);
        }
    }

    const hasDiscount = discountPercent > 0;

    // Badge Text
    const badgeTextKey = `badge_text_${lang}` as keyof typeof product;
    const badgeText = product[badgeTextKey] as string;

    return (
        <div className="bg-white min-h-screen pb-20">
            {/* Breadcrumb - RTL/LTR Safe */}
            <div className="bg-slate-50 border-b border-slate-100 py-4">
                <div className="container mx-auto px-4">
                    <div className="flex items-center text-sm text-slate-500 gap-2">
                        <Link to="/" className="hover:text-primary transition-colors">{t("nav.home")}</Link>
                        <span className={clsx("text-slate-300", isRtl && "rotate-180")}>/</span>
                        <Link to="/shop" className="hover:text-primary transition-colors">{t("nav.shop")}</Link>
                        <span className={clsx("text-slate-300", isRtl && "rotate-180")}>/</span>
                        <span className="text-slate-900 font-medium truncate max-w-[200px]">{getLocalizedName(product)}</span>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8 max-w-7xl animate-fade-in-up">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
                    {/* Left: Images */}
                    <div className="space-y-4">
                        <div className="aspect-[4/3] bg-[#F7F8FA] rounded-[32px] overflow-hidden border border-slate-100 relative group">
                            {displayImage ? (
                                <img
                                    src={displayImage}
                                    alt={getLocalizedName(product)}
                                    className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-300">
                                    <ShoppingBag size={64} strokeWidth={1} className="opacity-20" />
                                </div>
                            )}

                            {hasDiscount && discountPercent > 0 && (
                                <div className={clsx("absolute top-6 bg-gradient-to-r from-red-500 to-pink-600 text-white text-sm font-bold px-3 py-1.5 rounded-full shadow-lg shadow-red-500/20 uppercase tracking-wide", isRtl ? "left-6" : "right-6")}>
                                    {badgeText || (
                                        product.promotion_type === 'percent'
                                            ? t('store.badge.discountPercent', { percent: discountPercent })
                                            : `-${formatPrice(product.promotion_value || 0, lang)}`
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Thumbnails */}
                        {uniqueImages.length > 1 && (
                            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide snap-x">
                                {uniqueImages.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedImageIndex(idx)}
                                        className={clsx(
                                            "w-20 h-20 rounded-2xl overflow-hidden border-2 shrink-0 transition-all snap-start bg-[#F7F8FA]",
                                            selectedImageIndex === idx ? "border-primary ring-2 ring-primary/20" : "border-transparent opacity-60 hover:opacity-100"
                                        )}
                                    >
                                        <img src={img} alt="" className="w-full h-full object-contain" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right: Info */}
                    <div className="flex flex-col">
                        <div className="mb-auto">
                            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 font-heading tracking-tight leading-tight">
                                {getLocalizedName(product)}
                            </h1>

                            <div className="flex items-center gap-4 mb-8">
                                <div className="flex text-yellow-400">
                                    {[1, 2, 3, 4, 5].map((s) => (
                                        <Star key={s} size={18} fill="currentColor" />
                                    ))}
                                </div>
                                <span className="text-sm text-slate-400 font-medium">
                                    {t("product.reviewsLabel", { rating: "4.9" })}
                                </span>
                            </div>

                            <div className="flex items-end gap-4 mb-8 border-b border-slate-50 pb-8">
                                <span className="text-4xl font-bold text-slate-900 tracking-tight">
                                    {formatPrice(finalPrice, lang)}
                                </span>
                                {hasDiscount && discountPercent > 0 && basePrice > 0 && (
                                    <span className="text-xl text-slate-400 line-through mb-1.5 decoration-slate-400/50">
                                        {formatPrice(basePrice, lang)}
                                    </span>
                                )}
                            </div>

                            <div className="prose prose-slate prose-lg text-slate-500 mb-8 leading-relaxed max-w-none">
                                <p>{getLocalizedDescription(product)}</p>
                            </div>

                            {/* Trust Badges */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <ShieldCheck className="text-primary shrink-0" size={24} />
                                    <div>
                                        <div className="font-bold text-slate-900 text-sm">{t('product.yearWarranty')}</div>
                                        <div className="text-xs text-slate-500">{t('product.comprehensiveCoverage')}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <Truck className="text-primary shrink-0" size={24} />
                                    <div>
                                        <div className="font-bold text-slate-900 text-sm">{t('product.freeDelivery')}</div>
                                        <div className="text-xs text-slate-500">{t('product.ordersOver')}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Bar */}
                        <div className="bg-white border-t border-slate-100 pt-6 lg:border-none lg:pt-0">
                            <div className="flex flex-col sm:flex-row gap-4">
                                {/* Quantity */}
                                <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 p-1 w-full sm:w-auto">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="w-12 h-12 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-white rounded-lg transition-all shadow-sm"
                                    >
                                        <Minus size={18} />
                                    </button>
                                    <span className="w-12 text-center font-bold text-lg text-slate-900 tabular-nums">{quantity}</span>
                                    <button
                                        onClick={() => setQuantity(Math.min(product.stock_quantity || 10, quantity + 1))}
                                        className="w-12 h-12 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-white rounded-lg transition-all shadow-sm"
                                    >
                                        <Plus size={18} />
                                    </button>
                                </div>

                                <Button
                                    size="lg"
                                    className="flex-1 py-4 text-lg rounded-xl shadow-xl shadow-primary/20 hover:shadow-primary/40 font-bold h-14"
                                    onClick={() => {
                                        addToCart(product, quantity);
                                        addToast(t("cart.added"), "success");
                                    }}
                                    disabled={product.stock_quantity === 0}
                                >
                                    <ShoppingBag className={clsx("w-5 h-5", isRtl ? "ml-2" : "mr-2")} />
                                    {product.stock_quantity === 0 ? t("shop.outOfStock") : t("product.addToCart")}
                                </Button>

                                <button
                                    onClick={() => product && toggleWishlist(product.id)}
                                    className={clsx(
                                        "h-14 w-14 flex items-center justify-center rounded-xl border transition-all shrink-0",
                                        isFavorited(product.id)
                                            ? "bg-red-50 border-red-200 text-red-500"
                                            : "border-slate-200 text-slate-400 hover:text-red-500 hover:bg-red-50 hover:border-red-100"
                                    )}
                                >
                                    <Heart size={24} fill={isFavorited(product.id) ? "currentColor" : "none"} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Related Products */}
                {relatedProducts.length > 0 && (
                    <div className="mt-24 border-t border-slate-100 pt-16">
                        <h2 className="text-3xl font-bold text-slate-900 mb-10 text-center font-heading">
                            {t('product.youMightAlsoLike')}
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {relatedProducts.map((rel) => {
                                const relImage = rel.main_image_url || rel.product_images?.[0]?.url || (Array.isArray(rel.images) ? rel.images[0] : null);
                                return (
                                    <Link to={`/product/${rel.id}`} key={rel.id} className="group block">
                                        <Card className="h-full border-slate-100 hover:shadow-xl transition-all duration-300 rounded-[24px] overflow-hidden !p-0">
                                            <div className="aspect-[4/5] bg-[#F7F8FA] relative overflow-hidden p-6 border-b border-slate-50">
                                                {relImage ? (
                                                    <img src={relImage} alt="" className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                        <ShoppingBag size={32} />
                                                    </div>
                                                )}

                                                {/* Floating Cart Button for Related */}
                                                <button className="absolute bottom-4 right-4 bg-white text-slate-900 w-10 h-10 rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 hover:bg-primary hover:text-white">
                                                    <ShoppingBag size={18} />
                                                </button>
                                            </div>
                                            <div className="p-4 text-center">
                                                <h3 className="font-bold text-slate-900 mb-2 truncate group-hover:text-primary transition-colors">
                                                    {getLocalizedName(rel)}
                                                </h3>
                                                <div className="text-primary font-bold">
                                                    {formatPrice(rel.discount_price || rel.price, lang)}
                                                </div>
                                            </div>
                                        </Card>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
