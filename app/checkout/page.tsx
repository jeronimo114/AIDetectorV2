"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { PLANS, type PlanId } from "@/lib/wompi/types";
import LoadingLink from "@/components/LoadingLink";

type CheckoutStep = "plan" | "payment" | "processing" | "success" | "error";

interface CardForm {
  number: string;
  expMonth: string;
  expYear: string;
  cvc: string;
  cardHolder: string;
}

interface FormErrors {
  number?: string;
  expMonth?: string;
  expYear?: string;
  cvc?: string;
  cardHolder?: string;
  terms?: string;
}

const WOMPI_PUBLIC_KEY = process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY || "";
const WOMPI_ENV = process.env.NEXT_PUBLIC_WOMPI_ENV || "sandbox";
const WOMPI_BASE_URL =
  WOMPI_ENV === "production"
    ? "https://production.wompi.co/v1"
    : "https://sandbox.wompi.co/v1";

// Format card number with spaces
function formatCardNumber(value: string): string {
  const cleaned = value.replace(/\D/g, "");
  const groups = cleaned.match(/.{1,4}/g);
  return groups ? groups.join(" ") : cleaned;
}

// Validate card number using Luhn algorithm
function isValidCardNumber(number: string): boolean {
  const cleaned = number.replace(/\D/g, "");
  if (cleaned.length < 13 || cleaned.length > 19) return false;

  let sum = 0;
  let isEven = false;

  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned[i], 10);
    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
}

// Detect card brand
function getCardBrand(number: string): string {
  const cleaned = number.replace(/\D/g, "");
  if (/^4/.test(cleaned)) return "VISA";
  if (/^5[1-5]/.test(cleaned)) return "MASTERCARD";
  if (/^3[47]/.test(cleaned)) return "AMEX";
  if (/^6(?:011|5)/.test(cleaned)) return "DISCOVER";
  return "UNKNOWN";
}

// Loading fallback
function CheckoutLoading() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="mx-auto h-12 w-12 rounded-full border-4 border-gray-200 border-t-orange-500 animate-spin" />
        <p className="mt-4 text-gray-600">Loading checkout...</p>
      </div>
    </main>
  );
}

// Wrapper page with Suspense
export default function CheckoutPage() {
  return (
    <Suspense fallback={<CheckoutLoading />}>
      <CheckoutContent />
    </Suspense>
  );
}

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planId = searchParams.get("plan") as PlanId | null;

  const supabase = getSupabaseBrowserClient();

  const [step, setStep] = useState<CheckoutStep>("plan");
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [acceptanceToken, setAcceptanceToken] = useState<string | null>(null);
  const [termsPermalink, setTermsPermalink] = useState<string>("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState<string | null>(null);

  const [cardForm, setCardForm] = useState<CardForm>({
    number: "",
    expMonth: "",
    expYear: "",
    cvc: "",
    cardHolder: ""
  });

  const [errors, setErrors] = useState<FormErrors>({});

  const plan = planId ? PLANS[planId] : null;

  // Load user and acceptance token
  useEffect(() => {
    async function init() {
      // Check user auth
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push(`/login?redirectedFrom=/checkout?plan=${planId}`);
        return;
      }

      setUser({ id: user.id, email: user.email || "" });

      // Get acceptance token from Wompi
      try {
        const response = await fetch(`${WOMPI_BASE_URL}/merchants/${WOMPI_PUBLIC_KEY}`);
        const data = await response.json();

        if (data.data?.presigned_acceptance) {
          setAcceptanceToken(data.data.presigned_acceptance.acceptance_token);
          setTermsPermalink(data.data.presigned_acceptance.permalink);
        }
      } catch (error) {
        console.error("Failed to get acceptance token:", error);
      }

      setLoading(false);

      if (planId && PLANS[planId]) {
        setStep("payment");
      }
    }

    init();
  }, [supabase, router, planId]);

  // Validate form
  function validateForm(): boolean {
    const newErrors: FormErrors = {};

    const cleanedNumber = cardForm.number.replace(/\D/g, "");
    if (!cleanedNumber) {
      newErrors.number = "Card number is required";
    } else if (!isValidCardNumber(cleanedNumber)) {
      newErrors.number = "Invalid card number";
    }

    if (!cardForm.expMonth || parseInt(cardForm.expMonth) < 1 || parseInt(cardForm.expMonth) > 12) {
      newErrors.expMonth = "Invalid month";
    }

    const currentYear = new Date().getFullYear() % 100;
    if (!cardForm.expYear || parseInt(cardForm.expYear) < currentYear) {
      newErrors.expYear = "Invalid year";
    }

    if (!cardForm.cvc || cardForm.cvc.length < 3) {
      newErrors.cvc = "Invalid CVC";
    }

    if (!cardForm.cardHolder.trim()) {
      newErrors.cardHolder = "Cardholder name is required";
    }

    if (!acceptedTerms) {
      newErrors.terms = "You must accept the terms and conditions";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  // Handle form submission
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!validateForm() || !plan || !user || !acceptanceToken) return;

    setSubmitting(true);
    setErrorMessage(null);
    setStep("processing");

    try {
      // Step 1: Tokenize the card
      const cleanedNumber = cardForm.number.replace(/\D/g, "");
      const tokenResponse = await fetch(`${WOMPI_BASE_URL}/tokens/cards`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${WOMPI_PUBLIC_KEY}`
        },
        body: JSON.stringify({
          number: cleanedNumber,
          exp_month: cardForm.expMonth.padStart(2, "0"),
          exp_year: cardForm.expYear,
          cvc: cardForm.cvc,
          card_holder: cardForm.cardHolder.toUpperCase()
        })
      });

      const tokenData = await tokenResponse.json();

      if (tokenData.status !== "CREATED" || !tokenData.data?.id) {
        throw new Error(tokenData.error?.reason || "Failed to tokenize card");
      }

      // Step 2: Create subscription via our API
      const subscriptionResponse = await fetch("/api/subscriptions/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: plan.id,
          cardToken: tokenData.data.id,
          acceptanceToken
        })
      });

      const subscriptionData = await subscriptionResponse.json();

      if (!subscriptionResponse.ok) {
        throw new Error(subscriptionData.error || "Failed to create subscription");
      }

      if (subscriptionData.transaction?.status === "APPROVED") {
        setTransactionId(subscriptionData.transaction.wompi_transaction_id);
        setStep("success");
      } else {
        throw new Error(subscriptionData.transaction?.error_message || "Payment was not approved");
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Payment failed");
      setStep("error");
    } finally {
      setSubmitting(false);
    }
  }

  // Loading state
  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 rounded-full border-4 border-gray-200 border-t-orange-500 animate-spin" />
          <p className="mt-4 text-gray-600">Loading checkout...</p>
        </div>
      </main>
    );
  }

  // No plan selected
  if (!plan) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
        <div className="w-full max-w-md text-center">
          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-orange-50">
              <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7 text-orange-500">
                <path d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <h1 className="mt-4 text-xl font-bold text-gray-900">No plan selected</h1>
            <p className="mt-2 text-gray-600">Please select a plan from our pricing page.</p>
            <LoadingLink
              href="/pricing"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold text-white shadow-md hover:bg-orange-600"
            >
              View Plans
            </LoadingLink>
          </div>
        </div>
      </main>
    );
  }

  // Success state
  if (step === "success") {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
        <div className="w-full max-w-md text-center">
          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8 text-green-600">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h1 className="mt-4 text-2xl font-bold text-gray-900">Payment Successful!</h1>
            <p className="mt-2 text-gray-600">
              Welcome to Veridict {plan.name}! Your subscription is now active.
            </p>
            {transactionId && (
              <p className="mt-2 text-xs text-gray-400">
                Transaction ID: {transactionId}
              </p>
            )}
            <div className="mt-6 space-y-3">
              <LoadingLink
                href="/detector"
                className="block w-full rounded-full bg-orange-500 py-3 text-center text-sm font-semibold text-white shadow-md hover:bg-orange-600"
              >
                Start Using Veridict
              </LoadingLink>
              <LoadingLink
                href="/dashboard"
                className="block w-full rounded-full border border-gray-200 bg-white py-3 text-center text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Go to Dashboard
              </LoadingLink>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Error state
  if (step === "error") {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
        <div className="w-full max-w-md text-center">
          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8 text-red-600">
                <path d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <h1 className="mt-4 text-2xl font-bold text-gray-900">Payment Failed</h1>
            <p className="mt-2 text-gray-600">{errorMessage || "Something went wrong with your payment."}</p>
            <div className="mt-6 space-y-3">
              <button
                onClick={() => {
                  setStep("payment");
                  setErrorMessage(null);
                }}
                className="block w-full rounded-full bg-orange-500 py-3 text-center text-sm font-semibold text-white shadow-md hover:bg-orange-600"
              >
                Try Again
              </button>
              <LoadingLink
                href="/pricing"
                className="block w-full rounded-full border border-gray-200 bg-white py-3 text-center text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Back to Pricing
              </LoadingLink>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Processing state
  if (step === "processing") {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 rounded-full border-4 border-gray-200 border-t-orange-500 animate-spin" />
          <p className="mt-6 text-lg font-semibold text-gray-900">Processing your payment...</p>
          <p className="mt-2 text-gray-600">Please don&apos;t close this page.</p>
        </div>
      </main>
    );
  }

  // Payment form
  return (
    <main className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-500">
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-white">
                <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
              </svg>
            </div>
            <span className="text-xl font-bold text-gray-900">Veridict</span>
          </Link>
        </div>

        <div className="grid gap-8 lg:grid-cols-5">
          {/* Order Summary */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900">Order Summary</h2>

              <div className="mt-4 rounded-xl bg-gray-50 p-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">{plan.name} Plan</span>
                  <span className="text-lg font-bold text-gray-900">${plan.priceUSD}/mo</span>
                </div>
                <p className="mt-1 text-sm text-gray-500">Monthly subscription</p>
              </div>

              <ul className="mt-4 space-y-2">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-gray-600">
                    <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 flex-shrink-0 text-green-500 mt-0.5">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="mt-6 border-t border-gray-200 pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium text-gray-900">${plan.priceUSD}</span>
                </div>
                <div className="mt-2 flex items-center justify-between text-lg font-bold">
                  <span className="text-gray-900">Total</span>
                  <span className="text-orange-600">${plan.priceUSD} USD</span>
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  Billed monthly. Cancel anytime.
                </p>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-400">
              <div className="flex items-center gap-1">
                <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                Secure payment
              </div>
              <div className="flex items-center gap-1">
                <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Cancel anytime
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <div className="lg:col-span-3">
            <form onSubmit={handleSubmit} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900">Payment Details</h2>
              <p className="mt-1 text-sm text-gray-500">
                Enter your card information to complete the subscription.
              </p>

              <div className="mt-6 space-y-4">
                {/* Card Number */}
                <div>
                  <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700">
                    Card Number
                  </label>
                  <div className="relative mt-1">
                    <input
                      type="text"
                      id="cardNumber"
                      value={formatCardNumber(cardForm.number)}
                      onChange={(e) => setCardForm({ ...cardForm, number: e.target.value.replace(/\D/g, "").slice(0, 16) })}
                      placeholder="4242 4242 4242 4242"
                      className={`w-full rounded-lg border ${errors.number ? "border-red-300" : "border-gray-200"} bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-100`}
                      maxLength={19}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <span className="text-xs font-medium text-gray-400">
                        {getCardBrand(cardForm.number)}
                      </span>
                    </div>
                  </div>
                  {errors.number && <p className="mt-1 text-sm text-red-600">{errors.number}</p>}
                </div>

                {/* Expiry and CVC */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="expMonth" className="block text-sm font-medium text-gray-700">
                      Month
                    </label>
                    <input
                      type="text"
                      id="expMonth"
                      value={cardForm.expMonth}
                      onChange={(e) => setCardForm({ ...cardForm, expMonth: e.target.value.replace(/\D/g, "").slice(0, 2) })}
                      placeholder="MM"
                      className={`mt-1 w-full rounded-lg border ${errors.expMonth ? "border-red-300" : "border-gray-200"} bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-100`}
                      maxLength={2}
                    />
                    {errors.expMonth && <p className="mt-1 text-sm text-red-600">{errors.expMonth}</p>}
                  </div>
                  <div>
                    <label htmlFor="expYear" className="block text-sm font-medium text-gray-700">
                      Year
                    </label>
                    <input
                      type="text"
                      id="expYear"
                      value={cardForm.expYear}
                      onChange={(e) => setCardForm({ ...cardForm, expYear: e.target.value.replace(/\D/g, "").slice(0, 2) })}
                      placeholder="YY"
                      className={`mt-1 w-full rounded-lg border ${errors.expYear ? "border-red-300" : "border-gray-200"} bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-100`}
                      maxLength={2}
                    />
                    {errors.expYear && <p className="mt-1 text-sm text-red-600">{errors.expYear}</p>}
                  </div>
                  <div>
                    <label htmlFor="cvc" className="block text-sm font-medium text-gray-700">
                      CVC
                    </label>
                    <input
                      type="text"
                      id="cvc"
                      value={cardForm.cvc}
                      onChange={(e) => setCardForm({ ...cardForm, cvc: e.target.value.replace(/\D/g, "").slice(0, 4) })}
                      placeholder="123"
                      className={`mt-1 w-full rounded-lg border ${errors.cvc ? "border-red-300" : "border-gray-200"} bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-100`}
                      maxLength={4}
                    />
                    {errors.cvc && <p className="mt-1 text-sm text-red-600">{errors.cvc}</p>}
                  </div>
                </div>

                {/* Cardholder Name */}
                <div>
                  <label htmlFor="cardHolder" className="block text-sm font-medium text-gray-700">
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    id="cardHolder"
                    value={cardForm.cardHolder}
                    onChange={(e) => setCardForm({ ...cardForm, cardHolder: e.target.value })}
                    placeholder="JOHN DOE"
                    className={`mt-1 w-full rounded-lg border ${errors.cardHolder ? "border-red-300" : "border-gray-200"} bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-100 uppercase`}
                  />
                  {errors.cardHolder && <p className="mt-1 text-sm text-red-600">{errors.cardHolder}</p>}
                </div>

                {/* Terms */}
                <div className="rounded-lg bg-gray-50 p-4">
                  <label className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={acceptedTerms}
                      onChange={(e) => setAcceptedTerms(e.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                    />
                    <span className="text-sm text-gray-600">
                      I accept the{" "}
                      <a
                        href={termsPermalink || "/terms-of-service"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-orange-600 hover:text-orange-500 underline"
                      >
                        terms and conditions
                      </a>{" "}
                      and authorize Veridict to charge my card ${plan.priceUSD} USD monthly until I cancel.
                    </span>
                  </label>
                  {errors.terms && <p className="mt-2 text-sm text-red-600">{errors.terms}</p>}
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="mt-6 w-full rounded-full bg-orange-500 py-4 text-sm font-semibold text-white shadow-md transition-all hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Processing...
                  </span>
                ) : (
                  `Subscribe for $${plan.priceUSD}/month`
                )}
              </button>

              <p className="mt-4 text-center text-xs text-gray-500">
                Powered by{" "}
                <a href="https://wompi.co" target="_blank" rel="noopener noreferrer" className="font-medium text-gray-600 hover:text-gray-900">
                  Wompi
                </a>
                {" "}· Secure payment processing
              </p>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
