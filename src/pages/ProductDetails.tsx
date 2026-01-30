import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "../lib/supabase";
import { useCart } from "../context/CartContext";
import { Button } from "../components/ui/Button";
import { Minus, Plus, ShoppingBag, Check, Info, Heart, Edit2, X } from "lucide-react";
import type { Product, RxCartMetadata } from "../types";
import { useToast } from "../context/ToastContext";
import Card from "../components/ui/Card";
import clsx from "clsx";
import { useWishlist } from "../hooks/useWishlist";
import { formatPrice } from "../lib/utils";
import RxSelectionModal from "../components/product/RxSelectionModal";
import { LENS_PACKAGES } from "../lib/rxConstants";

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

    // --- Simplified Rx Flow State ---
    const [rxChoice, setRxChoice] = useState<'frame_only' | 'with_lenses'>('frame_only');
    const [isRxModalOpen, setIsRxModalOpen] = useState(false);
    const [selectedPackageForModal, setSelectedPackageForModal] = useState<string | null>(null);

    // Metadata holds the result from the modal
    const [rxMetadata, setRxMetadata] = useState<RxCartMetadata | null>(null);

    const lang = (i18n.language || 'en') as 'he' | 'ar' | 'en';
    const isRTL = lang === 'he' || lang === 'ar';

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
        // Reset State on product change
        setRxChoice('frame_only');
        setRxMetadata(null);
        setSelectedImageIndex(0);
        fetchProduct();
        window.scrollTo(0, 0);
    }, [id]);

    const fetchProduct = async () => {
        try {
            if (!id) return;
            setLoading(true);
            const { data, error } = await supabase
                .from("products_view")
                .select("*, category:category_id(*), product_images(*)")
                .eq("id", id)
                .single();

            if (error) throw error;
            if (data && data.product_images) {
                data.product_images.sort((a: any, b: any) => a.sort_order - b.sort_order);
            }
            setProduct(data);

            if (data?.category_id) {
                const { data: related } = await supabase
                    .from("products")
                    .select("*, product_images(*)")
                    .eq("category_id", data.category_id)
                    .neq("id", data.id)
                    .limit(4);
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

    const getRxEligible = () => {
        if (!product) return false;
        // Strict toggle: only use requires_lenses
        // Default to false if undefined (e.g. migration pending)
        return !!product.requires_lenses;
    };

    const handleAddToCart = (e?: React.MouseEvent) => {
        if (e) {
            e.stopPropagation();
            e.preventDefault();
        }
        if (!product) return;

        // Validation for Rx
        if (getRxEligible() && rxChoice === 'with_lenses') {
            if (!rxMetadata) {
                // If they chose lenses but haven't selected yet, open modal
                setIsRxModalOpen(true);
                return;
            }
            addToCart(product, quantity, rxMetadata);
            addToast(t("cart.added"), "success");
        } else {
            // Frame Only
            addToCart(product, quantity, { with_lenses: false });
            addToast(t("cart.added"), "success");
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

    // Price Calculations
    const basePrice = Number(product.price) || 0;
    const finalPrice = (product.final_price ? Number(product.final_price) : null) || (product.discount_price ? Number(product.discount_price) : null) || basePrice;

    // Total Price with Addons
    const lensAddonPrice = (rxChoice === 'with_lenses' && rxMetadata) ? (rxMetadata.lens_price_addon || 0) : 0;
    const totalPrice = finalPrice + lensAddonPrice;

    return (
        <div className="bg-white min-h-screen pb-20">
            {/* Navbar / Header spacing if needed */}

            <div className="container mx-auto px-4 py-8 max-w-7xl">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
                    {/* --- LEFT COLUMN: IMAGES --- */}
                    <div className="space-y-4">
                        <div className="aspect-[4/3] bg-[#F7F8FA] rounded-[32px] overflow-hidden border border-slate-100 relative group">
                            {displayImage ? (
                                <img src={displayImage} alt={getLocalizedName(product)} className="w-full h-full object-contain" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-300"><ShoppingBag size={64} /></div>
                            )}
                        </div>
                        {/* Thumbnails */}
                        {uniqueImages.length > 1 && (
                            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide snap-x">
                                {uniqueImages.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedImageIndex(idx)}
                                        className={clsx("w-20 h-20 rounded-2xl border-2 shrink-0 bg-[#F7F8FA]", selectedImageIndex === idx ? "border-primary" : "border-transparent opacity-60")}
                                    >
                                        <img src={img} alt="" className="w-full h-full object-contain" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* --- RIGHT COLUMN: DETAILS & RX FLOW --- */}
                    <div className="flex flex-col">
                        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2 font-heading">{getLocalizedName(product)}</h1>

                        {/* Price Display */}
                        <div className="flex items-end gap-3 mb-6 border-b border-slate-50 pb-6">
                            <span className="text-4xl font-bold text-slate-900">{formatPrice(finalPrice, lang)}</span>
                            {basePrice > finalPrice && (
                                <span className="text-xl text-slate-400 line-through mb-1.5">{formatPrice(basePrice, lang)}</span>
                            )}
                        </div>

                        <div className="prose prose-slate prose-lg text-slate-500 mb-8 leading-relaxed max-w-none">
                            <p>{getLocalizedDescription(product)}</p>
                        </div>

                        {/* --- SIMPLIFIED RX SECTION --- */}
                        {getRxEligible() && (
                            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 mb-8 space-y-6">
                                {/* 1. Simplified Choice Radio */}
                                <div>
                                    <h3 className="font-bold text-slate-900 mb-3 text-lg flex items-center gap-2">
                                        <Info size={18} className="text-primary" />
                                        {t('product.needLensesQuestion', 'Do you need prescription lenses?')}
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <label className={clsx("cursor-pointer border-2 rounded-xl p-4 flex items-center gap-3 transition-all", rxChoice === 'frame_only' ? "border-primary bg-primary/5" : "border-slate-200 bg-white hover:border-slate-300")}>
                                            <input type="radio" name="rxChoice" value="frame_only" checked={rxChoice === 'frame_only'} onChange={() => { setRxChoice('frame_only'); setRxMetadata(null); }} className="w-5 h-5 text-primary focus:ring-primary" />
                                            <span className="font-medium text-slate-900">{t('product.frameOnly', 'Frame Only (No Lenses)')}</span>
                                        </label>
                                        <label className={clsx("cursor-pointer border-2 rounded-xl p-4 flex items-center gap-3 transition-all", rxChoice === 'with_lenses' ? "border-primary bg-primary/5" : "border-slate-200 bg-white hover:border-slate-300")}>
                                            <input type="radio" name="rxChoice" value="with_lenses" checked={rxChoice === 'with_lenses'} onChange={() => setRxChoice('with_lenses')} className="w-5 h-5 text-primary focus:ring-primary" />
                                            <span className="font-medium text-slate-900">{t('product.withPrescriptionLenses', 'With Prescription Lenses')}</span>
                                        </label>
                                    </div>
                                </div>

                                {/* 2. Package List (Only if 'with_lenses') */}
                                {rxChoice === 'with_lenses' && (
                                    <div className="animate-in fade-in slide-in-from-top-4 space-y-4">
                                        <h4 className="font-bold text-slate-900">{t('lenses.selectPackageTitle', 'Select Lenses Package')}</h4>

                                        {!rxMetadata ? (
                                            <div className="space-y-3">
                                                {LENS_PACKAGES.map((pkg) => {
                                                    const price = pkg.price_addon;
                                                    return (
                                                        <div key={pkg.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-slate-200 rounded-xl bg-white hover:border-primary/30 transition-all">
                                                            <div className="flex-1">
                                                                <div className="flex justify-between items-center mb-1">
                                                                    <span className="font-bold text-slate-900 text-lg">{lang === 'ar' ? pkg.label_ar : (lang === 'he' ? pkg.label_he : pkg.label_en)}</span>
                                                                    <span className="font-bold text-primary">{price > 0 ? `+${price}₪` : t('rxModal.help.free', 'Free')}</span>
                                                                </div>
                                                                <p className="text-sm text-slate-500">{lang === 'ar' ? pkg.description_ar : (lang === 'he' ? pkg.description_he : pkg.description_en)}</p>
                                                            </div>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => {
                                                                    setSelectedPackageForModal(pkg.id);
                                                                    setIsRxModalOpen(true);
                                                                }}
                                                                className="shrink-0 whitespace-nowrap"
                                                            >
                                                                <Edit2 size={16} className={isRTL ? "ml-2" : "mr-2"} />
                                                                {t('lenses.chooseDetails', 'Choose Lenses Details')}
                                                            </Button>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            /* Summary Card if already selected */
                                            <div className="bg-white border text-left border-primary/20 rounded-xl p-4 shadow-sm relative animate-in fade-in">
                                                <button onClick={() => setRxMetadata(null)} className="absolute top-4 right-4 text-slate-400 hover:text-red-500"><X size={18} /></button>
                                                <div className="flex items-start gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0">
                                                        <Check size={20} />
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-slate-900 mb-1">{rxMetadata.lens_package_label}</div>
                                                        <div className="text-sm text-slate-500">
                                                            {rxMetadata.rx_method === 'upload' && t('rx.method.upload', 'Uploaded Prescription')}
                                                            {rxMetadata.rx_method === 'manual' && `${t('rx.od')} ${rxMetadata.rx_manual?.od_sph} | ${t('rx.os')} ${rxMetadata.rx_manual?.os_sph}`}
                                                        </div>
                                                        <div className="text-primary font-bold text-sm mt-1">
                                                            {rxMetadata.lens_price_addon && rxMetadata.lens_price_addon > 0 ? `+${formatPrice(rxMetadata.lens_price_addon, lang)}` : 'Free'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* --- PRICE BREAKDOWN & ADD TO CART --- */}
                        <div className="bg-white border-t border-slate-100 pt-6 mt-auto">

                            {/* Breakdown */}
                            {rxChoice === 'with_lenses' && (
                                <div className="mb-6 bg-slate-50 p-4 rounded-xl space-y-2 text-sm">
                                    <div className="flex justify-between text-slate-600">
                                        <span>Frame</span>
                                        <span>{formatPrice(finalPrice, lang)}</span>
                                    </div>
                                    {rxMetadata && (
                                        <div className="flex justify-between font-medium text-slate-900">
                                            <span>Lens: {rxMetadata.lens_package_label}</span>
                                            <span>{rxMetadata.lens_price_addon && rxMetadata.lens_price_addon > 0 ? `+${formatPrice(rxMetadata.lens_price_addon, lang)}` : t('rx.free', 'Free')}</span>
                                        </div>
                                    )}
                                    <div className="border-t border-slate-200 pt-2 flex justify-between font-bold text-lg text-slate-900">
                                        <span>Total</span>
                                        <span>{formatPrice(totalPrice, lang)}</span>
                                    </div>
                                </div>
                            )}

                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 p-1 w-full sm:w-auto">
                                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-12 h-12 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-white rounded-lg transition-all shadow-sm"><Minus size={18} /></button>
                                    <span className="w-12 text-center font-bold text-lg text-slate-900 tabular-nums">{quantity}</span>
                                    <button onClick={() => setQuantity(Math.min(product.stock_quantity || 10, quantity + 1))} className="w-12 h-12 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-white rounded-lg transition-all shadow-sm"><Plus size={18} /></button>
                                </div>

                                <Button size="lg" className="flex-1 py-4 text-lg rounded-xl shadow-xl shadow-primary/20 hover:shadow-primary/40 font-bold h-14" onClick={handleAddToCart} disabled={product.stock_quantity === 0}>
                                    <ShoppingBag className={clsx("w-5 h-5", isRTL ? "ml-2" : "mr-2")} />
                                    {product.stock_quantity === 0 ? t("shop.outOfStock") : (
                                        rxChoice === 'with_lenses' ? `${t('product.addToCart')} (${formatPrice(totalPrice, lang)})` : t("product.addToCart")
                                    )}
                                </Button>

                                <button onClick={() => product && toggleWishlist(product.id)} className={clsx("h-14 w-14 flex items-center justify-center rounded-xl border transition-all shrink-0", isFavorited(product.id) ? "bg-red-50 border-red-200 text-red-500" : "border-slate-200 text-slate-400 hover:text-red-50 hover:bg-red-50 hover:border-red-100")}>
                                    <Heart size={24} fill={isFavorited(product.id) ? "currentColor" : "none"} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Related Products */}
                {relatedProducts.length > 0 && (
                    <div className="mt-24 border-t border-slate-100 pt-16">
                        <h2 className="text-3xl font-bold text-slate-900 mb-10 text-center font-heading">{t('product.youMightAlsoLike')}</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {relatedProducts.map((rel) => {
                                const relImage = rel.main_image_url || rel.product_images?.[0]?.url || (Array.isArray(rel.images) ? rel.images[0] : null);
                                return (
                                    <Link to={`/product/${rel.id}`} key={rel.id} className="group block">
                                        <Card className="h-full border-slate-100 hover:shadow-xl transition-all duration-300 rounded-[24px] overflow-hidden !p-0">
                                            <div className="aspect-[4/5] bg-[#F7F8FA] relative overflow-hidden p-6 border-b border-slate-50">
                                                {relImage ? <img src={relImage} alt="" className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105" /> : <div className="w-full h-full flex items-center justify-center text-slate-300"><ShoppingBag size={32} /></div>}
                                            </div>
                                            <div className="p-4 text-center">
                                                <h3 className="font-bold text-slate-900 mb-2 truncate group-hover:text-primary transition-colors">{getLocalizedName(rel)}</h3>
                                                <div className="text-primary font-bold">{formatPrice(rel.discount_price || rel.price, lang)}</div>
                                            </div>
                                        </Card>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {isRxModalOpen && (
                <RxSelectionModal
                    isOpen={isRxModalOpen}
                    onClose={() => setIsRxModalOpen(false)}
                    onSave={setRxMetadata}
                    currentMetadata={rxMetadata || undefined}
                    initialPackageId={selectedPackageForModal || undefined}
                />
            )}
        </div>
    );
}
