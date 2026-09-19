"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Something went wrong");
      return;
    }

    router.push(searchParams.get("next") ?? "/pipeline");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f9f9f7] px-4 dark:bg-[#0d0d0d]">
      <div className="w-full max-w-sm rounded-xl border border-black/10 bg-[#fcfcfb] p-8 shadow-sm dark:border-white/10 dark:bg-[#1a1a19]">
        <h1 className="text-xl font-semibold text-[#0b0b0b] dark:text-white">
          Revlik
        </h1>
        <p className="mt-1 text-sm text-[#52514e] dark:text-[#c3c2b7]">
          Sign in to your pipeline
        </p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3">
          <input
            type="password"
            autoFocus
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm text-[#0b0b0b] outline-none focus:border-[#2a78d6] dark:border-white/10 dark:text-white"
          />
          {error && (
            <p className="text-sm text-[#d03b3b]" role="alert">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading || !password}
            className="mt-1 rounded-lg bg-[#2a78d6] px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-[#1c5cab] disabled:opacity-50"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
