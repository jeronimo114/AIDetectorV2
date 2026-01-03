"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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
      router.push("/dashboard");
      router.refresh();
      return;
    }

    setNotice(
      "Check your email to confirm your account, then log in to view your dashboard."
    );
    setIsLoading(false);
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f8f7f1]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-16 right-10 h-64 w-64 rounded-full bg-[#e6e2f2] opacity-50 blur-3xl" />
        <div className="absolute bottom-10 left-8 h-64 w-64 rounded-full bg-[#e5edd8] opacity-60 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-[560px] flex-col px-6 pb-16 pt-16">
        <div className="rounded-3xl border border-[#d6d2c6] bg-white/80 p-8 shadow-[0_18px_60px_rgba(27,24,19,0.08)] backdrop-blur">
          <p className="text-xs uppercase tracking-[0.3em] text-[#7b756a]">
            New session
          </p>
          <h1 className="mt-4 text-3xl font-semibold text-[#1f1d18]">
            Create account
          </h1>
          <p className="mt-2 text-sm text-[#4f4a40]">
            Save and review your detector history.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <label className="block text-sm text-[#4f4a40]">
              Email
              <input
                type="email"
                className="mt-2 w-full rounded-2xl border border-[#d6d2c6] bg-white/90 px-4 py-3 text-base text-[#1f1d18] focus:border-[#a8b09a] focus:outline-none focus:ring-4 focus:ring-[#dfe4d3]"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </label>
            <label className="block text-sm text-[#4f4a40]">
              Password
              <input
                type="password"
                className="mt-2 w-full rounded-2xl border border-[#d6d2c6] bg-white/90 px-4 py-3 text-base text-[#1f1d18] focus:border-[#a8b09a] focus:outline-none focus:ring-4 focus:ring-[#dfe4d3]"
                placeholder="Create a password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </label>

            {error && (
              <div className="rounded-2xl border border-[#e3c5b9] bg-[#f7e8e4] px-4 py-3 text-sm text-[#5a1e14]">
                {error}
              </div>
            )}
            {notice && (
              <div className="rounded-2xl border border-[#e0d6bf] bg-[#efe9d9] px-4 py-3 text-sm text-[#6a5b3f]">
                {notice}
              </div>
            )}

            <button
              type="submit"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#1f2a1f] px-6 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-[#f6f5ef] transition hover:bg-[#2b3a2b] disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? "Creating..." : "Sign up"}
            </button>
          </form>

          <p className="mt-6 text-sm text-[#6a6459]">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-[#1f1d18]">
              Log in
            </Link>
            .
          </p>
        </div>
      </div>
    </main>
  );
}
