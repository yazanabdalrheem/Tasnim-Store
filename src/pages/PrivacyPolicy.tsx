import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import Card from '../components/ui/Card';
import { Shield, Lock, Eye, Users, Database, FileText, MessageCircle, ChevronDown, Phone, MapPin, CheckCircle } from 'lucide-react';
import clsx from 'clsx';

export default function PrivacyPolicy() {
    const { t, i18n } = useTranslation();
    const isRTL = i18n.dir() === 'rtl';

    // Accordion State: Multi-select
    // Default: 'introduction' and 'informationWeCollect' are open
    const [openSections, setOpenSections] = useState<string[]>(['introduction', 'informationWeCollect']);

    const toggleSection = (id: string, shouldCloseOthers = false) => {
        if (shouldCloseOthers) {
            setOpenSections([id]);
        } else {
            setOpenSections(prev =>
                prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
            );
        }
    };

    const scrollToSection = (sectionId: string) => {
        // Expand and Scroll
        if (!openSections.includes(sectionId)) {
            setOpenSections(prev => [...prev, sectionId]);
        }

        // Timeout for expansion
        setTimeout(() => {
            const element = document.getElementById(sectionId);
            if (element) {
                const offset = 120; // Header height
                const elementPosition = element.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - offset;
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        }, 100);
    };

    const sections = [
        { id: 'introduction', icon: Shield },
        { id: 'informationWeCollect', icon: Database },
        { id: 'howWeUse', icon: FileText },
        { id: 'cookies', icon: Eye },
        { id: 'sharing', icon: Users },
        { id: 'dataRetention', icon: Lock },
        { id: 'security', icon: Shield },
        { id: 'yourRights', icon: FileText },
        { id: 'childrensPrivacy', icon: Users },
        { id: 'changes', icon: FileText },
        { id: 'contact', icon: MessageCircle }
    ];

    const lastUpdated = "29/01/2026";

    return (
        <div className="min-h-screen bg-slate-50 relative">
            <SEO
                title={t('privacyPolicy.title')}
                description={t('privacyPolicy.subtitle')}
            />

            {/* Dot Grid Pattern - Subtle Background */}
            <div className="absolute inset-0 pointer-events-none" style={{
                backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)',
                backgroundSize: '24px 24px',
                opacity: 0.4
            }} />

            {/* Hero Section */}
            <div className="relative pt-32 pb-16 px-4">
                <div className="container mx-auto max-w-7xl">
                    <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6 mb-8">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-semibold mb-4">
                                <span>{t('privacyPolicy.lastUpdated', { date: lastUpdated })}</span>
                            </div>
                            <h1 className={clsx("text-4xl md:text-5xl font-bold text-slate-900 mb-4", isRTL && "font-arabic")}>
                                {t('privacyPolicy.title')}
                            </h1>

                        </div>

                        {/* Decorative Trust Card */}
                        <div className="hidden md:block">
                            <div className="bg-white p-4 rounded-2xl shadow-lg border border-slate-100 flex items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center text-green-600">
                                    <Lock size={24} />
                                </div>
                                <div>
                                    <div className="font-bold text-slate-900 text-sm">Data Protection</div>
                                    <div className="text-xs text-slate-500">GDPR Compliant</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto max-w-7xl px-4 pb-24 relative z-10">
                <div className="grid md:grid-cols-12 gap-8 items-start">

                    {/* Sidebar / TOC - Sticky on Desktop */}
                    <aside className="hidden md:block md:col-span-3 sticky top-28 space-y-4">
                        <Card className="p-2 border-slate-200/60 shadow-sm rounded-2xl overflow-hidden bg-white/80 backdrop-blur-sm">
                            <div className="px-4 py-3 border-b border-slate-100">
                                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                    <FileText size={16} className="text-blue-600" />
                                    {t('privacyPolicy.tableOfContents')}
                                </h2>
                            </div>
                            <nav className="p-2 space-y-0.5">
                                {sections.map((section) => {
                                    const isActive = openSections.includes(section.id);
                                    return (
                                        <button
                                            key={section.id}
                                            onClick={() => scrollToSection(section.id)}
                                            className={clsx(
                                                "w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all duration-200 flex items-center justify-between group",
                                                isActive
                                                    ? "bg-blue-50 text-blue-700 font-medium"
                                                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                                            )}
                                        >
                                            <span className="truncate">{t(`privacyPolicy.sections.${section.id}.title`)}</span>
                                            {isActive && <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
                                        </button>
                                    );
                                })}
                            </nav>
                        </Card>
                    </aside>

                    {/* Main Content */}
                    <main className="md:col-span-9 space-y-6">
                        {sections.map((section) => {
                            const Icon = section.icon;
                            const isOpen = openSections.includes(section.id);
                            const sectionData = t(`privacyPolicy.sections.${section.id}`, {
                                returnObjects: true,
                                email: 'Atasnim481@gmail.com',
                                phone: '0526844574',
                                address: 'עין מאהל, ישראל'
                            }) as any;

                            return (
                                <Card
                                    key={section.id}
                                    id={section.id}
                                    className={clsx(
                                        "border-slate-200/60 shadow-sm transition-all duration-300 overflow-hidden bg-white group rounded-[20px]",
                                        isOpen ? "ring-1 ring-blue-500/10 shadow-md" : "hover:shadow-md"
                                    )}
                                >
                                    {/* Header */}
                                    <button
                                        onClick={() => toggleSection(section.id)}
                                        className="w-full flex items-center justify-between p-6 text-left"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={clsx(
                                                "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors",
                                                "bg-blue-50 text-blue-600 group-hover:bg-blue-100"
                                            )}>
                                                <Icon size={20} />
                                            </div>
                                            <h2 className={clsx(
                                                "text-lg md:text-xl font-bold text-slate-900",
                                                isRTL && "font-arabic"
                                            )}>
                                                {sectionData.title}
                                            </h2>
                                        </div>
                                        <div className={clsx(
                                            "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300",
                                            isOpen ? "bg-blue-50 text-blue-600 rotate-180" : "bg-slate-50 text-slate-400 group-hover:bg-slate-100"
                                        )}>
                                            <ChevronDown size={18} />
                                        </div>
                                    </button>

                                    {/* Content (Expanded) */}
                                    <div
                                        className={clsx(
                                            "grid transition-all duration-300 ease-in-out",
                                            isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                                        )}
                                    >
                                        <div className="overflow-hidden">
                                            <div className="p-6 pt-0 text-slate-600 leading-relaxed pl-[4.5rem] rtl:pl-0 rtl:pr-[4.5rem]">
                                                {sectionData.content && (
                                                    <p className="mb-4">{sectionData.content}</p>
                                                )}

                                                {sectionData.intro && (
                                                    <div className="mb-4">
                                                        <p className="mb-3">{sectionData.intro}</p>
                                                        {sectionData.items && (
                                                            <ul className="space-y-3 mt-4">
                                                                {sectionData.items.map((item: string, idx: number) => (
                                                                    <li key={idx} className="flex items-start gap-3">
                                                                        <CheckCircle size={16} className="text-blue-500 mt-1 shrink-0" />
                                                                        <span className="text-sm">{item}</span>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Contact Info */}
                                                {section.id === 'contact' && (
                                                    <div className="mt-8 grid md:grid-cols-2 gap-4">
                                                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-blue-200 transition-colors">
                                                            <div className="flex items-center gap-3 mb-2">
                                                                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-blue-600 shadow-sm">
                                                                    <MessageCircle size={16} />
                                                                </div>
                                                                <span className="font-bold text-slate-900">Email</span>
                                                            </div>
                                                            <a href="mailto:Atasnim481@gmail.com" className="text-blue-600 hover:underline block pl-11 rtl:pl-0 rtl:pr-11">Atasnim481@gmail.com</a>
                                                        </div>
                                                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-blue-200 transition-colors">
                                                            <div className="flex items-center gap-3 mb-2">
                                                                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-blue-600 shadow-sm">
                                                                    <Phone size={16} />
                                                                </div>
                                                                <span className="font-bold text-slate-900">Phone</span>
                                                            </div>
                                                            <a href="tel:0526844574" className="text-blue-600 hover:underline block pl-11 rtl:pl-0 rtl:pr-11" dir="ltr">0526844574</a>
                                                        </div>
                                                        <div className="md:col-span-2 p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-blue-200 transition-colors">
                                                            <div className="flex items-center gap-3 mb-2">
                                                                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-blue-600 shadow-sm">
                                                                    <MapPin size={16} />
                                                                </div>
                                                                <span className="font-bold text-slate-900">Address</span>
                                                            </div>
                                                            <span className="block pl-11 rtl:pl-0 rtl:pr-11 text-slate-600">
                                                                {i18n.language === 'en' ? 'Ein Mahal, Israel' : 'עין מאהל, ישראל'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            );
                        })}
                    </main>
                </div>

                {/* CTA Banner */}
                <div className="mt-20">
                    <div className="relative overflow-hidden rounded-[24px] bg-slate-900 p-8 md:p-12 text-center md:text-left shadow-2xl">
                        {/* Background Pattern */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/20 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2" />

                        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                            <div>
                                <h2 className={clsx("text-2xl md:text-3xl font-bold text-white mb-3", isRTL && "font-arabic")}>
                                    {t('ask.subtitle') || "Have questions about your data?"}
                                </h2>
                                <p className="text-slate-300 max-w-xl">
                                    {t('privacyPolicy.subtitle')}
                                </p>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-4 shrink-0">
                                <Link to="/ask" className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-900/50 transition-all hover:scale-105 flex items-center gap-2">
                                    <MessageCircle size={20} />
                                    <span>{t('footer.contact')}</span>
                                </Link>
                                <Link to="/terms-of-service" className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium backdrop-blur-sm transition-all flex items-center gap-2">
                                    <FileText size={20} />
                                    <span>{t('footer.terms')}</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
