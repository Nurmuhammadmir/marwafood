import { useCallback, useEffect, useState } from "react";
import { api, auth } from "../api.js";
import { formatPrice } from "../config.js";

const STATUSES = ["new", "preparing", "ready", "completed", "cancelled"];
const STATUS_LABEL = { new: "New", preparing: "Preparing", ready: "Ready", completed: "Completed", cancelled: "Cancelled" };

export default function Admin() {
  const [signedIn, setSignedIn] = useState(Boolean(auth.get()));
  const [tab, setTab] = useState("orders");

  const signOut = useCallback(() => {
    auth.clear();
    setSignedIn(false);
  }, []);

  if (!signedIn) return <Login onDone={() => setSignedIn(true)} />;

  return (
    <section className="page admin">
      <div className="admin-head">
        <div className="tabs" role="tablist">
          <button role="tab" aria-selected={tab === "orders"} onClick={() => setTab("orders")}>Orders</button>
          <button role="tab" aria-selected={tab === "menu"} onClick={() => setTab("menu")}>Menu</button>
        </div>
        <button className="text-link" onClick={signOut}>Sign out</button>
      </div>
      {tab === "orders" ? <Orders onAuthFail={signOut} /> : <MenuEditor onAuthFail={signOut} />}
    </section>
  );
}

function Login({ onDone }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault();
    setError("");
    try {
      const { token } = await api("/auth/login", { method: "POST", body: { password } });
      auth.set(token);
      onDone();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <section className="page narrow">
      <h1>Restaurant admin</h1>
      <form className="form" onSubmit={submit}>
        <label>
          Password
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoFocus />
        </label>
        {error && <p className="error" role="alert">{error}</p>}
        <button className="btn btn-primary btn-block">Sign in</button>
      </form>
    </section>
  );
}

/* ---------- Orders ---------- */

function Orders({ onAuthFail }) {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("active");
  const [error, setError] = useState("");

  const load = useCallback(() => {
    api("/orders", { admin: true })
      .then((data) => {
        setOrders(data);
        setError("");
      })
      .catch((e) => (e.status === 401 ? onAuthFail() : setError(e.message)));
  }, [onAuthFail]);

  useEffect(() => {
    load();
    const timer = setInterval(load, 20000); // check for new orders
    return () => clearInterval(timer);
  }, [load]);

  async function setStatus(order, status) {
    try {
      const updated = await api(`/orders/${order._id}/status`, { method: "PATCH", body: { status }, admin: true });
      setOrders((list) => list.map((o) => (o._id === updated._id ? updated : o)));
    } catch (e) {
      e.status === 401 ? onAuthFail() : setError(e.message);
    }
  }

  const shown = orders.filter((o) =>
    filter === "active" ? !["completed", "cancelled"].includes(o.status) : filter === "all" ? true : o.status === filter
  );

  return (
    <>
      <div className="filters">
        {[["active", "Active"], ["all", "All"], ...STATUSES.map((s) => [s, STATUS_LABEL[s]])].map(([key, label]) => (
          <button key={key} className={filter === key ? "chip active" : "chip"} onClick={() => setFilter(key)}>
            {label}
            {key === "new" && orders.some((o) => o.status === "new") && (
              <span className="badge">{orders.filter((o) => o.status === "new").length}</span>
            )}
          </button>
        ))}
      </div>

      {error && <p className="error" role="alert">{error}</p>}
      {shown.length === 0 && <p className="state">No orders here. New orders appear automatically.</p>}

      <ul className="orders">
        {shown.map((o) => (
          <li key={o._id} className={`order status-${o.status}`}>
            <div className="order-head">
              <div>
                <p className="order-number">#{o._id.slice(-6).toUpperCase()}</p>
                <p className="muted small">{new Date(o.createdAt).toLocaleString()}</p>
              </div>
              <select value={o.status} onChange={(e) => setStatus(o, e.target.value)} aria-label="Order status">
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                ))}
              </select>
            </div>
            <p>
              <strong>{o.customerName}</strong>, <a href={`tel:${o.phone}`}>{o.phone}</a>
            </p>
            <p className="muted">{o.type === "pickup" ? "Pickup" : `Delivery: ${o.address}`}</p>
            {o.note && <p className="note">Note: {o.note}</p>}
            <ul className="lines compact">
              {o.items.map((i) => (
                <li key={i.food}>
                  <p>{i.qty} × {i.name}</p>
                  <p className="line-total">{formatPrice(i.price * i.qty)}</p>
                </li>
              ))}
            </ul>
            <div className="total-row small-total">
              <span>Total</span>
              <strong>{formatPrice(o.total)}</strong>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}

/* ---------- Menu editor ---------- */

const EMPTY = { name: "", description: "", price: "", image: "", available: true, position: 0 };

function MenuEditor({ onAuthFail }) {
  const [foods, setFoods] = useState([]);
  const [max, setMax] = useState(10);
  const [editing, setEditing] = useState(null); // null | "new" | food id
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");

  const handle = (e) => (e.status === 401 ? onAuthFail() : setError(e.message));

  const load = useCallback(() => {
    api("/foods/all", { admin: true })
      .then((d) => {
        setFoods(d.foods);
        setMax(d.max);
      })
      .catch(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(load, [load]);

  function startEdit(food) {
    setError("");
    if (food) {
      setEditing(food._id);
      setForm({ ...EMPTY, ...food });
    } else {
      setEditing("new");
      setForm({ ...EMPTY, position: foods.length + 1 });
    }
  }

  async function save(e) {
    e.preventDefault();
    setError("");
    const body = { ...form, price: Number(form.price), position: Number(form.position) };
    try {
      if (editing === "new") await api("/foods", { method: "POST", body, admin: true });
      else await api(`/foods/${editing}`, { method: "PUT", body, admin: true });
      setEditing(null);
      load();
    } catch (err) {
      handle(err);
    }
  }

  async function remove(food) {
    if (!confirm(`Delete "${food.name}" from the menu?`)) return;
    try {
      await api(`/foods/${food._id}`, { method: "DELETE", admin: true });
      load();
    } catch (err) {
      handle(err);
    }
  }

  async function toggle(food) {
    try {
      await api(`/foods/${food._id}`, { method: "PUT", body: { available: !food.available }, admin: true });
      load();
    } catch (err) {
      handle(err);
    }
  }

  const update = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  return (
    <>
      <div className="menu-head">
        <p className="muted">{foods.length} of {max} dishes</p>
        {editing === null && foods.length < max && (
          <button className="btn btn-primary" onClick={() => startEdit(null)}>Add dish</button>
        )}
      </div>

      {error && <p className="error" role="alert">{error}</p>}

      {editing !== null && (
        <form className="form editor" onSubmit={save}>
          <h2>{editing === "new" ? "New dish" : "Edit dish"}</h2>
          <label>
            Name
            <input name="name" value={form.name} onChange={update} required maxLength={60} />
          </label>
          <label>
            Description <span className="muted">(optional)</span>
            <textarea name="description" rows={2} value={form.description} onChange={update} maxLength={240} />
          </label>
          <div className="row">
            <label>
              Price
              <input name="price" type="number" min="0" step="any" value={form.price} onChange={update} required />
            </label>
            <label>
              Order on menu
              <input name="position" type="number" value={form.position} onChange={update} />
            </label>
          </div>
          <label>
            Photo link <span className="muted">(optional, https://…)</span>
            <input name="image" type="url" value={form.image} onChange={update} />
          </label>
          <label className="check">
            <input type="checkbox" name="available" checked={form.available} onChange={update} />
            Show on menu
          </label>
          <div className="row-actions">
            <button className="btn btn-primary">Save dish</button>
            <button type="button" className="text-link" onClick={() => setEditing(null)}>Cancel</button>
          </div>
        </form>
      )}

      {foods.length === 0 && editing === null && (
        <p className="state">No dishes yet. Add your first dish to open the menu.</p>
      )}

      <ul className="admin-foods">
        {foods.map((f) => (
          <li key={f._id} className={f.available ? "" : "hidden-dish"}>
            <div>
              <p className="line-name">{f.name}</p>
              <p className="muted small">
                {formatPrice(f.price)}{f.available ? "" : ", hidden from menu"}
              </p>
            </div>
            <div className="row-actions">
              <button className="text-link" onClick={() => toggle(f)}>{f.available ? "Hide" : "Show"}</button>
              <button className="text-link" onClick={() => startEdit(f)}>Edit</button>
              <button className="text-link danger" onClick={() => remove(f)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
