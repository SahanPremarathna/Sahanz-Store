import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import Navigation from "../../components/Navigation";
import CartDrawer from "../../components/CartDrawer";
import FloatingCartButton from "../../components/FloatingCartButton";
import PageTransition from "../../components/PageTransition";
import SiteFooter from "../../components/SiteFooter";
import SmartImage from "../../components/SmartImage";
import { useAuth } from "../../auth/AuthContext";
import { useShop } from "../../shop/ShopContext";

function formatMoney(currency, cents) {
  return `${currency} ${(cents / 100).toFixed(2)}`;
}

export default function ProductDetailsPage() {
  const navigate = useNavigate();
  const { slug } = useParams();
  const { user } = useAuth();
  const { addToCart, catalog, catalogState, findProductBySlug } = useShop();
  const product = findProductBySlug(slug);
  const allProducts = catalog.flatMap((category) =>
    category.products.map((entry) => ({
      ...entry,
      categoryName: category.name,
      categorySlug: category.slug
    }))
  );
  const relatedProducts = allProducts
    .filter(
      (entry) =>
        entry.id !== product?.id && entry.categorySlug === product?.categorySlug
    )
    .slice(0, 4);
  const relatedProductIds = new Set(relatedProducts.map((entry) => entry.id));
  const featuredProducts = allProducts
    .filter((entry) => entry.id !== product?.id && !relatedProductIds.has(entry.id))
    .sort(
      (left, right) =>
        right.inventoryCount - left.inventoryCount ||
        right.priceCents - left.priceCents
    )
    .slice(0, 4);
  const productStory = product?.longDescription
    ? product.longDescription
        .split(/\n+/)
        .map((paragraph) => paragraph.trim())
        .filter(Boolean)
    : product
      ? [product.description]
      : [];
  const galleryImageKey = product?.galleryImages?.join("|") || "";
  const galleryImages = useMemo(() => {
    if (!product) {
      return [];
    }

    return Array.from(
      new Set([product.imageUrl, ...(product.galleryImages || [])].filter(Boolean))
    );
  }, [product?.imageUrl, galleryImageKey]);
  const [selectedImage, setSelectedImage] = useState("");
  const [selectedQuantity, setSelectedQuantity] = useState(1);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [slug]);

  useEffect(() => {
    setSelectedImage(galleryImages[0] || "");
  }, [slug, galleryImageKey, product?.imageUrl]);

  useEffect(() => {
    setSelectedQuantity(1);
  }, [slug]);

  if (user?.role === "seller") {
    return <Navigate to="/seller" replace />;
  }

  if (user?.role === "delivery") {
    return <Navigate to="/delivery" replace />;
  }

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
    if (addToCart(product, { openCart: true, quantity: selectedQuantity })) {
      navigate("/checkout");
    }
  }

  function adjustQuantity(nextQuantity) {
    setSelectedQuantity(
      Math.max(1, Math.min(product.inventoryCount || 1, nextQuantity))
    );
  }

  return (
    <div className="layout">
      <PageTransition className="page-shell">
        <Navigation />
        <section className="page-card product-detail-shell">
          <div className="product-detail-media">
            <button
              aria-label="Back to shop"
              className="detail-back-button"
              onClick={() => navigate(-1)}
              type="button"
            >
              <span aria-hidden="true">&#8592;</span>
            </button>
            <SmartImage
              alt={product.name}
              className="product-detail-image"
              src={selectedImage || product.imageUrl}
            />
            {galleryImages.length > 1 ? (
              <div className="product-gallery-strip">
                {galleryImages.map((imageUrl, index) => (
                  <button
                    key={`${imageUrl}-${index}`}
                    aria-label={`View image ${index + 1} for ${product.name}`}
                    className={`product-gallery-thumb${
                      imageUrl === (selectedImage || product.imageUrl) ? " active" : ""
                    }`}
                    onClick={() => setSelectedImage(imageUrl)}
                    type="button"
                  >
                    <img alt="" src={imageUrl} />
                  </button>
                ))}
              </div>
            ) : null}
          </div>
          <div className="product-detail-copy">
            <span className="eyebrow">{product.categoryName}</span>
            <h1>{product.name}</h1>
            <p className="hero-copy">{product.description}</p>
            <div className="product-detail-meta">
              <strong>{formatMoney(product.currency, product.priceCents)}</strong>
              <span className="pill">Seller: {product.sellerName}</span>
              <span className="pill">Stock {product.inventoryCount}</span>
            </div>
            <div className="detail-quantity-row">
              <span className="muted">Quantity</span>
              <div className="detail-quantity-controls">
                <button
                  aria-label={`Decrease quantity for ${product.name}`}
                  className="detail-quantity-button"
                  onClick={() => adjustQuantity(selectedQuantity - 1)}
                  type="button"
                >
                  -
                </button>
                <span className="detail-quantity-value">{selectedQuantity}</span>
                <button
                  aria-label={`Increase quantity for ${product.name}`}
                  className="detail-quantity-button"
                  onClick={() => adjustQuantity(selectedQuantity + 1)}
                  type="button"
                >
                  +
                </button>
              </div>
            </div>
            <div className="detail-actions">
              <button
                className="detail-add-button"
                onClick={() => addToCart(product, { quantity: selectedQuantity })}
                type="button"
              >
                Add to cart
              </button>
              <button className="detail-buy-button" onClick={handleBuyNow} type="button">
                Buy now
              </button>
            </div>
          </div>
        </section>
        <section className="page-card product-story-shell">
          <div className="section-heading compact">
            <div>
              <span className="eyebrow">About this product</span>
              <h2>More to know before you buy</h2>
            </div>
          </div>
          <div className="product-story-copy">
            {productStory.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <div className="product-info-grid">
            {product.details?.length ? (
              <section className="product-info-card">
                <h3>Details</h3>
                <ul>
                  {product.details.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>
            ) : null}
            {product.ingredients?.length ? (
              <section className="product-info-card">
                <h3>Ingredients</h3>
                <ul>
                  {product.ingredients.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>
            ) : null}
            {product.usageNotes ? (
              <section className="product-info-card">
                <h3>Usage</h3>
                <p>{product.usageNotes}</p>
              </section>
            ) : null}
            {product.storageNotes ? (
              <section className="product-info-card">
                <h3>Storage</h3>
                <p>{product.storageNotes}</p>
              </section>
            ) : null}
          </div>
        </section>
        {relatedProducts.length ? (
          <section className="page-card">
            <div className="section-heading compact">
              <div>
                <span className="eyebrow">Related products</span>
                <h2>More from {product.categoryName}</h2>
              </div>
            </div>
            <div className="product-grid detail-product-grid">
              {relatedProducts.map((entry) => (
                <article key={entry.id} className="product-card">
                  <Link className="product-link" to={`/products/${entry.slug}`}>
                    <SmartImage
                      alt={entry.name}
                      className="product-image"
                      src={entry.imageUrl}
                    />
                    <div className="product-meta">
                      <span className="muted">{entry.categoryName}</span>
                      <h3>{entry.name}</h3>
                      <p>{entry.description}</p>
                    </div>
                  </Link>
                  <div className="product-footer">
                    <strong>{formatMoney(entry.currency, entry.priceCents)}</strong>
                    <span className="muted">Stock {entry.inventoryCount}</span>
                  </div>
                  <button
                    aria-label={`Add ${entry.name} to cart`}
                    className="quick-add-button"
                    onClick={() => addToCart(entry, { openCart: true })}
                    type="button"
                  >
                    +
                  </button>
                </article>
              ))}
            </div>
          </section>
        ) : null}
        {featuredProducts.length ? (
          <section className="page-card">
            <div className="section-heading compact">
              <div>
                <span className="eyebrow">Featured products</span>
                <h2>Popular picks across the shop</h2>
              </div>
            </div>
            <div className="product-grid detail-product-grid">
              {featuredProducts.map((entry) => (
                <article key={entry.id} className="product-card featured-product-card">
                  <Link className="product-link" to={`/products/${entry.slug}`}>
                    <SmartImage
                      alt={entry.name}
                      className="product-image"
                      src={entry.imageUrl}
                    />
                    <div className="product-meta">
                      <span className="muted">{entry.categoryName}</span>
                      <h3>{entry.name}</h3>
                      <p>{entry.description}</p>
                    </div>
                  </Link>
                  <div className="product-footer">
                    <strong>{formatMoney(entry.currency, entry.priceCents)}</strong>
                    <span className="muted">Stock {entry.inventoryCount}</span>
                  </div>
                  <button
                    aria-label={`Add ${entry.name} to cart`}
                    className="quick-add-button"
                    onClick={() => addToCart(entry, { openCart: true })}
                    type="button"
                  >
                    +
                  </button>
                </article>
              ))}
            </div>
          </section>
        ) : null}
        <SiteFooter />
      </PageTransition>
      <FloatingCartButton />
      <CartDrawer />
    </div>
  );
}
