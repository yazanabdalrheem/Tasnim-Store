import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.91.1";

const PAYPAL_CLIENT_ID = Deno.env.get("PAYPAL_CLIENT_ID") || "";
const PAYPAL_CLIENT_SECRET = Deno.env.get("PAYPAL_CLIENT_SECRET") || "";
const PAYPAL_ENV = Deno.env.get("PAYPAL_ENV") || "sandbox";
const PAYPAL_API = PAYPAL_ENV === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        // Parse request body with error handling
        let body;
        try {
            body = await req.json();
        } catch (jsonError) {
            console.error("JSON parsing error:", jsonError);
            return new Response(
                JSON.stringify({ error: "invalid_json", message: "Request body must be valid JSON" }),
                {
                    status: 400,
                    headers: { ...corsHeaders, "Content-Type": "application/json" }
                }
            );
        }

        const { action, cartItems, couponCode, userData, orderID, amount, currency } = body;

        const supabase = createClient(
            Deno.env.get("SUPABASE_URL") ?? "",
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
        );

        // Get Auth Token
        const getAccessToken = async () => {
            const auth = btoa(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`);
            const response = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
                method: "POST",
                body: "grant_type=client_credentials",
                headers: {
                    Authorization: `Basic ${auth}`,
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            });
            const data = await response.json();
            return data.access_token;
        };

        if (action === "create-order") {
            // Validate amount field
            if (!amount) {
                return new Response(
                    JSON.stringify({ error: "amount_required", message: "Amount is required for creating order" }),
                    {
                        status: 400,
                        headers: { ...corsHeaders, "Content-Type": "application/json" }
                    }
                );
            }

            // Ensure amount is a string with 2 decimals
            const amountValue = typeof amount === 'string' ? amount : Number(amount).toFixed(2);
            const currencyCode = currency || "ILS";

            // 3. Create PayPal Order
            const accessToken = await getAccessToken();
            const paypalResponse = await fetch(`${PAYPAL_API}/v2/checkout/orders`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    intent: "CAPTURE",
                    purchase_units: [
                        {
                            amount: {
                                currency_code: currencyCode,
                                value: amountValue,
                            },
                            description: `Tasnim Store Order`,
                        },
                    ],
                }),
            });

            const paypalData = await paypalResponse.json();

            // Check if PayPal order creation failed
            if (!paypalResponse.ok || !paypalData.id) {
                console.error("PayPal order creation failed:", paypalData);
                return new Response(
                    JSON.stringify({
                        error: "paypal_order_failed",
                        message: "Failed to create PayPal order",
                        details: paypalData
                    }),
                    {
                        status: 502,
                        headers: { ...corsHeaders, "Content-Type": "application/json" }
                    }
                );
            }

            // Return order ID in correct format
            return new Response(
                JSON.stringify({ id: paypalData.id }),
                {
                    status: 200,
                    headers: { ...corsHeaders, "Content-Type": "application/json" },
                }
            );
        }

        if (action === "capture-order") {
            const accessToken = await getAccessToken();
            const response = await fetch(`${PAYPAL_API}/v2/checkout/orders/${orderID}/capture`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
            });

            const captureData = await response.json();

            if (captureData.status === "COMPLETED") {
                // Create Order in DB
                const { data: orderData, error: orderError } = await supabase
                    .from("orders")
                    .insert([{
                        user_id: userData.userId || null,
                        total_amount: parseFloat(captureData.purchase_units[0].payments.captures[0].amount.value),
                        status: "paid",
                        customer_details: userData.customerDetails,
                        shipping_address: userData.shippingAddress,
                        transaction_id: captureData.id,
                        payment_method: "paypal"
                    }])
                    .select()
                    .single();

                if (orderError) throw orderError;

                // Insert Items
                const orderItems = cartItems.map((item: any) => ({
                    order_id: orderData.id,
                    product_id: item.product_id,
                    quantity: item.quantity,
                    price_at_purchase: item.price
                }));

                await supabase.from("order_items").insert(orderItems);

                return new Response(JSON.stringify({ success: true, orderData }), {
                    headers: { ...corsHeaders, "Content-Type": "application/json" },
                    status: 200,
                });
            }

            return new Response(JSON.stringify(captureData), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 400,
            });
        }

        return new Response(
            JSON.stringify({ error: "invalid_action", message: "Action must be 'create-order' or 'capture-order'" }),
            {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 400
            }
        );

    } catch (error: any) {
        console.error("Edge function error:", error);
        return new Response(JSON.stringify({ error: "internal_error", message: error.message }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 500,
        });
    }
});
