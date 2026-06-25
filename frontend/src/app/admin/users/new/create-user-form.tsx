"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./new-user.module.css";

export function CreateUserForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"EDITOR" | "ADMIN">("EDITOR");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to create user");

      router.push("/admin/users");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.field}>
        <label className={styles.label}>Full Name</label>
        <input
          type="text"
          className={styles.input}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ramesh Shrestha"
          required
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Email</label>
        <input
          type="email"
          className={styles.input}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="ramesh@example.com"
          required
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Password (min 8 chars)</label>
        <input
          type="password"
          className={styles.input}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={8}
          placeholder="••••••••"
          required
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Role</label>
        <select
          className={styles.input}
          value={role}
          onChange={(e) => setRole(e.target.value as "EDITOR" | "ADMIN")}
        >
          <option value="EDITOR">Editor (content creator)</option>
          <option value="ADMIN">Admin (full access)</option>
        </select>
      </div>

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.cancelBtn}
          onClick={() => router.back()}
          disabled={submitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className={styles.submitBtn}
          disabled={submitting}
        >
          {submitting ? "Creating…" : "Create User"}
        </button>
      </div>
    </form>
  );
}
