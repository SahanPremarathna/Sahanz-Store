import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { useShop } from "../shop/ShopContext";

function formatMoney(currency, cents) {
  return `${currency} ${(cents / 100).toFixed(2)}`;
}

export default function CartDrawer() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    cart,
    cartTotal,
    isCartOpen,
    updateCartQuantity,
    closeCart
  } = useShop();

  function handleCheckoutNavigation() {
    closeCart();
    navigate("/checkout");
  }

  return (
    <>
      <button
        aria-label="Close cart"
        className={`drawer-backdrop ${isCartOpen ? "visible" : ""}`}
        onClick={closeCart}
        type="button"
      />
      <aside className={`cart-drawer ${isCartOpen ? "open" : ""}`}>
        <div className="section-heading">
          <div>
            <span className="eyebrow">Cart</span>
            <h2>Your items</h2>
          </div>
          <button className="ghost-button" onClick={closeCart} type="button">
            Close
          </button>
        </div>

        {user?.role !== "customer" ? (
          <p className="muted">Switch to the customer account above to place an order.</p>
        ) : null}

        {!cart.length ? (
          <p className="muted">Your cart is empty.</p>
        ) : (
          <>
            <div className="stack drawer-items">
              {cart.map((item) => (
                <div key={item.id} className="cart-item">
                  <div>
                    <strong>{item.name}</strong>
                    <p className="muted">{formatMoney(item.currency, item.priceCents)}</p>
                  </div>
                  <div className="quantity-controls">
                    <button
                      className="ghost-button"
                      onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                      type="button"
                    >
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      className="ghost-button"
                      onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                      type="button"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="drawer-summary">
              <div className="checkout-footer">
                <strong>LKR {(cartTotal / 100).toFixed(2)}</strong>
                <button className="primary-button" onClick={handleCheckoutNavigation} type="button">
                  Checkout
                </button>
              </div>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
