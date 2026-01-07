import { createClient } from "@supabase/supabase-js";

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

export interface PaymentStats {
  total_revenue: number;
  revenue_30d: number;
  revenue_7d: number;
  total_payments: number;
  payments_30d: number;
  payments_7d: number;
  successful_payments: number;
  failed_payments: number;
  success_rate: number;
  average_payment: number;
  active_subscriptions: number;
  cancelled_subscriptions: number;
  past_due_subscriptions: number;
  mrr: number; // Monthly Recurring Revenue
  plan_distribution: Record<string, number>;
}

export interface PaymentWithUser {
  id: string;
  user_id: string;
  subscription_id: string | null;
  wompi_transaction_id: string;
  reference: string;
  amount_cents: number;
  currency: string;
  status: string;
  payment_method_type: string | null;
  card_last_four: string | null;
  card_brand: string | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
  user_email?: string;
}

export interface SubscriptionWithUser {
  id: string;
  user_id: string;
  plan_id: string;
  status: string;
  payment_source_id: number;
  customer_email: string;
  amount_cents: number;
  currency: string;
  current_period_start: string;
  current_period_end: string;
  cancelled_at: string | null;
  created_at: string;
  updated_at: string;
  user_email?: string;
}

/**
 * Get payment and subscription statistics for admin dashboard
 */
export async function adminGetPaymentStats(): Promise<PaymentStats> {
  const supabase = getAdminClient();
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

  // Get all payments
  const { data: allPayments } = await supabase
    .from("payments")
    .select("amount_cents, status, created_at");

  // Get all subscriptions
  const { data: allSubscriptions } = await supabase
    .from("subscriptions")
    .select("status, plan_id, amount_cents");

  const payments = allPayments || [];
  const subscriptions = allSubscriptions || [];

  // Calculate payment stats
  const successfulPayments = payments.filter(p => p.status === "APPROVED");
  const failedPayments = payments.filter(p => p.status === "DECLINED" || p.status === "ERROR");
  const payments30d = payments.filter(p => p.created_at >= thirtyDaysAgo);
  const payments7d = payments.filter(p => p.created_at >= sevenDaysAgo);
  const successfulPayments30d = payments30d.filter(p => p.status === "APPROVED");
  const successfulPayments7d = payments7d.filter(p => p.status === "APPROVED");

  const totalRevenue = successfulPayments.reduce((sum, p) => sum + (p.amount_cents || 0), 0);
  const revenue30d = successfulPayments30d.reduce((sum, p) => sum + (p.amount_cents || 0), 0);
  const revenue7d = successfulPayments7d.reduce((sum, p) => sum + (p.amount_cents || 0), 0);

  // Calculate subscription stats
  const activeSubscriptions = subscriptions.filter(s => s.status === "active");
  const cancelledSubscriptions = subscriptions.filter(s => s.status === "cancelled");
  const pastDueSubscriptions = subscriptions.filter(s => s.status === "past_due");

  // Calculate MRR from active subscriptions
  const mrr = activeSubscriptions.reduce((sum, s) => sum + (s.amount_cents || 0), 0);

  // Plan distribution
  const planDistribution: Record<string, number> = {};
  activeSubscriptions.forEach(s => {
    planDistribution[s.plan_id] = (planDistribution[s.plan_id] || 0) + 1;
  });

  return {
    total_revenue: totalRevenue / 100, // Convert to dollars
    revenue_30d: revenue30d / 100,
    revenue_7d: revenue7d / 100,
    total_payments: payments.length,
    payments_30d: payments30d.length,
    payments_7d: payments7d.length,
    successful_payments: successfulPayments.length,
    failed_payments: failedPayments.length,
    success_rate: payments.length > 0 ? successfulPayments.length / payments.length : 0,
    average_payment: successfulPayments.length > 0 ? totalRevenue / successfulPayments.length / 100 : 0,
    active_subscriptions: activeSubscriptions.length,
    cancelled_subscriptions: cancelledSubscriptions.length,
    past_due_subscriptions: pastDueSubscriptions.length,
    mrr: mrr / 100,
    plan_distribution: planDistribution
  };
}

/**
 * Get paginated list of payments for admin
 */
export async function adminGetPayments(params: {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}): Promise<{ payments: PaymentWithUser[]; total: number }> {
  const supabase = getAdminClient();
  const page = params.page || 1;
  const limit = params.limit || 20;
  const offset = (page - 1) * limit;

  let query = supabase
    .from("payments")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (params.status) {
    query = query.eq("status", params.status);
  }

  if (params.search) {
    query = query.or(`reference.ilike.%${params.search}%,wompi_transaction_id.ilike.%${params.search}%`);
  }

  const { data: payments, count } = await query;

  // Get user emails for payments
  if (payments && payments.length > 0) {
    const userIds = [...new Set(payments.map(p => p.user_id))];
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, email")
      .in("id", userIds);

    const emailMap = new Map(profiles?.map(p => [p.id, p.email]) || []);

    return {
      payments: payments.map(p => ({
        ...p,
        user_email: emailMap.get(p.user_id) || undefined
      })),
      total: count || 0
    };
  }

  return { payments: [], total: 0 };
}

/**
 * Get paginated list of subscriptions for admin
 */
export async function adminGetSubscriptions(params: {
  page?: number;
  limit?: number;
  status?: string;
  plan?: string;
}): Promise<{ subscriptions: SubscriptionWithUser[]; total: number }> {
  const supabase = getAdminClient();
  const page = params.page || 1;
  const limit = params.limit || 20;
  const offset = (page - 1) * limit;

  let query = supabase
    .from("subscriptions")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (params.status) {
    query = query.eq("status", params.status);
  }

  if (params.plan) {
    query = query.eq("plan_id", params.plan);
  }

  const { data: subscriptions, count } = await query;

  return {
    subscriptions: subscriptions || [],
    total: count || 0
  };
}

/**
 * Get recent payments for dashboard widget
 */
export async function adminGetRecentPayments(limit = 5): Promise<PaymentWithUser[]> {
  const supabase = getAdminClient();

  const { data: payments } = await supabase
    .from("payments")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (payments && payments.length > 0) {
    const userIds = [...new Set(payments.map(p => p.user_id))];
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, email")
      .in("id", userIds);

    const emailMap = new Map(profiles?.map(p => [p.id, p.email]) || []);

    return payments.map(p => ({
      ...p,
      user_email: emailMap.get(p.user_id) || undefined
    }));
  }

  return [];
}

/**
 * Get revenue chart data for the last 30 days
 */
export async function adminGetRevenueChart(): Promise<{ date: string; revenue: number }[]> {
  const supabase = getAdminClient();
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const { data: payments } = await supabase
    .from("payments")
    .select("amount_cents, status, created_at")
    .eq("status", "APPROVED")
    .gte("created_at", thirtyDaysAgo.toISOString())
    .order("created_at", { ascending: true });

  // Group by date
  const revenueByDate = new Map<string, number>();

  // Initialize all dates with 0
  for (let i = 0; i < 30; i++) {
    const date = new Date(now.getTime() - (29 - i) * 24 * 60 * 60 * 1000);
    const dateStr = date.toISOString().split("T")[0];
    revenueByDate.set(dateStr, 0);
  }

  // Sum up revenue per date
  payments?.forEach(p => {
    const dateStr = p.created_at.split("T")[0];
    const current = revenueByDate.get(dateStr) || 0;
    revenueByDate.set(dateStr, current + (p.amount_cents || 0));
  });

  return Array.from(revenueByDate.entries()).map(([date, revenue]) => ({
    date,
    revenue: revenue / 100 // Convert to dollars
  }));
}
