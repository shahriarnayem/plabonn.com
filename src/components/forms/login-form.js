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
    <form className="login-form" onSubmit={handleSubmit}>
      <label><span>Email address</span><input type="email" name="email" autoComplete="email" required autoFocus /></label>
      <label><span>Password</span><input type="password" name="password" autoComplete="current-password" required minLength="8" /></label>
      <button className="button button-primary button-large" type="submit" disabled={loading}>{loading ? "Signing in…" : "Sign in"}<Icon name="arrow" size={16} /></button>
      {error ? <p className="form-status error" role="alert">{error}</p> : null}
    </form>
  );
}
