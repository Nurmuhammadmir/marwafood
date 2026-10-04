import { useEffect, useState } from "react";
import { api } from "../api.js";
import { useCart } from "../cart.jsx";
import { RESTAURANT, formatPrice } from "../config.js";
import QtyControl from "../components/QtyControl.jsx";
import CartBar from "../components/CartBar.jsx";

export default function Menu() {
  const [foods, setFoods] = useState([]);
  const [status, setStatus] = useState("loading");
  const cart = useCart();

  useEffect(() => {
    api("/foods")
      .then((data) => {
        setFoods(data);
        cart.syncWithMenu(data);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <section className="hero">
        <h1>{RESTAURANT.tagline}</h1>
        <p className="muted">{RESTAURANT.hours}. Delivery or pickup, pay when you get your food.</p>
      </section>

      {status === "loading" && <p className="state">Loading the menu…</p>}
      {status === "error" && <p className="state">The menu could not load. Check your connection and refresh the page.</p>}
      {status === "ready" && foods.length === 0 && (
        <p className="state">The menu is empty right now. Call us at {RESTAURANT.phone} to order.</p>
      )}

      <ul className="menu">
        {foods.map((food) => {
          const qty = cart.qtyOf(food._id);
          return (
            <li key={food._id} className="dish">
              <div className="dish-img">
                {food.image ? (
                  <img src={food.image} alt={food.name} loading="lazy" />
                ) : (
                  <span aria-hidden="true">{food.name.charAt(0)}</span>
                )}
              </div>
              <div className="dish-body">
                <div className="dish-top">
                  <h2>{food.name}</h2>
                  <p className="dish-price">{formatPrice(food.price)}</p>
                </div>
                {food.description && <p className="muted">{food.description}</p>}
                <div className="dish-action">
                  {qty === 0 ? (
                    <button className="btn btn-primary" onClick={() => cart.setQty(food, 1)}>
                      Add to order
                    </button>
                  ) : (
                    <QtyControl qty={qty} name={food.name} onChange={(q) => cart.setQty(food, q)} />
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <CartBar />
    </>
  );
}
