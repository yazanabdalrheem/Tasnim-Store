// deno-lint-ignore-file
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import webpush from 'https://esm.sh/web-push@3.6.3'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
const VAPID_PUBLIC_KEY = Deno.env.get('VAPID_PUBLIC_KEY') ?? ''
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY') ?? ''
const VAPID_SUBJECT = "mailto:admin@tasnim.com" // Update this

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

webpush.setVapidDetails(
    VAPID_SUBJECT,
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
);

Deno.serve(async (req) => {
    try {
        const now = new Date().toISOString();

        // 1. Fetch pending items
        const { data: queue, error: fetchError } = await supabase
            .from('notification_queue')
            .select('*')
            .eq('status', 'pending')
            .lte('next_retry_at', now)
            .limit(10);

        if (fetchError) throw fetchError;
        if (!queue || queue.length === 0) {
            return new Response(JSON.stringify({ message: 'No items' }), { headers: { 'Content-Type': 'application/json' } });
        }

        const results = [];

        // 2. Process each item
        for (const item of queue) {
            await supabase.from('notification_queue').update({ status: 'processing' }).eq('id', item.id);

            try {
                // Determine Recipients
                let recipients = [];

                if (item.recipient_user_id) {
                    // Specific User
                    const { data: subs } = await supabase.from('push_subscriptions').select('*').eq('user_id', item.recipient_user_id);
                    if (subs) recipients = subs;
                } else {
                    // All Admins
                    const { data: subs } = await supabase.from('push_subscriptions').select('*'); // Filtering by role happens at insert or assumed
                    // Ideally filtering by role here would be better if table grows, but schema keeps it simple.
                    // Assuming all in this table are admins/subscribed users.
                    if (subs) recipients = subs;
                }

                if (recipients.length === 0) {
                    throw new Error("No subscribed recipients found");
                }

                // Prepare Payload
                const pushPayload = JSON.stringify({
                    title: item.type === 'booking_new' ? 'New Booking!' :
                        item.type === 'order_new' ? 'New Order!' : 'Tasnim Notification',
                    body: item.type === 'booking_new' ? `${item.payload.name} - ${item.payload.date}` :
                        item.type === 'order_new' ? `Total: ₪${item.payload.total}` :
                            item.payload.message || 'Check admin panel for details.',
                    url: '/admin'
                });

                // Send to all endpoints
                const promises = recipients.map(sub => {
                    const pushConfig = {
                        endpoint: sub.endpoint,
                        keys: { auth: sub.auth, p256dh: sub.p256dh }
                    };
                    return webpush.sendNotification(pushConfig, pushPayload)
                        .catch(async (err) => {
                            if (err.statusCode === 410 || err.statusCode === 404) {
                                // Cleanup invalid subscription
                                await supabase.from('push_subscriptions').delete().eq('id', sub.id);
                            }
                            throw err;
                        });
                });

                await Promise.all(promises);

                // Success
                await supabase.from('notification_queue').update({ status: 'sent', last_error: null }).eq('id', item.id);
                results.push({ id: item.id, status: 'sent' });

            } catch (err: any) {
                console.error(`Error processing ${item.id}:`, err);
                // Retry Logic
                const nextAttempts = item.attempts + 1;
                const status = nextAttempts >= 5 ? 'failed' : 'pending';
                const backoffMinutes = Math.pow(2, nextAttempts);
                const nextRetry = new Date(Date.now() + backoffMinutes * 60000).toISOString();

                await supabase.from('notification_queue').update({
                    status: status,
                    attempts: nextAttempts,
                    next_retry_at: nextRetry,
                    last_error: err.message || 'Unknown error'
                }).eq('id', item.id);

                results.push({ id: item.id, status: 'error', error: err.message });
            }
        }

        return new Response(JSON.stringify({ processed: results }), { headers: { 'Content-Type': 'application/json' } });

    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
});
