import { Navigate, Outlet } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../context/ToastContext';
import { useTranslation } from 'react-i18next';

interface ProtectedRouteProps {
    allowedRoles?: string[];
    children?: React.ReactNode;
}

export default function ProtectedRoute({ allowedRoles, children }: ProtectedRouteProps) {
    const [loading, setLoading] = useState(true);
    const [isAllowed, setIsAllowed] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const { addToast } = useToast();
    const { t } = useTranslation();

    useEffect(() => {
        let mounted = true;

        async function checkAuth() {
            try {
                const { data: { session } } = await supabase.auth.getSession();

                if (!session) {
                    if (mounted) {
                        setIsAuthenticated(false);
                        setIsAllowed(false);
                        setLoading(false);
                    }
                    return;
                }

                if (mounted) setIsAuthenticated(true);

                if (!allowedRoles || allowedRoles.length === 0) {
                    if (mounted) {
                        setIsAllowed(true);
                        setLoading(false);
                    }
                    return;
                }

                // Check role
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', session.user.id)
                    .single();

                if (mounted) {
                    if (profile && allowedRoles.includes(profile.role)) {
                        setIsAllowed(true);
                    } else {
                        setIsAllowed(false);
                        // Show toast only if we are done loading and strictly denied
                        addToast(t('auth.notAuthorized', 'Access Denied: You do not have permission to view this page.'), 'error');
                    }
                    setLoading(false);
                }
            } catch (error) {
                console.error("Auth check error", error);
                if (mounted) setLoading(false);
            }
        }

        checkAuth();

        return () => { mounted = false; };
    }, [allowedRoles]); // removed addToast/t deps to avoid loop queries

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Checking permissions...</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (!isAllowed) {
        return <Navigate to="/account" replace />;
    }

    return children ? <>{children}</> : <Outlet />;
}
