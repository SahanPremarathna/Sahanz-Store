import { Link, useNavigate, useParams } from "react-router-dom";
import Navigation from "../../components/Navigation";
import CartDrawer from "../../components/CartDrawer";
import FloatingCartButton from "../../components/FloatingCartButton";
import PageTransition from "../../components/PageTransition";
import SmartImage from "../../components/SmartImage";
import { useShop } from "../../shop/ShopContext";

function formatMoney(currency, cents) {
  return `${currency} ${(cents / 100).toFixed(2)}`;
}

export default function ProductDetailsPage() {
  const navigate = useNavigate();
  const { slug } = useParams();
  const { addToCart, catalogState, findProductBySlug } = useShop();
  const product = findProductBySlug(slug);

  if (!product && catalogState.startsWith("Loading")) {
    return (
      <div className="layout">
        <PageTransition className="page-shell">
          <Navigation />
          <section className="page-card">
            <div className="loading-detail">
              <div className="skeleton-block skeleton-detail-image" />
              <div className="skeleton-block skeleton-line short" />
              <div className="skeleton-block skeleton-line" />
              <div className="skeleton-block skeleton-line medium" />
            </div>
          </section>
        </PageTransition>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="layout">
        <PageTransition className="page-shell">
          <Navigation />
          <section className="page-card">
            <div className="section-heading">
              <div>
                <span className="eyebrow">Product</span>
                <h2>Item not found</h2>
              </div>
              <Link className="ghost-link" to="/">
                Back to shop
              </Link>
            </div>
          </section>
        </PageTransition>
      </div>
    );
  }

  function handleBuyNow() {
    if (addToCart(product, { openCart: true })) {
      navigate("/checkout");
    }
  }

  return (
    <div className="layout">
      <PageTransition className="page-shell">
        <Navigation />
        <section className="page-card product-detail-shell">
          <SmartImage
            alt={product.name}
            className="product-detail-image"
            src={product.imageUrl}
          />
          <div className="product-detail-copy">
            <span className="eyebrow">{product.categoryName}</span>
            <h1>{product.name}</h1>
            <p className="hero-copy">{product.description}</p>
            <div className="product-detail-meta">
              <strong>{formatMoney(product.currency, product.priceCents)}</strong>
              <span className="pill">Seller: {product.sellerName}</span>
              <span className="pill">Stock {product.inventoryCount}</span>
            </div>
            <div className="detail-actions">
              <button
                className="ghost-button"
                onClick={() => addToCart(product)}
                type="button"
              >
                Add to cart
              </button>
              <button className="primary-button" onClick={handleBuyNow} type="button">
                Buy now
              </button>
            </div>
            <Link className="ghost-link detail-link" to="/">
              Back to shop
            </Link>
          </div>
        </section>
      </PageTransition>
      <FloatingCartButton />
      <CartDrawer />
    </div>
  );
}
