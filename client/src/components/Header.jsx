import { Link, useLocation } from "react-router-dom";
import { RESTAURANT } from "../config.js";

export default function Header() {
  const { pathname } = useLocation();
  return (
    <header className="site-header">
      <Link to="/" className="brand">{RESTAURANT.name}</Link>
      {pathname === "/admin" ? (
        <Link to="/" className="header-link">View shop</Link>
      ) : (
        <a href={`tel:${RESTAURANT.phone.replace(/\s/g, "")}`} className="header-link">{RESTAURANT.phone}</a>
      )}
    </header>
  );
}
