import { useEffect, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "../../lib/supabase";
import {
    Search, Package, Truck, CheckCircle,
    Clock, XCircle, Download, ExternalLink, RefreshCw, AlertCircle,
    ChevronRight, ShoppingBag
} from "lucide-react";
import { format } from "date-fns";
import { clsx } from "clsx";
import Card from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Link } from "react-router-dom";

// --- Types ---
interface Product {
    name_he?: string;
    name_ar?: string;
    name_en?: string;
    main_image_url?: string;
}

interface OrderItem {
    order_id: string;
    product_id: string;
    quantity: number;
    price_at_purchase: number;
    products?: Product; // joined
}

interface Order {
    id: string;
    created_at: string;
    status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
    total_amount: number;
    coupon_id?: string;
    discount_amount?: number;
    shipping_address?: any; // JSONB
    customer_details?: any; // JSONB
    order_items?: OrderItem[];
}

// --- Component ---
export default function MyOrders() {
    const { t, i18n } = useTranslation();
    // const isRTL = i18n.dir() === 'rtl';

    // State
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    // Filters
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [dateFilter, setDateFilter] = useState<string>("all"); // all, 30days, 3months, year
    const [sortOrder, setSortOrder] = useState<string>("newest"); // newest, oldest, price_desc

    // Fetch
    async function fetchOrders() {
        setLoading(true);
        setError(null);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

            const { data, error } = await supabase
                .from('orders')
                .select(`
                    *,
                    order_items (
                        *,
                        products (
                            name_he, name_ar, name_en, main_image_url
                        )
                    )
                `)
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setOrders(data || []);

            // Auto-select first order on desktop if available
            if (window.innerWidth >= 1024 && data && data.length > 0) {
                // Optional: setSelectedOrder(data[0]); 
            }
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Failed to fetch orders");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchOrders();
    }, []);

    // Derived Logic
    const filteredOrders = useMemo(() => {
        let res = [...orders];

        // Search
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            res = res.filter(o =>
                o.id.toLowerCase().includes(q) ||
                o.order_items?.some(i => {
                    const pName = (i.products?.name_en || i.products?.name_he || i.products?.name_ar || "").toLowerCase();
                    return pName.includes(q);
                })
            );
        }

        // Status
        if (statusFilter !== "all") {
            res = res.filter(o => o.status === statusFilter);
        }

        // Date
        if (dateFilter !== "all") {
            const now = new Date();
            let limitDate = new Date();
            if (dateFilter === "30days") limitDate.setDate(now.getDate() - 30);
            if (dateFilter === "3months") limitDate.setMonth(now.getMonth() - 3);
            if (dateFilter === "year") limitDate.setFullYear(now.getFullYear() - 1);

            res = res.filter(o => new Date(o.created_at) >= limitDate);
        }

        // Sort
        res.sort((a, b) => {
            if (sortOrder === "newest") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            if (sortOrder === "oldest") return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
            if (sortOrder === "price_desc") return b.total_amount - a.total_amount;
            return 0;
        });

        return res;
    }, [orders, searchQuery, statusFilter, dateFilter, sortOrder]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return "bg-yellow-50 text-yellow-700 border-yellow-200";
            case 'confirmed': return "bg-blue-50 text-blue-700 border-blue-200";
            case 'shipped': return "bg-purple-50 text-purple-700 border-purple-200";
            case 'delivered': return "bg-green-50 text-green-700 border-green-200";
            case 'cancelled': return "bg-red-50 text-red-700 border-red-200";
            default: return "bg-gray-50 text-gray-700 border-gray-200";
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending': return Clock;
            case 'confirmed': return CheckCircle;
            case 'shipped': return Truck;
            case 'delivered': return Package;
            case 'cancelled': return XCircle;
            default: return Clock;
        }
    };

    const handleCancelOrder = async (orderId: string) => {
        if (!confirm(t("account.confirmCancel"))) return;
        try {
            const { error } = await supabase
                .from('orders')
                .update({ status: 'cancelled' })
                .eq('id', orderId);
            if (error) throw error;
            fetchOrders(); // refresh
            if (selectedOrder?.id === orderId) setSelectedOrder(null);
        } catch (err) {
            alert(t("common.error"));
        }
    };

    // Render Helpers
    const formatPrice = (price: number) => `₪${price.toFixed(2)}`;

    const getProductName = (product: any) => {
        if (!product) return "Unknown Product";
        if (i18n.language === 'he') return product.name_he || product.name_en;
        if (i18n.language === 'ar') return product.name_ar || product.name_en;
        return product.name_en || product.name_he;
    };

    if (loading) return (
        <div className="space-y-4 animate-pulse">
            <div className="h-8 bg-gray-100 rounded w-1/4"></div>
            <div className="h-12 bg-gray-100 rounded w-full"></div>
            <div className="grid gap-4">
                {[1, 2, 3].map(i => <div key={i} className="h-40 bg-gray-100 rounded-xl"></div>)}
            </div>
        </div>
    );

    if (error) return (
        <div className="text-center py-12">
            <div className="inline-flex p-4 rounded-full bg-red-50 text-red-500 mb-4">
                <AlertCircle size={32} />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">{t("common.error")}</h2>
            <p className="text-gray-500 mb-4">{error}</p>
            <Button onClick={fetchOrders} variant="outline" size="sm">
                <RefreshCw size={16} className="mr-2" /> {t("common.retry")}
            </Button>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <div className="flex items-center gap-3 mb-1">
                    <h1 className="text-2xl font-bold text-gray-900">{t("account.orders.title")}</h1>
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-bold">
                        {orders.length}
                    </span>
                </div>
                <p className="text-slate-500">{t("account.orders.subtitle")}</p>
            </div>

            {/* Layout Grid */}
            <div className="flex flex-col lg:flex-row gap-6 relative">

                {/* LEFT: Orders List */}
                <div className={clsx(
                    "flex-1 flex flex-col gap-4",
                    selectedOrder ? "lg:w-7/12" : "w-full"
                )}>

                    {/* Filters Bar */}
                    <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute top-1/2 -translate-y-1/2 left-3 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder={t("account.orders.searchPlaceholder")}
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border-transparent rounded-lg focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium"
                            />
                        </div>
                        <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0">
                            <select
                                value={statusFilter}
                                onChange={e => setStatusFilter(e.target.value)}
                                className="bg-slate-50 border-0 rounded-lg text-sm font-medium text-slate-600 px-3 py-2 cursor-pointer hover:bg-slate-100 focus:ring-0"
                            >
                                <option value="all">{t("account.orders.filters.status")}: All</option>
                                <option value="pending">{t("account.orders.status.pending")}</option>
                                <option value="confirmed">{t("account.orders.status.confirmed")}</option>
                                <option value="shipped">{t("account.orders.status.shipped")}</option>
                                <option value="delivered">{t("account.orders.status.delivered")}</option>
                                <option value="cancelled">{t("account.orders.status.cancelled")}</option>
                            </select>

                            <select
                                value={dateFilter}
                                onChange={e => setDateFilter(e.target.value)}
                                className="bg-slate-50 border-0 rounded-lg text-sm font-medium text-slate-600 px-3 py-2 cursor-pointer hover:bg-slate-100 focus:ring-0"
                            >
                                <option value="all">{t("account.orders.filters.date")}: All</option>
                                <option value="30days">Last 30 Days</option>
                                <option value="3months">Last 3 Months</option>
                                <option value="year">Last Year</option>
                            </select>

                            <select
                                value={sortOrder}
                                onChange={e => setSortOrder(e.target.value)}
                                className="bg-slate-50 border-0 rounded-lg text-sm font-medium text-slate-600 px-3 py-2 cursor-pointer hover:bg-slate-100 focus:ring-0"
                            >
                                <option value="newest">{t("account.orders.filters.sort")}: Newest</option>
                                <option value="oldest">Oldest</option>
                                <option value="price_desc">Price: High to Low</option>
                            </select>
                        </div>
                    </div>

                    {/* Empty State */}
                    {filteredOrders.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-16 px-4 bg-white rounded-[24px] border border-dashed border-slate-200 text-center">
                            <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4">
                                <ShoppingBag size={28} />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-1">{t("account.orders.empty.title")}</h3>
                            <p className="text-gray-500 mb-6 max-w-xs mx-auto">{t("account.orders.empty.desc")}</p>
                            <Link to="/shop">
                                <Button size="md">{t("account.orders.empty.ctaShop")}</Button>
                            </Link>
                        </div>
                    )}

                    {/* List */}
                    <div className="space-y-4">
                        {filteredOrders.map(order => {
                            const StatusIcon = getStatusIcon(order.status);
                            const isSelected = selectedOrder?.id === order.id;

                            return (
                                <Card
                                    key={order.id}
                                    className={clsx(
                                        "p-0 overflow-hidden border transition-all duration-300",
                                        isSelected ? "border-blue-500 ring-4 ring-blue-500/10 shadow-lg" : "border-slate-100 hover:border-blue-200"
                                    )}
                                >
                                    <div
                                        onClick={() => setSelectedOrder(order)}
                                        className="p-5 cursor-pointer"
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-mono text-sm font-bold text-slate-500">#{order.id.slice(0, 8)}</span>
                                                    <span className="text-xs text-slate-400">•</span>
                                                    <span className="text-xs text-slate-500 font-medium">
                                                        {format(new Date(order.created_at), 'dd MMM yyyy, HH:mm')}
                                                    </span>
                                                </div>
                                                <div className={clsx(
                                                    "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border",
                                                    getStatusColor(order.status)
                                                )}>
                                                    <StatusIcon size={12} />
                                                    <span className="uppercase tracking-wide">{t(`account.orders.status.${order.status}`)}</span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-lg font-bold text-slate-900">{formatPrice(order.total_amount)}</div>
                                                <div className="text-xs text-slate-500">{order.order_items?.length || 0} items</div>
                                            </div>
                                        </div>

                                        {/* Thumbnails Row */}
                                        <div className="flex items-center gap-3">
                                            {order.order_items?.slice(0, 4).map((item, idx) => (
                                                <div key={idx} className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center p-1 overflow-hidden shrink-0">
                                                    {item.products?.main_image_url ? (
                                                        <img src={item.products.main_image_url} alt="" className="w-full h-full object-contain mix-blend-multiply" />
                                                    ) : (
                                                        <Package size={16} className="text-slate-300" />
                                                    )}
                                                </div>
                                            ))}
                                            {(order.order_items?.length || 0) > 4 && (
                                                <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
                                                    +{order.order_items!.length - 4}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Mobile: View Details Button only if not selected or to reinforce action */}
                                    <div className="border-t border-slate-50 p-3 bg-slate-50/50 flex justify-end lg:hidden">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                            onClick={() => setSelectedOrder(order)}
                                        >
                                            {t("account.orders.viewDetails")} <ChevronRight size={16} className="ml-1 rtl:rotate-180" />
                                        </Button>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                </div>

                {/* RIGHT: Order Details Panel */}
                {/* Desktop: Sticky column. Mobile: Fixed overlay/modal */}
                {/* Using a custom conditional rendering for mobile overlay behavior */}

                {selectedOrder && (
                    <>
                        {/* Mobile Overlay Backdrop */}
                        <div
                            className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-sm"
                            onClick={() => setSelectedOrder(null)}
                        />

                        <div className={clsx(
                            "bg-white lg:bg-transparent lg:static fixed bottom-0 left-0 right-0 z-50 rounded-t-[24px] lg:rounded-none shadow-2xl lg:shadow-none max-h-[85vh] lg:max-h-none overflow-y-auto lg:overflow-visible transition-transform duration-300 transform",
                            selectedOrder ? "translate-y-0" : "translate-y-full lg:translate-y-0",
                            "lg:w-5/12 lg:block flex flex-col"
                        )}>
                            <div className="sticky top-0 bg-white lg:bg-transparent lg:static z-10 px-6 py-4 border-b border-slate-100 lg:border-0 flex items-center justify-between lg:block">
                                <h2 className="text-xl font-bold lg:hidden">{t("account.orders.viewDetails")}</h2>
                                <button onClick={() => setSelectedOrder(null)} className="lg:hidden p-2 bg-slate-100 rounded-full text-slate-500">
                                    <XCircle size={20} />
                                </button>
                            </div>

                            <Card className="flex-1 lg:sticky lg:top-24 border-0 lg:border shadow-none lg:shadow-sm">
                                <div className="p-6 space-y-6">

                                    {/* Panel Header */}
                                    <div className="text-center pb-6 border-b border-slate-100">
                                        <div className="text-xs font-mono text-slate-400 mb-1">ID: {selectedOrder.id}</div>
                                        <div className="text-3xl font-bold text-slate-900 mb-2">{formatPrice(selectedOrder.total_amount)}</div>
                                        <div className={clsx("inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border", getStatusColor(selectedOrder.status))}>
                                            <span className="uppercase tracking-wide">{t(`account.orders.status.${selectedOrder.status}`)}</span>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="grid grid-cols-2 gap-3">
                                        {selectedOrder.status === 'shipped' && (
                                            <Button variant="primary" className="col-span-2">
                                                <ExternalLink size={16} className="mr-2" /> {t("account.orders.track")}
                                            </Button>
                                        )}
                                        {selectedOrder.status === 'delivered' && (
                                            <Button variant="outline" className="col-span-1">
                                                <RefreshCw size={16} className="mr-2" /> {t("account.orders.reorder")}
                                            </Button>
                                        )}
                                        <Button variant="outline" className={selectedOrder.status === 'delivered' ? "col-span-1" : "col-span-2"}>
                                            <Download size={16} className="mr-2" /> {t("account.orders.downloadInvoice")}
                                        </Button>

                                        {selectedOrder.status === 'pending' && (
                                            <button
                                                onClick={() => handleCancelOrder(selectedOrder.id)}
                                                className="col-span-2 text-red-500 text-sm font-medium hover:bg-red-50 py-2 rounded-lg transition-colors border border-transparent hover:border-red-100"
                                            >
                                                {t("account.orders.cancel")}
                                            </button>
                                        )}
                                    </div>

                                    {/* Info Blocks */}
                                    <div className="space-y-4 text-sm">
                                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                            <div className="font-bold text-slate-900 mb-2">{t("checkout.shipping")}</div>
                                            <div className="text-slate-600 leading-relaxed">
                                                {selectedOrder.customer_details?.full_name}<br />
                                                {selectedOrder.shipping_address?.address}, {selectedOrder.shipping_address?.city}<br />
                                                {selectedOrder.customer_details?.phone}
                                            </div>
                                        </div>

                                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                            <div className="font-bold text-slate-900 mb-3">{t("checkout.items", { count: selectedOrder.order_items?.length })}</div>
                                            <div className="space-y-3">
                                                {selectedOrder.order_items?.map((item, i) => (
                                                    <div key={i} className="flex gap-3">
                                                        <div className="w-10 h-10 bg-white rounded-md border border-slate-200 p-1 flex-shrink-0">
                                                            {item.products?.main_image_url && <img src={item.products.main_image_url} className="w-full h-full object-contain mix-blend-multiply" />}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="text-slate-900 font-medium truncate">{getProductName(item.products)}</div>
                                                            <div className="text-slate-500 text-xs">Qty: {item.quantity} × {formatPrice(item.price_at_purchase)}</div>
                                                        </div>
                                                        <div className="font-bold text-slate-700">{formatPrice(item.quantity * item.price_at_purchase)}</div>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="border-t border-slate-200 my-3 pt-3 space-y-1">
                                                <div className="flex justify-between text-slate-500">
                                                    <span>{t("checkout.subtotal")}</span>
                                                    <span>{formatPrice(selectedOrder.total_amount + (selectedOrder.discount_amount || 0))}</span>
                                                </div>
                                                {selectedOrder.discount_amount! > 0 && (
                                                    <div className="flex justify-between text-green-600">
                                                        <span>{t("coupon.discount")}</span>
                                                        <span>-{formatPrice(selectedOrder.discount_amount!)}</span>
                                                    </div>
                                                )}
                                                <div className="flex justify-between font-bold text-slate-900 text-base pt-1">
                                                    <span>{t("checkout.total")}</span>
                                                    <span>{formatPrice(selectedOrder.total_amount)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-2 text-center">
                                        <a
                                            href="https://wa.me/972526844574"
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
                                        >
                                            {t("account.orders.contactSupport")}
                                        </a>
                                    </div>

                                </div>
                            </Card>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

