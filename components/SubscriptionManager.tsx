"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Subscription, Payment, PlanId } from "@/lib/wompi/types";
import { PLANS } from "@/lib/wompi/types";
import LoadingLink from "./LoadingLink";

interface SubscriptionManagerProps {
  subscription: Subscription | null;
  payments: Payment[];
  userPlan: string;
}

export default function SubscriptionManager({
  subscription,
  payments,
  userPlan
}: SubscriptionManagerProps) {
  const router = useRouter();
  const [cancelling, setCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const plan = subscription ? PLANS[subscription.plan_id as PlanId] : null;

  async function handleCancel() {
    setCancelling(true);
    setError(null);

    try {
      const response = await fetch("/api/subscriptions/cancel", {
        method: "POST"
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to cancel subscription");
      }

      setShowCancelModal(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setCancelling(false);
    }
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case "active":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700 border border-green-200">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
            Active
          </span>
        );
      case "past_due":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-50 px-3 py-1 text-xs font-medium text-yellow-700 border border-yellow-200">
            <span className="h-1.5 w-1.5 rounded-full bg-yellow-500" />
            Past Due
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 border border-gray-200">
            <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
            Cancelled
          </span>
        );
      default:
        return null;
    }
  }

  function getPaymentStatusBadge(status: string) {
    switch (status) {
      case "APPROVED":
        return (
          <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
            Paid
          </span>
        );
      case "PENDING":
        return (
          <span className="inline-flex items-center rounded-full bg-yellow-50 px-2 py-0.5 text-xs font-medium text-yellow-700">
            Pending
          </span>
        );
      case "DECLINED":
      case "ERROR":
        return (
          <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700">
            Failed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
            {status}
          </span>
        );
    }
  }

  // No active subscription
  if (!subscription || subscription.status === "cancelled") {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="font-semibold text-gray-900">Subscription</h2>
        <div className="mt-4">
          <div className="rounded-xl bg-gray-50 p-4 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
              <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6 text-gray-400">
                <path d="M3 10h18M7 15h.01M11 15h2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <rect x="3" y="6" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="2" />
              </svg>
            </div>
            <p className="mt-3 text-sm font-medium text-gray-900">No active subscription</p>
            <p className="mt-1 text-sm text-gray-500">
              {userPlan === "free"
                ? "Upgrade to unlock more features and higher limits."
                : "Your subscription has been cancelled."}
            </p>
            <LoadingLink
              href="/pricing"
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-orange-600"
            >
              View Plans
              <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4">
                <path d="M6 12l4-4-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </LoadingLink>
          </div>
        </div>

        {/* Show payment history even if no active subscription */}
        {payments.length > 0 && (
          <div className="mt-6 border-t border-gray-200 pt-6">
            <h3 className="text-sm font-medium text-gray-900">Payment History</h3>
            <div className="mt-3 space-y-2">
              {payments.slice(0, 5).map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200">
                      <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-gray-500">
                        <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        ${(payment.amount_cents / 100).toFixed(2)} {payment.currency}
                      </p>
                      <p className="text-xs text-gray-500">{formatDate(payment.created_at)}</p>
                    </div>
                  </div>
                  {getPaymentStatusBadge(payment.status)}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Active subscription
  return (
    <>
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between">
          <h2 className="font-semibold text-gray-900">Subscription</h2>
          {getStatusBadge(subscription.status)}
        </div>

        {/* Current Plan */}
        <div className="mt-4 rounded-xl bg-gradient-to-br from-orange-50 to-orange-100/50 p-4 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-bold text-gray-900">{plan?.name} Plan</p>
              <p className="text-sm text-gray-600">
                ${plan?.priceUSD}/month
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500 shadow-md">
              <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6 text-white">
                <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
              </svg>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-medium text-gray-500">Current Period</p>
              <p className="mt-1 text-sm font-medium text-gray-900">
                {formatDate(subscription.current_period_start)}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">Next Billing</p>
              <p className="mt-1 text-sm font-medium text-gray-900">
                {formatDate(subscription.current_period_end)}
              </p>
            </div>
          </div>
        </div>

        {/* Plan Features */}
        {plan && (
          <div className="mt-4">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Includes</p>
            <ul className="mt-2 grid grid-cols-2 gap-2">
              {plan.features.slice(0, 4).map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-sm text-gray-600">
                  <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-green-500 flex-shrink-0">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="truncate">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 flex flex-wrap gap-3">
          {subscription.plan_id === "starter" && (
            <LoadingLink
              href="/checkout?plan=pro"
              className="inline-flex items-center gap-2 rounded-full bg-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-orange-600"
            >
              Upgrade to Pro
              <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4">
                <path d="M6 12l4-4-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </LoadingLink>
          )}
          <button
            onClick={() => setShowCancelModal(true)}
            className="inline-flex items-center rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50"
          >
            Cancel Subscription
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Payment History */}
        {payments.length > 0 && (
          <div className="mt-6 border-t border-gray-200 pt-6">
            <h3 className="text-sm font-medium text-gray-900">Recent Payments</h3>
            <div className="mt-3 space-y-2">
              {payments.slice(0, 5).map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
                      payment.status === "APPROVED" ? "bg-green-100" : "bg-gray-200"
                    }`}>
                      {payment.status === "APPROVED" ? (
                        <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-green-600">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-gray-500">
                          <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        ${(payment.amount_cents / 100).toFixed(2)} {payment.currency}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(payment.created_at)}
                        {payment.card_brand && payment.card_last_four && (
                          <span className="ml-2">
                            {payment.card_brand} ····{payment.card_last_four}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  {getPaymentStatusBadge(payment.status)}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6 text-red-600">
                <path d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">Cancel Subscription?</h3>
            <p className="mt-2 text-sm text-gray-600">
              Are you sure you want to cancel your {plan?.name} subscription? You&apos;ll lose access to:
            </p>
            <ul className="mt-3 space-y-1">
              {plan?.features.slice(0, 3).map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-sm text-gray-600">
                  <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-red-400">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-gray-500">
              Your access will continue until {formatDate(subscription.current_period_end)}.
            </p>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                disabled={cancelling}
                className="flex-1 rounded-full border border-gray-200 bg-white py-2.5 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 disabled:opacity-50"
              >
                Keep Subscription
              </button>
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="flex-1 rounded-full bg-red-600 py-2.5 text-sm font-semibold text-white transition-all hover:bg-red-700 disabled:opacity-50"
              >
                {cancelling ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Cancelling...
                  </span>
                ) : (
                  "Yes, Cancel"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
