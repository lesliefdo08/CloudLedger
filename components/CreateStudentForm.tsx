"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateStudentForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    const form = event.currentTarget;
    const formData = new FormData(form);

    const response = await fetch("/api/students", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName: formData.get("firstName"),
        lastName: formData.get("lastName"),
        email: formData.get("email"),
        department: formData.get("department"),
      }),
    });

    setLoading(false);

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      setError(payload?.error || "Failed to create student.");
      return;
    }

    form.reset();
    router.refresh();
  };

  return (
    <form className="card form-grid" onSubmit={handleSubmit}>
      <h2>Create Student</h2>
      {error ? <p className="error-text">{error}</p> : null}
      <input name="firstName" placeholder="First name" required />
      <input name="lastName" placeholder="Last name" required />
      <input name="email" placeholder="Email (optional)" type="email" />
      <input name="department" placeholder="Department (optional)" />
      <button type="submit" className="button" disabled={loading}>
        {loading ? "Creating..." : "Create Student"}
      </button>
    </form>
  );
}
