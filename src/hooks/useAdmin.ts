import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export function useAdmin() {
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);
    const [role, setRole] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;

        async function checkAdmin() {
            try {
                const { data: { session } } = await supabase.auth.getSession();

                if (!session) {
                    if (mounted) {
                        setIsAdmin(false);
                        setLoading(false);
                    }
                    return;
                }

                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', session.user.id)
                    .single();

                if (mounted) {
                    if (profile && (profile.role === 'admin' || profile.role === 'super_admin')) {
                        setIsAdmin(true);
                        setRole(profile.role);
                    } else {
                        setIsAdmin(false);
                        setRole(profile?.role || null);
                    }
                }
            } catch (error) {
                console.error('Error checking admin role:', error);
                if (mounted) setIsAdmin(false);
            } finally {
                if (mounted) setLoading(false);
            }
        }

        checkAdmin();

        return () => {
            mounted = false;
        };
    }, []);

    return { isAdmin, loading, role };
}
