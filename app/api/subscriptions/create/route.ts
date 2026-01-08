import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSubscription } from "@/lib/wompi/subscriptions";
import { PLANS, type PlanId } from "@/lib/wompi/types";

export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient();

    // Get current user
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { planId, cardToken, acceptanceToken } = body;

    // Validate plan
    if (!planId || !["starter", "pro"].includes(planId)) {
      return NextResponse.json(
        { error: "Invalid plan selected" },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!cardToken) {
      return NextResponse.json(
        { error: "Card token is required" },
        { status: 400 }
      );
    }

    if (!acceptanceToken) {
      return NextResponse.json(
        { error: "Terms acceptance is required" },
        { status: 400 }
      );
    }

    // Get plan details
    const plan = PLANS[planId as PlanId];
    if (!plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 400 });
    }

    // Determine currency based on environment
    // Wompi sandbox only supports COP, production can use USD
    // Note: amount_in_cents means centavos for COP (multiply by 100)
    const isProduction = process.env.NEXT_PUBLIC_WOMPI_ENV === "production";
    const currency = isProduction ? "USD" : "COP";
    const amountCents = isProduction ? plan.priceUSD * 100 : plan.priceCOP * 100;

    // Create subscription
    const result = await createSubscription({
      userId: user.id,
      planId: planId as PlanId,
      cardToken,
      customerEmail: user.email || "",
      acceptanceToken,
      amountCents,
      currency
    });

    // Check if transaction was approved
    if (result.transaction.status === "APPROVED") {
      return NextResponse.json({
        success: true,
        subscription: result.subscription,
        transaction: result.transaction,
        message: "Subscription created successfully"
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: "Payment was not approved",
          status: result.transaction.status
        },
        { status: 402 }
      );
    }
  } catch (error) {
    console.error("Subscription creation error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "An unexpected error occurred";

    // Handle specific error cases
    if (errorMessage.includes("already has an active subscription")) {
      return NextResponse.json(
        { error: "You already have an active subscription" },
        { status: 409 }
      );
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
