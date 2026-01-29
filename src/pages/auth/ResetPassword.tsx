import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useTranslation } from 'react-i18next';
import { Lock, Eye, EyeOff, Check, AlertCircle, ArrowLeft, ArrowRight, KeyRound } from 'lucide-react';
import clsx from 'clsx';

export default function ResetPassword() {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const isRtl = i18n.dir() === 'rtl';
    const Arrow = isRtl ? ArrowLeft : ArrowRight;

    useEffect(() => {
        // Check if we have a session (hash fragment from email link)
        // Ideally Supabase automatically handles the session recovery if the link is correct
        // We can just verify if the user is logged in or if there's a recovery token? 
        // Supabase auto-logs in the user for recovery flows usually.
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session) {
                // If there is no session, maybe the link is invalid or expired
                // But let's check if the URL has a hash first (sometimes it's processed after mount)

            }
        });

        // Listen for auth state changes
        const { data: authListener } = supabase.auth.onAuthStateChange(async (event) => {
            if (event === 'PASSWORD_RECOVERY') {
                // Determine if we are in recovery mode
            }
        });

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError(t('auth.errors.passwordMismatch'));
            return;
        }
        if (password.length < 8) {
            setError(t('auth.passwordRules'));
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const { error } = await supabase.auth.updateUser({ password: password });
            if (error) throw error;
            setSuccess(true);
        } catch (err: any) {
            setError(err.message || 'Failed to update password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] relative overflow-hidden font-sans text-slate-800">
            {/* Custom Animations & Styles */}
            <style>{`
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

            <div className="relative z-10 w-full max-w-md p-4">
                <div className="glass-card rounded-[32px] p-8 md:p-10 shadow-2xl">

                    {!success ? (
                        <>
                            <div className="text-center mb-8">
                                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                                    <KeyRound size={32} />
                                </div>
                                <h2 className="text-2xl font-bold text-slate-900">{t('auth.resetPassword.title')}</h2>
                                <p className="text-slate-500 mt-2 text-sm">{t('auth.resetPassword.desc')}</p>
                            </div>

                            {error && (
                                <div className="mb-6 bg-red-50 text-red-600 p-3 rounded-xl text-sm flex items-center gap-3 border border-red-100 animate-fadeIn">
                                    <AlertCircle size={16} className="shrink-0" />
                                    <span>{error}</span>
                                </div>
                            )}

                            <form onSubmit={handleUpdatePassword} className="space-y-6">
                                <div className="space-y-4">
                                    {/* New Password */}
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mx-1">
                                            {t('auth.resetPassword.newPasswordLabel')}
                                        </label>
                                        <div className="relative">
                                            <div className={clsx("absolute top-[13px] text-slate-400 pointer-events-none z-10 flex items-center justify-center w-5 h-5", isRtl ? "right-3" : "left-3")}>
                                                <Lock size={18} />
                                            </div>
                                            <Input
                                                type={showPassword ? "text" : "password"}
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                required
                                                placeholder="••••••••"
                                                className="bg-white/60 border-slate-200 focus:bg-white h-12 rounded-xl text-base shadow-sm px-10"
                                            />
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

                                    {/* Confirm Password */}
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mx-1">
                                            {t('auth.resetPassword.confirmPasswordLabel')}
                                        </label>
                                        <div className="relative">
                                            <div className={clsx("absolute top-[13px] text-slate-400 pointer-events-none z-10 flex items-center justify-center w-5 h-5", isRtl ? "right-3" : "left-3")}>
                                                <Lock size={18} />
                                            </div>
                                            <Input
                                                type={showConfirmPassword ? "text" : "password"}
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                required
                                                placeholder="••••••••"
                                                className="bg-white/60 border-slate-200 focus:bg-white h-12 rounded-xl text-base shadow-sm px-10"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className={clsx("absolute top-[13px] text-slate-400 hover:text-slate-600 p-0 z-20 flex items-center justify-center w-5 h-5", isRtl ? "left-3" : "right-3")}
                                                tabIndex={-1}
                                            >
                                                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full h-12 text-base font-bold shadow-lg shadow-primary/25 rounded-xl hover:shadow-primary/40 transition-all duration-300"
                                    size="lg"
                                    isLoading={loading}
                                >
                                    {t('auth.resetPassword.submit')}
                                </Button>
                            </form>
                        </>
                    ) : (
                        <div className="text-center py-4">
                            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                                <Check size={32} strokeWidth={3} />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 mb-2">{t('auth.resetPassword.successTitle')}</h2>
                            <p className="text-slate-600 mb-8 max-w-[280px] mx-auto leading-relaxed">
                                {t('auth.resetPassword.successDesc')}
                            </p>
                            <Button
                                className="w-full h-12 rounded-xl text-base font-bold"
                                onClick={() => navigate('/login')}
                            >
                                <span className="flex items-center justify-center gap-2">
                                    {t('auth.resetPassword.loginNow')}
                                    <Arrow size={18} />
                                </span>
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
