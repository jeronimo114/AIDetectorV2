"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectedFrom = searchParams.get("redirectedFrom");
  const safeRedirect =
    redirectedFrom && redirectedFrom.startsWith("/") && !redirectedFrom.startsWith("//")
      ? redirectedFrom
      : "/dashboard";
  const supabase = getSupabaseBrowserClient();

  // Check if returning from OAuth (has code or access_token in URL hash/params)
  const hasAuthCode = searchParams.get("code") !== null;
  const hasHashToken = typeof window !== "undefined" && window.location.hash.includes("access_token");
  const isReturningFromOAuth = hasAuthCode || hasHashToken;

  // Check if user is coming from checkout (paid plan flow)
  const isCheckoutFlow = redirectedFrom?.includes("/checkout");
  const planFromUrl = redirectedFrom?.match(/plan=(\w+)/)?.[1];

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOAuthLoading, setIsOAuthLoading] = useState(false);
  const [isProcessingOAuth, setIsProcessingOAuth] = useState(isReturningFromOAuth);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === "SIGNED_IN" || event === "INITIAL_SESSION") && session) {
        router.push(safeRedirect);
        router.refresh();
      }
    });

    // Check for existing session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.push(safeRedirect);
        router.refresh();
      } else {
        // No session and not returning from OAuth, show the form
        setIsProcessingOAuth(false);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router, safeRedirect, supabase]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (signInError) {
      setError(signInError.message);
      setIsLoading(false);
      return;
    }

    router.push(safeRedirect);
    router.refresh();
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsOAuthLoading(true);

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
    const redirectUrl = new URL("/login", siteUrl);
    redirectUrl.searchParams.set("redirectedFrom", safeRedirect);

    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirectUrl.toString()
      }
    });

    if (oauthError) {
      setError(oauthError.message);
      setIsOAuthLoading(false);
    }
  };

  // Show loading screen while processing OAuth callback
  if (isProcessingOAuth) {
    return (
      <main className="relative min-h-screen bg-gray-50">
        <div className="mx-auto flex min-h-screen w-full max-w-[480px] flex-col items-center justify-center px-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50">
              <span className="h-6 w-6 animate-spin rounded-full border-2 border-orange-200 border-t-orange-500" />
            </div>
            <h1 className="mt-4 text-xl font-bold text-gray-900">
              Signing you in...
            </h1>
            <p className="mt-2 text-gray-600">
              Please wait while we complete your sign in.
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen bg-gray-50">
      <div className="mx-auto flex min-h-screen w-full max-w-[480px] flex-col px-6 pb-16 pt-16">
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50">
              <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6 text-orange-500">
                <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
              </svg>
            </div>
            <h1 className="mt-4 text-2xl font-bold text-gray-900">
              Welcome back
            </h1>
            <p className="mt-2 text-gray-600">
              Sign in to access your dashboard
            </p>
          </div>

          {/* Plan indicator for checkout flow */}
          {isCheckoutFlow && planFromUrl && (
            <div className="mt-4 rounded-xl border border-orange-200 bg-orange-50 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
                  <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 text-orange-600">
                    <path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 capitalize">{planFromUrl} Plan Selected</p>
                  <p className="text-xs text-gray-600">Log in to complete your purchase</p>
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 space-y-4">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="inline-flex w-full items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isOAuthLoading || isLoading}
              aria-busy={isOAuthLoading}
            >
              {isOAuthLoading ? (
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
              ) : (
                <svg viewBox="0 0 24 24" className="h-5 w-5">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
              )}
              Continue with Google
            </button>

            <div className="flex items-center gap-3">
              <span className="h-px flex-1 bg-gray-200" />
              <span className="text-sm text-gray-500">or</span>
              <span className="h-px flex-1 bg-gray-200" />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-100"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-100"
                placeholder="Your password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isLoading || isOAuthLoading}
              aria-busy={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Signing in...
                </>
              ) : (
                "Log in"
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            New here?{" "}
            <Link
              href={redirectedFrom ? `/signup?redirectedFrom=${encodeURIComponent(redirectedFrom)}` : "/signup"}
              className="font-semibold text-orange-600 hover:text-orange-500"
            >
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
