import { Button } from "@mui/material";
import { useMeQuery } from "../services/authApi";
import { Link } from "react-router-dom";

export default function ProfilePage() {
  const { data, isLoading } = useMeQuery();
  if (isLoading) return <p style={{ textAlign: "center" }}>Loading…</p>;
  return (
    <div style={{ maxWidth: 480, margin: "40px auto" }}>
      <h2>Profile</h2>
      <pre>{JSON.stringify(data, null, 2)}</pre>
      <Button variant="contained" component={Link} to="/onboard">
        Onboarding
      </Button>
    </div>
  );
}
