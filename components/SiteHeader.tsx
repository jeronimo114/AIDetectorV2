"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export default function SiteHeader() {
  const [user, setUser] = useState<User | null>(null);
  const [isReady, setIsReady] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();

  useEffect(() => {
    let isMounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!isMounted) {
        return;
      }
      setUser(data.session?.user ?? null);
      setIsReady(true);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!isMounted) {
          return;
        }
        setUser(session?.user ?? null);
      }
    );

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const linkBase =
    "text-xs uppercase tracking-[0.3em] transition hover:text-[#1f1f1c]";
  const active = "text-[#1f1f1c]";
  const inactive = "text-[#7a7670]";

  return (
    <header className="sticky top-0 z-20 border-b border-[#d8d6cf]/80 bg-[#f7f7f4]/85 backdrop-blur">
      <div className="mx-auto flex w-full max-w-[960px] items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="text-xs font-semibold uppercase tracking-[0.35em] text-[#1f1f1c]"
        >
          Veridict
        </Link>
        <nav className="flex items-center gap-6">
          <Link
            href="/pricing"
            className={`${linkBase} ${pathname === "/pricing" ? active : inactive}`}
          >
            Pricing
          </Link>
          {isReady && user ? (
            <>
              <Link
                href="/dashboard"
                className={`${linkBase} ${
                  pathname === "/dashboard" ? active : inactive
                }`}
              >
                Dashboard
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className={`${linkBase} ${inactive}`}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className={`${linkBase} ${pathname === "/login" ? active : inactive}`}
              >
                Login
              </Link>
              <Link
                href="/signup"
                className={`${linkBase} ${pathname === "/signup" ? active : inactive}`}
              >
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
