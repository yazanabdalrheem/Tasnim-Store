import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ArrowLeft, ArrowRight, Star, ShieldCheck, Glasses, Eye, CheckCircle2, Award, Clock, ThumbsUp, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import { useContent } from "../context/ContentContext";
import Card from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import HeroRing from "../components/home/HeroRing";
import { supabase } from "../lib/supabase";
import { calculateDiscountedPrice, formatPrice } from "../lib/utils";
import clsx from "clsx";
import type { Product } from "../types";

export default function Home() {
    const { t, i18n } = useTranslation();
    const { getContent, loading } = useContent();
    const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
    const [hotDeals, setHotDeals] = useState<{ product: Product, percent: number }[]>([]);

    const isRtl = i18n.dir() === 'rtl';
    const Arrow = isRtl ? ArrowLeft : ArrowRight;

    useEffect(() => {
        async function fetchFeatured() {
            try {
                const { data, error } = await supabase
                    .from('products')
                    .select('*')
                    .eq('is_active', true)
                    .order('created_at', { ascending: false })
                    .limit(4);

                if (!error && data) {
                    setFeaturedProducts(data);
                }
            } catch (err) {
                console.error("Failed to fetch featured products", err);
            }
        }

        async function fetchHotDeals() {
            try {
                // Fetch active promotions and their products
                const { data, error } = await supabase
                    .from('promotions')
                    .select('*, products:promotion_products(product:products(*))')
                    .eq('is_active', true)
                    .eq('type', 'percent') // Only fetch percentage-based promotions for deals
                    .gt('end_at', new Date().toISOString());

                if (!error && data) {
                    const deals: { product: Product, percent: number }[] = [];
                    data.forEach((promo: any) => {
                        promo.products?.forEach((item: any) => {
                            if (item.product) {
                                // Use promo.value (which is the percentage for type='percent')
                                const discountPercent = Number(promo.value) || 0;

                                // Only add if discount is valid
                                if (discountPercent > 0 && discountPercent <= 100) {
                                    // Check if product already exists with better discount
                                    const existing = deals.findIndex(d => d.product.id === item.product.id);
                                    if (existing >= 0) {
                                        if (discountPercent > deals[existing].percent) {
                                            deals[existing].percent = discountPercent;
                                        }
                                    } else {
                                        deals.push({ product: item.product, percent: discountPercent });
                                    }
                                }
                            }
                        });
                    });
                    setHotDeals(deals.slice(0, 8)); // Limit to 8 hot deals
                }
            } catch (err) {
                console.error("Failed to fetch hot deals", err);
            }
        }

        fetchFeatured();
        fetchHotDeals();
    }, []);

    const getLocalizedProductName = (p: Product) => {
        if (i18n.language === 'he') return p.name_he;
        if (i18n.language === 'ar') return p.name_ar || p.name_he;
        return p.name_en || p.name_he;
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-white">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="pb-16 bg-white overflow-hidden">
            {/* Announcement Banner */}
            {getContent('home.banner.text') && (
                <div className="bg-gray-50 border-b border-gray-100 text-center py-2.5 px-4 text-xs font-semibold text-slate-600 tracking-wide">
                    <span className="inline-flex items-center gap-2">
                        {getContent('home.banner.text')}
                        <Arrow size={12} className="text-primary" />
                    </span>
                </div>
            )}

            {/* Hero Section */}
            <section className="relative pt-8 pb-16 md:pt-16 md:pb-24">
                {/* Hero Ring Effect */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0 pointer-events-none opacity-60">
                    <HeroRing />
                </div>

                <div className="container mx-auto px-4 grid md:grid-cols-2 gap-10 lg:gap-16 items-center relative z-10 max-w-7xl">
                    {/* Text Content */}
                    <div className="space-y-6 text-center md:text-start animate-slide-up order-2 md:order-1">
                        <div className="inline-block">
                            <div className="px-4 py-1.5 rounded-full bg-blue-50/50 border border-blue-100 text-primary mb-2 text-xs font-bold tracking-widest uppercase flex items-center gap-2 w-fit mx-auto md:mx-0">
                                {t("hero.badge")}
                            </div>
                        </div>

                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold font-heading leading-[1.05] text-slate-900 tracking-tight">
                            {t("hero.title")}
                        </h1>

                        <p className="text-lg md:text-xl text-slate-500 font-light max-w-lg mx-auto md:mx-0 leading-relaxed">
                            {t("hero.subtitle")}
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start pt-4">
                            <Link to="/book-exam" className="w-full sm:w-auto">
                                <Button size="lg" className="w-full sm:px-10 py-3.5 text-lg shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all duration-300">
                                    {t("hero.bookBtn")}
                                </Button>
                            </Link>
                            <Link to="/shop" className="w-full sm:w-auto">
                                <Button variant="outline" size="lg" className="w-full sm:px-10 py-3.5 text-lg border-2 hover:bg-slate-50 transition-all duration-300">
                                    {t("hero.shopBtn")}
                                </Button>
                            </Link>
                        </div>

                        <div className="pt-6 flex flex-wrap justify-center md:justify-start gap-8 text-sm text-slate-500 font-medium">
                            <div className="flex items-center gap-2">
                                <CheckCircle2 size={18} className="text-primary" />
                                <span>{t("home.whyUs.benefit1.title")}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle2 size={18} className="text-primary" />
                                <span>{t("hero.authentic")}</span>
                            </div>
                        </div>
                    </div>

                    {/* Premium Visuals - Real Image Clean */}
                    <div className="relative group px-4 md:px-0 order-1 md:order-2 flex justify-center">
                        <div className="relative w-full max-w-md aspect-square rounded-[32px] overflow-hidden shadow-2xl shadow-slate-200 border border-slate-100 bg-white">
                            {/* Real Image loaded lazily */}
                            <img
                                src="https://images.unsplash.com/photo-1577803645773-f96470509666?q=80&w=1000&auto=format&fit=crop"
                                alt="Premium Eyewear"
                                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                                loading="eager"
                            />

                            {/* Floating Card 1: Fast Booking */}
                            <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-white/50 flex items-center gap-3 animate-float-delayed z-20 max-w-[200px]">
                                <div className="w-8 h-8 rounded-full bg-green-50 text-green-600 flex items-center justify-center shrink-0">
                                    <Clock size={16} />
                                </div>
                                <div>
                                    <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{t("hero.fastBooking")}</div>
                                    <div className="text-xs font-bold text-slate-900 leading-tight">{t("hero.seconds")}</div>
                                </div>
                            </div>

                            {/* Floating Card 2: Rating */}
                            <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-white/50 flex flex-col items-center gap-1 z-10 w-32 justify-center animate-float">
                                <div className="text-2xl font-bold text-slate-900">{t("hero.rating")}</div>
                                <div className="flex text-yellow-400 gap-0.5">
                                    {[1, 2, 3, 4, 5].map(i => <Star key={i} size={12} fill="currentColor" strokeWidth={0} />)}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Products Section (NEW) */}
            {featuredProducts.length > 0 && (
                <section className="py-16 bg-slate-50">
                    <div className="container mx-auto px-4 max-w-7xl">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl md:text-3xl font-bold text-slate-900">{t("home.featured")}</h2>
                            <Link to="/shop" className="text-primary font-medium hover:underline flex items-center gap-1">
                                {t("home.viewAll")} <Arrow size={16} />
                            </Link>
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                            {featuredProducts.map((product) => (
                                <Link to={`/product/${product.id}`} key={product.id} className="group block h-full">
                                    <Card hoverEffect className="h-full flex flex-col p-4 border-slate-100 bg-white shadow-sm hover:shadow-md transition-all">
                                        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[20px] bg-[#F7F8FA] border border-slate-100 flex items-center justify-center mb-4">
                                            {product.main_image_url ? (
                                                <img
                                                    src={product.main_image_url}
                                                    alt={getLocalizedProductName(product)}
                                                    className="w-full h-full object-contain p-3 sm:p-4 transition-transform duration-500 group-hover:scale-[1.05]"
                                                    loading="lazy"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                    <Glasses size={48} strokeWidth={1} className="opacity-20" />
                                                </div>
                                            )}

                                            {/* Quick Action Button */}
                                            <div className="absolute bottom-2 right-2 translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                                                <div className="bg-white p-2 rounded-full shadow-lg text-primary hover:bg-primary hover:text-white">
                                                    <ShoppingBag size={18} />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col flex-grow">
                                            <h3 className="font-bold text-slate-900 mb-1 line-clamp-1 group-hover:text-primary transition-colors">
                                                {getLocalizedProductName(product)}
                                            </h3>
                                            <div className="mt-auto flex items-center justify-between pt-2">
                                                <div className="flex flex-col">
                                                    {product.discount_price ? (
                                                        <>
                                                            <span className="text-xs text-slate-400 line-through">
                                                                {formatPrice(product.price, i18n.language as any)}
                                                            </span>
                                                            <span className="font-bold text-red-500">
                                                                {formatPrice(product.discount_price, i18n.language as any)}
                                                            </span>
                                                        </>
                                                    ) : (
                                                        <span className="font-bold text-slate-900">
                                                            {formatPrice(product.price, i18n.language as any)}
                                                        </span>
                                                    )}
                                                </div>
                                                <Button size="sm" variant="outline" className="text-xs h-8 px-3 rounded-full hover:bg-primary hover:text-white hover:border-primary">
                                                    {t("home.viewProduct")}
                                                </Button>
                                            </div>
                                        </div>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Hot Deals Section - Display if exists */}
            {hotDeals.length > 0 && (
                <section className="py-16 bg-red-50/50 border-y border-red-50">
                    <div className="container mx-auto px-4 max-w-7xl">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-2">
                                <span className="bg-red-500 text-white p-1 rounded-lg"><Award size={20} /></span>
                                {t("store.section.hotDeals")}
                            </h2>
                            <Link to="/shop" className="text-red-500 font-medium hover:underline flex items-center gap-1">
                                {t("store.section.viewAllDeals")} <Arrow size={16} />
                            </Link>
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                            {hotDeals.map(({ product, percent }) => {
                                // Safe price parsing
                                const basePrice = Number(product.price) || 0;
                                const discountedPrice = calculateDiscountedPrice(basePrice, percent);
                                const validPercent = Math.round(Number(percent) || 0);

                                // Only show if we have valid prices
                                if (basePrice <= 0) return null;

                                return (
                                    <Link to={`/product/${product.id}`} key={product.id} className="group block h-full">
                                        <Card hoverEffect className="h-full flex flex-col p-4 border-red-100 bg-white shadow-sm hover:shadow-md transition-all">
                                            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[20px] bg-[#F7F8FA] border border-slate-100 flex items-center justify-center mb-4">
                                                {product.main_image_url ? (
                                                    <img
                                                        src={product.main_image_url}
                                                        alt={getLocalizedProductName(product)}
                                                        className="w-full h-full object-contain p-3 sm:p-4 transition-transform duration-500 group-hover:scale-[1.05]"
                                                        loading="lazy"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                        <Glasses size={48} strokeWidth={1} className="opacity-20" />
                                                    </div>
                                                )}

                                                {validPercent > 0 && (
                                                    <div className={clsx("absolute top-2 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-md uppercase tracking-wide z-10", i18n.dir() === 'rtl' ? "left-2" : "right-2")}>
                                                        {t('store.badge.discountPercent', { percent: validPercent })}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex flex-col flex-grow">
                                                <h3 className="font-bold text-slate-900 mb-1 line-clamp-1 group-hover:text-primary transition-colors">
                                                    {getLocalizedProductName(product)}
                                                </h3>
                                                <div className="mt-auto flex items-center justify-between pt-2">
                                                    <div className="flex flex-col">
                                                        <span className="text-xs text-slate-400 line-through">
                                                            {formatPrice(basePrice, i18n.language as any)}
                                                        </span>
                                                        <span className="font-bold text-red-500 text-lg">
                                                            {formatPrice(discountedPrice, i18n.language as any)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                        </Card>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </section>
            )}

            {/* Services Section */}
            <section className="py-16 bg-white">
                <div className="container mx-auto px-4 max-w-7xl">
                    <div className="text-center mb-12 max-w-2xl mx-auto">
                        <span className="text-primary font-bold tracking-wider text-xs uppercase mb-3 block">{t("home.services.title")}</span>
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 tracking-tight">
                            {t("home.services.subtitle")}
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                        {[
                            { icon: Eye, titleKey: 'eyeExam', link: '/book-exam' },
                            { icon: Glasses, titleKey: 'eyewear', link: '/shop' },
                            { icon: ShieldCheck, titleKey: 'fitting', link: '/book-exam' }
                        ].map((service, i) => (
                            <Card key={i} hoverEffect className="p-8 flex flex-col items-center text-center group border-transparent hover:border-primary/10 transition-all duration-500 bg-slate-50/50 hover:bg-white">
                                <div className="w-14 h-14 bg-white border border-slate-100 rounded-2xl flex items-center justify-center mb-6 text-primary group-hover:scale-110 group-hover:shadow-md transition-all duration-300 shadow-sm">
                                    <service.icon size={28} strokeWidth={1.5} />
                                </div>
                                <h3 className="text-xl font-bold mb-3 text-slate-900">
                                    {t(`home.services.${service.titleKey}.title`)}
                                </h3>
                                <p className="text-slate-500 text-sm leading-relaxed mb-6">
                                    {t(`home.services.${service.titleKey}.desc`)}
                                </p>
                                <div className="mt-auto">
                                    <Link to={service.link} className="text-sm font-bold text-primary flex items-center gap-1 group-hover:gap-2 transition-all">
                                        {t("common.view")} <Arrow size={14} />
                                    </Link>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Why Tasnim - Benefits */}
            <section className="py-16 overflow-hidden bg-[var(--color-background)]">
                <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 lg:gap-16 items-center max-w-7xl">
                    <div className="order-2 md:order-1 relative">
                        {/* Real Image for Benefits */}
                        <div className="aspect-[4/3] rounded-[32px] overflow-hidden relative shadow-xl border border-white/50">
                            <img
                                src="https://images.unsplash.com/photo-1589733955941-5eeaf752f6dd?q=80&w=1000&auto=format&fit=crop"
                                alt="Professional Optometrist"
                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                                loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent"></div>

                            <div className="absolute bottom-6 left-6 right-6">
                                <div className="bg-white/95 backdrop-blur rounded-2xl p-4 shadow-lg flex items-center gap-4">
                                    <div className="w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center shrink-0">
                                        <Award size={20} />
                                    </div>
                                    <div>
                                        <div className="font-bold text-slate-900 text-sm">Premium Quality</div>
                                        <div className="text-slate-500 text-xs">Certified Excellence</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="order-1 md:order-2 space-y-6">
                        <div>
                            <span className="text-primary font-bold tracking-wider text-xs uppercase block mb-2">{t("home.whyUs.title")}</span>
                            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-slate-900 leading-tight">
                                {t("home.whyUs.subtitle")}
                            </h2>
                            <p className="text-slate-500 text-base md:text-lg font-light leading-relaxed">
                                {t("home.whyUs.desc")}
                            </p>
                        </div>

                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex gap-4 group p-4 rounded-2xl border border-transparent hover:border-primary/10 hover:shadow-md transition-all duration-300 bg-white/50 hover:bg-white">
                                    <div className="w-10 h-10 rounded-full bg-white border border-slate-100 flex items-center justify-center text-primary shrink-0 font-bold text-sm shadow-sm">
                                        {i}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg text-slate-900 mb-1">{t(`home.whyUs.benefit${i}.title`)}</h4>
                                        <p className="text-slate-500 text-sm leading-relaxed">{t(`home.whyUs.benefit${i}.desc`)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials - Single Premium Hebrew-Friendly Card */}
            <section className="py-20 bg-white relative overflow-hidden">
                <div className="container mx-auto px-4 relative z-10 max-w-3xl text-center">
                    <div className="mb-10">
                        <span className="text-primary font-bold tracking-wider text-xs uppercase mb-2 block">{t("home.testimonials.title")}</span>
                    </div>

                    <div className="bg-slate-50 p-8 md:p-12 rounded-[32px] relative border border-slate-100">
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-white text-primary w-12 h-12 rounded-full flex items-center justify-center shadow-lg border border-slate-50">
                            <ThumbsUp size={20} />
                        </div>

                        <div className="flex gap-1 text-[var(--color-accent)] justify-center mb-6 mt-2">
                            {[1, 2, 3, 4, 5].map(s => <Star key={s} size={20} fill="currentColor" className="stroke-none" />)}
                        </div>

                        <p className="text-slate-700 mb-8 leading-relaxed text-xl md:text-2xl font-light italic">
                            "{t("home.testimonials.text")}"
                        </p>

                        <div className="flex flex-col items-center">
                            <div className="font-bold text-slate-900 text-lg">
                                {i18n.language === 'en' ? 'Sarah L.' : 'שרה ל.'}
                            </div>
                            <div className="text-[10px] text-green-600 font-bold uppercase tracking-wider bg-green-50 px-3 py-1 rounded-full mt-2 border border-green-100 flex items-center gap-1">
                                <CheckCircle2 size={10} />
                                {i18n.language === 'en' ? 'Verified Client' : 'לקוחה מאומתת'}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div >
    );
}

