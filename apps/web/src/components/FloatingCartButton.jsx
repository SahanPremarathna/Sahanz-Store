import { useShop } from "../shop/ShopContext";

export default function FloatingCartButton() {
  const { cartCount, openCart } = useShop();

  return (
    <button className="floating-cart-button" onClick={openCart} type="button">
      <svg
        aria-hidden="true"
        className="floating-cart-icon"
        fill="none"
        height="20"
        viewBox="0 0 24 24"
        width="20"
      >
        <path
          d="M3 5H5L7.2 14.2C7.31 14.67 7.77 15 8.25 15H17.4C17.86 15 18.28 14.71 18.43 14.28L20.5 8.5H6"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.8"
        />
        <circle cx="9" cy="19" r="1.5" fill="currentColor" />
        <circle cx="17" cy="19" r="1.5" fill="currentColor" />
      </svg>
      <span>Cart</span>
      <span className="floating-cart-count">{cartCount}</span>
    </button>
  );
}
