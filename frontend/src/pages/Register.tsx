import { useState } from "react";
import { useRegisterMutation } from "../services/authApi";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [register, { isLoading }] = useRegisterMutation();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    await register({ username, email, password }).unwrap();
    alert("Registered. Now login");
  }

  return (
    <form
      onSubmit={onSubmit}
      style={{ display: "grid", gap: 8, maxWidth: 360, margin: "40px auto" }}
    >
      <h2>Register</h2>
      <input
        placeholder="username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        placeholder="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button disabled={isLoading}>
        {isLoading ? "..." : "Create account"}
      </button>
    </form>
  );
}
