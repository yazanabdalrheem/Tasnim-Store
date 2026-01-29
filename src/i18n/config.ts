import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import he from './locales/he';
import ar from './locales/ar';
import en from './locales/en';

i18n
    .use(initReactI18next)
    .init({
        resources: {
            he: { translation: he },
            ar: { translation: ar },
            en: { translation: en },
        },
        lng: 'he', // Default language
        fallbackLng: 'he',
        interpolation: {
            escapeValue: false,
        },
    });

export default i18n;
