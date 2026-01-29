import { useEffect, useState, Component, type ErrorInfo, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "../lib/supabase";
import type { Product, Category } from "../types";
import { Button } from "../components/ui/Button";
import Card from "../components/ui/Card";
import { Link } from "react-router-dom";
import { ShoppingCart, AlertCircle, Search } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import { useWishlist } from "../hooks/useWishlist";
import { Heart } from "lucide-react";
import clsx from "clsx";
import { formatPrice } from "../lib/utils";


// --- Error Boundary ---
class ShopErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error: Error | null }> {
    constructor(props: { children: ReactNode }) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Shop Page Error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-[50vh] flex flex-col items-center justify-center p-4 text-center">
                    <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                    <h2 className="text-xl font-bold text-slate-900 mb-2">Something went wrong loading the Shop.</h2>
                    <p className="text-slate-500 max-w-md bg-slate-50 p-3 rounded text-sm font-mono overflow-auto mb-4 border border-slate-200">
                        {this.state.error?.message}
                    </p>
                    <Button onClick={() => window.location.reload()} variant="outline">
                        Reload Page
                    </Button>
                </div>
            );
        }
        return this.props.children;
    }
}

// --- Main Component ---
function ShopContent() {
    const { t, i18n } = useTranslation();
    const { addToCart } = useCart();
    const { addToast } = useToast();
    const { isFavorited, toggleWishlist } = useWishlist();
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    // Safe access to language
    const lang = (i18n.language || 'en') as 'he' | 'ar' | 'en';

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch Products from View (Smart Pricing)
            // We use 'products_view' to get calculated prices and promotions
            const productsQuery = supabase
                .from('products_view')
                .select('*')
                .eq('is_active', true)
                .order('created_at', { ascending: false });
            // Note: We might want to handle pagination later

            // Fetch Categories
            const categoriesQuery = supabase
                .from('categories')
                .select('*')
                .order('name_he', { ascending: true });

            const [productsRes, categoriesRes] = await Promise.all([
                productsQuery,
                categoriesQuery
            ]);

            if (productsRes.error) throw new Error(`Products Error: ${productsRes.error.message}`);
            if (categoriesRes.error) throw new Error(`Categories Error: ${categoriesRes.error.message}`);

            // Sort images just in case we need them for gallery, but list view will use main_image_url
            const prods = (productsRes.data || []).map((p: any) => ({
                ...p,
                product_images: p.product_images?.sort((a: any, b: any) => a.sort_order - b.sort_order) || []
            }));

            setProducts(prods as Product[]);
            setCategories(categoriesRes.data as Category[] || []);

        } catch (err: any) {
            console.error("Error fetching shop data:", err);
            addToast(t("common.error"), "error");
        } finally {
            setLoading(false);
        }
    };

    const getLocalizedContent = (item: Product | Category, field: 'name' | 'description') => {
        const key = `${field}_${lang}` as keyof typeof item;
        // @ts-ignore
        return (item[key] as string) || item[`${field}_en`] || item[`${field}_he`] || '';
    };

    const filteredProducts = selectedCategory
        ? products.filter(p => p.category_id === selectedCategory)
        : products;

    if (loading) {
        return (
            <div className="min-h-[70vh] flex items-center justify-center bg-white">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-slate-400 text-sm font-medium animate-pulse">{t('common.loading')}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white min-h-screen pb-20">
            {/* Header / Title Section */}
            <div className="bg-slate-50 border-b border-gray-100 py-12 md:py-16">
                <div className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 text-center animate-fade-in-up">
                    <h1 className="text-4xl md:text-5xl font-bold font-heading text-slate-900 mb-4 tracking-tight">
                        {t('shop.title')}
                    </h1>
                    <p className="text-slate-500 max-w-lg mx-auto text-lg font-light leading-relaxed">
                        {t('shop.subtitle')}
                    </p>
                </div>
            </div>

            {/* Sticky Filter Bar */}
            <div className="sticky top-[60px] md:top-[72px] z-30 bg-white/95 backdrop-blur-md border-b border-gray-100 py-3 shadow-sm transition-all">
                <div className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                        {/* Filter Chips Container */}
                        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide w-full md:w-auto pb-1 md:pb-0 px-1 snap-x">
                            <div className="flex items-center gap-2 mx-auto">
                                <button
                                    onClick={() => setSelectedCategory(null)}
                                    className={clsx(
                                        "px-4 py-1.5 rounded-full text-sm font-bold transition-all duration-300 whitespace-nowrap snap-center border",
                                        selectedCategory === null
                                            ? "bg-primary text-white border-primary shadow-md shadow-primary/20"
                                            : "bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                                    )}
                                >
                                    {t('shop.allProducts')}
                                </button>
                                {categories.map((cat) => (
                                    <button
                                        key={cat.id}
                                        onClick={() => setSelectedCategory(cat.id)}
                                        className={clsx(
                                            "px-4 py-1.5 rounded-full text-sm font-bold transition-all duration-300 whitespace-nowrap snap-center border",
                                            selectedCategory === cat.id
                                                ? "bg-primary text-white border-primary shadow-md shadow-primary/20"
                                                : "bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                                        )}
                                    >
                                        {getLocalizedContent(cat, 'name')}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Product Grid */}
            <div className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
                {filteredProducts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-center text-slate-500 py-32 bg-slate-50 rounded-[32px] border border-dashed border-gray-200">
                        <Search className="w-16 h-16 mb-6 text-slate-300" strokeWidth={1.5} />
                        <p className="text-xl font-medium text-slate-600 mb-2">{t('shop.outOfStock') || "No products found."}</p>
                        <button onClick={() => setSelectedCategory(null)} className="mt-4 text-primary hover:underline font-bold text-sm">
                            {t('shop.resetFilters')}
                        </button>
                    </div>
                ) : (
                    <div className="grid w-full gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
                        {filteredProducts.map((product) => {
                            const displayImage = product.main_image_url ||
                                product.product_images?.[0]?.url ||
                                (Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : null);

                            const catName = categories.find(c => c.id === product.category_id)
                                ? getLocalizedContent(categories.find(c => c.id === product.category_id)!, 'name')
                                : '';

                            // Pricing logic - Using View Data with safe parsing
                            const basePrice = Number(product.price) || 0;
                            const calculatedFinalPrice = product.final_price ? Number(product.final_price) : null;
                            const discountPrice = product.discount_price ? Number(product.discount_price) : null;

                            // Determine final price: promotion > discount_price > base price
                            const finalPrice = calculatedFinalPrice || discountPrice || basePrice;

                            // Has discount only if final price is less than base price and both are valid
                            const hasDiscount = basePrice > 0 && finalPrice < basePrice;

                            // Calculate discount percentage safely
                            let discountPercent = 0;
                            if (hasDiscount && basePrice > 0) {
                                // Try to use calculated_discount_percent from view first
                                const viewDiscountPercent = product.calculated_discount_percent
                                    ? Number(product.calculated_discount_percent)
                                    : null;

                                if (viewDiscountPercent && viewDiscountPercent > 0 && viewDiscountPercent <= 100) {
                                    discountPercent = Math.round(viewDiscountPercent);
                                } else {
                                    // Calculate manually
                                    discountPercent = Math.round(((basePrice - finalPrice) / basePrice) * 100);
                                }
                            }

                            const badgeTextKey = `badge_text_${lang}` as keyof typeof product;
                            const badgeText = product[badgeTextKey] as string;

                            return (
                                <Card
                                    key={product.id}
                                    className="!p-0 border-0 bg-transparent shadow-none hover:shadow-none group flex flex-col overflow-hidden"
                                    hoverEffect={false}
                                >
                                    {/* Product Image Card - Updated Aspect Ratio & Sizing */}
                                    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[20px] bg-[#F7F8FA] border border-slate-100 shadow-sm transition-all duration-300 group-hover:shadow-md group-hover:border-slate-200 mb-4">
                                        <Link to={`/product/${product.id}`} className="block w-full h-full">
                                            {!displayImage ? (
                                                <div className="absolute inset-0 flex items-center justify-center text-slate-300">
                                                    <ShoppingCart size={40} className="opacity-20" />
                                                </div>
                                            ) : (
                                                <img
                                                    src={displayImage}
                                                    alt={getLocalizedContent(product, 'name')}
                                                    className="w-full h-full object-contain p-3 sm:p-4 transition-transform duration-500 group-hover:scale-[1.05]"
                                                    loading="lazy"
                                                />
                                            )}

                                            {/* Overlays / Badges */}
                                            <div className={clsx("absolute top-3 flex flex-col gap-2 z-10 pointer-events-none", i18n.dir() === 'rtl' ? "left-3" : "right-3")}>
                                                {product.stock_quantity <= 0 && (
                                                    <span className="bg-white/90 backdrop-blur text-red-500 px-2.5 py-1 rounded-full text-[10px] font-bold shadow-sm border border-red-100 uppercase tracking-wide">
                                                        {t('shop.outOfStock')}
                                                    </span>
                                                )}

                                                {/* Promotion Badge */}
                                                {hasDiscount && product.has_promotion && discountPercent > 0 && (
                                                    <span className="bg-gradient-to-r from-red-500 to-pink-600 text-white px-2.5 py-1 rounded-full text-[10px] font-bold shadow-md uppercase tracking-wide">
                                                        {badgeText || (
                                                            product.promotion_type === 'percent'
                                                                ? t('store.badge.discountPercent', { percent: discountPercent })
                                                                : `-${formatPrice(product.promotion_value || 0, lang)}`
                                                        )}
                                                    </span>
                                                )}
                                                {/* Regular Product Discount */}
                                                {hasDiscount && !product.has_promotion && discountPercent > 0 && (
                                                    <span className="bg-red-500 text-white px-2.5 py-1 rounded-full text-[10px] font-bold shadow-md uppercase tracking-wide">
                                                        {t('store.badge.discountPercent', { percent: discountPercent })}
                                                    </span>
                                                )}
                                            </div>
                                        </Link>

                                        {/* Wishlist Button - Top Opposite Side */}
                                        <button
                                            className={clsx(
                                                "absolute top-3 w-8 h-8 rounded-full flex items-center justify-center shadow-sm transition-all duration-300 z-20",
                                                i18n.dir() === 'rtl' ? "right-3" : "left-3",
                                                isFavorited(product.id)
                                                    ? "bg-red-50 text-red-500"
                                                    : "bg-white/80 backdrop-blur text-slate-400 hover:text-red-500 hover:bg-white"
                                            )}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                toggleWishlist(product.id);
                                            }}
                                        >
                                            <Heart size={16} fill={isFavorited(product.id) ? "currentColor" : "none"} />
                                        </button>

                                        {/* Quick Add Button - Floating */}
                                        <button
                                            className={clsx(
                                                "absolute bottom-3 right-3 w-9 h-9 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 z-20",
                                                product.stock_quantity > 0
                                                    ? "bg-white text-slate-900 hover:bg-primary hover:text-white"
                                                    : "bg-slate-100 text-slate-300 cursor-not-allowed hidden"
                                            )}
                                            disabled={product.stock_quantity <= 0}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                addToCart(product);
                                            }}
                                            title={t('shop.addToCart')}
                                        >
                                            <ShoppingCart size={16} />
                                        </button>
                                    </div>

                                    {/* Product Info */}
                                    <div className="flex-1 flex flex-col px-1">
                                        <div className="flex items-start justify-between gap-4 mb-1">
                                            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider line-clamp-1">{catName}</div>
                                        </div>

                                        <h3 className="text-base font-bold text-slate-900 mb-2 line-clamp-2 leading-tight min-h-[2.5rem] group-hover:text-primary transition-colors">
                                            <Link to={`/product/${product.id}`}>
                                                {getLocalizedContent(product, 'name')}
                                            </Link>
                                        </h3>

                                        <div className="mt-auto flex items-center justify-between">
                                            <div className="flex flex-col">
                                                {hasDiscount && basePrice > 0 ? (
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-red-500 font-bold text-lg">
                                                            {formatPrice(finalPrice, lang)}
                                                        </span>
                                                        <span className="text-slate-400 line-through text-xs font-medium decoration-slate-300">
                                                            {formatPrice(basePrice, lang)}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-900 font-bold text-lg">
                                                        {formatPrice(basePrice, lang)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>
        </div >
    );
}

// Export wrapped component
export default function Shop() {
    return (
        <ShopErrorBoundary>
            <ShopContent />
        </ShopErrorBoundary>
    );
}
