import { useState } from "react";
import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { useCreatePaymentIntentMutation } from "../services/stripeApi";

export default function Checkout() {
  const stripe = useStripe();
  const elements = useElements();
  const [amount, setAmount] = useState(1000);
  const [buyerEmail, setBuyerEmail] = useState("");
  const [createPI, { isLoading }] = useCreatePaymentIntentMutation();

  async function pay(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;

    const { clientSecret } = await createPI({
      amount,
      buyer_email: buyerEmail,
    }).unwrap();

    const { error, paymentIntent } = await stripe.confirmCardPayment(
      clientSecret,
      {
        payment_method: { card: elements.getElement(CardElement)! },
      }
    );
    if (error) {
      alert(error.message);
    } else {
      alert(`Status: ${paymentIntent?.status}`);
      // при желании — триггернуть refetch orders
    }
  }

  return (
    <form onSubmit={pay}>
      <h2>Checkout</h2>
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(parseInt(e.target.value || "0", 10))}
      />
      <input
        type="email"
        value={buyerEmail}
        onChange={(e) => setBuyerEmail(e.target.value)}
        placeholder="buyer email (optional)"
      />
      <div style={{ border: "1px solid #ddd", padding: 12, borderRadius: 6 }}>
        <CardElement />
      </div>
      <button disabled={isLoading || !stripe || !elements}>
        {isLoading ? "..." : "Pay"}
      </button>
    </form>
  );
}
