"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState, type FormEvent } from "react";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectedFrom = searchParams.get("redirectedFrom");
  const supabase = getSupabaseBrowserClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOAuthLoading, setIsOAuthLoading] = useState(false);

  const safeRedirect =
    redirectedFrom && redirectedFrom.startsWith("/") && !redirectedFrom.startsWith("//")
      ? redirectedFrom
      : "/dashboard";

  // Check if user is coming from checkout (paid plan flow)
  const isCheckoutFlow = redirectedFrom?.includes("/checkout");
  const planFromUrl = redirectedFrom?.match(/plan=(\w+)/)?.[1];

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === "SIGNED_IN" || event === "INITIAL_SESSION") && session) {
        router.push(safeRedirect);
        router.refresh();
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
    setNotice(null);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password
    });

    if (signUpError) {
      setError(signUpError.message);
      setIsLoading(false);
      return;
    }

    if (data.session) {
      router.push(safeRedirect);
      router.refresh();
      return;
    }

    setNotice(
      "Check your email to confirm your account, then log in to view your dashboard."
    );
    setIsLoading(false);
  };

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
              {isCheckoutFlow ? "Create your account" : "Create your account"}
            </h1>
            <p className="mt-2 text-gray-600">
              {isCheckoutFlow && planFromUrl ? (
                <>
                  Sign up to continue with{" "}
                  <span className="font-semibold text-orange-600 capitalize">{planFromUrl}</span> plan
                </>
              ) : (
                "Start checking your writing for free"
              )}
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
                  <p className="text-xs text-gray-600">You&apos;ll complete payment after signing up</p>
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 space-y-4">
            <button
              type="button"
              onClick={async () => {
                setError(null);
                setNotice(null);
                setIsOAuthLoading(true);

                const redirectUrl = new URL("/signup", window.location.origin);
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
              }}
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
                placeholder="Create a password"
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
            {notice && (
              <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                {notice}
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
                  Creating account...
                </>
              ) : (
                "Sign up"
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link
              href={redirectedFrom ? `/login?redirectedFrom=${encodeURIComponent(redirectedFrom)}` : "/login"}
              className="font-semibold text-orange-600 hover:text-orange-500"
            >
              Log in
            </Link>
          </p>
        </div>

        {/* Testimonials */}
        <div className="mt-8 space-y-4">
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <svg key={i} viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-yellow-400">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <p className="mt-3 text-sm text-gray-700">
              "The signals list is clear. I can see what to fix without guessing."
            </p>
            <p className="mt-2 text-xs text-gray-500">
              Jordan K. · Graduate student, US
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <svg key={i} viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-yellow-400">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <p className="mt-3 text-sm text-gray-700">
              "It is calm and direct. I can check a draft before I submit it."
            </p>
            <p className="mt-2 text-xs text-gray-500">
              Elena P. · Masters student, EU
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function SignupPage() {
  return (
    <Suspense>
      <SignupForm />
    </Suspense>
  );
}
