import { useState, useEffect } from 'react';
import { useContent } from '../../context/ContentContext';
import type { SiteSettings } from '../../hooks/useSiteSettings';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import {
    Save,
    Store,
    Phone,
    MapPin,
    Clock,
    Mail,
    Globe,
    Image as ImageIcon,
    Palette,
    Instagram,
    Facebook,
    Bell,
    CheckCircle,
    Info,
    RotateCcw,
    Bug,

} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { clsx } from 'clsx';
import { useToast } from '../../context/ToastContext';

export default function Settings() {
    const { getSetting, updateSetting } = useContent();
    const { success, error: showError, warning } = useToast();

    const [loading, setLoading] = useState(false);
    const [pushLoading, setPushLoading] = useState(false);

    // Default values
    const [formData, setFormData] = useState({
        storeName: '',
        phone: '',
        whatsapp: '',
        email: '',
        address_he: '',
        address_ar: '',
        address_en: '',
        hours_he: '',
        hours_ar: '',
        hours_en: '',
        instagram_url: '',
        facebook_url: '',
        logo_url: '',
        hero_image_url: '',
        primary_color: '#0F172A',
        whatsapp_enabled: false,
        whatsapp_admin_phone: '',
        debug_mode: false,

    });

    useEffect(() => {
        const settings = getSetting('settings.general');
        if (settings && Object.keys(settings).length > 0) {
            const safe: any = {};
            for (const key of Object.keys(settings)) {


                const v = (settings as any)[key];
                if (v === null || v === undefined) {
                    // Keep booleans booleans
                    if (key === 'whatsapp_enabled') safe[key] = false;
                    else safe[key] = '';
                } else {
                    safe[key] = v;
                }
            }
            setFormData((prev) => ({ ...prev, ...safe }));
        }
    }, [getSetting]);

    const handleChange = (field: string, value: string | boolean) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    // ---------------------------
    // Push Notifications
    // ---------------------------
    const [isPushEnabled, setIsPushEnabled] = useState(false);
    const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>(Notification.permission);
    const [swStatus, setSwStatus] = useState<string>('checking');
    const [swScope, setSwScope] = useState<string>('-');

    // Helper for debug logging
    const log = (msg: any, ...args: any[]) => {
        if (formData.debug_mode) {
            // eslint-disable-next-line no-console
            console.log(`[DEBUG] ${msg}`, ...args);
        }
    };

    const logError = (msg: any, ...args: any[]) => {
        if (formData.debug_mode) {
            // eslint-disable-next-line no-console
            console.error(`[ERROR] ${msg}`, ...args);
        }
    };

    const getPublicVapidKey = () => {
        const k = (import.meta as any).env?.VITE_VAPID_PUBLIC_KEY?.toString()?.trim() || '';
        return k;
    };

    const urlBase64ToUint8Array = (base64String: string) => {
        const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
        const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);
        for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i);
        return outputArray;
    };

    const arrayBufferToBase64 = (buffer: ArrayBuffer) => {
        let binary = '';
        const bytes = new Uint8Array(buffer);
        for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
        return window.btoa(binary);
    };

    const waitForSwReady = async (timeoutMs = 15000) => {
        const swPromise = navigator.serviceWorker.ready;
        const timeoutPromise = new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('Service Worker timeout')), timeoutMs)
        );
        return Promise.race([swPromise, timeoutPromise]) as Promise<ServiceWorkerRegistration>;
    };

    const ensureSwRegistered = async () => {
        setSwStatus('registering');
        // Check SW file exists (helps debugging)
        const swResp = await fetch('/sw.js', { cache: 'no-store' });
        if (!swResp.ok) {
            throw new Error(`sw.js not reachable (HTTP ${swResp.status}). Ensure /public/sw.js exists.`);
        }

        // Always register to root scope
        const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
        setSwStatus('registered');
        setSwScope(reg.scope);
        return reg;
    };

    // 🔥 Hard reset: remove ALL SW registrations + subscriptions + cache for THIS ORIGIN
    const hardResetPush = async () => {
        if (!('serviceWorker' in navigator)) return;

        setPushLoading(true);
        try {
            const regs = await navigator.serviceWorker.getRegistrations();
            for (const reg of regs) {
                try {
                    const sub = await reg.pushManager.getSubscription();
                    if (sub) await sub.unsubscribe();
                } catch { }
                try {
                    await reg.unregister();
                } catch { }
            }

            // Clear Cache Storage (helps when SW is cached weirdly)
            if ('caches' in window) {
                const keys = await caches.keys();
                await Promise.all(keys.map((k) => caches.delete(k)));
            }

            setIsPushEnabled(false);
            setSwStatus('reset');
            setSwScope('-');
            success('✅ Reset Done. Now refresh the page and click Enable Push again.');
        } finally {
            setPushLoading(false);
        }
    };

    // On mount: just check if already subscribed (do NOT force subscribe)
    useEffect(() => {
        (async () => {
            try {
                if (!('serviceWorker' in navigator)) return;

                await ensureSwRegistered();
                const readyReg = await waitForSwReady(12000);
                setSwScope(readyReg.scope);

                const sub = await readyReg.pushManager.getSubscription();
                if (sub) {
                    setIsPushEnabled(true);
                    setSwStatus('ready');
                } else {
                    setIsPushEnabled(false);
                    setSwStatus('ready');
                }
            } catch (e) {
                logError('SW init error:', e);
                setSwStatus('error');
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const saveSubscriptionToDb = async (subscription: PushSubscription) => {
        const userRes = await supabase.auth.getUser();
        const userId = userRes.data.user?.id;

        if (!userId) throw new Error('Not logged in (no user).');

        const p256dh = subscription.getKey('p256dh');
        const auth = subscription.getKey('auth');

        if (!p256dh || !auth) throw new Error('Invalid subscription keys');

        const payload = {
            user_id: userId,
            endpoint: subscription.endpoint,
            p256dh: arrayBufferToBase64(p256dh),
            auth: arrayBufferToBase64(auth),
        };


        // If you have unique index on endpoint, upsert is safest
        const { error } = await supabase
            .from('push_subscriptions')
            .upsert(payload, { onConflict: 'endpoint' });

        if (error) throw error;
    };

    const handleEnablePush = async () => {
        if (!('serviceWorker' in navigator)) {
            showError('هذا المتصفح لا يدعم Service Workers');
            return;
        }

        setPushLoading(true);
        log('Starting Push Setup...');

        try {
            const publicVapidKey = getPublicVapidKey();
            log('VAPID Key loaded. Length:', publicVapidKey?.length);

            if (!publicVapidKey || publicVapidKey.length < 60) {
                throw new Error(
                    "VAPID Public Key missing/invalid (too short). Checks env keys."
                );
            }

            try {
                const decoded = urlBase64ToUint8Array(publicVapidKey);
                if (decoded.length !== 65) {
                    throw new Error(`Invalid VAPID Key length (${decoded.length} bytes). Expected 65 bytes.`);
                }
                if (decoded[0] !== 0x04) {
                    throw new Error(`Invalid VAPID Key header (0x${decoded[0].toString(16)}). Expected 0x04.`);
                }
            } catch (kErr: any) {
                throw new Error(`VAPID Key validation failed: ${kErr.message}.`);
            }

            const permission = await Notification.requestPermission();
            setPermissionStatus(permission);
            log('Notification Permission:', permission);

            if (permission !== 'granted') {
                warning('Permission denied. Please allow notifications.');
                throw new Error('Permission denied.');
            }

            // Ensure SW exists
            await ensureSwRegistered();

            // Wait for SW ready
            log('Waiting for SW ready...');
            const reg = await waitForSwReady(15000);
            setSwScope(reg.scope);
            setSwStatus('ready');
            log('SW Ready. Scope:', reg.scope);

            // Existing sub?
            const existingSub = await reg.pushManager.getSubscription();

            if (existingSub) {
                log('Existing subscription found. Saving to DB...');
                await saveSubscriptionToDb(existingSub);
                setIsPushEnabled(true);
                success('✅ Already subscribed. Saved successfully.');
                return;
            }

            log('No existing subscription. Creating new...');

            // Try subscribe
            try {
                const subscription = await reg.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
                });

                await saveSubscriptionToDb(subscription);
                setIsPushEnabled(true);
                success('✅ Notifications Enabled Successfully!');
                return;
            } catch (subErr: any) {
                const msg = (subErr?.message || '').toLowerCase();
                logError('Subscribe error:', subErr);

                // Most common Chrome profile issue OR extension blocking FCM
                if (msg.includes('could not retrieve the public key') || msg.includes('aborterror')) {
                    throw new Error(
                        `Push setup blocked by browser/extension. Reset push and try again.`
                    );
                }

                throw subErr;
            }
        } catch (error: any) {
            logError('Push Setup Error:', error);
            showError(`Error: ${error?.message || 'Failed to enable notifications'} `);
        } finally {
            setPushLoading(false);
        }
    };

    const handleSendTestPush = async () => {
        try {
            const { error } = await supabase.from('notification_queue').insert({
                type: 'test',
                payload: { ref_id: 'test-' + Date.now(), message: 'Hello from Tasnim Optic!' },
            });
            if (error) throw error;
            if (error) throw error;
            success('✅ Test queued! Check your device/notifications momentarily.');
        } catch (e) {
            showError('❌ Error sending test');
        }
    };

    // ---------------------------
    // Save General Settings
    // ---------------------------
    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Map form data to valid DB columns (SiteSettings interface)
            const payload: Partial<SiteSettings> = {
                // Map legacy/form fields to DB columns
                store_name_en: formData.storeName, // Assuming storeName is EN or primary
                store_name_he: formData.storeName, // Fallback

                whatsapp_phone: formData.phone,    // Assuming phone is whatsapp_phone
                whatsapp_admin_phone: formData.whatsapp,
                support_email: formData.email,

                // Direct mapping
                address_he: formData.address_he,
                address_ar: formData.address_ar,
                address_en: formData.address_en,
                working_hours_he: formData.hours_he,
                working_hours_ar: formData.hours_ar,
                working_hours_en: formData.hours_en,
                instagram_url: formData.instagram_url,
                facebook_url: formData.facebook_url,
                logo_url: formData.logo_url,
                hero_image_url: formData.hero_image_url,
                primary_color: formData.primary_color,
                whatsapp_enabled: formData.whatsapp_enabled,

            };

            await updateSetting(payload);
            success('Settings saved successfully!');
        } catch (error) {
            showError('Failed to save settings');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <h1 className="text-2xl font-bold text-gray-800">Store Settings</h1>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Form Section */}
                <div className="lg:col-span-2 space-y-8">
                    <form onSubmit={handleSave} className="space-y-8">
                        {/* Branding */}
                        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-6">
                            <h3 className="font-bold text-lg flex items-center gap-2 text-gray-700 border-b pb-2">
                                <Palette size={20} className="text-primary" /> Branding & Assets
                            </h3>

                            <div className="grid md:grid-cols-2 gap-4">
                                <Input
                                    label="Store Name"
                                    value={formData.storeName}
                                    onChange={(e) => handleChange('storeName', e.target.value)}
                                    placeholder="Tasnim Optic"
                                    icon={<Store size={16} />}
                                />
                                <Input
                                    label="Primary Color (Hex)"
                                    value={formData.primary_color}
                                    onChange={(e) => handleChange('primary_color', e.target.value)}
                                    placeholder="#0F172A"
                                />
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <Input
                                    label="Logo URL"
                                    value={formData.logo_url}
                                    onChange={(e) => handleChange('logo_url', e.target.value)}
                                    placeholder="https://..."
                                    icon={<ImageIcon size={16} />}
                                />
                                <Input
                                    label="Hero Image URL"
                                    value={formData.hero_image_url}
                                    onChange={(e) => handleChange('hero_image_url', e.target.value)}
                                    placeholder="https://..."
                                    icon={<ImageIcon size={16} />}
                                />
                            </div>
                        </div>

                        {/* Socials */}
                        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-6">
                            <h3 className="font-bold text-lg flex items-center gap-2 text-gray-700 border-b pb-2">
                                <Globe size={20} className="text-primary" /> Social Media
                            </h3>
                            <div className="grid md:grid-cols-2 gap-4">
                                <Input
                                    label="Instagram URL"
                                    value={formData.instagram_url}
                                    onChange={(e) => handleChange('instagram_url', e.target.value)}
                                    placeholder="https://instagram.com/..."
                                    icon={<Instagram size={16} />}
                                />
                                <Input
                                    label="Facebook URL"
                                    value={formData.facebook_url}
                                    onChange={(e) => handleChange('facebook_url', e.target.value)}
                                    placeholder="https://facebook.com/..."
                                    icon={<Facebook size={16} />}
                                />
                            </div>
                        </div>

                        {/* Contact Info */}
                        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-6">
                            <h3 className="font-bold text-lg flex items-center gap-2 text-gray-700 border-b pb-2">
                                <Phone size={20} className="text-primary" /> Contact Details
                            </h3>

                            <Input
                                label="Support Email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => handleChange('email', e.target.value)}
                                icon={<Mail size={16} />}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    label="Phone"
                                    value={formData.phone}
                                    onChange={(e) => handleChange('phone', e.target.value)}
                                    icon={<Phone size={16} />}
                                />
                                <Input
                                    label="WhatsApp"
                                    value={formData.whatsapp}
                                    onChange={(e) => handleChange('whatsapp', e.target.value)}
                                    placeholder="972..."
                                />
                            </div>
                        </div>

                        {/* Push Notifications (PWA) */}
                        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-6">
                            <h3 className="font-bold text-lg flex items-center gap-2 text-gray-700 border-b pb-2">
                                <Bell size={20} className="text-blue-500" /> Push Notifications
                            </h3>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <p className="font-medium text-gray-900">Browser Notifications</p>
                                        <p className="text-xs text-gray-500">Receive instant alerts for new orders & bookings.</p>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Button
                                            type="button"
                                            onClick={hardResetPush}
                                            isLoading={pushLoading}
                                            className="bg-gray-100 text-gray-800 hover:bg-gray-200"
                                        >
                                            <RotateCcw size={16} className="mr-2" />
                                            Reset Push
                                        </Button>

                                        <Button
                                            type="button"
                                            onClick={handleEnablePush}
                                            isLoading={pushLoading}
                                            className={clsx(
                                                isPushEnabled ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'
                                            )}
                                        >
                                            {isPushEnabled ? (
                                                <>
                                                    <CheckCircle size={16} className="mr-2" /> Active
                                                </>
                                            ) : (
                                                <>
                                                    <Bell size={16} className="mr-2" /> Enable Push
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </div>

                                {isPushEnabled && (
                                    <div className="bg-green-50 text-green-800 text-sm p-3 rounded-lg flex items-center gap-2">
                                        <CheckCircle size={16} />
                                        This device is subscribed to notifications.
                                        <button
                                            onClick={handleSendTestPush}
                                            className="ml-auto text-xs underline font-bold hover:text-green-900"
                                            type="button"
                                        >
                                            Send Test
                                        </button>
                                    </div>
                                )}

                                {!isPushEnabled && (
                                    <div className="space-y-2">
                                        <div className="bg-blue-50 text-blue-800 text-sm p-3 rounded-lg flex items-center gap-2">
                                            <Info size={16} />
                                            Click "Enable Push" and allow permissions when asked.
                                        </div>

                                    </div>
                                )}

                                {/* Debug Mode Toggle */}
                                <div className="mt-4 pt-4 border-t flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                        <Bug size={16} />
                                        <span>Show debug logs in console</span>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={formData.debug_mode}
                                            onChange={(e) => handleChange('debug_mode', e.target.checked)}
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                    </label>
                                </div>
                                {formData.debug_mode && (
                                    <div className="text-[10px] text-gray-400 font-mono p-2 border border-dashed rounded mt-2">
                                        <p>Permission: {permissionStatus}</p>
                                        <p>SW Status: {swStatus}</p>
                                        <p>Scope: {swScope}</p>
                                        <p>Secure Context: {window.isSecureContext ? 'Yes' : 'No'}</p>
                                        <p>VAPID: {getPublicVapidKey() ? 'Loaded' : 'Missing'}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Address */}
                        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-6">
                            <h3 className="font-bold text-lg flex items-center gap-2 text-gray-700 border-b pb-2">
                                <MapPin size={20} className="text-primary" /> Location
                            </h3>

                            <div className="grid md:grid-cols-2 gap-4">
                                <Input
                                    label="Address (Hebrew)"
                                    value={formData.address_he}
                                    onChange={(e) => handleChange('address_he', e.target.value)}
                                    className="text-right"
                                    dir="rtl"
                                />
                                <Input
                                    label="Address (Arabic)"
                                    value={formData.address_ar}
                                    onChange={(e) => handleChange('address_ar', e.target.value)}
                                    className="text-right"
                                    dir="rtl"
                                />
                                <Input
                                    label="Address (English)"
                                    value={formData.address_en}
                                    onChange={(e) => handleChange('address_en', e.target.value)}
                                />
                            </div>
                        </div>



                        {/* Working Hours */}
                        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-6">
                            <h3 className="font-bold text-lg flex items-center gap-2 text-gray-700 border-b pb-2">
                                <Clock size={20} className="text-primary" /> Working Hours
                            </h3>

                            <div className="grid md:grid-cols-3 gap-4">
                                <Input
                                    label="Hours (Hebrew)"
                                    value={formData.hours_he}
                                    onChange={(e) => handleChange('hours_he', e.target.value)}
                                    className="text-right"
                                    dir="rtl"
                                />
                                <Input
                                    label="Hours (Arabic)"
                                    value={formData.hours_ar}
                                    onChange={(e) => handleChange('hours_ar', e.target.value)}
                                    className="text-right"
                                    dir="rtl"
                                />
                                <Input
                                    label="Hours (English)"
                                    value={formData.hours_en}
                                    onChange={(e) => handleChange('hours_en', e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button type="submit" size="lg" isLoading={loading}>
                                <Save size={20} className="mr-2" /> Save All Settings
                            </Button>
                        </div>
                    </form>
                </div>

                {/* Preview Section */}
                <div className="lg:col-span-1">
                    <div className="sticky top-24 space-y-6">
                        <h3 className="text-lg font-bold text-gray-500 uppercase tracking-wider">Live Preview</h3>

                        <div className="bg-gray-900 text-white rounded-xl shadow-xl overflow-hidden text-sm">
                            <div className="p-4 border-b border-gray-800 bg-black/20">
                                <div className="font-bold text-lg">{formData.storeName || 'Store Name'}</div>
                            </div>
                            <div className="p-4 space-y-3">
                                <div className="flex gap-2 text-gray-300">
                                    <MapPin size={14} className="mt-0.5" />
                                    <span>{formData.address_en || formData.address_he || 'Address'}</span>
                                </div>
                                <div className="flex gap-2 text-gray-300">
                                    <Clock size={14} className="mt-0.5" />
                                    <span>{formData.hours_en || formData.hours_he || 'Hours'}</span>
                                </div>
                                <div className="flex gap-2 text-gray-300">
                                    <Phone size={14} className="mt-0.5" />
                                    <span>{formData.phone || 'Phone'}</span>
                                </div>
                                <div className="pt-3 flex gap-3">
                                    {formData.instagram_url && <Instagram size={16} className="text-pink-400" />}
                                    {formData.facebook_url && <Facebook size={16} className="text-blue-400" />}
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 text-sm text-gray-500">
                            Updates reflect instantly across the entire website.
                        </div>
                    </div>
                </div>
            </div >
        </div >
    );
}
