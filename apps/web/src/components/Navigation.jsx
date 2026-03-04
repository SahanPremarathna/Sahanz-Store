import { Link } from "react-router-dom";

export default function Navigation() {
  return (
    <nav className="nav">
      <Link to="/">Shop</Link>
      <Link to="/seller">Seller</Link>
      <Link to="/delivery">Delivery</Link>
    </nav>
  );
}
