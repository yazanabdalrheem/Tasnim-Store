import { useState, useEffect, useRef } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Menu, X, ShoppingCart, User, Home, ShoppingBag, Clock, Search, Shield, Settings as SettingsIcon, LogOut, Heart } from "lucide-react";
import Background from "./Background";
import Footer from "./Footer";
import { useCart } from "../../context/CartContext";
import { useAdmin } from "../../hooks/useAdmin";
import { supabase } from "../../lib/supabase";
import { Button } from "../ui/Button";
import clsx from "clsx";

export default function Layout() {
    const { t, i18n } = useTranslation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { itemCount } = useCart();
    const { isAdmin } = useAdmin();
    const profileRef = useRef<HTMLDivElement>(null);

    const lang = (i18n.language || 'en') as 'he' | 'ar' | 'en';
    const isRtl = lang === 'he' || lang === 'ar';
    const dir = isRtl ? 'rtl' : 'ltr';

    useEffect(() => {
        document.documentElement.dir = dir;
        document.documentElement.lang = lang;
    }, [dir, lang]);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener("scroll", handleScroll);

        // Click outside listener for profile menu
        const handleClickOutside = (event: MouseEvent) => {
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            window.removeEventListener("scroll", handleScroll);
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    useEffect(() => {
        setIsMenuOpen(false);
        setIsProfileOpen(false);
    }, [location]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/login');
    };

    const handleAdminClick = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        navigate('/admin');
        setIsProfileOpen(false);
    };

    const navLinks = [
        { name: t('nav.home') || 'Home', path: "/" },
        { name: t('nav.shop') || 'Shop', path: "/shop" },
        { name: t('nav.bookExam') || 'Book Exam', path: "/book-exam" },
        { name: t('nav.askTasnim') || 'FAQ', path: "/ask" },
        { name: t('nav.about') || 'About', path: "/about" },

    ];

    return (
        <div className="min-h-screen flex flex-col font-body text-[var(--color-text-main)]">
            <Background />

            {/* Header */}
            <header
                className={clsx(
                    "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
                    scrolled
                        ? "bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100 py-3"
                        : "bg-transparent py-5"
                )}
            >
                <div className="container mx-auto px-4 flex items-center justify-between max-w-7xl">
                    {/* Logo - Minimal */}
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="w-9 h-9 bg-primary text-white rounded-lg flex items-center justify-center shadow-lg shadow-primary/30">
                            <span className="font-heading font-bold text-xl">T</span>
                        </div>
                        <span className="text-xl font-bold font-heading tracking-tight text-slate-900">
                            TasnimStore
                        </span>
                    </Link>

                    {/* Desktop Nav - Centered */}
                    <nav className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={clsx(
                                    "text-sm font-medium transition-colors hover:text-primary",
                                    location.pathname === link.path ? "text-primary font-semibold" : "text-slate-500"
                                )}
                            >
                                {link.name}
                            </Link>
                        ))}
                    </nav>

                    {/* Actions - Right */}
                    <div className="hidden md:flex items-center gap-3">

                        <Link to="/shop">
                            <Button variant="ghost" size="sm" className="!p-2 text-slate-500 hover:text-primary rounded-full">
                                <Search size={20} />
                            </Button>
                        </Link>

                        <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
                            {['he', 'ar', 'en'].map((code) => (
                                <button
                                    key={code}
                                    onClick={() => i18n.changeLanguage(code)}
                                    className={clsx(
                                        "text-[10px] font-bold px-2 py-1 rounded-md transition-all uppercase",
                                        lang === code
                                            ? "bg-white text-primary shadow-sm"
                                            : "text-slate-400 hover:text-slate-600"
                                    )}
                                >
                                    {code}
                                </button>
                            ))}
                        </div>

                        <div className="w-px h-5 bg-gray-200"></div>

                        {/* Profile Dropdown */}
                        <div className="relative" ref={profileRef}>
                            <Button
                                variant="ghost"
                                size="sm"
                                className={clsx("!p-2 text-slate-500 hover:text-primary rounded-full transition-colors", isProfileOpen && "bg-slate-100 text-primary")}
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                            >
                                <User size={20} />
                            </Button>

                            {isProfileOpen && (
                                <div className={clsx(
                                    "absolute top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 animate-fade-in z-50",
                                    isRtl ? "left-0" : "right-0"
                                )}>
                                    <div className="mb-1 px-3 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">{t('nav.account', 'Account')}</div>

                                    {isAdmin && (
                                        <button
                                            onClick={handleAdminClick}
                                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 text-slate-700 font-medium text-sm text-start transition-colors mb-1"
                                        >
                                            <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center shrink-0">
                                                <Shield size={14} />
                                            </div>
                                            {t('menu.adminPanel', 'Admin Panel')}
                                        </button>
                                    )}

                                    <Link
                                        to="/account"
                                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 text-slate-700 font-medium text-sm transition-colors"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center shrink-0">
                                            <SettingsIcon size={16} />
                                        </div>
                                        {t('menu.settings', 'Settings')}
                                    </Link>

                                    <Link
                                        to="/account/wishlist"
                                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 text-slate-700 font-medium text-sm transition-colors"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center shrink-0">
                                            <Heart size={16} />
                                        </div>
                                        {t('wishlist.title', 'My Wishlist')}
                                    </Link>

                                    <div className="h-px bg-slate-100 my-1"></div>

                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-50 text-red-600 font-medium text-sm text-start transition-colors"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-red-100 text-red-500 flex items-center justify-center shrink-0">
                                            <LogOut size={16} />
                                        </div>
                                        {t('menu.logout', 'Logout')}
                                    </button>
                                </div>
                            )}
                        </div>

                        <Link to="/cart">
                            <Button variant="ghost" size="sm" className="relative !p-2 text-slate-500 hover:text-primary rounded-full">
                                <ShoppingCart size={20} />
                                {itemCount > 0 && (
                                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-white text-[10px] font-bold flex items-center justify-center rounded-full shadow-sm ring-2 ring-white">
                                        {itemCount}
                                    </span>
                                )}
                            </Button>
                        </Link>
                    </div>

                    {/* Mobile Toggle */}
                    <button
                        className="md:hidden p-2 text-slate-700 active:scale-95 transition-transform"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </header>

            {/* Mobile Menu Overlay */}
            {isMenuOpen && (
                <div className="fixed inset-0 z-40 bg-white pt-24 px-6 md:hidden animate-fade-in">
                    <div className="flex flex-col gap-6">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={clsx(
                                    "text-2xl font-bold transition-colors",
                                    location.pathname === link.path ? "text-primary" : "text-slate-800"
                                )}
                                onClick={() => setIsMenuOpen(false)}
                            >
                                {link.name}
                            </Link>
                        ))}
                        <div className="h-px bg-slate-100 my-2"></div>
                        <div className="flex items-center justify-between">
                            <Link to="/cart" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 text-lg font-medium text-slate-700">
                                <ShoppingCart size={20} />
                                {t('cart.title') || 'Cart'} ({itemCount})
                            </Link>
                        </div>
                        <div className="flex items-center justify-between">
                            <Link to="/account" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 text-lg font-medium text-slate-700">
                                <User size={20} />
                                {t('nav.account') || 'Account'}
                            </Link>
                        </div>

                        <div className="flex items-center justify-between mt-4">
                            <button onClick={() => { setIsMenuOpen(false); handleLogout(); }} className="flex items-center gap-3 text-lg font-medium text-red-600">
                                <LogOut size={20} />
                                {t('menu.logout', 'Logout')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <main className="flex-grow pt-24 pb-16 relative z-10 w-full max-w-[1920px] mx-auto">
                <Outlet />
            </main>

            <Footer />

            {/* Mobile Bottom Nav - Glassmorphism */}
            <div className="md:hidden fixed bottom-4 left-4 right-4 bg-white/90 backdrop-blur-lg border border-white/20 shadow-2xl rounded-2xl z-50 flex justify-around items-center px-2 py-3">
                <Link to="/" className={clsx("flex flex-col items-center gap-1 p-2 rounded-xl transition-colors", location.pathname === "/" ? "text-primary" : "text-slate-400")}>
                    <Home size={20} className={location.pathname === "/" ? "fill-current" : ""} />
                </Link>
                <Link to="/shop" className={clsx("flex flex-col items-center gap-1 p-2 rounded-xl transition-colors", location.pathname === "/shop" ? "text-primary" : "text-slate-400")}>
                    <ShoppingBag size={20} className={location.pathname === "/shop" ? "fill-current" : ""} />
                </Link>
                <Link to="/book-exam" className="relative -top-8 bg-primary text-white p-4 rounded-full shadow-xl shadow-primary/30 active:scale-95 transition-transform flex items-center justify-center ring-4 ring-white/50">
                    <Clock size={24} />
                </Link>
                <Link to="/cart" className={clsx("flex flex-col items-center gap-1 p-2 rounded-xl transition-colors", location.pathname === "/cart" ? "text-primary" : "text-slate-400")}>
                    <div className="relative">
                        <ShoppingCart size={20} className={location.pathname === "/cart" ? "fill-current" : ""} />
                        {itemCount > 0 && <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-red-500 text-white text-[9px] font-bold flex items-center justify-center rounded-full border border-white">{itemCount}</span>}
                    </div>
                </Link>
                <Link to="/account" className={clsx("flex flex-col items-center gap-1 p-2 rounded-xl transition-colors", location.pathname === "/account" ? "text-primary" : "text-slate-400")}>
                    <User size={20} className={location.pathname === "/account" ? "fill-current" : ""} />
                </Link>
            </div>
        </div>
    );
}
