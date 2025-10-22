import { Container } from "@mui/material";
import Header from "./components/Header";
import Router from "./Router";

export default function App() {
  return (
    <>
      <Header />
      <Container maxWidth="xl">
        {/* <nav style={{ display: "flex", gap: 12, marginBottom: 16 }}>
            <>
              <Link to="/checkout">Checkout</Link>
              <Link to="/orders">Orders</Link>
            </>
        </nav> */}
        <Router />
      </Container>
    </>
  );
}
