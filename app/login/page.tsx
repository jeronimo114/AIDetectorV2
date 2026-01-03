import { Suspense } from "react";

import LoginForm from "@/app/login/LoginForm";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="relative min-h-screen overflow-hidden bg-[#f8f7f1]">
          <div className="relative mx-auto flex min-h-screen w-full max-w-[560px] flex-col px-6 pb-16 pt-16">
            <div className="rounded-3xl border border-[#d6d2c6] bg-white/80 p-8 text-sm text-[#6a6459]">
              Loading…
            </div>
          </div>
        </main>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
