import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { Button } from "../components/ui/Button";
import { Trash2, Plus, Minus, ArrowRight, ArrowLeft, ShoppingBag, ShieldCheck } from "lucide-react";
import type { Product } from "../types";
import Card from "../components/ui/Card";
import clsx from "clsx";
import { formatPrice } from "../lib/utils";

export default function Cart() {
    const { t, i18n } = useTranslation();
    const { items, removeFromCart, updateQuantity, cartTotal } = useCart();
    const isRtl = i18n.language === "ar" || i18n.language === "he";
    const Arrow = isRtl ? ArrowLeft : ArrowRight;
    const lang = (i18n.language || 'en') as 'he' | 'ar' | 'en';

    const getLocalizedName = (product: Product) => {
        const key = `name_${lang}` as keyof Product;
        // @ts-ignore - dynamic key access
        return (product[key] as string) || product.name_en || product.name_he || '';
    };

    if (items.length === 0) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 text-center bg-white">
                <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center text-slate-300 mb-8 shadow-sm border border-slate-100">
                    <ShoppingBag size={48} strokeWidth={1.5} />
                </div>
                <h2 className="text-3xl font-bold text-slate-900 mb-3 tracking-tight">
                    {t("cart.emptyTitle")}
                </h2>
                <p className="text-slate-500 mb-10 max-w-sm text-lg font-light leading-relaxed">
                    {t("cart.emptyMessage")}
                </p>
                <Link to="/shop">
                    <Button size="lg" className="rounded-full px-10 py-4 shadow-xl shadow-primary/20">
                        {t("cart.continueShopping")}
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-white min-h-screen pb-20">
            {/* Header */}
            <div className="bg-slate-50 border-b border-slate-100 py-12 mb-8">
                <div className="container mx-auto px-4 max-w-[1280px]">
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-900 font-heading tracking-tight flex items-center gap-3">
                        {t("cart.title")}
                        <span className="text-sm font-normal text-slate-500 self-end mb-1">
                            {t("cart.itemsCount", { count: items.length })}
                        </span>
                    </h1>
                </div>
            </div>

            <div className="container mx-auto px-4 max-w-[1280px]">
                <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">
                    {/* Cart Items List */}
                    <div className="lg:col-span-8 space-y-4">
                        {items.map(({ product, quantity }) => {
                            const displayImage = product.main_image_url ||
                                product.product_images?.[0]?.url ||
                                (Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : null);

                            return (
                                <Card
                                    key={product.id}
                                    className="p-4 sm:p-6 flex flex-col sm:flex-row gap-6 items-center group transition-all duration-300 hover:shadow-lg border-slate-100 rounded-[24px]"
                                >
                                    {/* Image */}
                                    <div className="w-32 h-32 bg-[#F7F8FA] rounded-2xl overflow-hidden shrink-0 border border-slate-100 relative">
                                        {displayImage ? (
                                            <img
                                                src={displayImage}
                                                alt={getLocalizedName(product)}
                                                className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                <ShoppingBag size={24} className="opacity-20" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Details */}
                                    <div className="flex-1 text-center sm:text-start min-w-0 flex flex-col justify-center h-full w-full">
                                        <h3 className="font-bold text-lg text-slate-900 truncate mb-1">
                                            {getLocalizedName(product)}
                                        </h3>
                                        <div className="flex items-center justify-center sm:justify-start gap-3 mb-4 sm:mb-0">
                                            <span className="text-slate-900 font-bold text-xl">
                                                {formatPrice(product.discount_price || product.price, lang)}
                                            </span>
                                            {product.discount_price && (
                                                <span className="text-slate-400 text-sm line-through decoration-slate-400/50">
                                                    {formatPrice(product.price, lang)}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Right Side: Controls */}
                                    <div className="flex flex-col items-center gap-4 sm:items-end w-full sm:w-auto">
                                        {/* Quantity Controls */}
                                        <div className="flex items-center gap-2 bg-slate-50 rounded-xl p-1.5 border border-slate-200">
                                            <button
                                                onClick={() => updateQuantity(product.id, quantity - 1)}
                                                className="w-8 h-8 flex items-center justify-center rounded-lg bg-white shadow-sm text-slate-600 hover:text-primary disabled:opacity-50 transition-colors"
                                                disabled={quantity <= 1}
                                            >
                                                <Minus size={14} />
                                            </button>
                                            <span className="text-sm font-bold w-8 text-center text-slate-900 tabular-nums">{quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(product.id, quantity + 1)}
                                                className="w-8 h-8 flex items-center justify-center rounded-lg bg-white shadow-sm text-slate-600 hover:text-primary transition-colors"
                                                disabled={quantity >= (product.stock_quantity || 10)}
                                            >
                                                <Plus size={14} />
                                            </button>
                                        </div>

                                        {/* Remove */}
                                        <button
                                            onClick={() => removeFromCart(product.id)}
                                            className="text-xs text-slate-400 hover:text-red-500 font-medium transition-colors flex items-center gap-1 group/trash"
                                            title={t("common.remove")}
                                        >
                                            <Trash2 size={14} className="group-hover/trash:scale-110 transition-transform" />
                                            <span>{t("common.remove")}</span>
                                        </button>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-4">
                        <div className="sticky top-24">
                            <Card className="p-8 border-slate-100 shadow-xl shadow-slate-200/50 rounded-[28px] bg-white">
                                <h3 className="font-bold text-xl mb-6 text-slate-900 border-b border-slate-100 pb-4">
                                    {t("cart.summary")}
                                </h3>

                                <div className="space-y-4 mb-8">
                                    <div className="flex justify-between text-slate-500 font-medium text-sm">
                                        <span>{t("cart.subtotal")}</span>
                                        <span className="text-slate-900">{formatPrice(cartTotal, lang)}</span>
                                    </div>
                                    <div className="flex justify-between text-slate-500 font-medium text-sm">
                                        <span>{t("cart.shipping")}</span>
                                        <span className="text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded text-[10px] uppercase tracking-wider border border-green-100">{t("cart.free")}</span>
                                    </div>
                                    <div className="border-t border-dashed border-slate-200 pt-6 flex justify-between items-end">
                                        <span className="font-bold text-lg text-slate-900">{t("cart.total")}</span>
                                        <div className="text-end">
                                            <span className="block text-3xl font-bold text-slate-900 leading-none tracking-tight">{formatPrice(cartTotal, lang)}</span>
                                        </div>
                                    </div>
                                </div>

                                <Link to="/checkout" className="block mb-6">
                                    <Button size="lg" className="w-full py-5 text-lg rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 flex items-center justify-center gap-2 font-bold group bg-primary text-white h-auto">
                                        {t("cart.checkout")}
                                        <Arrow size={20} className={clsx("transition-transform", isRtl ? "group-hover:-translate-x-1" : "group-hover:translate-x-1")} />
                                    </Button>
                                </Link>

                                <div className="flex items-center justify-center gap-2 text-xs text-slate-400 font-medium bg-slate-50 py-3 rounded-xl border border-slate-100">
                                    <ShieldCheck size={14} className="text-primary" />
                                    <span>{t("cart.secureCheckout")}</span>
                                </div>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
