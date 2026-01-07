import { Suspense } from "react";

import LoginForm from "@/app/login/LoginForm";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="relative min-h-screen bg-gray-50">
          <div className="mx-auto flex min-h-screen w-full max-w-[480px] flex-col px-6 pb-16 pt-16">
            <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
              <div className="flex items-center justify-center py-12">
                <span className="h-6 w-6 animate-spin rounded-full border-2 border-gray-200 border-t-orange-500" />
              </div>
            </div>
          </div>
        </main>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
