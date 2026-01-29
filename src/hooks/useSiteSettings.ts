import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useTranslation } from 'react-i18next';

export interface SiteSettings {
    id: string;
    store_name_he: string;
    store_name_ar: string;
    store_name_en: string;
    whatsapp_phone: string;
    support_email: string;
    address_he: string;
    address_ar: string;
    address_en: string;
    working_hours_he: string;
    working_hours_ar: string;
    working_hours_en: string;
    instagram_url: string;
    facebook_url: string;
    logo_url: string;
    hero_image_url: string;
    primary_color: string;
    whatsapp_enabled: boolean;
    whatsapp_admin_phone: string;
}

export function useSiteSettings() {
    const { i18n } = useTranslation();
    const [settings, setSettings] = useState<Partial<SiteSettings>>({});
    const [loading, setLoading] = useState(true);

    const fetchSettings = async () => {
        try {
            const { data, error } = await supabase.from('site_settings').select('*').limit(1).single();
            if (error) {
                // If detailed error is "Row not found", it means table empty, we should handle gracefully or insert default via SQL
                console.warn('Settings load warning:', error.message);
            }
            if (data) setSettings(data);
        } catch (error) {
            console.error('Error loading settings:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    const getLocalizedSetting = (fieldPrefix: string) => {
        const lang = i18n.language as 'he' | 'ar' | 'en';
        // @ts-ignore
        return settings[`${fieldPrefix}_${lang}`] || settings[`${fieldPrefix}_en`] || settings[`${fieldPrefix}_he`] || '';
    };

    return { settings, loading, getLocalizedSetting, refreshSettings: fetchSettings };
}
