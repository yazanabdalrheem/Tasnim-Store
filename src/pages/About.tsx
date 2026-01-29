import { useTranslation } from 'react-i18next';
import { Award, Heart, Users, Eye, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const About = () => {
    const { t, i18n } = useTranslation();
    const isRtl = i18n.language === 'ar' || i18n.language === 'he';

    const features = [
        {
            icon: <Award className="w-6 h-6 text-purple-600" />,
            key: 'personalized',
            bg: 'bg-purple-100'
        },
        {
            icon: <Heart className="w-6 h-6 text-pink-600" />,
            key: 'personalTouch',
            bg: 'bg-pink-100'
        },
        {
            icon: <Users className="w-6 h-6 text-blue-600" />,
            key: 'allAges',
            bg: 'bg-blue-100'
        },
        {
            icon: <Eye className="w-6 h-6 text-emerald-600" />,
            key: 'mission',
            bg: 'bg-emerald-100'
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50/50 pt-20" dir={isRtl ? 'rtl' : 'ltr'}>
            {/* Hero Section */}
            <div className="relative bg-white overflow-hidden">
                <div className="max-w-7xl mx-auto">
                    <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32 pt-20 px-4 sm:px-6 lg:px-8">
                        <main className="mt-10 mx-auto max-w-7xl sm:mt-12 md:mt-16 lg:mt-20 xl:mt-28">
                            <div className="sm:text-center lg:text-start">
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800 mb-4">
                                    {t('about.hero.badge')}
                                </span>
                                <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl mb-6">
                                    <span className="block xl:inline">{t('about.title')}</span>
                                </h1>
                                <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                                    {t('about.hero.subtitle')}
                                </p>
                                <div className="mt-6 flex flex-col gap-3">
                                    {['cred1', 'cred2', 'cred3'].map((key) => (
                                        <div key={key} className="flex items-center gap-2 text-gray-700 font-medium">
                                            <CheckCircle2 className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                                            <span>{t(`about.hero.${key}`)}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-8 sm:mt-12 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                                    <Link
                                        to="/book-exam"
                                        className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg transition-all shadow-lg hover:shadow-xl"
                                    >
                                        {t('about.cta.book')}
                                        <ArrowRight className={`w-5 h-5 ${isRtl ? 'mr-2 rotate-180' : 'ml-2'}`} />
                                    </Link>
                                    <Link
                                        to="/ask"
                                        className="inline-flex items-center justify-center px-8 py-3 border border-gray-200 text-base font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 md:py-4 md:text-lg transition-all hover:border-indigo-200"
                                    >
                                        {t('about.cta.ask')}
                                    </Link>
                                </div>
                            </div>
                        </main>
                    </div>
                </div>
                <div className={`lg:absolute lg:inset-y-0 lg:w-5/12 ${isRtl ? 'lg:left-0' : 'lg:right-0'} lg:py-24 lg:px-12 flex items-center justify-center`}>
                    <div className="relative w-[500px] h-[500px] flex items-center justify-center">
                        {/* Background Glows */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-100 to-purple-100 rounded-full blur-3xl opacity-60 animate-pulse"></div>

                        {/* Main Central Circle */}
                        <div className="relative z-10 w-64 h-64 bg-white/90 backdrop-blur-3xl rounded-full shadow-[0_0_60px_-15px_rgba(79,70,229,0.2)] border border-white/50 flex flex-col items-center justify-center text-center p-6 ring-4 ring-indigo-50">
                            <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-4 text-indigo-600 shadow-inner">
                                <Eye className="w-10 h-10" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 leading-tight">Tasnim Optic</h3>
                            <p className="text-sm text-indigo-600 font-medium mt-1">{t('about.hero.badge')}</p>
                        </div>

                        {/* Orbiting Satellite 1 - Top Right - Experience */}
                        <div className="absolute top-10 right-10 z-20 animate-bounce delay-700">
                            <div className="w-24 h-24 bg-white/90 backdrop-blur-xl rounded-full shadow-lg border border-white/60 flex flex-col items-center justify-center text-center p-2 transform hover:scale-110 transition-transform cursor-default">
                                <span className="text-xl font-bold text-gray-900 block">{t('about.stats.experience')}</span>
                                <span className="text-[10px] text-gray-500 font-medium leading-tight">{t('about.stats.experienceDesc')}</span>
                            </div>
                        </div>

                        {/* Orbiting Satellite 2 - Bottom Left - Patients */}
                        <div className="absolute bottom-16 left-12 z-20 animate-bounce delay-1000">
                            <div className="w-28 h-28 bg-white/90 backdrop-blur-xl rounded-full shadow-lg border border-white/60 flex flex-col items-center justify-center text-center p-2 transform hover:scale-110 transition-transform cursor-default">
                                <span className="text-xl font-bold text-gray-900 block">{t('about.stats.patients')}</span>
                                <span className="text-[10px] text-gray-500 font-medium leading-tight">{t('about.stats.patientsDesc')}</span>
                            </div>
                        </div>

                        {/* Orbiting Satellite 3 - Bottom Right - Certified */}
                        <div className="absolute bottom-8 right-20 z-20 animate-bounce delay-500">
                            <div className="w-20 h-20 bg-white/90 backdrop-blur-xl rounded-full shadow-lg border border-white/60 flex flex-col items-center justify-center text-center p-2 transform hover:scale-110 transition-transform cursor-default">
                                <CheckCircle2 className="w-6 h-6 text-emerald-500 mb-1" />
                                <span className="text-[10px] text-gray-900 font-bold leading-tight">{t('about.stats.certifiedDesc')}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Who Am I Section */}
            <div className="py-16 bg-white border-t border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto">
                        <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl mb-8">
                            {t('about.whoAmI.title')}
                        </h2>
                        <p className="text-xl text-gray-500 leading-relaxed whitespace-pre-line">
                            {t('about.whoAmI.content')}
                        </p>
                    </div>
                </div>
            </div>

            {/* Features Grid */}
            <div className="py-24 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl mb-16">
                            {t('about.whyMe.title')}
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
                        {features.map((feature) => (
                            <div key={feature.key} className="relative group bg-white p-8 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                                <div>
                                    <span className={`rounded-xl inline-flex p-3 ${feature.bg} ring-4 ring-white`}>
                                        {feature.icon}
                                    </span>
                                </div>
                                <div className="mt-8">
                                    <h3 className="text-lg font-medium text-gray-900 group-hover:text-indigo-600 transition-colors">
                                        {t(`about.whyMe.items.${feature.key}.title`)}
                                    </h3>
                                    <p className="mt-2 text-sm text-gray-500">
                                        {t(`about.whyMe.items.${feature.key}.desc`)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom CTA */}
            <div className="bg-indigo-700">
                <div className="max-w-2xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
                        <span className="block">{t('about.cta.title')}</span>
                    </h2>
                    <p className="mt-4 text-lg leading-6 text-indigo-200">
                        {t('contact.intro')}
                    </p>
                    <div className="mt-8 flex justify-center gap-4">
                        <Link
                            to="/book-exam"
                            className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50"
                        >
                            {t('about.cta.book')}
                        </Link>
                        <Link
                            to="/ask"
                            className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-800"
                        >
                            {t('about.cta.ask')}
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default About;
