import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifyWebhookSignature } from "@/lib/wompi/client";
import type { WompiWebhookEvent, TransactionStatus } from "@/lib/wompi/types";

// Use service role for webhook operations
function getAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing Supabase configuration");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false }
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const event = body as WompiWebhookEvent;

    // Verify webhook signature
    if (event.signature) {
      const isValid = verifyWebhookSignature(
        event.signature.checksum,
        event.signature.properties,
        event.data
      );

      if (!isValid) {
        console.error("Invalid webhook signature");
        return NextResponse.json(
          { error: "Invalid signature" },
          { status: 401 }
        );
      }
    }

    // Handle different event types
    switch (event.event) {
      case "transaction.updated":
        await handleTransactionUpdated(event);
        break;
      case "nequi_token.updated":
        // Handle Nequi token updates if needed
        console.log("Nequi token updated:", event.data);
        break;
      default:
        console.log("Unhandled webhook event:", event.event);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

async function handleTransactionUpdated(event: WompiWebhookEvent) {
  const supabase = getAdminClient();
  const transaction = event.data.transaction;

  if (!transaction) {
    console.error("No transaction data in webhook");
    return;
  }

  const wompiTransactionId = transaction.id;
  const newStatus = transaction.status as TransactionStatus;

  // Update payment record
  const { data: payment, error: paymentError } = await supabase
    .from("payments")
    .update({
      status: newStatus,
      error_message:
        newStatus === "DECLINED" || newStatus === "ERROR"
          ? transaction.status_message || "Payment failed"
          : null
    })
    .eq("wompi_transaction_id", wompiTransactionId)
    .select("subscription_id, user_id")
    .single();

  if (paymentError) {
    console.error("Failed to update payment:", paymentError);
    return;
  }

  // If payment was approved, update subscription status
  if (newStatus === "APPROVED" && payment?.subscription_id) {
    const newPeriodStart = new Date();
    const newPeriodEnd = new Date();
    newPeriodEnd.setMonth(newPeriodEnd.getMonth() + 1);

    const { error: subError } = await supabase
      .from("subscriptions")
      .update({
        status: "active",
        current_period_start: newPeriodStart.toISOString(),
        current_period_end: newPeriodEnd.toISOString()
      })
      .eq("id", payment.subscription_id);

    if (subError) {
      console.error("Failed to update subscription:", subError);
    }

    // Get subscription to update user plan
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("plan_id")
      .eq("id", payment.subscription_id)
      .single();

    if (subscription && payment.user_id) {
      await supabase
        .from("profiles")
        .update({ plan: subscription.plan_id })
        .eq("id", payment.user_id);
    }
  }

  // If payment failed, mark subscription as past_due
  if (
    (newStatus === "DECLINED" || newStatus === "ERROR") &&
    payment?.subscription_id
  ) {
    const { error: subError } = await supabase
      .from("subscriptions")
      .update({ status: "past_due" })
      .eq("id", payment.subscription_id);

    if (subError) {
      console.error("Failed to update subscription to past_due:", subError);
    }
  }

  console.log(
    `Transaction ${wompiTransactionId} updated to status: ${newStatus}`
  );
}

// Wompi may also send GET requests for verification
export async function GET() {
  return NextResponse.json({ status: "Webhook endpoint active" });
}
