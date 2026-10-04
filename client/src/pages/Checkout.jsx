import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api.js";
import { useCart } from "../cart.jsx";
import { formatPrice } from "../config.js";
import QtyControl from "../components/QtyControl.jsx";

export default function Checkout() {
  const cart = useCart();
  const navigate = useNavigate();
  const [form, setForm] = useState({ customerName: "", phone: "", type: "delivery", address: "", note: "" });
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  async function placeOrder(e) {
    e.preventDefault();
    setError("");
    setSending(true);
    try {
      const order = await api("/orders", {
        method: "POST",
        body: { ...form, items: cart.items.map((i) => ({ food: i._id, qty: i.qty })) },
      });
      cart.clear();
      navigate(`/order/${order._id}`, { replace: true });
    } catch (err) {
      setError(err.message);
      setSending(false);
    }
  }

  if (cart.count === 0) {
    return (
      <section className="page narrow">
        <h1>Your order is empty</h1>
        <p className="muted">Add a dish from the menu to start an order.</p>
        <Link to="/" className="btn btn-primary">Go to menu</Link>
      </section>
    );
  }

  return (
    <section className="page checkout">
      <div>
        <h1>Your order</h1>
        <ul className="lines">
          {cart.items.map((i) => (
            <li key={i._id}>
              <div>
                <p className="line-name">{i.name}</p>
                <p className="muted">{formatPrice(i.price)}</p>
              </div>
              <QtyControl qty={i.qty} name={i.name} onChange={(q) => cart.setQty(i, q)} />
              <p className="line-total">{formatPrice(i.price * i.qty)}</p>
            </li>
          ))}
        </ul>
        <div className="total-row">
          <span>Total</span>
          <strong>{formatPrice(cart.total)}</strong>
        </div>
        <Link to="/" className="text-link">Add more dishes</Link>
      </div>

      <form className="form" onSubmit={placeOrder}>
        <fieldset className="toggle">
          <legend>How do you want to get it?</legend>
          {["delivery", "pickup"].map((t) => (
            <label key={t} className={form.type === t ? "active" : ""}>
              <input type="radio" name="type" value={t} checked={form.type === t} onChange={update} />
              {t === "delivery" ? "Delivery" : "Pickup"}
            </label>
          ))}
        </fieldset>

        <label>
          Your name
          <input name="customerName" value={form.customerName} onChange={update} required maxLength={80} autoComplete="name" />
        </label>
        <label>
          Phone number
          <input name="phone" type="tel" value={form.phone} onChange={update} required maxLength={30} autoComplete="tel" />
        </label>
        {form.type === "delivery" && (
          <label>
            Delivery address
            <textarea name="address" rows={2} value={form.address} onChange={update} required maxLength={240} autoComplete="street-address" />
          </label>
        )}
        <label>
          Note for the kitchen <span className="muted">(optional)</span>
          <textarea name="note" rows={2} value={form.note} onChange={update} maxLength={300} />
        </label>

        {error && <p className="error" role="alert">{error}</p>}

        <button className="btn btn-accent btn-block" disabled={sending}>
          {sending ? "Placing order…" : "Place order"}
        </button>
        <p className="muted small">You pay {form.type === "delivery" ? "the courier" : "at pickup"}. We'll call to confirm.</p>
      </form>
    </section>
  );
}
