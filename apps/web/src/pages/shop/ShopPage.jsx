import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiGet } from "../../api/client";
import { useAuth } from "../../auth/AuthContext";
import CartDrawer from "../../components/CartDrawer";
import FloatingCartButton from "../../components/FloatingCartButton";
import Navigation from "../../components/Navigation";
import PageTransition from "../../components/PageTransition";
import SmartImage from "../../components/SmartImage";
import { useNotifications } from "../../notifications/NotificationContext";
import { useShop } from "../../shop/ShopContext";

function formatMoney(currency, cents) {
  return `${currency} ${(cents / 100).toFixed(2)}`;
}

export default function ShopPage() {
  const { user } = useAuth();
  const notifications = useNotifications();
  const { addToCart, cartCount, catalog, catalogState } = useShop();
  const [health, setHealth] = useState("Checking API...");

  useEffect(() => {
    let isMounted = true;

    apiGet("/health")
      .then((data) => {
        if (isMounted) {
          setHealth(`API response: ${JSON.stringify(data)}`);
        }
      })
      .catch((error) => {
        if (isMounted) {
          setHealth(`API error: ${error.message}`);
          notifications.error(error.message, "API health check failed");
        }
      });

    return () => {
      isMounted = false;
    };
  }, [notifications]);

  return (
    <div className="layout">
      <PageTransition className="page-shell">
        <Navigation />
        <section className="hero">
          <div>
            <span className="eyebrow">Customer storefront</span>
            <h1>Browse the store, open an item page, and order from a sliding cart.</h1>
            <p className="hero-copy">
              Clicking a product now opens its own page with more details, quick
              add-to-cart actions, and buy-now flow. The cart lives in a
              floating drawer instead of the main page.
            </p>
            <div className="hero-meta">
              <span className="pill">{health}</span>
              <span className="pill">
                Active role: {user ? `${user.name} (${user.role})` : "none"}
              </span>
              <span className="pill">Cart items: {cartCount}</span>
            </div>
          </div>
          <div className="hero-panel">
            <h2>Customer flow</h2>
            <ul className="feature-list">
              <li>Open a product page for more details</li>
              <li>Add to cart or buy now from the item page</li>
              <li>Checkout from the floating cart drawer</li>
              <li>Track order progress from your profile page</li>
            </ul>
          </div>
        </section>

        <section className="page-card">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Catalog</span>
              <h2>Shop the latest listings</h2>
            </div>
            {catalogState ? <span className="muted">{catalogState}</span> : null}
          </div>
          {catalog.map((category) => (
            <section key={category.id} className="catalog-section">
              <div className="section-heading compact">
                <h3>{category.name}</h3>
                <span className="muted">{category.products.length} listings</span>
              </div>
              <div className="product-grid">
                {category.products.map((product) => (
                  <article key={product.id} className="product-card">
                    <Link className="product-link" to={`/products/${product.slug}`}>
                      <SmartImage
                        alt={product.name}
                        className="product-image"
                        src={product.imageUrl}
                      />
                      <div className="product-meta">
                        <span className="muted">Seller: {product.sellerName}</span>
                        <h3>{product.name}</h3>
                        <p>{product.description}</p>
                      </div>
                    </Link>
                    <div className="product-footer">
                      <strong>{formatMoney(product.currency, product.priceCents)}</strong>
                      <span className="muted">Stock {product.inventoryCount}</span>
                    </div>
                    <div className="product-card-actions">
                      <Link className="ghost-link" to={`/products/${product.slug}`}>
                        View item
                      </Link>
                      <button
                        className="primary-button"
                        onClick={() => addToCart(product, { openCart: true })}
                        type="button"
                      >
                        Add to cart
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))}
          {!catalog.length && catalogState.startsWith("Loading") ? (
            <div className="loading-grid">
              {Array.from({ length: 6 }).map((_, index) => (
                <article className="product-card skeleton-card" key={`catalog-skeleton-${index}`}>
                  <div className="skeleton-block skeleton-image" />
                  <div className="skeleton-block skeleton-line short" />
                  <div className="skeleton-block skeleton-line" />
                  <div className="skeleton-block skeleton-line medium" />
                </article>
              ))}
            </div>
          ) : null}
        </section>
      </PageTransition>
      <FloatingCartButton />
      <CartDrawer />
    </div>
  );
}
