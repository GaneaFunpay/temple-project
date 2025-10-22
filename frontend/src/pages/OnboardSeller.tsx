import {
  useStartOnboardingMutation,
  useStripeStatusQuery,
} from "../services/stripeApi";

export default function OnboardSeller() {
  const [createLink, { isLoading: linking }] = useStartOnboardingMutation();
  const { data: status, refetch } = useStripeStatusQuery();

  async function start() {
    const { onboarding_url } = await createLink().unwrap();
    window.location.href = onboarding_url;
  }

  return (
    <div
      style={{ maxWidth: 420, margin: "40px auto", display: "grid", gap: 12 }}
    >
      <h2>Stripe Onboarding</h2>
      <button onClick={start} disabled={linking}>
        {linking ? "..." : "Start onboarding"}
      </button>

      <div style={{ marginTop: 16 }}>
        <button onClick={() => refetch()}>Refresh status</button>
        <pre>{JSON.stringify(status, null, 2)}</pre>
      </div>
    </div>
  );
}
