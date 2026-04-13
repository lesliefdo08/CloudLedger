"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: formData.get("email"),
        password: formData.get("password"),
      }),
    });

    setLoading(false);

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      setError(payload?.error || "Login failed.");
      return;
    }

    router.push("/students");
    router.refresh();
  };

  return (
    <main className="page-wrap centered">
      <form className="card form-grid login-card" onSubmit={handleSubmit}>
        <h1>CloudLedger Login</h1>
        <p className="muted-text">Use your admin account to continue.</p>
        {error ? <p className="error-text">{error}</p> : null}
        <input name="email" type="email" placeholder="Email" required />
        <input name="password" type="password" placeholder="Password" required />
        <button type="submit" className="button" disabled={loading}>
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>
    </main>
  );
}
