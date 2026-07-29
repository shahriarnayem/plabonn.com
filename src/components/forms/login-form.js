"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Icon } from "@/components/icon";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const data = new FormData(event.currentTarget);

    try {
      const result = await authClient.signIn.email({
        email: String(data.get("email") || "").trim().toLowerCase(),
        password: String(data.get("password") || ""),
        rememberMe: true,
      });

      if (result.error) {
        setError(result.error.message || "The email or password is incorrect.");
        return;
      }

      router.replace(callbackUrl);
      router.refresh();
    } catch (requestError) {
      setError(
        requestError?.message ||
          "The login request could not reach the authentication server.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit}>
      <label className="grid gap-1.5">
        <span className="text-xs font-semibold uppercase text-[var(--text-soft)]">
          Email address
        </span>
        <input
          className="w-full rounded-[8px] bg-[var(--card-soft)] px-3 py-2.5 text-sm text-[var(--text)] outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
          type="email"
          name="email"
          autoComplete="email"
          required
          autoFocus
        />
      </label>
      <label className="grid gap-1.5">
        <span className="text-xs font-semibold uppercase text-[var(--text-soft)]">
          Password
        </span>
        <input
          className="w-full rounded-[8px] bg-[var(--card-soft)] px-3 py-2.5 text-sm text-[var(--text)] outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
          type="password"
          name="password"
          autoComplete="current-password"
          required
          minLength="8"
        />
      </label>
      <button
        className="inline-flex min-h-[46px] cursor-pointer items-center justify-center gap-2.5 rounded-[7px] bg-[var(--accent)] px-5 py-2 text-xs font-bold uppercase tracking-[0.015em] text-white transition-colors duration-150 hover:bg-[var(--accent-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-55"
        type="submit"
        disabled={loading}
      >
        {loading ? "Signing in…" : "Sign in"}
        <Icon name="arrow" size={16} />
      </button>
      {error ? (
        <p
          className="rounded-[8px] bg-[var(--card-soft)] px-3.5 py-3 text-xs text-[var(--danger)]"
          role="alert"
        >
          {error}
        </p>
      ) : null}
    </form>
  );
}
