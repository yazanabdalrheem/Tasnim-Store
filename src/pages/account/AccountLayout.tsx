import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LayoutDashboard, Calendar, User, LogOut, ShoppingBag, ChevronLeft, ChevronRight, MessageCircle } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { useToast } from "../../context/ToastContext";
import { useEffect, useState } from "react";
import { clsx } from "clsx";

export default function AccountLayout() {
    const { t, i18n } = useTranslation();
    const location = useLocation();
    const navigate = useNavigate();
    const { success } = useToast();
    const [profile, setProfile] = useState<any>(null);
    const isRTL = i18n.dir() === 'rtl';

    useEffect(() => {
        async function getProfile() {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
                setProfile(data);
            }
        }
        getProfile();
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        success(t("common.logout", "Logged out successfully"));
        navigate("/login");
    };

    const navItems = [
        { path: "/account", label: t("account.dashboard", "Dashboard"), icon: LayoutDashboard, exact: true },
        { path: "/account/bookings", label: t("account.myBookings", "My Appointments"), icon: Calendar },
        { path: "/account/orders", label: t("account.myOrders", "My Orders"), icon: ShoppingBag },
        { path: "/account/questions", label: t("account.myQuestions.title", "My Questions"), icon: MessageCircle },
        { path: "/account/profile", label: t("account.profile", "Edit Profile"), icon: User },
    ];

    return (
        <div className="min-h-screen bg-white relative">
            {/* Subtle Dotted Background (Opacity 6%) */}
            <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] opacity-[0.06] pointer-events-none" />

            <div className="container mx-auto px-4 py-12 md:py-20 max-w-7xl relative z-10">
                <div className="flex flex-col lg:flex-row-reverse gap-8 lg:gap-12">

                    {/* SIDEBAR (Profile + Actions) */}
                    {/* Desktop: Right Column (LTR) / Left (RTL). Mobile: Top. */}
                    <aside className="w-full lg:w-[380px] shrink-0 space-y-6">

                        {/* Profile Card */}
                        <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm p-8 text-center relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-blue-600" />

                            <div className="relative inline-block mb-4">
                                <div className="w-24 h-24 rounded-full bg-slate-50 border-4 border-white shadow-lg flex items-center justify-center text-primary text-3xl font-bold mx-auto ring-4 ring-blue-500/5 relative z-10">
                                    {profile?.full_name?.charAt(0).toUpperCase() || <User size={40} />}
                                </div>
                                {/* Subtle Glow */}
                                <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full scale-125 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            </div>

                            <h2 className="text-xl font-bold text-slate-900 mb-1">{profile?.full_name || t("common.guest")}</h2>
                            <p className="text-sm text-slate-400 font-medium uppercase tracking-wider mb-2">{t("client.dashboard.role")}</p>
                            <div className="flex items-center justify-center gap-2 text-xs text-slate-500 bg-slate-50 py-1.5 px-3 rounded-full inline-flex border border-slate-100">
                                <span className="truncate max-w-[200px]">{profile?.email || profile?.phone}</span>
                            </div>

                            {/* Separator */}
                            <div className="h-px bg-slate-100 my-8" />

                            {/* Navigation Buttons */}
                            <nav className="space-y-3">
                                {navItems.map((item) => {
                                    const isActive = item.exact
                                        ? location.pathname === item.path
                                        : location.pathname.startsWith(item.path);

                                    return (
                                        <Link
                                            key={item.path}
                                            to={item.path}
                                            className={clsx(
                                                "flex items-center justify-between w-full px-5 h-[52px] rounded-[14px] transition-all duration-300 font-bold border",
                                                isActive
                                                    ? "bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-900/20"
                                                    : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                                            )}
                                        >
                                            <div className="flex items-center gap-3">
                                                <item.icon size={20} className={isActive ? "text-blue-400" : "text-slate-400"} />
                                                <span>{item.label}</span>
                                            </div>
                                            {isActive && (isRTL ? <ChevronLeft size={16} /> : <ChevronRight size={16} />)}
                                        </Link>
                                    );
                                })}

                                <button
                                    onClick={handleLogout}
                                    className="flex items-center justify-center w-full px-5 h-[52px] rounded-[14px] text-red-500 font-bold border border-red-100 hover:bg-red-50 hover:border-red-200 transition-all mt-6"
                                >
                                    <LogOut size={18} className={clsx("mr-2", isRTL && "ml-2 mr-0")} />
                                    {t("common.logout")}
                                </button>
                            </nav>
                        </div>

                        {/* Support Widget */}
                        <div className="bg-blue-50 rounded-[24px] p-6 border border-blue-100 text-center">
                            <p className="text-blue-900 font-bold mb-2">{t("client.dashboard.needHelp.title")}</p>
                            <p className="text-blue-700/80 text-sm mb-4">{t("client.dashboard.needHelp.subtitle")}</p>
                            <Link to="/ask" className="text-sm font-bold text-blue-600 hover:underline">
                                {t("client.dashboard.needHelp.cta")}
                            </Link>
                        </div>
                    </aside>

                    {/* MAIN CONTENT (Stats + Widgets) */}
                    <main className="flex-1 min-w-0">
                        <Outlet context={{ profile }} />
                    </main>
                </div>
            </div>
        </div>
    );
}
