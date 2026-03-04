import { Link } from "react-router-dom";
import SmartImage from "../../../components/SmartImage";

export default function ShopProductCard({
  addToCart,
  className = "",
  formatMoney,
  onRecordProductInteraction,
  product,
  showSeller = false
}) {
  return (
    <article className={`product-card ${className}`.trim()}>
      <Link
        className="product-link"
        onClick={() => onRecordProductInteraction(product, "views")}
        to={`/products/${product.slug}`}
      >
        <SmartImage
          alt={product.name}
          className="product-image"
          src={product.imageUrl}
        />
        <div className="product-meta">
          {showSeller ? <span className="muted">Seller: {product.sellerName}</span> : null}
          <h3>{product.name}</h3>
          <p>{product.description}</p>
        </div>
      </Link>
      <div className="product-footer">
        <strong>{formatMoney(product.currency, product.priceCents)}</strong>
        <span className="muted">Stock {product.inventoryCount}</span>
      </div>
      <button
        aria-label={`Add ${product.name} to cart`}
        className="quick-add-button"
        onClick={() => {
          onRecordProductInteraction(product, "adds");
          addToCart(product, { openCart: true });
        }}
        type="button"
      >
        +
      </button>
    </article>
  );
}
