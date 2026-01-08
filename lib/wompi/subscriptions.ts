import { createClient } from "@supabase/supabase-js";
import type { PlanId, Subscription, Payment, TransactionStatus, PLANS } from "./types";
import {
  createPaymentSource,
  createTransaction,
  generateReference,
  generateIntegritySignature
} from "./client";

// Use service role client for server-side operations
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

/**
 * Create a new subscription for a user
 */
export async function createSubscription(params: {
  userId: string;
  planId: PlanId;
  cardToken: string;
  customerEmail: string;
  acceptanceToken: string;
  amountCents: number;
  currency: string;
}): Promise<{ subscription: Subscription; transaction: Payment }> {
  const supabase = getAdminClient();

  // Check if user already has an active subscription
  const { data: existingSubscription } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", params.userId)
    .eq("status", "active")
    .single();

  if (existingSubscription) {
    throw new Error("User already has an active subscription");
  }

  // Create payment source from card token
  const paymentSourceResponse = await createPaymentSource({
    type: "CARD",
    token: params.cardToken,
    customer_email: params.customerEmail,
    acceptance_token: params.acceptanceToken
  });

  const paymentSourceId = paymentSourceResponse.data.id;

  // Generate reference for first payment
  const reference = generateReference(params.userId, params.planId);

  // Generate integrity signature
  const integritySignature = generateIntegritySignature(
    reference,
    params.amountCents,
    params.currency
  );

  // Create first transaction
  const transactionResponse = await createTransaction({
    amount_in_cents: params.amountCents,
    currency: params.currency as "COP" | "USD",
    customer_email: params.customerEmail,
    reference,
    payment_source_id: paymentSourceId,
    payment_method: { installments: 1 },
    recurrent: true,
    signature: integritySignature
  });

  const transaction = transactionResponse.data;

  // Calculate period dates (monthly subscription)
  const periodStart = new Date();
  const periodEnd = new Date();
  periodEnd.setMonth(periodEnd.getMonth() + 1);

  // Create subscription record
  const { data: subscription, error: subError } = await supabase
    .from("subscriptions")
    .insert({
      user_id: params.userId,
      plan_id: params.planId,
      status: transaction.status === "APPROVED" ? "active" : "past_due",
      payment_source_id: paymentSourceId,
      customer_email: params.customerEmail,
      amount_cents: params.amountCents,
      currency: params.currency,
      current_period_start: periodStart.toISOString(),
      current_period_end: periodEnd.toISOString()
    })
    .select()
    .single();

  if (subError) {
    throw new Error(`Failed to create subscription: ${subError.message}`);
  }

  // Create payment record
  const { data: payment, error: payError } = await supabase
    .from("payments")
    .insert({
      user_id: params.userId,
      subscription_id: subscription.id,
      wompi_transaction_id: transaction.id,
      reference,
      amount_cents: params.amountCents,
      currency: params.currency,
      status: transaction.status,
      payment_method_type: transaction.payment_method_type,
      card_last_four: transaction.payment_method?.extra?.last_four,
      card_brand: transaction.payment_method?.extra?.brand
    })
    .select()
    .single();

  if (payError) {
    throw new Error(`Failed to create payment record: ${payError.message}`);
  }

  // Update user plan if payment was approved
  if (transaction.status === "APPROVED") {
    await supabase
      .from("profiles")
      .update({ plan: params.planId })
      .eq("id", params.userId);
  }

  return { subscription, transaction: payment };
}

/**
 * Process recurring payment for a subscription
 */
export async function processRecurringPayment(
  subscriptionId: string
): Promise<Payment> {
  const supabase = getAdminClient();

  // Get subscription
  const { data: subscription, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("id", subscriptionId)
    .single();

  if (error || !subscription) {
    throw new Error("Subscription not found");
  }

  if (subscription.status === "cancelled") {
    throw new Error("Subscription is cancelled");
  }

  const reference = generateReference(subscription.user_id, subscription.plan_id);

  // Generate integrity signature
  const integritySignature = generateIntegritySignature(
    reference,
    subscription.amount_cents,
    subscription.currency
  );

  // Create transaction
  const transactionResponse = await createTransaction({
    amount_in_cents: subscription.amount_cents,
    currency: subscription.currency as "COP" | "USD",
    customer_email: subscription.customer_email,
    reference,
    payment_source_id: subscription.payment_source_id,
    payment_method: { installments: 1 },
    recurrent: true,
    signature: integritySignature
  });

  const transaction = transactionResponse.data;

  // Create payment record
  const { data: payment, error: payError } = await supabase
    .from("payments")
    .insert({
      user_id: subscription.user_id,
      subscription_id: subscription.id,
      wompi_transaction_id: transaction.id,
      reference,
      amount_cents: subscription.amount_cents,
      currency: subscription.currency,
      status: transaction.status,
      payment_method_type: transaction.payment_method_type,
      card_last_four: transaction.payment_method?.extra?.last_four,
      card_brand: transaction.payment_method?.extra?.brand
    })
    .select()
    .single();

  if (payError) {
    throw new Error(`Failed to create payment record: ${payError.message}`);
  }

  // Update subscription based on payment status
  if (transaction.status === "APPROVED") {
    const newPeriodStart = new Date();
    const newPeriodEnd = new Date();
    newPeriodEnd.setMonth(newPeriodEnd.getMonth() + 1);

    await supabase
      .from("subscriptions")
      .update({
        status: "active",
        current_period_start: newPeriodStart.toISOString(),
        current_period_end: newPeriodEnd.toISOString()
      })
      .eq("id", subscriptionId);
  } else {
    await supabase
      .from("subscriptions")
      .update({ status: "past_due" })
      .eq("id", subscriptionId);
  }

  return payment;
}

/**
 * Cancel a subscription
 */
export async function cancelSubscription(
  userId: string
): Promise<Subscription> {
  const supabase = getAdminClient();

  const { data: subscription, error } = await supabase
    .from("subscriptions")
    .update({
      status: "cancelled",
      cancelled_at: new Date().toISOString()
    })
    .eq("user_id", userId)
    .eq("status", "active")
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to cancel subscription: ${error.message}`);
  }

  return subscription;
}

/**
 * Get user's active subscription
 */
export async function getUserSubscription(
  userId: string
): Promise<Subscription | null> {
  const supabase = getAdminClient();

  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .in("status", ["active", "past_due"])
    .single();

  if (error) {
    return null;
  }

  return data;
}

/**
 * Get user's payment history
 */
export async function getUserPayments(
  userId: string,
  limit = 10
): Promise<Payment[]> {
  const supabase = getAdminClient();

  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    return [];
  }

  return data;
}

/**
 * Update payment status from webhook
 */
export async function updatePaymentStatus(
  wompiTransactionId: string,
  status: TransactionStatus,
  errorMessage?: string
): Promise<void> {
  const supabase = getAdminClient();

  await supabase
    .from("payments")
    .update({
      status,
      error_message: errorMessage
    })
    .eq("wompi_transaction_id", wompiTransactionId);
}

/**
 * Get subscriptions that need renewal
 */
export async function getSubscriptionsDueForRenewal(): Promise<Subscription[]> {
  const supabase = getAdminClient();

  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("status", "active")
    .lt("current_period_end", now);

  if (error) {
    return [];
  }

  return data;
}

/**
 * Upgrade or downgrade subscription
 */
export async function changeSubscriptionPlan(
  userId: string,
  newPlanId: PlanId,
  newAmountCents: number
): Promise<Subscription> {
  const supabase = getAdminClient();

  const { data: subscription, error } = await supabase
    .from("subscriptions")
    .update({
      plan_id: newPlanId,
      amount_cents: newAmountCents
    })
    .eq("user_id", userId)
    .eq("status", "active")
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to change plan: ${error.message}`);
  }

  // Update user profile
  await supabase
    .from("profiles")
    .update({ plan: newPlanId })
    .eq("id", userId);

  return subscription;
}
