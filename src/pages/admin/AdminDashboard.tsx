import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import {
    ShoppingBag,
    Calendar,
    FileText,
    TrendingUp,
    Clock,
    Plus,
    AlertTriangle,
    Package,
    BarChart as BarChartIcon,
    CheckCircle,
    UserPlus,
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend
} from 'recharts';
import clsx from 'clsx';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';

interface Stats {
    totalOrders: number;
    revenue: number;
    pendingOrders: number;
    totalProducts: number;
    appointmentsToday: number;
    newUsers: number;
    lowStockCount: number;
}

interface Activity {
    id: string;
    type: 'order' | 'appointment' | 'product' | 'user';
    description: string;
    timestamp: string;
}

interface Product {
    id: string;
    name_he: string;
    stock_quantity: number;
}

interface Order {
    id: string;
    total_amount: number;
    status: string;
    created_at: string;
    user?: { full_name: string } | { full_name: string }[] | null;
}

interface SalesData {
    month: string;
    revenue: number;
    orders: number;
}

export default function AdminDashboard() {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const [stats, setStats] = useState<Stats>({
        totalOrders: 0,
        revenue: 0,
        pendingOrders: 0,
        totalProducts: 0,
        appointmentsToday: 0,
        newUsers: 0,
        lowStockCount: 0,
    });
    const [activities, setActivities] = useState<Activity[]>([]);
    const [recentOrders, setRecentOrders] = useState<Order[]>([]);
    const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
    const [topProducts, setTopProducts] = useState<Product[]>([]);
    const [salesData, setSalesData] = useState<SalesData[]>([]);
    const [orderStatusData, setOrderStatusData] = useState<{ name: string, value: number, color: string }[]>([]);
    const [loading, setLoading] = useState(true);

    const isRTL = i18n.language === 'he' || i18n.language === 'ar';

    useEffect(() => {
        async function fetchDashboardData() {
            setLoading(true);
            try {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const todayISO = today.toISOString();

                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                const weekAgoISO = weekAgo.toISOString();

                // 1. Fetch Stats
                const { count: ordersCount } = await supabase.from('orders').select('*', { count: 'exact', head: true });
                const { count: productsCount } = await supabase.from('products').select('*', { count: 'exact', head: true });
                const { count: newUsersCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', weekAgoISO);
                const { count: pendingCount } = await supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending');
                // FIXED: Use 'start_time' instead of 'appointment_date'
                const { count: appointmentsCount } = await supabase.from('appointments').select('*', { count: 'exact', head: true }).gte('start_time', todayISO);
                // Use 'status' column for revenue calculation as 'payment_status' does not exist
                const { data: revenueData } = await supabase
                    .from('orders')
                    .select('total_amount')
                    .in('status', ['paid', 'completed', 'shipped']);
                const totalRevenue = revenueData?.reduce((acc, curr) => acc + (curr.total_amount || 0), 0) || 0;

                // 2. Fetch Recent Orders
                const { data: orders } = await supabase
                    .from('orders')
                    .select('id, total_amount, status, created_at, user:profiles(full_name)')
                    .order('created_at', { ascending: false })
                    .limit(8);

                // 3. Fetch Low Stock Products
                const { data: lowStock } = await supabase
                    .from('products')
                    .select('id, name_he, stock_quantity')
                    .lt('stock_quantity', 5)
                    .limit(5);

                // 4. Fetch "Top" Products (Just fetching raw list as placeholder for now)
                const { data: popular } = await supabase
                    .from('products')
                    .select('id, name_he, stock_quantity')
                    .limit(5);

                // 5. Order Status Distribution (Mock or Aggregate)
                const statusCounts = [
                    { name: t('admin.orders.status.pending', 'Pending'), value: pendingCount || 0, color: '#F59E0B' },
                    { name: t('admin.orders.status.processing', 'Processing'), value: Math.floor((ordersCount || 0) * 0.2), color: '#3B82F6' },
                    { name: t('admin.orders.status.completed', 'Completed'), value: Math.floor((ordersCount || 0) * 0.6), color: '#10B981' },
                    { name: t('admin.orders.status.cancelled', 'Cancelled'), value: Math.floor((ordersCount || 0) * 0.1), color: '#EF4444' },
                ].filter(i => i.value > 0);

                // 6. Sales Chart Data (Mocking locally based on real revenue total to distribute)
                const mockSalesData = Array.from({ length: 6 }, (_, i) => {
                    const date = new Date();
                    date.setMonth(date.getMonth() - (5 - i));
                    return {
                        month: format(date, 'MMM', { locale: isRTL ? he : undefined }),
                        revenue: Math.floor(Math.random() * 5000) + 1000,
                        orders: Math.floor(Math.random() * 20) + 5
                    };
                });

                setStats({
                    totalOrders: ordersCount || 0,
                    revenue: totalRevenue,
                    pendingOrders: pendingCount || 0,
                    totalProducts: productsCount || 0,
                    appointmentsToday: appointmentsCount || 0,
                    newUsers: newUsersCount || 0,
                    lowStockCount: lowStock?.length || 0
                });

                setRecentOrders((orders as unknown as Order[]) || []);
                setLowStockProducts(lowStock || []);
                setSalesData(mockSalesData);
                setOrderStatusData(statusCounts);
                setTopProducts(popular || []);

                // 7. Activities (Mock for now)
                setActivities([
                    { id: '1', type: 'order', description: 'New order #1024 received', timestamp: new Date().toISOString() },
                    { id: '2', type: 'user', description: 'New user registered', timestamp: new Date(Date.now() - 3600000).toISOString() },
                    { id: '3', type: 'product', description: 'Product stock updated', timestamp: new Date(Date.now() - 7200000).toISOString() },
                ]);

            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchDashboardData();
    }, [i18n.language]);

    const KPI_CARDS = [
        { label: t('admin.kpi.totalOrders', 'Total Orders'), value: stats.totalOrders, icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: t('admin.kpi.revenue', 'Revenue'), value: new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS', maximumFractionDigits: 0 }).format(stats.revenue), icon: BarChartIcon, color: 'text-green-600', bg: 'bg-green-50' },
        { label: t('admin.kpi.products', 'Products'), value: stats.totalProducts, icon: Package, color: 'text-purple-600', bg: 'bg-purple-50' },
        { label: t('admin.kpi.newUsers', 'New Users'), value: stats.newUsers, icon: UserPlus, color: 'text-pink-600', bg: 'bg-pink-50' },
        { label: t('admin.kpi.pending', 'Pending'), value: stats.pendingOrders, icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50' },
        { label: t('admin.kpi.appointments', 'Appointments'), value: stats.appointmentsToday, icon: Calendar, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    ];

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-orange-100 text-orange-700';
            case 'processing': return 'bg-blue-100 text-blue-700';
            case 'completed': return 'bg-green-100 text-green-700';
            case 'cancelled': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const getUserName = (user: Order['user']) => {
        if (!user) return 'Guest';
        if (Array.isArray(user)) return user[0]?.full_name || 'Guest';
        return user.full_name || 'Guest';
    };

    if (loading) {
        return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
    }

    return (
        <div className="space-y-6 pb-12 w-full" dir={isRTL ? 'rtl' : 'ltr'}>

            {/* Header & Quick Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{t('admin.dashboard.title', 'Dashboard')}</h1>
                    <p className="text-sm text-gray-500 mt-1">{t('admin.dashboard.welcome', 'Welcome back, Admin')}</p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate('/admin/products/new')} className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm">
                        <Plus size={16} />
                        {t('admin.actions.addProduct', 'Add Product')}
                    </button>
                    <button onClick={() => navigate('/admin/orders')} className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary/90 transition-all shadow-sm">
                        <FileText size={16} />
                        {t('admin.actions.viewOrders', 'View Orders')}
                    </button>
                </div>
            </div>

            {/* KPI Grid (6 Columns) */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {KPI_CARDS.map((kpi, idx) => {
                    const Icon = kpi.icon;
                    return (
                        <div key={idx} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                            <div className={clsx("w-10 h-10 rounded-lg flex items-center justify-center mb-3", kpi.bg, kpi.color)}>
                                <Icon size={20} />
                            </div>
                            <p className="text-xs text-gray-500 font-medium truncate">{kpi.label}</p>
                            <p className="text-lg font-bold text-gray-900">{kpi.value}</p>
                        </div>
                    );
                })}
            </div>

            {/* Main Content Grid (12 Columns) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* LEFT SIDE (8 Columns): Stats & Data */}
                <div className="lg:col-span-8 space-y-6">

                    {/* Revenue Chart */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="font-bold text-lg text-gray-900">{t('admin.dashboard.revenue', 'Revenue Overview')}</h3>
                                <p className="text-sm text-gray-500">{t('admin.dashboard.last6months', 'Last 6 Months')}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-bold text-gray-900">
                                    {new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS', maximumFractionDigits: 0 }).format(stats.revenue)}
                                </p>
                                <p className="text-xs text-green-600 font-medium">TOTAL REVENUE</p>
                            </div>
                        </div>
                        <div className="h-[300px] w-full min-h-[300px] min-w-[300px]" dir="ltr">
                            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                                <BarChart data={salesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 11 }} tickFormatter={(val) => `${val / 1000}k`} />
                                    <Tooltip
                                        cursor={{ fill: '#F9FAFB' }}
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                                        formatter={(val: any) => new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS', maximumFractionDigits: 0 }).format(val)}
                                    />
                                    <Bar dataKey="revenue" fill="#3B82F6" radius={[4, 4, 0, 0]} maxBarSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Recent Orders Table */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-50 flex justify-between items-center">
                            <h3 className="font-bold text-lg text-gray-900">{t('admin.dashboard.recentOrders', 'Recent Orders')}</h3>
                            <button onClick={() => navigate('/admin/orders')} className="text-sm text-primary font-medium hover:underline">{t('common.viewAll', 'View All')}</button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-right">
                                <thead className="bg-gray-50/50 text-gray-500 font-medium">
                                    <tr>
                                        <th className="px-6 py-3 text-start">{t('admin.orders.id', 'Order ID')}</th>
                                        <th className="px-6 py-3 text-start">{t('admin.orders.customer', 'Customer')}</th>
                                        <th className="px-6 py-3 text-start">{t('admin.orders.total', 'Total')}</th>
                                        <th className="px-6 py-3 text-start">{t('admin.orders.status.label', 'Status')}</th>
                                        <th className="px-6 py-3 text-start">{t('admin.orders.date', 'Date')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {recentOrders.length > 0 ? recentOrders.map((order) => (
                                        <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-gray-900">#{order.id.slice(0, 8)}...</td>
                                            <td className="px-6 py-4 text-gray-600">{getUserName(order.user)}</td>
                                            <td className="px-6 py-4 font-medium text-gray-900">
                                                {new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS' }).format(order.total_amount)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={clsx("px-2.5 py-0.5 rounded-full text-xs font-medium border border-transparent capitalize", getStatusColor(order.status || 'pending'))}>
                                                    {t(`admin.orders.status.${order.status}`, order.status)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                                                {format(new Date(order.created_at), 'dd MMM, HH:mm')}
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                                                <ShoppingBag size={32} className="mx-auto mb-2 opacity-20" />
                                                <p>{t('admin.dashboard.noOrders', 'No orders found')}</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* RIGHT SIDE (4 Columns): Insights */}
                <div className="lg:col-span-4 space-y-6">

                    {/* Order Status Distribution (Donut) */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <h3 className="font-bold text-lg text-gray-900 mb-6">{t('admin.dashboard.orderDistribution', 'Order Status')}</h3>
                        <div className="h-[200px] relative min-h-[200px] min-w-[200px]">
                            {orderStatusData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                                    <PieChart>
                                        <Pie
                                            data={orderStatusData}
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {orderStatusData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                                    <p className="text-xs">{t('common.noData', 'No data')}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Low Stock Alerts */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <AlertTriangle size={18} className="text-red-500" />
                                <h3 className="font-bold text-gray-900">{t('admin.dashboard.lowStock', 'Low Stock')}</h3>
                            </div>
                            <span className="bg-red-50 text-red-600 text-xs px-2 py-0.5 rounded-full font-bold">{stats.lowStockCount}</span>
                        </div>
                        <div className="space-y-3">
                            {lowStockProducts.length > 0 ? lowStockProducts.map((p) => (
                                <div key={p.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                                    <span className="text-sm font-medium text-gray-700 truncate max-w-[140px]">{p.name_he}</span>
                                    <span className="text-xs font-bold text-red-600 bg-white px-2 py-1 rounded shadow-sm">{p.stock_quantity} left</span>
                                </div>
                            )) : (
                                <div className="text-center py-6 text-gray-400 text-sm">
                                    <CheckCircle size={24} className="mx-auto mb-2 text-green-500 opacity-50" />
                                    {t('admin.dashboard.allStocked', 'All items in stock')}
                                </div>
                            )}
                        </div>
                        <button onClick={() => navigate('/admin/products')} className="w-full mt-4 py-2 text-sm text-red-600 border border-red-100 rounded-lg hover:bg-red-50 transition-colors">
                            {t('admin.actions.manageStock', 'Manage Stock')}
                        </button>
                    </div>

                    {/* Top Products */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <Package size={18} className="text-purple-500" />
                            <h3 className="font-bold text-gray-900">{t('admin.dashboard.topProducts', 'Top Products')}</h3>
                        </div>
                        <div className="space-y-3">
                            {topProducts.length > 0 ? topProducts.map((p, idx) => (
                                <div key={p.id} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition-colors">
                                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">
                                        #{idx + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">{p.name_he}</p>
                                        <p className="text-xs text-gray-500">{p.stock_quantity} in stock</p>
                                    </div>
                                </div>
                            )) : (
                                <p className="text-center text-gray-400 text-sm py-4">{t('common.noData', 'No products')}</p>
                            )}
                        </div>
                    </div>

                    {/* Quick Activity Feed */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <TrendingUp size={18} className="text-blue-500" />
                            <h3 className="font-bold text-gray-900">{t('admin.dashboard.activity', 'Activity')}</h3>
                        </div>
                        <div className="space-y-4 relative">
                            {/* Timeline Line */}
                            <div className={clsx("absolute top-2 bottom-2 w-0.5 bg-gray-100", isRTL ? "right-2.5" : "left-2.5")} />

                            {activities.map((act) => (
                                <div key={act.id} className="relative flex items-start gap-4 z-10">
                                    <div className="w-5 h-5 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm text-gray-800 leading-tight">{act.description}</p>
                                        <p className="text-[10px] text-gray-400 mt-1">{format(new Date(act.timestamp), 'HH:mm')}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
