import { createContext, useContext, type ReactNode } from 'react';
import { useSiteContent, type SiteContentItem } from '../hooks/useSiteContent';
import { useSiteSettings, type SiteSettings } from '../hooks/useSiteSettings';
import { supabase } from '../lib/supabase';

// Backward compatibility types (mapped to new structure)
export interface SettingValue {
    he: string;
    ar: string;
    en: string;
}

interface ContentContextType {
    // Deprecated but support for now
    settings: { [key: string]: any };
    loading: boolean;
    getContent: (key: string, defaultValue?: string) => string;
    getSetting: (key: string) => any;
    // New methods
    refreshContent: () => Promise<void>;
    updateContent: (key: string, values: { he: string, ar: string, en: string }) => Promise<void>;
    updateSetting: (values: Partial<SiteSettings>) => Promise<void>;
    rawContent: SiteContentItem[];
    rawSettings: Partial<SiteSettings>;
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

export function ContentProvider({ children }: { children: ReactNode }) {
    const contentHook = useSiteContent();
    const settingsHook = useSiteSettings();

    const loading = contentHook.loading || settingsHook.loading;

    // Helper to update Site Content (multilingual text)
    const updateContent = async (key: string, values: { he: string, ar: string, en: string }) => {
        const { error } = await supabase
            .from('site_content')
            .upsert({
                key,
                value_he: values.he,
                value_ar: values.ar,
                value_en: values.en
            }, { onConflict: 'key' });

        if (error) throw error;
        contentHook.refreshContent();
    };

    // Helper to update Site Settings (global config)
    const updateSetting = async (values: Partial<SiteSettings>) => {
        // We assume single row, so we update the one with the ID we loaded, or assume the first one
        if (!settingsHook.settings.id) {
            // Should not happen if migration worked, but handle create if needed
            const { error } = await supabase.from('site_settings').insert([values]);
            if (error) throw error;
        } else {
            const { error } = await supabase
                .from('site_settings')
                .update(values)
                .eq('id', settingsHook.settings.id);
            if (error) throw error;
        }
        settingsHook.refreshSettings();
    };

    // Adapter for legacy getSetting call (e.g. from Footer)
    // NOTE: This tries to map old 'settings.general' style calls to new flattened object
    const getLegacySetting = (key: string) => {
        if (key === 'settings.general') {
            return settingsHook.settings; // Return the whole object
        }
        return {};
    };

    return (
        <ContentContext.Provider value={{
            settings: {}, // Deprecated
            loading,
            getContent: contentHook.getContent,
            getSetting: getLegacySetting,
            refreshContent: async () => { await contentHook.refreshContent(); await settingsHook.refreshSettings(); },
            updateContent,
            updateSetting,
            rawContent: contentHook.content,
            rawSettings: settingsHook.settings
        }}>
            {children}
        </ContentContext.Provider>
    );
}

export function useContent() {
    const context = useContext(ContentContext);
    if (context === undefined) {
        throw new Error('useContent must be used within a ContentProvider');
    }
    return context;
}
