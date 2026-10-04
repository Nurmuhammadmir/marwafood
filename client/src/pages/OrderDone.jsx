import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api.js";
import { RESTAURANT, formatPrice } from "../config.js";

const STATUS_TEXT = {
  new: "Received. We'll call you shortly to confirm.",
  preparing: "The kitchen is cooking your order.",
  ready: "Your order is ready.",
  completed: "Delivered. Enjoy your meal.",
  cancelled: `This order was cancelled. Call ${RESTAURANT.phone} if this is a mistake.`,
};

export default function OrderDone() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    const load = () =>
      api(`/orders/${id}`)
        .then((o) => alive && setOrder(o))
        .catch((e) => alive && setError(e.message));
    load();
    const timer = setInterval(load, 15000); // refresh status
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, [id]);

  if (error) {
    return (
      <section className="page narrow">
        <h1>Order not found</h1>
        <p className="muted">{error}</p>
        <Link to="/" className="btn btn-primary">Go to menu</Link>
      </section>
    );
  }
  if (!order) return <p className="state">Loading your order…</p>;

  return (
    <section className="page narrow">
      <p className="order-number">Order #{order._id.slice(-6).toUpperCase()}</p>
      <h1>Thank you!</h1>
      <p className={`status status-${order.status}`}>{STATUS_TEXT[order.status]}</p>
      <ul className="lines compact">
        {order.items.map((i) => (
          <li key={i.food}>
            <p>{i.qty} × {i.name}</p>
            <p className="line-total">{formatPrice(i.price * i.qty)}</p>
          </li>
        ))}
      </ul>
      <div className="total-row">
        <span>Total, paid on {order.type === "delivery" ? "delivery" : "pickup"}</span>
        <strong>{formatPrice(order.total)}</strong>
      </div>
      <Link to="/" className="text-link">Back to menu</Link>
    </section>
  );
}
