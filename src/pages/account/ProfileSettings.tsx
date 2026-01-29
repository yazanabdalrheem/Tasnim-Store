import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "../../lib/supabase";
import { useToast } from "../../context/ToastContext";
import { Save, User, Phone, Mail, Loader2 } from "lucide-react";
import { Button } from "../../components/ui/Button";

export default function ProfileSettings() {
    const { t } = useTranslation();
    const { success, error: showError } = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        id: "",
        full_name: "",
        phone: "",
        email: ""
    });

    useEffect(() => {
        async function loadProfile() {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                const { data, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                if (error) throw error;

                setFormData({
                    id: user.id,
                    full_name: data.full_name || "",
                    phone: data.phone || "",
                    email: data.email || user.email || ""
                });
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        loadProfile();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setSaving(true);
        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    full_name: formData.full_name,
                    email: formData.email,
                    // phone is usually fixed from auth, but if editable:
                    // phone: formData.phone 
                })
                .eq('id', formData.id);

            if (error) throw error;
            success(t("account.savedSuccess"));
        } catch (err) {
            console.error(err);
            showError("Failed to update profile");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">{t("common.loading")}</div>;

    return (
        <div className="max-w-2xl">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">{t("account.profile")}</h1>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Full Name */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                            <User size={16} className="text-primary" />
                            {t("account.fullName")}
                        </label>
                        <input
                            type="text"
                            value={formData.full_name}
                            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                            placeholder="Your Name"
                            required
                        />
                    </div>

                    {/* Phone (Read Only usually) */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                            <Phone size={16} className="text-primary" />
                            {t("account.phone")}
                        </label>
                        <input
                            type="tel"
                            value={formData.phone}
                            disabled
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed"
                        />
                        <p className="text-xs text-gray-400">Phone number cannot be changed directly.</p>
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                            <Mail size={16} className="text-primary" />
                            {t("account.email")}
                        </label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                            placeholder="your@email.com"
                        />
                    </div>

                    <div className="pt-4">
                        <Button
                            type="submit"
                            disabled={saving}
                            className="w-full sm:w-auto"
                        >
                            {saving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} className="mr-2" />}
                            {t("account.saveChanges")}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
