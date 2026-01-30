import { useState, useEffect, useRef } from "react";
import { Outlet, Link, useLocation, useNavigate, NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
    LayoutDashboard,
    ShoppingBag,
    Tag,
    Calendar,
    Users,
    FileText,
    Settings,
    LogOut,
    Type,
    MessageCircle,
    Bell,
    Store,
    Search,
    ChevronLeft,
    ChevronRight,
    Percent,
    Ticket,
    ChevronDown,
    User,
    ArrowRight,
    ArrowLeft
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import clsx from "clsx";
import NotificationBell from "../admin/NotificationBell";

export default function AdminLayout() {
    const location = useLocation();
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const [user, setUser] = useState<any>(null);
    const [userProfile, setUserProfile] = useState<any>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    // Removed unused isMobileSidebarOpen state
    const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [searchQuery, setSearchQuery] = useState("");

    const isRTL = i18n.language === 'he' || i18n.language === 'ar';

    useEffect(() => {
        async function fetchUser() {
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user || null);

            if (session?.user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', session.user.id)
                    .single();
                setUserProfile(profile);
            }
        }
        fetchUser();
    }, []);

    // Close dropdown on outside click
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsUserDropdownOpen(false);
            }
        }

        function handleEscape(event: KeyboardEvent) {
            if (event.key === 'Escape') {
                setIsUserDropdownOpen(false);
            }
        }

        if (isUserDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('keydown', handleEscape);
            return () => {
                document.removeEventListener('mousedown', handleClickOutside);
                document.removeEventListener('keydown', handleEscape);
            };
        }
    }, [isUserDropdownOpen]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate("/login");
    };

    const handleToggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const menuSections = [
        {
            title: t('admin.nav.overview', 'Overview'),
            items: [
                { path: "/admin", icon: LayoutDashboard, label: t('admin.nav.dashboard', 'Dashboard') },
            ]
        },
        {
            title: t('admin.nav.catalog', 'Catalog'),
            items: [
                { path: "/admin/products", icon: ShoppingBag, label: t('admin.nav.products', 'Products') },
                { path: "/admin/categories", icon: Tag, label: t('admin.nav.categories', 'Categories') },
                { path: "/admin/promotions", icon: Percent, label: t('admin.nav.promotions', 'Promotions') },
                { path: "/admin/coupons", icon: Ticket, label: t('admin.nav.coupons', 'Coupons') },

            ]
        },
        {
            title: t('admin.nav.sales', 'Sales'),
            items: [
                { path: "/admin/orders", icon: FileText, label: t('admin.nav.orders', 'Orders') },
            ]
        },
        {
            title: t('admin.nav.services', 'Services'),
            items: [
                { path: "/admin/appointments", icon: Calendar, label: t('admin.nav.appointments', 'Appointments') },
            ]
        },
        {
            title: t('admin.nav.support', 'Support'),
            items: [
                { path: "/admin/faq", icon: MessageCircle, label: t('admin.nav.faq', 'FAQ & Questions') },
                { path: "/admin/notifications", icon: Bell, label: t('admin.nav.notifications', 'Notifications') },
            ]
        },
        {
            title: t('admin.nav.admin', 'Admin'),
            items: [
                { path: "/admin/users", icon: Users, label: t('admin.nav.users', 'Users') },
                { path: "/admin/content", icon: Type, label: t('admin.nav.content', 'Content') },
                { path: "/admin/settings", icon: Settings, label: t('admin.nav.settings', 'Settings') },
            ]
        }
    ];

    const getInitials = (name?: string) => {
        if (!name) return 'A';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const getUserDisplayName = () => {
        return userProfile?.full_name || user?.email?.split('@')[0] || 'Admin';
    };

    const getRoleLabel = () => {
        const role = userProfile?.role || 'customer';
        if (role === 'super_admin') return t('admin.users.roles.super_admin', 'Super Admin');
        if (role === 'admin') return t('admin.users.roles.admin', 'Admin');
        return t('admin.users.roles.customer', 'Customer');
    };

    const isAdmin = () => {
        const role = userProfile?.role;
        return role === 'admin' || role === 'super_admin';
    };

    // Top navigation items (admin only)
    const topNavItems = [
        { path: '/admin', label: t('admin.nav.dashboard', 'Dashboard'), exact: true },
        { path: '/admin/products', label: t('admin.nav.products', 'Products') },
        { path: '/admin/orders', label: t('admin.nav.orders', 'Orders') },
        { path: '/admin/users', label: t('admin.nav.users', 'Users') },
        { path: '/admin/settings', label: t('admin.nav.settings', 'Settings') },
    ];

    return (
        <div className="min-h-screen bg-[#F6F8FC] flex" dir={isRTL ? 'rtl' : 'ltr'}>

            {/* Sidebar - Desktop Only */}
            <aside
                className={clsx(
                    "bg-white border-gray-200 transition-all duration-300 flex-col flex-shrink-0 hidden lg:flex relative",
                    isRTL ? "border-l" : "border-r",
                    isSidebarOpen ? "w-64" : "w-20"
                )}
            >
                {/* Sidebar Header */}
                <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
                    {isSidebarOpen ? (
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-primary to-blue-600 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-sm">T</span>
                            </div>
                            <span className="font-bold text-gray-900">{t('admin.layout.appName', 'Tasnim Admin')}</span>
                        </div>
                    ) : (
                        <div className="w-8 h-8 bg-gradient-to-br from-primary to-blue-600 rounded-lg flex items-center justify-center mx-auto">
                            <span className="text-white font-bold text-sm">T</span>
                        </div>
                    )}
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-3 space-y-6 overflow-y-auto">
                    {menuSections.map((section, idx) => (
                        <div key={idx}>
                            {isSidebarOpen && (
                                <div className="px-3 pb-2">
                                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                        {section.title}
                                    </span>
                                </div>
                            )}
                            <div className="space-y-1">
                                {section.items.map((item) => {
                                    const Icon = item.icon;
                                    const isActive = location.pathname === item.path;

                                    return (
                                        <Link
                                            key={item.path}
                                            to={item.path}
                                            className={clsx(
                                                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative",
                                                {
                                                    "bg-blue-50 text-primary font-medium": isActive,
                                                    "text-gray-600 hover:bg-gray-50 hover:text-gray-900": !isActive,
                                                    "justify-center": !isSidebarOpen,
                                                }
                                            )}
                                            title={!isSidebarOpen ? item.label : undefined}
                                        >
                                            {/* Active indicator */}
                                            {isActive && (
                                                <div className={clsx(
                                                    "absolute top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-full",
                                                    isRTL ? "right-0" : "left-0"
                                                )} />
                                            )}

                                            <Icon size={20} className={clsx({ "mx-auto": !isSidebarOpen })} />

                                            {isSidebarOpen && (
                                                <span className="flex-1">{item.label}</span>
                                            )}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </nav>

                {/* Sidebar Footer */}
                <div className="p-3 border-t border-gray-200">
                    <button
                        onClick={handleLogout}
                        className={clsx(
                            "flex items-center gap-3 px-3 py-2.5 w-full text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all duration-200",
                            { "justify-center": !isSidebarOpen }
                        )}
                        title={!isSidebarOpen ? t('common.logout', 'Logout') : undefined}
                    >
                        <LogOut size={20} />
                        {isSidebarOpen && <span>{t('common.logout', 'Logout')}</span>}
                    </button>
                </div>

                {/* Toggle Button - Desktop Only */}
                <button
                    onClick={handleToggleSidebar}
                    className={clsx(
                        "hidden lg:flex absolute -translate-y-1/2 w-6 h-6 bg-white border border-gray-200 rounded-full items-center justify-center text-gray-400 hover:text-gray-600 hover:border-gray-300 transition-all duration-200 shadow-sm",
                        "top-20",
                        {
                            [isRTL ? "left-0 -translate-x-1/2" : "right-0 translate-x-1/2"]: true,
                        }
                    )}
                >
                    {(isSidebarOpen && !isRTL) || (!isSidebarOpen && isRTL) ? (
                        <ChevronLeft size={14} />
                    ) : (
                        <ChevronRight size={14} />
                    )}
                </button>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
                {/* Top Bar */}
                <header className="sticky top-0 z-30 h-16 bg-white/80 backdrop-blur-md border-b border-gray-200">
                    <div className="flex items-center h-full px-4 lg:px-6 gap-4 w-full max-w-[1400px] mx-auto">

                        {/* Search Bar - Hidden on small screens when nav tabs visible */}
                        <div className="hidden xl:flex flex-1 max-w-xs">
                            <div className="relative w-full">
                                <Search className={clsx("absolute top-1/2 -translate-y-1/2 text-gray-400", isRTL ? "right-3" : "left-3")} size={18} />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder={t('admin.layout.searchPlaceholder', 'Search orders, products, users...')}
                                    className={clsx(
                                        "w-full h-10 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all",
                                        isRTL ? "pr-10 pl-4" : "pl-10 pr-4"
                                    )}
                                />
                            </div>
                        </div>

                        {/* Top Navigation Tabs (Admin Only) - Desktop */}
                        {isAdmin() && (
                            <nav className="hidden md:flex items-center gap-1 flex-1 justify-center max-w-2xl">
                                {topNavItems.map((item) => (
                                    <NavLink
                                        key={item.path}
                                        to={item.path}
                                        end={item.exact}
                                        className={({ isActive }) => clsx(
                                            "px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200",
                                            isActive
                                                ? "bg-primary/10 text-primary"
                                                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                                        )}
                                    >
                                        {item.label}
                                    </NavLink>
                                ))}
                            </nav>
                        )}

                        {/* Right Side */}
                        <div className={clsx("flex items-center gap-3", isRTL ? "mr-auto" : "ml-auto")}>

                            {/* Back to Dashboard Button (Visible on all admin pages except Dashboard) */}
                            {location.pathname !== '/admin' && (
                                <Link to="/admin">
                                    <button
                                        className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-primary hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-200"
                                        title={t('admin.layout.backToDashboard', 'Back to Dashboard')}
                                    >
                                        {isRTL ? <ArrowRight size={18} /> : <ArrowLeft size={18} />}
                                        <span className="hidden lg:inline">{t('admin.layout.backToDashboard', 'Back to Dashboard')}</span>
                                    </button>
                                </Link>
                            )}

                            {/* Back to Store Button - Header */}
                            <Link to="/">
                                <button
                                    className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-primary hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-200"
                                    title={t('common.backToStore', 'Back to Store')}
                                >
                                    <Store size={18} />
                                    <span className="hidden lg:inline">{t('common.backToStore', 'Back to Store')}</span>
                                </button>
                            </Link>

                            <div className="w-px h-6 bg-gray-200 hidden sm:block mx-1"></div>

                            {/* Notification Bell */}
                            <NotificationBell />

                            {/* User Menu with Dropdown */}
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                                    className="flex items-center gap-3 px-3 py-1.5 hover:bg-gray-50 rounded-xl transition-colors group"
                                >
                                    <div className={clsx("hidden sm:block", isRTL ? "text-left" : "text-right")}>
                                        <div
                                            className="text-sm font-medium text-gray-900 max-w-[120px] truncate"
                                            title={getUserDisplayName()}
                                        >
                                            {getUserDisplayName()}
                                        </div>
                                        <div className="text-xs text-gray-500">{getRoleLabel()}</div>
                                    </div>
                                    <div className="w-9 h-9 bg-gradient-to-br from-primary to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                        {getInitials(getUserDisplayName())}
                                    </div>
                                    <ChevronDown
                                        size={16}
                                        className={clsx(
                                            "text-gray-400 transition-transform duration-200",
                                            { "rotate-180": isUserDropdownOpen }
                                        )}
                                    />
                                </button>

                                {/* Dropdown Menu */}
                                {isUserDropdownOpen && (
                                    <div className={clsx(
                                        "absolute top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-[100]",
                                        "animate-in fade-in slide-in-from-top-2 duration-200",
                                        isRTL ? "left-0" : "right-0"
                                    )}>
                                        {/* User Info Header */}
                                        <div className="px-4 py-3 border-b border-gray-100">
                                            <div className="font-medium text-gray-900 truncate" title={user?.email}>
                                                {user?.email}
                                            </div>
                                            <div className="text-xs text-gray-500 mt-0.5">{getRoleLabel()}</div>
                                        </div>

                                        {/* Menu Items */}
                                        <div className="py-1">
                                            {/* Back to Store - Dropdown Item */}
                                            <Link
                                                to="/"
                                                onClick={() => setIsUserDropdownOpen(false)}
                                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                            >
                                                <Store size={16} />
                                                <span>{t('common.backToStore', 'Back to Store')}</span>
                                            </Link>

                                            <div className="h-px bg-gray-100 my-1"></div>

                                            <Link
                                                to="/account"
                                                onClick={() => setIsUserDropdownOpen(false)}
                                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                            >
                                                <User size={16} />
                                                <span>{t('account.menu.profile', 'Profile')}</span>
                                            </Link>

                                            <Link
                                                to="/admin/settings"
                                                onClick={() => setIsUserDropdownOpen(false)}
                                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                            >
                                                <Settings size={16} />
                                                <span>{t('account.menu.settings', 'Settings')}</span>
                                            </Link>

                                            {/* Admin Panel Link - Only for admins when not in admin area */}
                                            {isAdmin() && !location.pathname.startsWith('/admin') && (
                                                <Link
                                                    to="/admin"
                                                    onClick={() => setIsUserDropdownOpen(false)}
                                                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                                >
                                                    <LayoutDashboard size={16} />
                                                    <span>{t('account.menu.adminPanel', 'Admin Panel')}</span>
                                                </Link>
                                            )}
                                        </div>

                                        {/* Logout */}
                                        <div className="border-t border-gray-100 pt-1">
                                            <button
                                                onClick={() => {
                                                    setIsUserDropdownOpen(false);
                                                    handleLogout();
                                                }}
                                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                                            >
                                                <LogOut size={16} />
                                                <span>{t('account.menu.logout', 'Logout')}</span>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto">
                    <div className="w-full max-w-[1400px] mx-auto p-4 lg:p-8">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}
