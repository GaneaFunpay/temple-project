import { useState } from "react";
import { useLoginMutation } from "../services/authApi";
import { useAppDispatch } from "../utils/hooks";
import { setAccess } from "../store/reducers/authReducer";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [login, { isLoading }] = useLoginMutation();
  const dispatch = useAppDispatch();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const data = await login({ username, password }).unwrap();
    dispatch(setAccess(data.access));
  }

  return (
    <form
      onSubmit={onSubmit}
      style={{ display: "grid", gap: 8, maxWidth: 360, margin: "40px auto" }}
    >
      <h2>Login</h2>
      <input
        placeholder="username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="password"
        placeholder="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button disabled={isLoading}>{isLoading ? "..." : "Login"}</button>
    </form>
  );
}
