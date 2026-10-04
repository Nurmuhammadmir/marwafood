import { Link } from "react-router-dom";
import { useCart } from "../cart.jsx";
import { formatPrice } from "../config.js";

export default function CartBar() {
  const { count, total } = useCart();
  if (count === 0) return null;
  return (
    <div className="cart-bar">
      <div className="cart-bar-inner">
        <div className="cart-bar-sum">
          <span>{count} {count === 1 ? "item" : "items"}</span>
          <strong>{formatPrice(total)}</strong>
        </div>
        <Link to="/checkout" className="btn btn-accent">Review order</Link>
      </div>
    </div>
  );
}
