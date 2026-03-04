import { useShop } from "../shop/ShopContext";

export default function FloatingCartButton() {
  const { cartCount, openCart } = useShop();

  return (
    <button className="floating-cart-button" onClick={openCart} type="button">
      <span className="floating-cart-icon">Cart</span>
      <span className="floating-cart-count">{cartCount}</span>
    </button>
  );
}
