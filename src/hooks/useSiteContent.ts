import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useTranslation } from 'react-i18next';

export interface SiteContentItem {
    id: string;
    key: string;
    value_he: string;
    value_ar: string;
    value_en: string;
}

export function useSiteContent() {
    const { i18n } = useTranslation();
    const [content, setContent] = useState<SiteContentItem[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchContent = async () => {
        try {
            const { data, error } = await supabase.from('site_content').select('*');
            if (error) throw error;
            setContent(data || []);
        } catch (error) {
            console.error('Error loading content:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchContent();
    }, []);

    const getContent = (key: string, defaultVal: string = '') => {
        const item = content.find(c => c.key === key);
        if (!item) return defaultVal;

        const lang = i18n.language as 'he' | 'ar' | 'en';
        // Fallback chain: requested lang -> en -> he -> default
        return item[`value_${lang}`] || item.value_en || item.value_he || defaultVal;
    };

    return { content, loading, getContent, refreshContent: fetchContent };
}
