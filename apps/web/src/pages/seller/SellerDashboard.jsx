import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navigation from "../../components/Navigation";
import { useAuth } from "../../auth/AuthContext";
import PageTransition from "../../components/PageTransition";
import SiteFooter from "../../components/SiteFooter";
import SmartImage from "../../components/SmartImage";
import {
  createSellerProduct,
  getCategories,
  getOrders,
  getSellerProducts
} from "../../api/client";
import { useNotifications } from "../../notifications/NotificationContext";

function formatMoney(currency, cents) {
  return `${currency} ${(cents / 100).toFixed(2)}`;
}

function parseGalleryImages(value) {
  return value
    .split(/\r?\n/)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function getOrderStateText(order) {
  if (order.status === "cancelled" || order.deliveryStatus === "cancelled") {
    const reason = order.cancellationReason ? `Reason: ${order.cancellationReason}` : "Order cancelled";
    return `${reason}${order.cancellationNote ? ` | ${order.cancellationNote}` : ""}`;
  }

  return `Delivery: ${order.deliveryStatus} | Total: ${formatMoney(order.currency, order.totalCents)}`;
}

export default function SellerDashboard() {
  const { token, user } = useAuth();
  const notifications = useNotifications();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [stateMessage, setStateMessage] = useState("Loading seller data...");
  const [form, setForm] = useState({
    categoryId: "",
    title: "",
    description: "",
    price: "0",
    inventoryCount: "0",
    imageUrl: "",
    galleryImages: ""
  });

  useEffect(() => {
    if (!user) {
      return;
    }

    let isMounted = true;
    setStateMessage("Loading seller data...");

    Promise.all([getCategories(), getSellerProducts(token), getOrders(token)])
      .then(([categoryData, productData, orderData]) => {
        if (!isMounted) {
          return;
        }

        setCategories(categoryData);
        setProducts(productData);
        setOrders(orderData);
        setForm((current) => ({
          ...current,
          categoryId: categoryData[0]?.id || ""
        }));
        setStateMessage("");
      })
      .catch((error) => {
        if (isMounted) {
          setStateMessage(`Failed to load seller data: ${error.message}`);
          notifications.error(error.message, "Seller portal load failed");
        }
      });

    return () => {
      isMounted = false;
    };
  }, [notifications, token, user]);

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      const product = await createSellerProduct(
        {
          categoryId: form.categoryId,
          title: form.title,
          description: form.description,
          priceCents: Math.round(Number(form.price) * 100),
          inventoryCount: Number(form.inventoryCount),
          imageUrl: form.imageUrl,
          galleryImages: parseGalleryImages(form.galleryImages)
        },
        token
      );

      setProducts((current) => [product, ...current]);
      setForm((current) => ({
        ...current,
        title: "",
        description: "",
        price: "0",
        inventoryCount: "0",
        imageUrl: "",
        galleryImages: ""
      }));
      setStateMessage("Listing created.");
      notifications.modalSuccess(
        `${product.title} is now live in your inventory and visible in the customer storefront.`,
        "Listing created",
        [
          {
            label: "Add another",
            variant: "ghost"
          },
          {
            label: "Done",
            variant: "primary"
          }
        ]
      );
    } catch (error) {
      setStateMessage(`Failed to create listing: ${error.message}`);
      notifications.modalError(error.message, "Listing creation failed");
    }
  }

  const openOrders = orders.filter(
    (order) => order.status !== "delivered" && order.status !== "cancelled"
  ).length;
  const previewProducts = products.slice(0, 5);

  return (
    <div className="layout">
      <PageTransition className="page-shell">
        <Navigation />
        <section className="seller-hero portal-hero">
          <div>
            <span className="eyebrow">Seller portal</span>
            <h1>Keep the order queue tight and move into fulfillment only when needed.</h1>
            <p className="hero-copy">
              This view is now compact on purpose. Use it to scan incoming orders fast,
              then open the fulfillment page when you need to update the order itself.
            </p>
          </div>
          <div className="portal-summary">
            <span className="pill">{stateMessage || "Seller data loaded"}</span>
            <div className="metric-strip">
              <article className="metric-card">
                <span className="eyebrow">Open orders</span>
                <strong>{openOrders}</strong>
              </article>
              <article className="metric-card">
                <span className="eyebrow">Live listings</span>
                <strong>{products.length}</strong>
              </article>
            </div>
          </div>
        </section>

        <section className="page-card">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Orders</span>
              <h2>Seller order stream</h2>
            </div>
            <span className="muted">{orders.length} total orders</span>
          </div>
          <div className="portal-grid">
            {!orders.length && stateMessage.startsWith("Loading") ? (
              Array.from({ length: 3 }).map((_, index) => (
                <article
                  className="order-card portal-card seller-stream-card skeleton-card"
                  key={`seller-order-${index}`}
                >
                  <div className="skeleton-block skeleton-line short" />
                  <div className="skeleton-block skeleton-line" />
                  <div className="skeleton-block skeleton-line medium" />
                </article>
              ))
            ) : null}
            {orders.map((order) => (
              <article className="order-card portal-card seller-stream-card" key={order.id}>
                <div className="section-heading compact">
                  <div>
                    <span className="eyebrow">Order {order.id}</span>
                    <h3>{order.customerName}</h3>
                  </div>
                  <span className={`status-chip ${order.status}`}>{order.status}</span>
                </div>
                <p className="muted">Recipient: {order.recipientName || order.customerName}</p>
                <p className="muted">{order.deliveryAddress}</p>
                <p className="muted">{getOrderStateText(order)}</p>
                <div className="seller-stream-meta">
                  <span>{order.items.length} items</span>
                  <span>{formatMoney(order.currency, order.totalCents)}</span>
                </div>
                <Link className="ghost-link" to={`/orders/${order.id}`}>
                  Open fulfillment view
                </Link>
              </article>
            ))}
          </div>
        </section>

        <div className="dashboard-grid">
          <section className="page-card">
            <div className="section-heading">
              <div>
                <span className="eyebrow">New listing</span>
                <h2>Add inventory</h2>
              </div>
            </div>
            <form className="stack form-grid" onSubmit={handleSubmit}>
              <label>
                Category
                <select
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      categoryId: event.target.value
                    }))
                  }
                  value={form.categoryId}
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Product title
                <input
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      title: event.target.value
                    }))
                  }
                  placeholder="Example: Red Rice 5kg"
                  value={form.title}
                />
              </label>
              <label>
                Description
                <textarea
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      description: event.target.value
                    }))
                  }
                  rows="4"
                  value={form.description}
                />
              </label>
              <label>
                Price (LKR)
                <input
                  min="0"
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      price: event.target.value
                    }))
                  }
                  step="0.01"
                  type="number"
                  value={form.price}
                />
              </label>
              <label>
                Stock count
                <input
                  min="0"
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      inventoryCount: event.target.value
                    }))
                  }
                  type="number"
                  value={form.inventoryCount}
                />
              </label>
              <label>
                Image URL
                <input
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      imageUrl: event.target.value
                    }))
                  }
                  placeholder="Main product image"
                  value={form.imageUrl}
                />
              </label>
              <label>
                Gallery image URLs
                <textarea
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      galleryImages: event.target.value
                    }))
                  }
                  placeholder={"One image URL per line"}
                  rows="5"
                  value={form.galleryImages}
                />
              </label>
              <button className="primary-button" type="submit">
                Save listing
              </button>
            </form>
          </section>

          <section className="page-card span-two">
            <div className="section-heading">
              <div>
                <span className="eyebrow">Inventory</span>
                <h2>Your live listings</h2>
              </div>
              <div className="inventory-section-heading">
                <span className="muted">{products.length} products</span>
                {products.length > 5 ? (
                  <Link className="ghost-link inventory-view-all-link" to="/seller/listings">
                    View all listings
                  </Link>
                ) : null}
              </div>
            </div>
            <div className="inventory-grid">
              {previewProducts.map((product) => (
                <Link
                  className="inventory-card inventory-management-card"
                  key={product.id}
                  to={`/seller/listings/${product.id}/edit`}
                >
                  <SmartImage
                    alt={product.title}
                    className="inventory-thumb"
                    src={product.imageUrl}
                  />
                  <div>
                    <h3>{product.title}</h3>
                    <p>{product.description}</p>
                    <p className="muted">
                      {formatMoney(product.currency, product.priceCents)} | Stock{" "}
                      {product.inventoryCount}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </div>
        <SiteFooter />
      </PageTransition>
    </div>
  );
}
