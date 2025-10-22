import React, { useState } from "react";
import { useSendResetEmailMutation } from "../services/authApi";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [send, { isLoading }] = useSendResetEmailMutation();
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    await send({ email }).unwrap();
    alert("If the email exists, a reset link was sent.");
  }
  return (
    <form
      onSubmit={onSubmit}
      style={{ display: "grid", gap: 8, maxWidth: 360, margin: "40px auto" }}
    >
      <h2>Forgot password</h2>
      <input
        placeholder="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button disabled={isLoading}>
        {isLoading ? "..." : "Send reset link"}
      </button>
    </form>
  );
}
