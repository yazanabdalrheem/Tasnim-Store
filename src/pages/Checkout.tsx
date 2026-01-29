import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useCart } from "../context/CartContext";
import { supabase } from "../lib/supabase";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { CheckCircle, AlertCircle, ShoppingBag, Lock, CreditCard, Tag, X, Wallet, Banknote } from "lucide-react";
import { useToast } from "../context/ToastContext";
import Card from "../components/ui/Card";
import { Link } from "react-router-dom";
import clsx from "clsx";

export default function Checkout() {
    const { t, i18n } = useTranslation();
    const { items, cartTotal, clearCart } = useCart();
    const { addToast } = useToast();
    const isRTL = i18n.dir() === 'rtl';

    // State
    const [formData, setFormData] = useState({
        fullName: "",
        phone: "",
        email: "",
        address: "",
        city: "",
        notes: "",
    });

    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'paypal'>('cash');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);
    const [isPaypalLoaded, setIsPaypalLoaded] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [couponCode, setCouponCode] = useState("");
    const [couponLoading, setCouponLoading] = useState(false);
    const [appliedCoupon, setAppliedCoupon] = useState<{
        id: string;
        code: string;
        type: 'percent' | 'fixed';
        value: number;
        discount_amount: number;
    } | null>(null);

    // PayPal SDK Injection
    useEffect(() => {
        const paypalClientId = import.meta.env.VITE_PAYPAL_CLIENT_ID || "test";
        if (!(window as any).paypal) {
            const script = document.createElement("script");
            script.src = `https://www.paypal.com/sdk/js?client-id=${paypalClientId}&currency=ILS`;
            script.async = true;
            script.onload = () => setIsPaypalLoaded(true);
            document.body.appendChild(script);
        } else {
            setIsPaypalLoaded(true);
        }
    }, []);

    // PayPal Button Rendering Helper
    useEffect(() => {
        if (isPaypalLoaded && paymentMethod === 'paypal' && !success) {
            const container = document.getElementById("paypal-button-container");
            if (container && !container.hasChildNodes()) {
                (window as any).paypal.Buttons({
                    style: {
                        layout: 'vertical',
                        color: 'blue',
                        shape: 'rect',
                        label: 'pay',
                    },
                    createOrder: async () => {
                        try {
                            const totalFormatted = Number(finalTotal).toFixed(2);

                            const { data, error: invokeError } = await supabase.functions.invoke('paypal-checkout', {
                                body: {
                                    action: 'create-order',
                                    amount: totalFormatted,  // STRING with 2 decimals
                                    currency: "ILS"
                                }
                            });

                            if (invokeError) {
                                console.error("PayPal create order error:", invokeError);
                                console.error("Error context:", (invokeError as any).context);
                                throw new Error(invokeError.message || "Failed to create PayPal order");
                            }

                            if (!data || !data.id) {
                                console.error("Invalid response from PayPal:", data);
                                throw new Error("Invalid PayPal order response");
                            }

                            return data.id;  // Return order ID as string
                        } catch (err: any) {
                            console.error("Create order exception:", err);
                            setError(err.message || t("checkout.checkoutFailed"));
                            throw err;
                        }
                    },
                    onApprove: async (data: any) => {
                        setIsProcessingPayment(true);
                        try {
                            const { data: captureData, error: captureError } = await supabase.functions.invoke('paypal-checkout', {
                                body: {
                                    action: 'capture-order',
                                    orderID: data.orderID,
                                    cartItems: items.map(i => ({
                                        product_id: i.product.id,
                                        quantity: i.quantity,
                                        price: i.product.discount_price || i.product.price
                                    })),
                                    userData: {
                                        userId: (await supabase.auth.getUser()).data.user?.id,
                                        customerDetails: {
                                            full_name: formData.fullName,
                                            email: formData.email,
                                            phone: formData.phone,
                                            notes: formData.notes
                                        },
                                        shippingAddress: {
                                            city: formData.city,
                                            address: formData.address,
                                            full_address: `${formData.city}, ${formData.address}`
                                        }
                                    }
                                }
                            });

                            if (captureError || !captureData.success) throw captureError || new Error("Capture failed");

                            clearCart();
                            setSuccess(true);
                            addToast(t("checkout.orderPlacedSuccess"), "success");
                        } catch (err: any) {
                            console.error(err);
                            setError(err.message || t("checkout.checkoutFailed"));
                        } finally {
                            setIsProcessingPayment(false);
                        }
                    },
                    onError: (err: any) => {
                        console.error(err);
                        setError(t("checkout.checkoutFailed"));
                    }
                }).render('#paypal-button-container');
            }
        }
    }, [isPaypalLoaded, paymentMethod, items, appliedCoupon, formData, success, t, addToast, clearCart]);


    // Helper: Format Price (No .00 decimals)
    const formatPrice = (price: number) => {
        const p = Number(price);
        if (isNaN(p)) return "₪0";
        // If integer, show no decimals. If float, show 2.
        return p % 1 === 0 ? `₪${p}` : `₪${p.toFixed(2)}`;
    };

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) return;
        setCouponLoading(true);
        try {
            const { data, error } = await supabase.rpc('validate_coupon', {
                p_code: couponCode,
                p_subtotal: cartTotal
            });

            if (error) throw error;
            if (!data.valid) {
                addToast(t('coupon.invalid') + ': ' + data.message, 'error');
                setAppliedCoupon(null);
                return;
            }

            setAppliedCoupon({
                id: data.coupon_id,
                code: data.code,
                type: data.type,
                value: data.value,
                discount_amount: data.discount_amount
            });
            addToast(t('coupon.applied', { code: data.code }), 'success');
        } catch (error) {
            console.error(error);
            addToast(t('coupon.invalid'), 'error');
        } finally {
            setCouponLoading(false);
        }
    };

    const removeCoupon = () => {
        setAppliedCoupon(null);
        setCouponCode("");
    };

    const finalTotal = Math.max(0, cartTotal - (appliedCoupon?.discount_amount || 0));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            // 0. Get User (Optional, but good to link if exists)
            const { data: { user } } = await supabase.auth.getUser();

            // 1. Verify Prices (Server-side check simulation)
            let calculatedTotal = 0;
            for (const item of items) {
                const { data: product, error: productError } = await supabase
                    .from('products')
                    .select('price, discount_price')
                    .eq('id', item.product.id)
                    .single();

                if (productError || !product) {
                    throw new Error(`Product ${item.product.id} not found.`);
                }
                const price = product.discount_price || product.price;
                calculatedTotal += price * item.quantity;
            }

            // Allow small float diff
            if (Math.abs(calculatedTotal - cartTotal) > 0.1) {
                throw new Error("Price mismatch. Cart updated.");
            }

            // Re-validate coupon
            let validDiscount = 0;
            if (appliedCoupon) {
                const { data: couponData } = await supabase.rpc('validate_coupon', {
                    p_code: appliedCoupon.code,
                    p_subtotal: calculatedTotal
                });
                if (couponData && couponData.valid) {
                    validDiscount = couponData.discount_amount;
                } else {
                    addToast(t("checkout.couponInvalidAtCheckout"), "warning");
                }
            }

            const totalToCharge = Math.max(0, calculatedTotal - validDiscount);

            // PayPal Mock Flow
            if (paymentMethod === 'paypal') {
                setIsProcessingPayment(true);
                await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate 2s delay
                setIsProcessingPayment(false);
                // In real app, here we would verify transaction ID
            }

            // 2. Create Order (Using correct JSONB Schema)
            const { data: orderData, error: orderError } = await supabase
                .from('orders')
                .insert([
                    {
                        user_id: user?.id || null, // If user is logged in
                        total_amount: totalToCharge,
                        discount_amount: validDiscount,
                        coupon_id: appliedCoupon?.id || null,
                        status: paymentMethod === 'paypal' ? 'paid' : 'pending',
                        customer_details: {
                            full_name: formData.fullName,
                            email: formData.email,
                            phone: formData.phone,
                            notes: formData.notes
                        },
                        shipping_address: {
                            city: formData.city,
                            address: formData.address,
                            full_address: `${formData.city}, ${formData.address}`
                        }
                    }
                ])
                .select()
                .single();

            if (orderError) throw orderError;

            // 3. Insert Order Items (Separate Table)
            if (orderData) {
                const orderItemsData = items.map(item => ({
                    order_id: orderData.id,
                    product_id: item.product.id,
                    quantity: item.quantity,
                    price_at_purchase: item.product.discount_price || item.product.price
                }));

                const { error: itemsError } = await supabase
                    .from('order_items')
                    .insert(orderItemsData);

                if (itemsError) throw itemsError;

                // 4. Redeem Coupon
                if (appliedCoupon) {
                    await supabase.rpc('redeem_coupon', {
                        p_coupon_id: appliedCoupon.id,
                        p_order_id: orderData.id
                    });
                }
            }

            // 5. Success
            clearCart();
            setSuccess(true);
            addToast(t("checkout.orderPlacedSuccess"), "success");

        } catch (err: any) {
            console.error("Checkout error:", err);
            setError(err.message || t("checkout.genericError"));
            addToast(err.message || t("checkout.checkoutFailed"), "error");
            setIsProcessingPayment(false);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-white">
                <div className="bg-white rounded-[32px] shadow-2xl p-10 max-w-md w-full text-center space-y-6 border border-slate-100">
                    <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto shadow-sm">
                        <CheckCircle size={40} />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900 mb-2">{t("checkout.successTitle")}</h2>
                        <p className="text-slate-500 text-lg leading-relaxed">
                            {t("checkout.successMessage")}
                        </p>
                    </div>
                    <Link to="/shop">
                        <Button className="w-full py-4 text-lg mt-4 shadow-lg shadow-green-500/20 bg-green-600 hover:bg-green-700">
                            {t("common.backToShop")}
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 text-center bg-white">
                <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center text-slate-300 mb-8 shadow-sm border border-slate-100">
                    <ShoppingBag size={48} strokeWidth={1.5} />
                </div>
                <h2 className="text-3xl font-bold text-slate-900 mb-3 tracking-tight">
                    {t("cart.emptyTitle")}
                </h2>
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
            <div className="bg-slate-50 border-b border-slate-100 py-12 mb-12">
                <div className="container mx-auto px-4 max-w-4xl text-center">
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-900 font-heading tracking-tight mb-2">
                        {t("checkout.title")}
                    </h1>
                    <div className="flex items-center justify-center gap-2 text-slate-500 text-sm">
                        <Lock size={14} />
                        <span>{t("checkout.secureLabel")}</span>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 max-w-5xl">
                <form id="checkout-form" onSubmit={handleSubmit}>
                    <div className="grid md:grid-cols-12 gap-12">
                        {/* Left: Form */}
                        <div className="md:col-span-7 space-y-8">

                            {/* Section 1: Billing */}
                            <div>
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-sm font-bold shadow-lg shadow-slate-900/20">1</span>
                                    <h2 className="text-2xl font-bold text-slate-900">{t("checkout.billingDetails")}</h2>
                                </div>

                                <Card className="p-8 border-slate-100 shadow-sm space-y-5">
                                    {error && (
                                        <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-xl flex items-start gap-3 border border-red-100">
                                            <AlertCircle className="shrink-0 mt-0.5" size={20} />
                                            <div className="text-sm font-medium">{error}</div>
                                        </div>
                                    )}

                                    <Input
                                        label={t("common.fullName")}
                                        value={formData.fullName}
                                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                        required
                                        placeholder={t("common.placeholders.fullName")}
                                        className="bg-white"
                                    />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <Input
                                            label={t("common.phone")}
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            required
                                            type="tel"
                                            placeholder={t("common.placeholders.phone")}
                                            className="bg-white"
                                            dir="ltr"
                                        />
                                        <Input
                                            label={t("common.email")}
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            required
                                            type="email"
                                            placeholder={t("common.placeholders.email")}
                                            className="bg-white"
                                            dir="ltr"
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                        <div className="md:col-span-1">
                                            <Input
                                                label={t("common.city")}
                                                value={formData.city}
                                                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                                required
                                                placeholder={t("common.placeholders.city")}
                                                className="bg-white"
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <Input
                                                label={t("common.address")}
                                                value={formData.address}
                                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                                required
                                                placeholder={t("common.placeholders.address")}
                                                className="bg-white"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-slate-700">
                                            {t("common.notes")}
                                        </label>
                                        <textarea
                                            value={formData.notes}
                                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                            className="w-full min-h-[100px] px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none bg-white placeholder:text-slate-400 text-slate-800 text-sm"
                                            placeholder={t("common.placeholders.notes")}
                                        />
                                    </div>
                                </Card>
                            </div>

                            {/* Section 2: Payment Method */}
                            <div>
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-sm font-bold shadow-lg shadow-slate-900/20">2</span>
                                    <h2 className="text-2xl font-bold text-slate-900">{t("checkout.paymentMethod")}</h2>
                                </div>
                                <Card className="p-6 border-slate-100 shadow-sm space-y-3">
                                    {/* Paypal */}
                                    <label className={clsx(
                                        "flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all",
                                        paymentMethod === 'paypal' ? "border-blue-500 bg-blue-50/50 shadow-sm ring-1 ring-blue-500/20" : "border-slate-200 hover:border-blue-300 hover:bg-slate-50"
                                    )}>
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="paypal"
                                            checked={paymentMethod === 'paypal'}
                                            onChange={() => setPaymentMethod('paypal')}
                                            className="w-5 h-5 text-blue-600 focus:ring-blue-500"
                                        />
                                        <div className="w-10 h-10 bg-white rounded-lg border border-slate-200 flex items-center justify-center text-blue-600 shrink-0">
                                            <Wallet size={20} />
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-bold text-slate-900">{t("checkout.methods.paypal")}</div>
                                        </div>
                                    </label>

                                    {/* PayPal Button Container */}
                                    {paymentMethod === 'paypal' && (
                                        <div className="pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                            <div id="paypal-button-container" className="w-full min-h-[150px]"></div>
                                            <p className="text-[11px] text-slate-400 text-center mt-2">
                                                {t("checkout.processingPayment")}
                                            </p>
                                        </div>
                                    )}

                                    {/* Cash */}
                                    <label className={clsx(
                                        "flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all",
                                        paymentMethod === 'cash' ? "border-green-500 bg-green-50/50 shadow-sm ring-1 ring-green-500/20" : "border-slate-200 hover:border-green-300 hover:bg-slate-50"
                                    )}>
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="cash"
                                            checked={paymentMethod === 'cash'}
                                            onChange={() => setPaymentMethod('cash')}
                                            className="w-5 h-5 text-green-600 focus:ring-green-500"
                                        />
                                        <div className="w-10 h-10 bg-white rounded-lg border border-slate-200 flex items-center justify-center text-green-600 shrink-0">
                                            <Banknote size={20} />
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-bold text-slate-900">{t("checkout.methods.cash")}</div>
                                        </div>
                                    </label>
                                </Card>
                            </div>
                        </div>

                        {/* Right: Summary */}
                        <div className="md:col-span-5">
                            <div className="sticky top-24 space-y-6">
                                <Card className="p-8 border-slate-100 shadow-xl shadow-slate-200/40 rounded-[28px] overflow-hidden relative bg-white">
                                    {/* Decorative gradient */}
                                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary via-blue-400 to-primary"></div>

                                    <div className="flex justify-between items-center mb-6">
                                        <span className="text-slate-500 font-medium">{t("checkout.items", { count: items.length })}</span>
                                        <Link to="/cart" className="text-primary text-sm font-bold hover:underline">{t("checkout.editCart")}</Link>
                                    </div>

                                    <div className="space-y-3 mb-8 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                        {items.map((item) => (
                                            <div key={item.product.id} className="flex gap-3 items-center text-sm group">
                                                <div className="w-12 h-12 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-center shrink-0 overflow-hidden">
                                                    {item.product.images?.[0] ?
                                                        <img src={item.product.images[0]} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" /> :
                                                        <ShoppingBag size={16} className="text-slate-300" />
                                                    }
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-bold text-slate-700 truncate">
                                                        {isRTL ? item.product.name_he : (item.product.name_en || item.product.name_he)}
                                                    </div>
                                                    <div className="text-slate-400 text-xs">x {item.quantity}</div>
                                                </div>
                                                <span className="font-semibold text-slate-900 shrink-0">
                                                    {formatPrice((item.product.discount_price || item.product.price) * item.quantity)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="border-t border-slate-100 pt-6 space-y-3">
                                        <div className="flex justify-between text-slate-500">
                                            <span>{t("checkout.subtotal")}</span>
                                            <span>{formatPrice(cartTotal)}</span>
                                        </div>
                                        <div className="flex justify-between text-slate-500">
                                            <span>{t("checkout.shipping")}</span>
                                            <span className="text-green-600 font-bold text-sm">{t("checkout.free")}</span>
                                        </div>

                                        {/* Coupon Section */}
                                        {appliedCoupon ? (
                                            <div className="flex justify-between items-start text-green-600 font-medium animate-fade-in py-3 border-t border-dashed border-slate-200 mt-2">
                                                <div className="flex flex-col gap-0.5">
                                                    <div className="flex items-center gap-2">
                                                        <Tag size={14} className="shrink-0" />
                                                        <span className="text-sm font-bold uppercase tracking-tight">
                                                            {t("checkout.couponLabel", { code: appliedCoupon.code })}
                                                        </span>
                                                        <button
                                                            onClick={removeCoupon}
                                                            className="text-slate-400 hover:text-red-500 transition-colors p-1 -m-1"
                                                            title={t("common.remove")}
                                                        >
                                                            <X size={14} />
                                                        </button>
                                                    </div>
                                                    <div className="text-[12px] opacity-80 font-medium px-5">
                                                        {appliedCoupon.type === 'percent'
                                                            ? t("checkout.discountTypePercent", { percent: Math.round(appliedCoupon.value) })
                                                            : t("checkout.discountTypeFixed")
                                                        }
                                                    </div>
                                                </div>
                                                <span className="font-bold text-lg leading-none shrink-0">
                                                    -{formatPrice(appliedCoupon.discount_amount)}
                                                </span>
                                            </div>
                                        ) : (
                                            <div className="py-2">
                                                <div className="flex gap-2">
                                                    <Input
                                                        placeholder={t('coupon.placeholder')}
                                                        value={couponCode}
                                                        onChange={e => setCouponCode(e.target.value)}
                                                        className="h-10 text-sm uppercase font-mono"
                                                        containerClassName="flex-1 mb-0"
                                                    />
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="h-10 px-4"
                                                        onClick={handleApplyCoupon}
                                                        isLoading={couponLoading}
                                                        disabled={!couponCode}
                                                    >
                                                        {t('coupon.apply')}
                                                    </Button>
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex justify-between text-slate-900 text-2xl font-bold pt-4 border-t border-slate-100">
                                            <span>{t("checkout.total")}</span>
                                            <span>{formatPrice(finalTotal)}</span>
                                        </div>
                                    </div>

                                    {paymentMethod === 'cash' && (
                                        <Button
                                            type="submit"
                                            className="w-full mt-8 py-5 text-lg rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 font-bold"
                                            size="lg"
                                            isLoading={isSubmitting || isProcessingPayment}
                                            disabled={isSubmitting || isProcessingPayment}
                                        >
                                            {isProcessingPayment
                                                ? t("checkout.processingPayment")
                                                : t("checkout.placeOrder")
                                            }
                                        </Button>
                                    )}

                                    <div className="mt-6 flex flex-col items-center gap-3">
                                        <div className="flex gap-2 text-slate-300">
                                            <CreditCard size={20} />
                                            <div className="w-8 h-5 bg-slate-100 rounded"></div>
                                            <div className="w-8 h-5 bg-slate-100 rounded"></div>
                                        </div>
                                        <p className="text-[10px] text-slate-400 text-center max-w-xs">
                                            {t("checkout.disclaimer")}
                                        </p>
                                    </div>
                                </Card>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
