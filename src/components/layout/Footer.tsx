import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Facebook, Instagram, Phone, Mail, MapPin } from "lucide-react";

export default function Footer() {
    const { t } = useTranslation();
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-white border-t border-gray-100 pt-16 pb-24 md:pb-8">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    {/* Brand */}
                    <div className="col-span-1 md:col-span-1">
                        <Link to="/" className="flex items-center gap-2 mb-6 group">
                            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                                <span className="font-heading font-bold text-2xl">T</span>
                            </div>
                            <span className="text-xl font-bold font-heading text-slate-900">
                                TasnimStore
                            </span>
                        </Link>
                        <p className="text-slate-500 text-sm leading-relaxed mb-6">
                            Your premium destination for optometry and eyewear excellence.
                        </p>
                        <div className="flex gap-4">
                            <a href="https://www.facebook.com/share/14GKWtWyajU/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-primary hover:text-white transition-all duration-300">
                                <Facebook size={18} />
                            </a>
                            <a href="https://www.instagram.com/tasnim.abbas?igsh=MTVqbjExcjk4Y3BqYQ==" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-secondary hover:text-white transition-all duration-300">
                                <Instagram size={18} />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-bold text-slate-900 mb-6">{t('nav.shop')}</h4>
                        <ul className="space-y-4 text-sm text-slate-500">
                            <li><Link to="/shop" className="hover:text-primary transition-colors">All Products</Link></li>
                            <li><Link to="/shop?category=glasses" className="hover:text-primary transition-colors">Eyeglasses</Link></li>
                            <li><Link to="/shop?category=lenses" className="hover:text-primary transition-colors">Lenses</Link></li>
                            <li><Link to="/shop?category=accessories" className="hover:text-primary transition-colors">Accessories</Link></li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h4 className="font-bold text-slate-900 mb-6">{t('footer.support')}</h4>
                        <ul className="space-y-4 text-sm text-slate-500">
                            <li><Link to="/book-exam" className="hover:text-primary transition-colors">{t('nav.bookExam')}</Link></li>
                            <li><Link to="/ask" className="hover:text-primary transition-colors">{t('nav.askTasnim')}</Link></li>
                            <li><Link to="/terms-of-service" className="hover:text-primary transition-colors">{t('footer.terms')}</Link></li>
                            <li><Link to="/privacy-policy" className="hover:text-primary transition-colors">{t('footer.privacy')}</Link></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="font-bold text-slate-900 mb-6">{t('footer.contact') || 'Contact Us'}</h4>
                        <ul className="space-y-4 text-sm text-slate-500">
                            <li className="flex items-start gap-3">
                                <MapPin size={18} className="text-primary mt-0.5" />
                                <span>123 Optometry St, Jerusalem</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone size={18} className="text-primary" />
                                <span dir="ltr">+970 59-123-4567</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail size={18} className="text-primary" />
                                <span>info@tasnimstore.com</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-100 pt-8 text-center">
                    <p className="text-xs text-slate-400">
                        © {currentYear} TasnimStore. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}
