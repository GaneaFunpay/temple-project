import { useState } from "react";
import { useParams } from "react-router-dom";
import { useConfirmResetMutation } from "../services/authApi";

export default function ResetPasswordPage() {
  const { uid = "", token = "" } = useParams();
  const [password, setPassword] = useState("");
  const [confirm, { isLoading }] = useConfirmResetMutation();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    await confirm({ uid, token, new_password: password }).unwrap();
    alert("Password changed. You can login now.");
  }

  return (
    <form
      onSubmit={onSubmit}
      style={{ display: "grid", gap: 8, maxWidth: 360, margin: "40px auto" }}
    >
      <h2>Reset password</h2>
      <input
        type="password"
        placeholder="new password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button disabled={isLoading}>
        {isLoading ? "..." : "Set new password"}
      </button>
    </form>
  );
}
