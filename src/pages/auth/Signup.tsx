import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useTranslation } from 'react-i18next';
import {
    User,
    Mail,
    Lock,
    Phone,
    ShieldCheck,
    Truck,
    MessageCircle,
    Star,
    Eye,
    EyeOff,
    ArrowLeft,
    ArrowRight,
    ShoppingBag,
    AlertCircle
} from 'lucide-react';
import clsx from 'clsx';

export default function Signup() {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
    });
    const [agreeTerms, setAgreeTerms] = useState(false);

    const isRtl = i18n.dir() === 'rtl';
    const Arrow = isRtl ? ArrowLeft : ArrowRight;

    // Password strength calculation
    const getPasswordStrength = (pass: string) => {
        if (!pass) return { score: 0, label: '' };
        let score = 0;
        if (pass.length >= 8) score++;
        if (/\d/.test(pass)) score++;
        if (/[A-Z]/.test(pass)) score++;
        if (/[^A-Z0-9]/i.test(pass)) score++;

        if (score <= 2) return { score, label: t('auth.strength.weak'), color: 'bg-red-500', width: '33%' };
        if (score === 3) return { score, label: t('auth.strength.medium'), color: 'bg-yellow-500', width: '66%' };
        return { score, label: t('auth.strength.strong'), color: 'bg-green-500', width: '100%' };
    };

    const strength = getPasswordStrength(formData.password);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (error) setError(null);
    };

    const validateForm = () => {
        if (!formData.fullName) return t('common.placeholders.fullName');
        if (!formData.email) return t('common.placeholders.email');
        if (!formData.phone || formData.phone.length < 9) return t('auth.errors.phoneRequired');
        if (formData.password.length < 8 || !/\d/.test(formData.password)) return t('auth.passwordRules');
        if (formData.password !== formData.confirmPassword) return t('auth.errors.passwordMismatch');
        if (!agreeTerms) return t('auth.agreeTerms');
        return null;
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();

        const validationError = validateForm();
        if (validationError) {
            setError(validationError);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const { data, error } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        full_name: formData.fullName,
                        phone: formData.phone,
                    },
                },
            });

            if (error) throw error;

            if (data.user) {
                navigate('/admin');
            }
        } catch (err: any) {
            setError(err.message || 'Signup failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] relative overflow-hidden font-sans text-slate-800">
            {/* Custom Animations */}
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

            {/* Ambient Light Effects */}
            <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-cyan-100/30 rounded-full blur-[120px] pointer-events-none animate-pulse-glow" />
            <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-blue-100/30 rounded-full blur-[100px] pointer-events-none animate-pulse-glow" style={{ animationDelay: '2s' }} />

            {/* Main Container - Split Layout - Forced LTR for Desktop Layout */}
            <div dir="ltr" className="relative z-10 w-full max-w-7xl mx-auto p-4 md:p-8 grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-16 items-center h-full min-h-screen lg:min-h-[800px]">

                {/* LEFT Column: Signup Form Card */}
                {/* On Mobile: Order 2 (Bottom) | On Desktop: Order 1 (Left) */}
                <div className="order-2 md:order-1 md:col-span-5 lg:col-span-5 w-full flex flex-col items-center" dir={isRtl ? 'rtl' : 'ltr'}>
                    <div className="w-full max-w-[420px] relative group">

                        {/* Card Glow Effect */}
                        <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-cyan-300/20 rounded-[32px] blur-xl opacity-0 group-hover:opacity-60 transition-opacity duration-1000"></div>

                        <div className="relative glass-card rounded-[28px] p-6 md:p-8 transform transition-all duration-300 hover:scale-[1.005]">

                            <div className="mb-6 text-center md:text-start">
                                <h2 className="text-2xl font-bold text-slate-900 font-heading">{t('auth.signupTitle')}</h2>
                                <p className="text-slate-500 mt-1 text-sm">{t('auth.signupSubtitle')}</p>
                            </div>

                            {error && (
                                <div className="mb-6 bg-red-50 text-red-600 p-3 rounded-xl text-sm flex items-center gap-3 border border-red-100 animate-fadeIn">
                                    <AlertCircle size={16} className="shrink-0" />
                                    <span>{error}</span>
                                </div>
                            )}

                            <form onSubmit={handleSignup} className="space-y-4">
                                <div className="space-y-4">
                                    {/* Full Name */}
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mx-1">{t('common.fullName')}</label>
                                        <Input
                                            name="fullName"
                                            value={formData.fullName}
                                            onChange={handleChange}
                                            placeholder={t('common.placeholders.fullName')}
                                            icon={<User size={18} className="text-slate-400" />}
                                            required
                                            className="bg-white/60 border-slate-200 focus:bg-white h-11 rounded-xl text-base shadow-sm"
                                        />
                                    </div>

                                    {/* Email */}
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mx-1">{t('common.email')}</label>
                                        <Input
                                            name="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder={t('common.placeholders.email')}
                                            icon={<Mail size={18} className="text-slate-400" />}
                                            required
                                            className="bg-white/60 border-slate-200 focus:bg-white h-11 rounded-xl text-base shadow-sm"
                                        />
                                    </div>

                                    {/* Phone - New Field */}
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mx-1">{t('common.phone')}</label>
                                        <Input
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            placeholder={t('common.placeholders.phone')}
                                            icon={<Phone size={18} className="text-slate-400" />}
                                            required
                                            className="bg-white/60 border-slate-200 focus:bg-white h-11 rounded-xl text-base shadow-sm"
                                        />
                                    </div>

                                    {/* Password - Manually placed icons for consistency */}
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mx-1">{t('common.placeholders.password')}</label>
                                        <div className="relative">
                                            <div className={clsx("absolute top-[11px] text-slate-400 pointer-events-none z-10 flex items-center justify-center w-5 h-5", isRtl ? "right-3" : "left-3")}>
                                                <Lock size={18} />
                                            </div>

                                            <Input
                                                name="password"
                                                type={showPassword ? "text" : "password"}
                                                value={formData.password}
                                                onChange={handleChange}
                                                placeholder="••••••••"
                                                required
                                                className="bg-white/60 border-slate-200 focus:bg-white h-11 rounded-xl text-base shadow-sm px-10"
                                            />

                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className={clsx("absolute top-[11px] text-slate-400 hover:text-slate-600 p-0 z-20 flex items-center justify-center w-5 h-5", isRtl ? "left-3" : "right-3")}
                                                tabIndex={-1}
                                            >
                                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                        {/* Password Strength Meter */}
                                        {formData.password && (
                                            <div className="flex items-center gap-2 px-1 animate-fadeIn">
                                                <div className="flex-1 h-1 bg-slate-200 rounded-full overflow-hidden">
                                                    <div className={clsx("h-full transition-all duration-300", strength.color)} style={{ width: strength.width }}></div>
                                                </div>
                                                <span className="text-[10px] uppercase font-bold text-slate-400">{strength.label}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Confirm Password */}
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mx-1">{t('auth.confirmPassword')}</label>
                                        <div className="relative">
                                            <div className={clsx("absolute top-[11px] text-slate-400 pointer-events-none z-10 flex items-center justify-center w-5 h-5", isRtl ? "right-3" : "left-3")}>
                                                <Lock size={18} />
                                            </div>

                                            <Input
                                                name="confirmPassword"
                                                type={showConfirmPassword ? "text" : "password"}
                                                value={formData.confirmPassword}
                                                onChange={handleChange}
                                                placeholder="••••••••"
                                                required
                                                className="bg-white/60 border-slate-200 focus:bg-white h-11 rounded-xl text-base shadow-sm px-10"
                                            />

                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className={clsx("absolute top-[11px] text-slate-400 hover:text-slate-600 p-0 z-20 flex items-center justify-center w-5 h-5", isRtl ? "left-3" : "right-3")}
                                                tabIndex={-1}
                                            >
                                                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Terms Checkbox */}
                                    <div className="flex items-center gap-2 pt-2">
                                        <input
                                            type="checkbox"
                                            id="terms"
                                            checked={agreeTerms}
                                            onChange={(e) => setAgreeTerms(e.target.checked)}
                                            className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary/20 accent-primary cursor-pointer"
                                        />
                                        <label htmlFor="terms" className="text-xs font-medium text-slate-500 cursor-pointer hover:text-primary transition-colors">
                                            {t('auth.agreeTerms')}
                                        </label>
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full h-12 text-base font-bold shadow-lg shadow-primary/25 rounded-xl hover:shadow-primary/40 transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 mt-4"
                                    size="lg"
                                    isLoading={loading}
                                    disabled={!agreeTerms}
                                >
                                    <span className="flex items-center justify-center gap-2">
                                        {t('auth.signupTitle')}
                                        {!loading && <Arrow size={18} />}
                                    </span>
                                </Button>
                            </form>

                            <div className="mt-6 pt-4 border-t border-slate-100/80 text-center">
                                <p className="text-slate-600 text-sm">
                                    {t('auth.haveAccount')}{' '}
                                    <Link to="/login" className="text-primary font-bold hover:text-primary-dark hover:underline transition-colors px-1">
                                        {t('auth.loginLink')}
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
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 font-heading leading-tight tracking-tight">
                            {t('auth.signupTitle')}
                        </h1>
                        <p className="text-lg md:text-xl text-slate-500 leading-relaxed max-w-lg">
                            {t('auth.signupSubtitle')}
                        </p>
                    </div>

                    {/* Trust Chips */}
                    <div className="flex flex-wrap justify-center md:justify-start gap-3">
                        {[
                            { icon: ShieldCheck, text: t('auth.badges.securePay') },
                            { icon: Truck, text: t('auth.badges.fastShipping') },
                            { icon: MessageCircle, text: t('auth.badges.support') }
                        ].map((badge, idx) => (
                            <div key={idx} className="flex items-center gap-2 px-4 py-2.5 bg-white/60 backdrop-blur-md rounded-2xl border border-white/50 shadow-sm text-sm font-medium text-slate-700 hover:bg-white transition-colors">
                                <badge.icon size={16} className="text-primary" />
                                <span>{badge.text}</span>
                            </div>
                        ))}
                    </div>

                    {/* Rating */}
                    <div className="flex items-center gap-6 pt-2">
                        <div className="flex flex-col items-start gap-1">
                            <div className="flex text-amber-400">
                                {[1, 2, 3, 4, 5].map(i => <Star key={i} size={16} fill="currentColor" />)}
                            </div>
                            <div className="text-xs font-medium text-slate-500">
                                4.9/5 • {t('auth.rating')}
                            </div>
                        </div>
                    </div>

                    {/* Quick Link - Back to Login/Shop */}
                    <div className="hidden md:flex items-center gap-6 pt-8 opacity-70 hover:opacity-100 transition-opacity">
                        <Link to="/shop" className="flex items-center gap-2 text-sm text-slate-500 hover:text-primary transition-colors">
                            <ShoppingBag size={14} />
                            <span>{t('auth.quick.allProducts')}</span>
                        </Link>
                    </div>

                </div>
            </div>
        </div>
    );
}
