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
    <main className="relative min-h-screen overflow-hidden bg-[#f7f7f4]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-16 right-10 h-64 w-64 rounded-full bg-[#e9eef2] opacity-50 blur-3xl" />
        <div className="absolute bottom-10 left-8 h-64 w-64 rounded-full bg-[#e6ecf1] opacity-60 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-[560px] flex-col px-6 pb-16 pt-16">
        <div className="rounded-3xl border border-[#d8d6cf] bg-white/85 p-8 shadow-[0_18px_60px_rgba(27,24,19,0.08)] backdrop-blur">
          <p className="text-xs uppercase tracking-[0.3em] text-[#7a7670]">
            New session
          </p>
          <h1 className="mt-4 text-3xl font-semibold text-[#1f1f1c]">
            Create account
          </h1>
          <p className="mt-2 text-sm text-[#4c4b45]">
            Save and review your run history.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <label className="block text-sm text-[#4c4b45]">
              Email
              <input
                type="email"
                className="mt-2 w-full rounded-2xl border border-[#d8d6cf] bg-white/90 px-4 py-3 text-base text-[#1f1f1c] focus:border-[#8fa3b5] focus:outline-none focus:ring-4 focus:ring-[#d7e1ea]"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </label>
            <label className="block text-sm text-[#4c4b45]">
              Password
              <input
                type="password"
                className="mt-2 w-full rounded-2xl border border-[#d8d6cf] bg-white/90 px-4 py-3 text-base text-[#1f1f1c] focus:border-[#8fa3b5] focus:outline-none focus:ring-4 focus:ring-[#d7e1ea]"
                placeholder="Create a password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </label>

            {error && (
              <div className="rounded-2xl border border-[#e2ccc2] bg-[#f0e4de] px-4 py-3 text-sm text-[#6a4033]">
                {error}
              </div>
            )}
            {notice && (
              <div className="rounded-2xl border border-[#d8dde2] bg-[#eef1f3] px-4 py-3 text-sm text-[#4a5560]">
                {notice}
              </div>
            )}

            <button
              type="submit"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#2f3e4e] px-6 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-[#f7f7f4] transition hover:bg-[#3b4d60] disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? "Creating..." : "Sign up"}
            </button>
          </form>

          <p className="mt-6 text-sm text-[#7a7670]">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-[#1f1f1c]">
              Log in
            </Link>
            .
          </p>
        </div>
      </div>
    </main>
  );
}
