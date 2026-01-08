// Wompi API Types

export type PlanId = "starter" | "pro";

export interface Plan {
  id: PlanId;
  name: string;
  priceUSD: number;
  priceCOP: number;
  features: string[];
  analysesPerMonth: number;
  maxChars: number;
}

export const PLANS: Record<PlanId, Plan> = {
  starter: {
    id: "starter",
    name: "Starter",
    priceUSD: 4,
    priceCOP: 16000, // ~4 USD in COP
    features: [
      "100 analyses per month",
      "Up to 6,000 characters",
      "Edit and recheck workflow",
      "What changed panel",
      "Signal breakdown",
      "Full history"
    ],
    analysesPerMonth: 100,
    maxChars: 6000
  },
  pro: {
    id: "pro",
    name: "Pro",
    priceUSD: 12,
    priceCOP: 48000, // ~12 USD in COP
    features: [
      "500 analyses per month",
      "Up to 12,000 characters",
      "Unlimited edit chains",
      "Comparison history",
      "Exports (PDF / CSV)",
      "Priority processing"
    ],
    analysesPerMonth: 500,
    maxChars: 12000
  }
};

// Card tokenization request
export interface TokenizeCardRequest {
  number: string;
  exp_month: string;
  exp_year: string;
  cvc: string;
  card_holder: string;
}

// Card token response
export interface CardToken {
  id: string;
  created_at: string;
  brand: string;
  name: string;
  last_four: string;
  bin: string;
  exp_year: string;
  exp_month: string;
  card_holder: string;
  expires_at: string;
}

export interface TokenizeCardResponse {
  status: "CREATED" | "ERROR";
  data?: CardToken;
  error?: {
    type: string;
    reason: string;
    messages?: Record<string, string[]>;
  };
}

// Payment source (for recurring payments)
export interface CreatePaymentSourceRequest {
  type: "CARD";
  token: string;
  customer_email: string;
  acceptance_token: string;
}

export interface PaymentSource {
  id: number;
  public_data: {
    type: string;
    token: string;
    bin: string;
    last_four: string;
    exp_month: string;
    exp_year: string;
    card_holder: string;
    validity_ends_at: string;
  };
  type: string;
  status: string;
}

export interface CreatePaymentSourceResponse {
  data: PaymentSource;
}

// Transaction
export interface CreateTransactionRequest {
  amount_in_cents: number;
  currency: "COP" | "USD";
  customer_email: string;
  reference: string;
  payment_source_id: number;
  payment_method?: {
    installments: number;
  };
  recurrent?: boolean;
  signature?: string;
}

export type TransactionStatus =
  | "PENDING"
  | "APPROVED"
  | "DECLINED"
  | "VOIDED"
  | "ERROR";

export interface Transaction {
  id: string;
  created_at: string;
  amount_in_cents: number;
  reference: string;
  customer_email: string;
  currency: string;
  payment_method_type: string;
  payment_method: {
    type: string;
    extra: {
      bin: string;
      name: string;
      brand: string;
      exp_year: string;
      exp_month: string;
      last_four: string;
      card_holder: string;
    };
    installments: number;
  };
  status: TransactionStatus;
  status_message: string | null;
  merchant: {
    id: number;
    name: string;
    legal_name: string;
    contact_name: string;
    phone_number: string;
    logo_url: string | null;
    legal_id_type: string;
    email: string;
    legal_id: string;
  };
  taxes: unknown[];
  redirect_url: string | null;
  payment_source_id: number;
  payment_link_id: string | null;
  finalized_at: string | null;
}

export interface TransactionResponse {
  data: Transaction;
}

// Acceptance token (terms and conditions)
export interface AcceptanceToken {
  acceptance_token: string;
  permalink: string;
  type: string;
}

export interface MerchantResponse {
  data: {
    id: number;
    name: string;
    legal_name: string;
    contact_name: string;
    phone_number: string;
    logo_url: string | null;
    email: string;
    legal_id: string;
    legal_id_type: string;
    public_key: string;
    accepted_currencies: string[];
    fraud_javascript_key: string | null;
    fraud_groups: unknown[];
    accepted_payment_methods: string[];
    payment_methods: unknown[];
    presigned_acceptance: AcceptanceToken;
  };
}

// Webhook event
export interface WompiWebhookEvent {
  event: string;
  data: {
    transaction: Transaction;
  };
  sent_at: string;
  timestamp: number;
  signature: {
    checksum: string;
    properties: string[];
  };
  environment: "test" | "prod";
}

// Subscription in our database
export interface Subscription {
  id: string;
  user_id: string;
  plan_id: PlanId;
  status: "active" | "cancelled" | "past_due" | "expired";
  payment_source_id: number;
  customer_email: string;
  amount_cents: number;
  currency: string;
  current_period_start: string;
  current_period_end: string;
  cancelled_at: string | null;
  created_at: string;
  updated_at: string;
}

// Payment in our database
export interface Payment {
  id: string;
  user_id: string;
  subscription_id: string;
  wompi_transaction_id: string;
  reference: string;
  amount_cents: number;
  currency: string;
  status: TransactionStatus;
  payment_method_type: string | null;
  card_last_four: string | null;
  card_brand: string | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}
