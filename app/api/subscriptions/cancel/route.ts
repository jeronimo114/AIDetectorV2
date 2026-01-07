import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { cancelSubscription } from "@/lib/wompi/subscriptions";

export async function POST() {
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

    // Cancel subscription
    const subscription = await cancelSubscription(user.id);

    return NextResponse.json({
      success: true,
      subscription,
      message: "Subscription cancelled successfully"
    });
  } catch (error) {
    console.error("Subscription cancellation error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "An unexpected error occurred";

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
