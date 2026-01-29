import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "../../lib/supabase";
import { Link, useNavigate } from "react-router-dom";
import { Clock, ChevronLeft, ChevronRight, ShoppingBag, Calendar, MessageCircle, MapPin, Eye, Shield } from "lucide-react";
import { format } from "date-fns";
import Card from "../../components/ui/Card";
import { clsx } from "clsx";
import { useAdmin } from "../../hooks/useAdmin";

export default function AccountDashboard() {
    const { t, i18n } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [userName, setUserName] = useState("");
    const [stats, setStats] = useState({ orders: 0, appointments: 0, questions: 0 });
    const [nextAppointment, setNextAppointment] = useState<any>(null);
    const [recentOrder, setRecentOrder] = useState<any>(null);
    const isRtl = i18n.dir() === 'rtl';
    const { isAdmin } = useAdmin();
    const navigate = useNavigate();

    useEffect(() => {
        async function loadData() {
            setLoading(true);
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                // 1. Get Profile Name
                const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).single();
                setUserName(profile?.full_name || t("common.guest", "Guest"));

                // 2. Get Appointments (Stats & Next)
                const { data: appointments } = await supabase
                    .from('appointments')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('start_time', { ascending: true });

                // 3. Get Orders (Stats & Recent) - Assuming 'orders' table has user_id
                const { data: orders } = await supabase
                    .from('orders')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false });

                // 4. Get Questions/Inquiries Count (exclude soft-deleted)
                const { count: questionsCount } = await supabase
                    .from('questions')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', user.id)
                    .is('deleted_by_user', false);

                // 5. Calculate Stats
                const now = new Date();
                const upcoming = (appointments || []).filter(a => new Date(a.start_time) > now && a.status !== 'cancelled');

                setStats({
                    orders: orders?.length || 0,
                    appointments: upcoming.length, // Showing upcoming count as KPI
                    questions: questionsCount || 0
                });

                setNextAppointment(upcoming.length > 0 ? upcoming[0] : null);
                setRecentOrder(orders && orders.length > 0 ? orders[0] : null);

            } catch (err) {
                console.error("Error loading dashboard", err);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [t]);

    if (loading) return (
        <div className="flex items-center justify-center p-12">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
    );

    const StatCard = ({ icon: Icon, label, value, colorClass, link }: any) => {
        const content = (
            <div className="flex items-center gap-4">
                <div className={clsx("w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110", colorClass)}>
                    <Icon size={22} className="text-current" />
                </div>
                <div>
                    <div className="text-3xl font-bold text-slate-900 leading-none mb-1">{value}</div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</div>
                </div>
            </div>
        );

        if (link) {
            return (
                <Link to={link}>
                    <Card className="p-6 border-slate-100 shadow-sm hover:shadow-md transition-all group cursor-pointer bg-white rounded-[20px] hover:border-primary/20">
                        {content}
                    </Card>
                </Link>
            );
        }

        return (
            <Card className="p-6 border-slate-100 shadow-sm hover:shadow-md transition-all group cursor-default bg-white rounded-[20px]">
                {content}
            </Card>
        );
    };

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div>
                <h1 className="text-3xl md:text-4xl font-bold text-slate-900 font-heading tracking-tight mb-2">
                    {t("client.dashboard.title")} <span className="text-primary">{userName}</span>
                </h1>
                <p className="text-slate-500 text-lg">
                    {t("client.dashboard.subtitle")}
                </p>
            </div>

            {/* Admin Card */}
            {isAdmin && (
                <div
                    onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); navigate('/admin'); }}
                    className="relative overflow-hidden rounded-[24px] bg-slate-900 p-6 text-white shadow-xl shadow-slate-900/20 hover:shadow-slate-900/30 transition-all hover:-translate-y-1 cursor-pointer group"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-10 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform">
                        <Shield size={120} />
                    </div>
                    <div className="relative z-10 flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-2 bg-white/10 rounded-lg backdrop-blur-md">
                                    <Shield size={20} className="text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-white drop-shadow-md">{t("client.dashboard.adminCta.title")}</h3>
                            </div>
                            <p className="text-slate-300 text-sm mb-0 max-w-md">{t("client.dashboard.adminCta.subtitle")}</p>
                        </div>
                        <span className="hidden sm:inline-flex items-center font-bold text-sm bg-white text-slate-900 px-4 py-2.5 rounded-xl group-hover:bg-primary group-hover:text-white transition-colors shadow-lg">
                            {t("client.dashboard.adminCta.button")}
                            {isRtl ? <ChevronLeft size={16} className="mr-2" /> : <ChevronRight size={16} className="ml-2" />}
                        </span>
                    </div>
                </div>
            )}

            {/* KPI Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <StatCard
                    icon={ShoppingBag}
                    label={t("account.orders.title")}
                    value={stats.orders}
                    colorClass="bg-blue-50 text-blue-600"
                    link="/account/orders"
                />
                <StatCard
                    icon={Calendar}
                    label={t("client.dashboard.stats.appointments")}
                    value={stats.appointments}
                    colorClass="bg-teal-50 text-teal-600"
                    link="/account/bookings"
                />
                <StatCard
                    icon={MessageCircle}
                    label={t("client.dashboard.stats.tickets")}
                    value={stats.questions}
                    colorClass="bg-purple-50 text-purple-600"
                    link="/account/questions"
                />
            </div>

            {/* Content Widgets */}
            <div className="grid gap-8">

                {/* Next Appointment Section */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-slate-900">{t("account.nextAppointment")}</h2>
                        {nextAppointment && (
                            <Link to="/account/bookings" className="text-sm font-bold text-primary hover:underline">
                                {t("account.viewAll")}
                            </Link>
                        )}
                    </div>

                    {nextAppointment ? (
                        <Card className="p-0 border-slate-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow rounded-[24px]">
                            <div className="flex flex-col md:flex-row">
                                <div className="bg-primary/5 p-6 md:w-48 flex flex-col items-center justify-center border-b md:border-b-0 md:border-e border-slate-100">
                                    <div className="text-4xl font-bold text-primary mb-1">
                                        {format(new Date(nextAppointment.start_time), 'dd')}
                                    </div>
                                    <div className="text-sm font-bold uppercase tracking-widest text-slate-500">
                                        {format(new Date(nextAppointment.start_time), 'MMM')}
                                    </div>
                                    <div className="mt-3 px-3 py-1 bg-white rounded-full text-xs font-bold text-slate-600 shadow-sm border border-slate-100">
                                        {format(new Date(nextAppointment.start_time), 'yyyy')}
                                    </div>
                                </div>
                                <div className="p-6 flex-1 flex flex-col justify-center">
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <div className="flex items-center gap-2 text-primary font-bold mb-1 text-sm">
                                                <Clock size={16} />
                                                {format(new Date(nextAppointment.start_time), 'HH:mm')} - {format(new Date(nextAppointment.end_time), 'HH:mm')}
                                            </div>
                                            <h3 className="text-xl font-bold text-slate-900">
                                                {(nextAppointment.type || 'Eye Exam').replace('_', ' ')}
                                            </h3>
                                        </div>
                                        <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full uppercase tracking-wide border border-green-200">
                                            Confirmed
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-500 text-sm">
                                        <MapPin size={16} />
                                        Tasnim Optic Clinic, Main Branch
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ) : (
                        <Card className="p-8 border-dashed border-2 border-slate-200 shadow-none bg-slate-50/50 rounded-[24px] text-center">
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm text-slate-300">
                                <Calendar size={32} />
                            </div>
                            <h3 className="text-slate-900 font-bold mb-1">{t("client.dashboard.empty.title")}</h3>
                            <p className="text-slate-500 text-sm mb-6">{t("client.dashboard.empty.subtitle")}</p>
                            <Link to="/book-exam" className="inline-flex items-center px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm">
                                <Eye size={18} className={clsx("mr-2", isRtl && "ml-2 mr-0")} />
                                <div className="ml-2 mr-2">{t("client.dashboard.cta.exam.button")}</div>
                            </Link>
                        </Card>
                    )}
                </section>

                {/* Main CTAs */}
                {!nextAppointment && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Link to="/book-exam" className="group relative overflow-hidden rounded-[24px] bg-primary p-6 text-white shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all hover:-translate-y-1">
                            <div className="absolute top-0 right-0 p-4 opacity-10 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform">
                                <Eye size={100} />
                            </div>
                            <div className="relative z-10">
                                <h3 className="text-xl font-bold mb-1">{t("client.dashboard.cta.exam.title")}</h3>
                                <p className="text-primary-100 text-sm mb-4 opacity-90">{t("client.dashboard.cta.exam.subtitle")}</p>
                                <span className="inline-flex items-center font-bold text-sm bg-white/20 backdrop-blur-md px-4 py-2 rounded-lg group-hover:bg-white group-hover:text-primary transition-colors">
                                    {t("client.dashboard.cta.exam.button")}
                                    {isRtl ? <ChevronLeft size={16} className="mr-2" /> : <ChevronRight size={16} className="ml-2" />}
                                </span>
                            </div>
                        </Link>

                        <Link to="/shop" className="group relative overflow-hidden rounded-[24px] bg-slate-900 p-6 text-white shadow-lg shadow-slate-900/20 hover:shadow-slate-900/30 transition-all hover:-translate-y-1">
                            <div className="absolute top-0 right-0 p-4 opacity-10 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform">
                                <ShoppingBag size={100} />
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                            <div className="relative z-10">
                                <h3 className="text-xl font-bold mb-1 text-white">{t("common.shopNow")}</h3>
                                <p className="text-slate-300 text-sm mb-4">{t("client.dashboard.cta.shop.title")}</p>
                                <span className="inline-flex items-center font-bold text-sm bg-white text-slate-900 px-4 py-2 rounded-lg group-hover:bg-slate-100 transition-colors shadow-sm">
                                    {t("client.dashboard.cta.shop.button")}
                                    {isRtl ? <ChevronLeft size={16} className="mr-2" /> : <ChevronRight size={16} className="ml-2" />}
                                </span>
                            </div>
                        </Link>
                    </div>
                )}

                {/* Recent Order Widget (Optional) */}
                {recentOrder && (
                    <section>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-slate-900">{t("account.recentOrders", "Recent Orders")}</h2>
                            <Link to="/account/orders" className="text-sm font-bold text-primary hover:underline">
                                {t("account.viewAll", "View All")}
                            </Link>
                        </div>
                        <Card className="p-4 border-slate-100 shadow-sm hover:shadow-md transition-all rounded-[20px] flex items-center justify-between group">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-primary transition-colors">
                                    <ShoppingBag size={24} />
                                </div>
                                <div>
                                    <div className="font-bold text-slate-900">Order #{recentOrder.id.slice(0, 8)}</div>
                                    <div className="text-slate-500 text-sm">{format(new Date(recentOrder.created_at), 'PPP')}</div>
                                </div>
                            </div>
                            <div className="text-end">
                                <div className="font-bold text-slate-900">{recentOrder.total_amount} ₪</div>
                                <div className="text-xs font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-yellow-50 text-yellow-700 status-chip inline-block mt-1">
                                    {String(t(`account.orders.status.${(recentOrder.status || 'pending').toLowerCase()}`, recentOrder.status))}
                                </div>
                            </div>
                        </Card>
                    </section>
                )}

            </div>
        </div>
    );
}
