import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useTranslation } from 'react-i18next';
import {
    Mail,
    Lock,
    ShieldCheck,
    Truck,
    MessageCircle,
    Star,
    Eye,
    EyeOff,
    Check,
    X,
    Info,
    ArrowRight,
    ArrowLeft,
    ShoppingBag,
    Calendar,
    KeyRound
} from 'lucide-react';
import clsx from 'clsx';

export default function Login() {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showWhyUs, setShowWhyUs] = useState(false);

    // Forgot Password State
    const [showForgotModal, setShowForgotModal] = useState(false);
    const [forgotEmail, setForgotEmail] = useState('');
    const [forgotLoading, setForgotLoading] = useState(false);
    const [forgotError, setForgotError] = useState<string | null>(null);
    const [forgotSuccess, setForgotSuccess] = useState(false);

    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const isRtl = i18n.dir() === 'rtl';
    const Arrow = isRtl ? ArrowLeft : ArrowRight;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (error) setError(null);
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: formData.email,
                password: formData.password,
            });

            if (error) throw error;

            if (data.user) {
                navigate('/', { replace: true });
            }
        } catch (err: any) {
            setError(err.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!forgotEmail) return;

        setForgotLoading(true);
        setForgotError(null);
        setForgotSuccess(false);

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
                redirectTo: `${window.location.origin}/auth/reset`,
            });

            if (error) throw error;
            setForgotSuccess(true);
        } catch (err: any) {
            setForgotError(err.message || 'Failed to send reset link');
        } finally {
            setForgotLoading(false);
        }
    };

    const closeForgotModal = () => {
        setShowForgotModal(false);
        setForgotEmail('');
        setForgotError(null);
        setForgotSuccess(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] relative overflow-hidden font-sans text-slate-800">
            {/* Custom Animations & Styles */}
            <style>{`
                @keyframes float-slow {
                    0%, 100% { transform: translate(0, 0); }
                    50% { transform: translate(15px, -15px); }
                }
                @keyframes pulse-glow {
                    0%, 100% { opacity: 0.4; }
                    50% { opacity: 0.7; }
                }
                .glass-card {
                    background: rgba(255, 255, 255, 0.75);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.8);
                    box-shadow: 0 20px 40px -10px rgba(100, 116, 139, 0.1), 0 0 0 1px rgba(255,255,255,0.5) inset;
                }
                .dot-pattern {
                    background-image: radial-gradient(#cbd5e1 1px, transparent 1px);
                    background-size: 32px 32px;
                }
            `}</style>

            {/* Background Layers */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-blue-50/40 z-0"></div>
            <div className="absolute inset-0 dot-pattern opacity-[0.4] z-0"></div>

            {/* Ambient Animated Blobs */}
            <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-cyan-100/30 rounded-full blur-[100px] pointer-events-none animate-pulse-glow" />
            <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-blue-100/30 rounded-full blur-[100px] pointer-events-none animate-pulse-glow" style={{ animationDelay: '2s' }} />

            {/* Main Container - Forced LTR Layout for Physical Placement */}
            <div dir="ltr" className="relative z-10 w-full max-w-7xl mx-auto p-4 md:p-8 grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-16 items-center h-full min-h-screen lg:min-h-[800px]">

                {/* LEFT Column: Login Form Card */}
                <div className="order-2 md:order-1 md:col-span-5 lg:col-span-5 w-full flex flex-col items-center" dir={isRtl ? 'rtl' : 'ltr'}>
                    <div className="w-full max-w-[420px] relative group">

                        {/* Card Glow Effect Behind */}
                        <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-cyan-300/20 rounded-[32px] blur-xl opacity-0 group-hover:opacity-60 transition-opacity duration-1000"></div>

                        {/* Glass Login Card */}
                        <div className="relative glass-card rounded-[28px] p-8 md:p-10 transform transition-all duration-300 hover:scale-[1.005]">

                            <div className="mb-8 text-center md:text-start">
                                <h2 className="text-3xl font-bold text-slate-900 font-heading tracking-tight">{t('auth.loginTitle')}</h2>
                                <p className="text-slate-500 mt-2 text-sm md:text-base">{t('auth.loginHelper')}</p>
                            </div>

                            {error && (
                                <div className="mb-6 bg-red-50 text-red-600 p-3 rounded-xl text-sm flex items-center gap-3 border border-red-100 animate-fadeIn">
                                    <Info size={16} className="shrink-0" />
                                    <span>{error}</span>
                                </div>
                            )}

                            <form onSubmit={handleLogin} className="space-y-6">
                                <div className="space-y-5">
                                    {/* Email Field */}
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mx-1">{t('common.email')}</label>
                                        <Input
                                            name="email"
                                            type="email"
                                            placeholder="name@example.com"
                                            value={formData.email}
                                            onChange={handleChange}
                                            icon={<Mail size={18} className="text-slate-400" />}
                                            required
                                            autoComplete="email"
                                            className="bg-white/60 border-slate-200 focus:bg-white focus:border-primary/50 transition-all h-12 rounded-xl text-base shadow-sm"
                                        />
                                    </div>

                                    {/* Password Field */}
                                    <div className="space-y-1.5">
                                        <div className="flex justify-between items-center mx-1">
                                            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">{t('common.placeholders.password')}</label>
                                        </div>
                                        <div className="relative">
                                            {/* Manually Placed Lock Icon - Always on the Start side */}
                                            <div className={clsx("absolute top-[13px] text-slate-400 pointer-events-none z-10 flex items-center justify-center w-5 h-5", isRtl ? "right-3" : "left-3")}>
                                                <Lock size={18} />
                                            </div>

                                            <Input
                                                name="password"
                                                type={showPassword ? "text" : "password"}
                                                placeholder="••••••••"
                                                value={formData.password}
                                                onChange={handleChange}
                                                // Removed 'icon' prop to act manually
                                                required
                                                autoComplete="current-password"
                                                // Added px-10 (or equivalent padding) to clear both icons
                                                className="bg-white/60 border-slate-200 focus:bg-white focus:border-primary/50 transition-all h-12 rounded-xl text-base shadow-sm px-10"
                                            />

                                            {/* Eye Button - Always on the End side */}
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className={clsx("absolute top-[13px] text-slate-400 hover:text-slate-600 p-0 z-20 flex items-center justify-center w-5 h-5", isRtl ? "left-3" : "right-3")}
                                                tabIndex={-1}
                                            >
                                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Additional Options */}
                                    <div className="flex items-center justify-between text-sm pt-1">
                                        <label className="flex items-center gap-2 cursor-pointer text-slate-600 hover:text-slate-900 transition-colors select-none">
                                            <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary/20 accent-primary" />
                                            <span>{t('auth.rememberMe')}</span>
                                        </label>

                                        <button
                                            type="button"
                                            className="text-primary font-medium hover:underline focus:outline-none"
                                            onClick={() => setShowForgotModal(true)}
                                        >
                                            {t('auth.forgotPasswordLink')}
                                        </button>
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <Button
                                    type="submit"
                                    className="w-full h-12 text-base font-bold shadow-lg shadow-primary/25 rounded-xl hover:shadow-primary/40 transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0"
                                    size="lg"
                                    isLoading={loading}
                                >
                                    <span className="flex items-center justify-center gap-2">
                                        {t('common.login')}
                                        {!loading && <Arrow size={18} />}
                                    </span>
                                </Button>
                            </form>

                            {/* Footer */}
                            <div className="mt-8 pt-6 border-t border-slate-200/60 text-center">
                                <p className="text-slate-600 text-sm">
                                    {t('auth.noAccount')}{' '}
                                    <Link to="/signup" className="text-primary font-bold hover:text-primary-dark hover:underline transition-colors px-1">
                                        {t('auth.signupLink')}
                                    </Link>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT Column: Hero Content */}
                <div className="order-1 md:order-2 md:col-span-7 lg:col-span-7 flex flex-col justify-center items-center md:items-start text-center md:text-start space-y-8 pt-4 md:pt-0" dir={isRtl ? 'rtl' : 'ltr'}>

                    {/* Brand Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-slate-100 mb-2 hover:shadow-md transition-shadow cursor-default">
                        <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                        <span className="text-sm font-bold text-slate-800 tracking-wide">{t('common.appName')}</span>
                    </div>

                    {/* Headlines */}
                    <div className="space-y-4 max-w-2xl">
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 font-heading leading-[1.1] tracking-tight">
                            {t('auth.welcomeTitle')}
                        </h1>
                        <p className="text-lg md:text-xl text-slate-500 leading-relaxed max-w-lg">
                            {t('auth.welcomeSubtitle')}
                        </p>
                    </div>

                    {/* Trust Chips */}
                    <div className="flex flex-wrap justify-center md:justify-start gap-3">
                        {[
                            { icon: ShieldCheck, text: t('auth.badges.securePay') },
                            { icon: Truck, text: t('auth.badges.fastShipping') },
                            { icon: MessageCircle, text: t('auth.badges.support') }
                        ].map((badge, idx) => (
                            <div key={idx} className="flex items-center gap-2 px-4 py-2.5 bg-white/60 backdrop-blur-md rounded-2xl border border-white/50 shadow-sm text-sm font-medium text-slate-700 hover:bg-white transition-colors cursor-default select-none">
                                <badge.icon size={16} className="text-primary" />
                                <span>{badge.text}</span>
                            </div>
                        ))}
                    </div>

                    {/* Rating Row */}
                    <div className="flex items-center gap-6 pt-2">
                        <div className="flex flex-col items-start gap-1">
                            <div className="flex text-amber-400">
                                {[1, 2, 3, 4, 5].map(i => <Star key={i} size={16} fill="currentColor" />)}
                            </div>
                            <div className="text-xs font-medium text-slate-500">
                                4.9/5 • {t('auth.rating')}
                            </div>
                        </div>
                        <div className="h-8 w-px bg-slate-200"></div>
                        <button onClick={() => setShowWhyUs(true)} className="text-sm font-medium text-primary hover:underline underline-offset-4">
                            {t('auth.whyChooseUsLink')}
                        </button>
                    </div>

                    {/* Quick Links (Desktop Only - Optional Extra) */}
                    <div className="hidden md:flex items-center gap-6 pt-8 opacity-70 hover:opacity-100 transition-opacity">
                        <Link to="/shop" className="flex items-center gap-2 text-sm text-slate-500 hover:text-primary transition-colors">
                            <ShoppingBag size={14} />
                            <span>{t('auth.quick.allProducts')}</span>
                        </Link>
                        <Link to="/booking" className="flex items-center gap-2 text-sm text-slate-500 hover:text-primary transition-colors">
                            <Calendar size={14} />
                            <span>{t('auth.quick.bookExam')}</span>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Why Choose Us Modal */}
            {showWhyUs && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-sm animate-fadeIn" dir={isRtl ? 'rtl' : 'ltr'}>
                    <div className="relative bg-white rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-2xl glass-card">
                        <button
                            onClick={() => setShowWhyUs(false)}
                            className="absolute top-4 right-4 rtl:left-4 rtl:right-auto text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 transition-colors"
                        >
                            <X size={20} />
                        </button>

                        <div className="text-center mb-6">
                            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3 text-primary">
                                <Star size={24} fill="currentColor" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900">{t('auth.whyChooseUs.title')}</h3>
                        </div>

                        <ul className="space-y-4">
                            {[
                                t('auth.whyChooseUs.point1'),
                                t('auth.whyChooseUs.point2'),
                                t('auth.whyChooseUs.point3')
                            ].map((point, idx) => (
                                <li key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                                    <div className="mt-0.5 w-5 h-5 bg-green-100 text-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                                        <Check size={12} strokeWidth={3} />
                                    </div>
                                    <span className="text-slate-700 font-medium text-sm">{point}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}

            {/* Forgot Password Modal */}
            {showForgotModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-sm animate-fadeIn" dir={isRtl ? 'rtl' : 'ltr'}>
                    <div className="relative bg-white rounded-3xl p-6 md:p-10 max-w-md w-full shadow-2xl glass-card" dir={isRtl ? 'rtl' : 'ltr'}>
                        <button
                            onClick={closeForgotModal}
                            className="absolute top-4 right-4 rtl:left-4 rtl:right-auto text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 transition-colors"
                        >
                            <X size={20} />
                        </button>

                        {!forgotSuccess ? (
                            <>
                                <div className="text-center mb-8">
                                    <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                                        <KeyRound size={28} />
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-900 mb-2">{t('auth.forgotPassword.title')}</h3>
                                    <p className="text-slate-500 text-sm">{t('auth.forgotPassword.subtitle')}</p>
                                </div>

                                {forgotError && (
                                    <div className="mb-6 bg-red-50 text-red-600 p-3 rounded-xl text-sm flex items-center gap-3 border border-red-100">
                                        <Info size={16} className="shrink-0" />
                                        <span>{forgotError}</span>
                                    </div>
                                )}

                                <form onSubmit={handleForgotPassword} className="space-y-6">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mx-1">
                                            {t('auth.forgotPassword.emailLabel')}
                                        </label>
                                        <Input
                                            type="email"
                                            value={forgotEmail}
                                            onChange={(e) => setForgotEmail(e.target.value)}
                                            icon={<Mail size={18} className="text-slate-400" />}
                                            placeholder="name@example.com"
                                            required
                                            className="bg-white/60 border-slate-200 focus:bg-white h-12 rounded-xl text-base shadow-sm"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="h-11 rounded-xl border-slate-200 hover:bg-slate-50"
                                            onClick={closeForgotModal}
                                        >
                                            {t('auth.forgotPassword.cancel')}
                                        </Button>
                                        <Button
                                            type="submit"
                                            className="h-11 rounded-xl shadow-lg shadow-primary/20"
                                            isLoading={forgotLoading}
                                        >
                                            {t('auth.forgotPassword.sendLink')}
                                        </Button>
                                    </div>
                                </form>
                            </>
                        ) : (
                            <div className="text-center py-4">
                                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                                    <Check size={32} strokeWidth={3} />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 mb-2">{t('auth.forgotPassword.successTitle')}</h3>
                                <p className="text-slate-600 mb-8 max-w-[280px] mx-auto leading-relaxed">
                                    {t('auth.forgotPassword.successDesc').replace('{email}', forgotEmail)}
                                </p>
                                <Button
                                    className="w-full h-12 rounded-xl text-base font-bold"
                                    onClick={closeForgotModal}
                                >
                                    {t('auth.forgotPassword.backToLogin')}
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
