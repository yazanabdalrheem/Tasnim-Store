import { useState, useEffect } from 'react';
import { useTranslation } from "react-i18next";
import { supabase } from "../lib/supabase";
import {
    Search, ChevronDown, ChevronUp, Send, MessageCircle,
    Clock, ShieldCheck, Mail, Phone, User,
    Sparkles, X, HelpCircle, Eye
} from 'lucide-react';
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { useToast } from "../context/ToastContext";
import Card from '../components/ui/Card';
import { clsx } from "clsx";

interface FAQItem {
    id: string;
    question_he: string;
    question_ar: string;
    question_en: string;
    answer_he: string;
    answer_ar: string;
    answer_en: string;
    category: string;
}

interface PublicQuestion {
    id: string;
    user_name: string;
    question: string;
    answer: string;
}

export default function AskTasnim() {
    const { t, i18n } = useTranslation();
    const lang = i18n.language as 'he' | 'ar' | 'en';
    const isRTL = lang === 'he' || lang === 'ar';

    // Data State
    const [activeTab, setActiveTab] = useState<'common' | 'community'>('common');
    const [searchQuery, setSearchQuery] = useState('');
    const [faqs, setFaqs] = useState<FAQItem[]>([]);
    const [publicQuestions, setPublicQuestions] = useState<PublicQuestion[]>([]);
    const [expandedFaq, setExpandedFaq] = useState<string | null>(null);

    // Form State
    const [askForm, setAskForm] = useState({
        name: '',
        phone: '',
        email: '',
        category: 'General',
        question: ''
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchData();
        fetchPublicQuestions();
    }, []);

    const fetchData = async () => {
        const { data } = await supabase.from('faq').select('*').order('created_at', { ascending: true });
        if (data) setFaqs(data);
    };

    const fetchPublicQuestions = async () => {
        const { data } = await supabase
            .from('questions')
            .select('*')
            .eq('is_public', true)
            .eq('status', 'approved')
            .eq('deleted_by_user', false)
            .order('created_at', { ascending: false });
        if (data) setPublicQuestions(data);
    };

    const { addToast } = useToast();

    const handleSubmitQuestion = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            // Get current user if logged in
            const { data: { user } } = await supabase.auth.getUser();

            // Prepend category if not supported database-side
            const finalQuestion = `[Category: ${askForm.category}] ${askForm.question} `;

            const { error } = await supabase.from('questions').insert([{
                user_name: askForm.name,
                user_phone: askForm.phone,
                question: finalQuestion,
                user_id: user?.id || null,  // Save user_id if logged in
            }]);

            if (error) throw error;
            addToast(t('ask.success', 'Question submitted successfully!'), 'success');
            setAskForm({ name: '', phone: '', email: '', category: 'General', question: '' });
        } catch (error: any) {
            console.error(error);
            addToast(error.message || t('ask.error', 'Error submitting question'), 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const getLocalized = (item: any, field: string) => {
        return item[`${field}_${lang}`] || item[`${field}_en`] || item[`${field}_he`] || '';
    };

    const filteredFaqs = faqs.filter(f =>
        getLocalized(f, 'question').toLowerCase().includes(searchQuery.toLowerCase()) ||
        getLocalized(f, 'answer').toLowerCase().includes(searchQuery.toLowerCase())
    );

    const categories = [
        { id: 'General', label: t('ask.cat.general', 'General') },
        { id: 'Lens', label: t('ask.cat.lens', 'Lenses') },
        { id: 'Frames', label: t('ask.cat.frames', 'Frames') },
        { id: 'Eye Exam', label: t('ask.cat.exam', 'Eye Exam') },
    ];

    return (
        <div className="min-h-screen bg-white relative overflow-hidden">
            {/* Subtle Dotted Background */}
            <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] opacity-[0.4] pointer-events-none" />

            {/* HERO SECTION */}
            <div className="relative pt-12 pb-16 md:pt-20 md:pb-24 px-4 overflow-hidden">
                <div className="container mx-auto max-w-7xl">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        {/* Text Content */}
                        <div className="relative z-10 text-center lg:text-start">
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 font-heading tracking-tight leading-tight">
                                {t('ask.title', 'Questions & Support')}
                            </h1>
                            <p className="text-lg md:text-xl text-slate-500 mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed font-light">
                                {t('ask.subtitle', 'Get professional answers for your vision needs. Browse our common questions or consult our experts directly.')}
                            </p>

                            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
                                <span className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 text-blue-700 text-sm font-bold border border-blue-100 shadow-sm">
                                    <ShieldCheck size={16} className={clsx("mr-2", isRTL && "mr-0 ml-2")} />
                                    {t('ask.verified', 'Verified Answers')}
                                </span>
                                <span className="inline-flex items-center px-4 py-2 rounded-full bg-green-50 text-green-700 text-sm font-bold border border-green-100 shadow-sm">
                                    <Clock size={16} className={clsx("mr-2", isRTL && "mr-0 ml-2")} />
                                    {t('ask.response', 'Response within 24h')}
                                </span>
                            </div>
                        </div>

                        {/* Illustration / Stats */}
                        <div className="relative hidden lg:block">
                            <div className="relative bg-white/80 backdrop-blur-md rounded-[32px] p-8 shadow-2xl border border-white/50 max-w-md ml-auto transform rotate-2 hover:rotate-0 transition-all duration-700">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                        <Sparkles size={28} />
                                    </div>
                                    <div>
                                        <div className="text-3xl font-bold text-slate-900">4.9/5</div>
                                        <div className="text-sm text-slate-500 font-medium">{t('ask.stats.rating', 'Customer Rating')}</div>
                                    </div>
                                </div>
                                <div className="h-px bg-slate-100 mb-6" />
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="flex -space-x-3 rtl:space-x-reverse">
                                        {['noa', 'adam', 'lina', 'yosef'].map((seed, i) => (
                                            <div
                                                key={i}
                                                className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 shadow-sm overflow-hidden flex items-center justify-center"
                                            >
                                                <img
                                                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`}
                                                    alt=""
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        const target = e.target as HTMLImageElement;
                                                        target.style.display = 'none';
                                                        const parent = target.parentElement;
                                                        if (parent && !parent.querySelector('svg')) {
                                                            parent.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-slate-400"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>';
                                                        }
                                                    }}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                    <span className="text-sm font-bold text-slate-700 px-2">+200</span>
                                </div>
                                <p className="text-sm text-slate-400 font-medium">{t('ask.stats.questions', 'Questions answered this month')}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* MAIN CONTENT GRID */}
            <div className="container mx-auto px-4 pb-24 max-w-7xl relative z-10">
                <div className="grid lg:grid-cols-12 gap-8 lg:gap-16">

                    {/* LEFT: ASK FORM (Sticky) */}
                    <div className="lg:col-span-5 relative order-2 lg:order-1">
                        <div className="sticky top-24">
                            {/* Section Background for the card */}
                            <div className="relative rounded-[32px] p-1" style={{ background: 'linear-gradient(180deg, rgba(59,130,246,0.06), transparent)' }}>
                                <Card className="p-8 border-slate-200 shadow-xl shadow-slate-200/50 rounded-[24px] bg-white relative overflow-hidden">
                                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl opacity-50" />

                                    <h3 className="text-2xl font-bold mb-1 text-slate-900 flex items-center gap-2 relative z-10">
                                        <Send size={24} className={clsx("text-primary", isRTL && "flip-horizontal")} />
                                        {t('ask.formTitle', 'Ask the Expert')}
                                    </h3>
                                    <p className="text-slate-500 mb-6 text-sm relative z-10">
                                        {t('ask.formDesc', 'Fill out the form below to get a professional response.')}
                                    </p>

                                    <form onSubmit={handleSubmitQuestion} className="space-y-5 relative z-10" noValidate>
                                        <Input
                                            label={
                                                <span className="flex items-center gap-1 font-semibold text-slate-900">
                                                    {t('ask.form.fullName', 'Full Name')} <span className="text-red-500">*</span>
                                                </span>
                                            }
                                            value={askForm.name}
                                            onChange={(e) => setAskForm({ ...askForm, name: e.target.value })}
                                            required
                                            placeholder={t('ask.form.fullNamePlaceholder', 'Enter your full name')}
                                            icon={<User size={18} />}
                                            className="bg-[#F8FAFC] border-slate-300 rounded-[14px] shadow-sm focus:border-primary focus:ring-4 focus:ring-blue-100 placeholder-slate-500 text-slate-900 font-medium"
                                        />

                                        <div className="grid grid-cols-2 gap-4">
                                            <Input
                                                label={
                                                    <span className="flex items-center gap-1 font-semibold text-slate-900">
                                                        {t('ask.form.phone', 'Phone')} <span className="text-red-500">*</span>
                                                    </span>
                                                }
                                                value={askForm.phone}
                                                onChange={(e) => setAskForm({ ...askForm, phone: e.target.value })}
                                                required
                                                type="tel"
                                                placeholder="050..."
                                                icon={<Phone size={18} />}
                                                className="bg-[#F8FAFC] border-slate-300 rounded-[14px] shadow-sm focus:border-primary focus:ring-4 focus:ring-blue-100 placeholder-slate-500 text-slate-900 font-medium"
                                            />
                                            <div className="space-y-1.5">
                                                <label className="text-sm font-semibold text-slate-900 ml-1 flex items-center gap-1">
                                                    {t('ask.form.category', 'Category')} <span className="text-red-500">*</span>
                                                </label>
                                                <div className="relative">
                                                    <select
                                                        value={askForm.category}
                                                        onChange={(e) => setAskForm({ ...askForm, category: e.target.value })}
                                                        className="w-full h-[46px] pl-4 pr-10 rounded-[14px] bg-[#F8FAFC] border border-slate-300 shadow-sm focus:border-primary focus:ring-4 focus:ring-blue-100 outline-none text-slate-900 appearance-none font-medium text-sm transition-all placeholder-slate-500"
                                                    >
                                                        {categories.map((c) => (
                                                            <option key={c.id} value={c.id}>{c.label}</option>
                                                        ))}
                                                    </select>
                                                    <ChevronDown className={clsx("absolute top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none", isRTL ? "left-3" : "right-3")} size={16} />
                                                </div>
                                            </div>
                                        </div>

                                        <Input
                                            label={<span className="font-semibold text-slate-900">{t('ask.form.email', 'Email (Optional)')}</span>}
                                            value={askForm.email}
                                            onChange={(e) => setAskForm({ ...askForm, email: e.target.value })}
                                            type="email"
                                            placeholder="example@gmail.com"
                                            icon={<Mail size={18} />}
                                            className="bg-[#F8FAFC] border-slate-300 rounded-[14px] shadow-sm focus:border-primary focus:ring-4 focus:ring-blue-100 placeholder-slate-500 text-slate-900 font-medium"
                                        />

                                        <div className="space-y-1.5">
                                            <label className="text-sm font-semibold text-slate-900 ml-1 flex items-center gap-1">
                                                {t('ask.form.question', 'Your Question')} <span className="text-red-500">*</span>
                                            </label>
                                            <textarea
                                                value={askForm.question}
                                                onChange={(e) => setAskForm({ ...askForm, question: e.target.value })}
                                                className="w-full min-h-[120px] p-4 rounded-[14px] bg-[#F8FAFC] border border-slate-300 shadow-sm focus:border-primary focus:ring-4 focus:ring-blue-100 outline-none text-slate-900 placeholder-slate-500 text-sm font-medium resize-none transition-all"
                                                required
                                                placeholder={t('ask.form.placeholders', 'Type clearly...')}
                                            />
                                        </div>

                                        <Button
                                            type="submit"
                                            className="w-full h-[52px] rounded-[14px] bg-primary text-white font-bold text-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2"
                                            isLoading={submitting}
                                            disabled={submitting}
                                        >
                                            <Send size={20} className={clsx(isRTL && "flip-horizontal")} />
                                            {t('ask.form.submit', 'Send Question')}
                                        </Button>

                                        <div className="flex justify-center items-center gap-2 text-[11px] text-slate-400">
                                            <ShieldCheck size={12} />
                                            {t('ask.privacy', 'Your information is secure and private.')}
                                        </div>
                                    </form>
                                </Card>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: FAQ CONTENT */}
                    <div className="lg:col-span-7 space-y-8 order-1 lg:order-2">

                        {/* Tab Switcher (Pill Style) */}
                        <div className="bg-slate-100 p-1.5 rounded-2xl flex relative max-w-md mx-auto lg:mx-0">
                            <button
                                onClick={() => setActiveTab('common')}
                                className={clsx(
                                    "flex-1 py-3 px-6 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2",
                                    activeTab === 'common'
                                        ? "bg-white text-slate-900 shadow-sm"
                                        : "text-slate-500 hover:text-slate-700"
                                )}
                            >
                                <HelpCircle size={18} />
                                {t('ask.faqTab', 'Common Questions')}
                            </button>
                            <button
                                onClick={() => setActiveTab('community')}
                                className={clsx(
                                    "flex-1 py-3 px-6 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2",
                                    activeTab === 'community'
                                        ? "bg-white text-slate-900 shadow-sm"
                                        : "text-slate-500 hover:text-slate-700"
                                )}
                            >
                                <MessageCircle size={18} />
                                {t('ask.community', 'Community')}
                            </button>
                        </div>

                        {/* Search Bar */}
                        <div className="relative group sticky top-[80px] z-30">
                            <div className="absolute inset-0 bg-white/80 backdrop-blur-xl rounded-2xl -m-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="relative">
                                <Search className={clsx("absolute top-1/2 -translate-y-1/2 text-slate-400", isRTL ? "right-4" : "left-4")} size={20} />
                                <input
                                    type="text"
                                    placeholder={t('ask.searchPlaceholder', 'Keywords like "Lens", "Exam"...')}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className={clsx(
                                        "w-full py-4 rounded-2xl border border-slate-200 bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary/50 outline-none shadow-sm text-slate-700 placeholder:text-slate-400 transition-all font-medium",
                                        isRTL ? "pr-12 pl-12" : "pl-12 pr-12"
                                    )}
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery('')}
                                        className={clsx("absolute top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 p-1", isRTL ? "left-4" : "right-4")}
                                    >
                                        <X size={16} />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Content Area */}
                        <div className="min-h-[400px]">
                            {activeTab === 'common' ? (
                                <div className="space-y-4">
                                    {/* Popular Mini Cards */}
                                    {!searchQuery && (
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                                            {filteredFaqs.slice(0, 3).map(faq => (
                                                <button
                                                    key={faq.id}
                                                    onClick={() => setExpandedFaq(faq.id)}
                                                    className="p-3 rounded-xl bg-blue-50/50 border border-blue-100 text-start hover:bg-blue-50 transition-colors"
                                                >
                                                    <div className="text-xs font-bold text-blue-600 mb-1 line-clamp-1">{getLocalized(faq, 'question')}</div>
                                                    <div className="text-[10px] text-blue-400">{t('ask.read', 'Read Answer')} →</div>
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {filteredFaqs.length === 0 ? (
                                        <div className="text-center py-20 flex flex-col items-center">
                                            <Search className="text-slate-200 mb-4" size={64} />
                                            <h3 className="text-lg font-bold text-slate-400">{t('common.noResults', 'No questions found')}</h3>
                                            <p className="text-slate-400 text-sm max-w-xs">{t('common.tryDifferent', 'Try different keywords or submit a new question.')}</p>
                                        </div>
                                    ) : (
                                        filteredFaqs.map((faq) => (
                                            <div
                                                key={faq.id}
                                                className={clsx(
                                                    "bg-white rounded-[20px] transition-all duration-300 overflow-hidden border",
                                                    expandedFaq === faq.id
                                                        ? "border-primary/30 shadow-lg shadow-primary/5 ring-4 ring-primary/5"
                                                        : "border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200"
                                                )}
                                            >
                                                <button
                                                    onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                                                    className="w-full flex items-center justify-between p-5 md:p-6 text-start"
                                                >
                                                    <div className="flex items-start gap-4">
                                                        <div className={clsx(
                                                            "w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 font-sans font-bold text-sm",
                                                            expandedFaq === faq.id ? "bg-primary text-white" : "bg-slate-100 text-slate-400"
                                                        )}>
                                                            Q
                                                        </div>
                                                        <div>
                                                            <h4 className={clsx(
                                                                "font-bold text-lg leading-snug transition-colors",
                                                                expandedFaq === faq.id ? "text-primary" : "text-slate-800"
                                                            )}>
                                                                {getLocalized(faq, 'question')}
                                                            </h4>
                                                            {faq.category && (
                                                                <span className="inline-block mt-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100">
                                                                    {faq.category}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {expandedFaq === faq.id ? <ChevronUp className="text-primary shrink-0" /> : <ChevronDown className="text-slate-300 shrink-0" />}
                                                </button>

                                                <div className={clsx(
                                                    "grid transition-all duration-300 ease-in-out",
                                                    expandedFaq === faq.id ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                                                )}>
                                                    <div className="overflow-hidden">
                                                        <div className="p-6 pt-0 pl-[4.5rem] pr-6 md:pr-12 pb-8">
                                                            <div className="text-slate-600 leading-relaxed text-base bg-slate-50 p-5 rounded-2xl rounded-tl-none border border-slate-100 relative">
                                                                <div className="absolute -top-[1px] -left-[10px] w-2.5 h-[1px] bg-slate-100" />
                                                                {getLocalized(faq, 'answer')}
                                                            </div>
                                                            <div className="mt-2 flex justify-end">
                                                                <span className="text-[10px] text-slate-300 font-medium">{t('ask.updated', 'Updated recently')}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            ) : (
                                /* Community Questions */
                                <div className="space-y-6">
                                    {publicQuestions.length === 0 ? (
                                        <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                                            <MessageCircle className="text-slate-300 mx-auto mb-4" size={48} strokeWidth={1.5} />
                                            <p className="text-slate-400 font-medium">{t('ask.noCommunity', 'No community questions yet. Be the first!')}</p>
                                        </div>
                                    ) : (
                                        publicQuestions.map((q) => (
                                            <div key={q.id} className="group bg-white rounded-[24px] p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all">
                                                <div className="flex gap-4">
                                                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 shrink-0 font-bold">
                                                        {q.user_name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="w-full">
                                                        <div className="flex justify-between items-start">
                                                            <h4 className="font-bold text-slate-900 text-lg mb-1">{q.question}</h4>
                                                            <span className="text-xs text-slate-400 bg-slate-50 px-2 py-1 rounded-full">{q.user_name}</span>
                                                        </div>

                                                        {q.answer ? (
                                                            <div className="mt-4 bg-blue-50/50 p-4 rounded-2xl rounded-tl-none border border-blue-100/50 relative overflow-hidden group-hover:bg-blue-50 transition-colors">
                                                                <div className="flex items-center gap-2 mb-2">
                                                                    <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center text-white text-[10px] font-bold">T</div>
                                                                    <span className="text-xs font-bold text-primary tracking-wide">{t('ask.team', 'TASNIM TEAM')}</span>
                                                                </div>
                                                                <p className="text-slate-700 text-sm leading-relaxed">{q.answer}</p>
                                                            </div>
                                                        ) : (
                                                            <div className="mt-2 flex items-center gap-2 text-xs text-orange-400 font-medium bg-orange-50 inline-flex px-3 py-1 rounded-full">
                                                                <Clock size={12} /> {t('ask.awaiting', 'Awaiting Answer')}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* CTA BANNER */}
            <div className="container mx-auto px-4 pb-16 max-w-7xl">
                <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-8 md:p-12 shadow-2xl shadow-slate-200/50 group">
                    {/* Background Effects */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2 pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2 pointer-events-none" />

                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 md:gap-12">

                        {/* Left: Decorative Glass Card (Desktop) */}
                        <div className="hidden md:flex shrink-0">
                            <div className="w-20 h-20 rounded-[24px] bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center shadow-inner transform -rotate-3 group-hover:rotate-0 transition-transform duration-500">
                                <Clock className="text-white/90" size={40} strokeWidth={1.5} />
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 text-center md:text-start">
                            <h2 className="text-2xl md:text-4xl font-bold text-white mb-3 tracking-tight font-heading drop-shadow-sm">
                                {t('ask.cta.title', 'Ready to see the world clearly?')}
                            </h2>
                            <p className="text-slate-300 text-lg max-w-xl mx-auto md:mx-0 leading-relaxed font-light">
                                {t('ask.cta.subtitle', 'Book your comprehensive eye exam today with our certified optometrists.')}
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto shrink-0">
                            <Button
                                className="bg-primary hover:bg-primary-600 text-white px-8 py-7 h-auto text-lg font-bold rounded-[16px] shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-1 transition-all flex items-center justify-center w-full sm:w-auto"
                                onClick={() => window.location.href = '/book-exam'}
                            >
                                <Eye className={clsx("mr-2", isRTL && "ml-2 mr-0")} size={22} />
                                {t('nav.bookExam', 'Book Eye Exam')}
                            </Button>

                            <Button
                                className="bg-white/5 hover:bg-white/10 border border-white/20 text-white px-6 py-7 h-auto text-lg font-bold rounded-[16px] backdrop-blur-sm hover:-translate-y-1 transition-all flex items-center justify-center w-full sm:w-auto"
                                onClick={() => window.location.href = '/about'}
                            >
                                {t('ask.cta.learnMore', 'Learn More')}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
