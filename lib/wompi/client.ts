import crypto from "crypto";
import type {
  TokenizeCardRequest,
  TokenizeCardResponse,
  CreatePaymentSourceRequest,
  CreatePaymentSourceResponse,
  CreateTransactionRequest,
  TransactionResponse,
  MerchantResponse
} from "./types";

const WOMPI_ENV = process.env.NEXT_PUBLIC_WOMPI_ENV || "sandbox";
const BASE_URL =
  WOMPI_ENV === "production"
    ? "https://production.wompi.co/v1"
    : "https://sandbox.wompi.co/v1";

const PUBLIC_KEY = process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY || "";
const PRIVATE_KEY = process.env.WOMPI_PRIVATE_KEY || "";
const INTEGRITY_SECRET = process.env.WOMPI_INTEGRITY_SECRET || "";
const EVENTS_SECRET = process.env.WOMPI_EVENTS_SECRET || "";

/**
 * Get merchant info including acceptance token for terms
 */
export async function getMerchantInfo(): Promise<MerchantResponse> {
  const response = await fetch(`${BASE_URL}/merchants/${PUBLIC_KEY}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json"
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.reason || "Failed to get merchant info");
  }

  return response.json();
}

/**
 * Tokenize a credit card (client-side safe - uses public key)
 */
export async function tokenizeCard(
  cardData: TokenizeCardRequest
): Promise<TokenizeCardResponse> {
  const response = await fetch(`${BASE_URL}/tokens/cards`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${PUBLIC_KEY}`
    },
    body: JSON.stringify(cardData)
  });

  const data = await response.json();
  return data;
}

/**
 * Create a payment source from a card token (server-side only - uses private key)
 */
export async function createPaymentSource(
  request: CreatePaymentSourceRequest
): Promise<CreatePaymentSourceResponse> {
  const response = await fetch(`${BASE_URL}/payment_sources`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${PRIVATE_KEY}`
    },
    body: JSON.stringify(request)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.reason || "Failed to create payment source");
  }

  return response.json();
}

/**
 * Create a transaction (charge a payment source)
 */
export async function createTransaction(
  request: CreateTransactionRequest
): Promise<TransactionResponse> {
  const response = await fetch(`${BASE_URL}/transactions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${PRIVATE_KEY}`
    },
    body: JSON.stringify(request)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.reason || "Failed to create transaction");
  }

  return response.json();
}

/**
 * Get transaction by ID
 */
export async function getTransaction(
  transactionId: string
): Promise<TransactionResponse> {
  const response = await fetch(`${BASE_URL}/transactions/${transactionId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${PRIVATE_KEY}`
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.reason || "Failed to get transaction");
  }

  return response.json();
}

/**
 * Generate integrity signature for a transaction
 * Format: reference + amount_in_cents + currency + integrity_secret
 */
export function generateIntegritySignature(
  reference: string,
  amountInCents: number,
  currency: string
): string {
  const data = `${reference}${amountInCents}${currency}${INTEGRITY_SECRET}`;
  return crypto.createHash("sha256").update(data).digest("hex");
}

/**
 * Verify webhook signature
 */
export function verifyWebhookSignature(
  checksum: string,
  properties: string[],
  eventData: Record<string, unknown>
): boolean {
  // Build the string to hash from the properties in order
  const values = properties.map((prop) => {
    const keys = prop.split(".");
    let value: unknown = eventData;
    for (const key of keys) {
      value = (value as Record<string, unknown>)?.[key];
    }
    return String(value);
  });

  const dataString = values.join("") + EVENTS_SECRET;
  const calculatedChecksum = crypto
    .createHash("sha256")
    .update(dataString)
    .digest("hex");

  return calculatedChecksum === checksum;
}

/**
 * Generate a unique reference for a transaction
 */
export function generateReference(
  userId: string,
  planId: string
): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `veridict-${planId}-${userId.substring(0, 8)}-${timestamp}-${random}`;
}

/**
 * Get the base URL for Wompi
 */
export function getWompiBaseUrl(): string {
  return BASE_URL;
}

/**
 * Get the public key (for client-side use)
 */
export function getPublicKey(): string {
  return PUBLIC_KEY;
}
