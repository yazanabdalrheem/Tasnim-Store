// Admin Panel Theme Configuration
export const adminTheme = {
    colors: {
        background: '#F6F8FC',
        cardBg: '#FFFFFF',
        cardBgHover: '#FAFBFC',
        primary: 'rgb(59, 130, 246)', // Blue
        primaryHover: 'rgb(37, 99, 235)',
        success: '#10B981',
        successLight: '#D1FAE5',
        warning: '#F59E0B',
        warningLight: '#FEF3C7',
        danger: '#EF4444',
        dangerLight: '#FEE2E2',
        info: '#3B82F6',
        infoLight: '#DBEAFE',
        neutral: '#6B7280',
        neutralLight: '#F3F4F6',
        textPrimary: '#1F2937',
        textSecondary: '#6B7280',
        textTertiary: '#9CA3AF',
        border: '#E5E7EB',
        borderSubtle: 'rgba(0, 0, 0, 0.05)',
        borderFocus: 'rgb(59, 130, 246)',
    },
    spacing: {
        sidebarWidth: '256px',
        sidebarCollapsed: '80px',
        topBarHeight: '64px',
    },
    effects: {
        glass: 'backdrop-blur-md bg-white/80',
        glassStrong: 'backdrop-blur-lg bg-white/90',
        shadow: '0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.06)',
        shadowMd: '0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -1px rgba(0, 0, 0, 0.04)',
        shadowLg: '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.04)',
        shadowXl: '0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        ring: '0 0 0 3px rgba(59, 130, 246, 0.1)',
    },
    radius: {
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '20px',
    },
    transitions: {
        fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
        base: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
        slow: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
    },
} as const;

export type AdminTheme = typeof adminTheme;
