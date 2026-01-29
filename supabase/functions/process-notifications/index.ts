// Follow this setup guide to deploy: https://supabase.com/docs/guides/functions/deploy
// deno-lint-ignore-file
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

// Initialize with Service Role to bypass RLS
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

Deno.serve(async (req) => {
    try {
        // 1. Fetch Setting: Is WhatsApp Enabled?
        const { data: settings } = await supabase.from('site_settings').select('whatsapp_enabled, whatsapp_admin_phone').single();
        if (!settings?.whatsapp_enabled) {
            return new Response(JSON.stringify({ message: 'WhatsApp Disabled' }), { headers: { 'Content-Type': 'application/json' } });
        }

        // 2. Claim Pending Items (Simple Locking)
        // We update status to 'processing' for items due now
        // Note: For high concurrency, use a stored procedure with FOR UPDATE SKIP LOCKED
        const now = new Date().toISOString();

        // Fetch pending
        const { data: pendingItems, error: fetchError } = await supabase
            .from('notification_queue')
            .select('*')
            .eq('status', 'pending')
            .lte('next_retry_at', now)
            .limit(10);

        if (fetchError) throw fetchError;
        if (!pendingItems || pendingItems.length === 0) {
            return new Response(JSON.stringify({ message: 'No items to process' }), { headers: { 'Content-Type': 'application/json' } });
        }

        const results = [];

        // 3. Process Batch
        for (const item of pendingItems) {
            // Mark as processing
            await supabase.from('notification_queue').update({ status: 'processing' }).eq('id', item.id);

            try {
                let recipient = item.recipient_phone;
                // If type is new booking/order, recipient is Admin
                if (item.type === 'booking_new' || item.type === 'order_new') {
                    recipient = settings.whatsapp_admin_phone;
                }

                if (!recipient) {
                    throw new Error('No recipient phone');
                }

                // ============================================
                // MOCK SEND (Replace with real WhatsApp API call)
                // ============================================
                console.log(`[WhatsApp Mock] Sending ${item.type} to ${recipient}:`, item.payload);

                // Simulating API Call
                // const response = await fetch('https://graph.facebook.com/v17.0/PHONE_NUMBER_ID/messages', { ... })
                // if (!response.ok) throw new Error(...)

                // ============================================

                // Success
                await supabase.from('notification_queue').update({
                    status: 'sent',
                    last_error: null
                }).eq('id', item.id);

                // Log success
                await supabase.from('notification_logs').insert({
                    queue_id: item.id,
                    type: item.type,
                    recipient_phone: recipient,
                    status: 'success',
                    response_data: { mock: true, timestamp: new Date() }
                });

                results.push({ id: item.id, status: 'sent' });

            } catch (err: any) {
                console.error(`Failed to process item ${item.id}:`, err);

                // Retry Logic
                const nextAttempts = item.attempts + 1;
                const status = nextAttempts >= 5 ? 'failed' : 'pending';
                // Exponential Backoff: 1m, 2m, 4m, 8m...
                const backoffMinutes = Math.pow(2, nextAttempts);
                const nextRetry = new Date(Date.now() + backoffMinutes * 60000).toISOString();

                await supabase.from('notification_queue').update({
                    status: status,
                    attempts: nextAttempts,
                    next_retry_at: nextRetry,
                    last_error: err.message
                }).eq('id', item.id);

                results.push({ id: item.id, status: 'error', error: err.message });
            }
        }

        return new Response(JSON.stringify({ processed: results }), { headers: { 'Content-Type': 'application/json' } });

    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
})
