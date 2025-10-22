import { useListOrdersQuery } from "../services/stripeApi";

export default function OrdersPage() {
  const { data, isLoading, refetch } = useListOrdersQuery();
  const orders = data?.results ?? [];

  return (
    <div>
      <h2>Orders</h2>
      <button onClick={() => refetch()}>Refresh</button>
      {isLoading ? (
        <p>Loading…</p>
      ) : (
        <table
          style={{ width: "100%", marginTop: 12, borderCollapse: "collapse" }}
        >
          <thead>
            <tr>
              <th align="left">PI</th>
              <th align="right">Amount</th>
              <th align="right">Fee</th>
              <th>Status</th>
              <th>Buyer</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id}>
                <td>{o.payment_intent_id}</td>
                <td align="right">
                  {(o.amount / 100).toFixed(2)} {o.currency.toUpperCase()}
                </td>
                <td align="right">{(o.fee / 100).toFixed(2)}</td>
                <td>{o.status}</td>
                <td>{o.buyer_email || "—"}</td>
                <td>{new Date(o.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
