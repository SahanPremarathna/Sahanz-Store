import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navigation from "../../components/Navigation";
import { useAuth } from "../../auth/AuthContext";
import OrderProgress from "../../components/OrderProgress";
import PageTransition from "../../components/PageTransition";
import SmartImage from "../../components/SmartImage";
import {
  createSellerProduct,
  getCategories,
  getOrders,
  getSellerProducts,
  updateSellerOrderProgress
} from "../../api/client";
import { useNotifications } from "../../notifications/NotificationContext";

function formatMoney(currency, cents) {
  return `${currency} ${(cents / 100).toFixed(2)}`;
}

function formatApproximateCoordinates(coordinates) {
  if (!coordinates) {
    return "Customer did not share coordinates";
  }

  return `${coordinates.latitude.toFixed(2)}, ${coordinates.longitude.toFixed(2)}`;
}

function buildMapEmbedLink(coordinates) {
  if (!coordinates) {
    return null;
  }

  return `https://www.google.com/maps?q=${coordinates.latitude},${coordinates.longitude}&z=13&output=embed`;
}

export default function SellerDashboard() {
  const { user } = useAuth();
  const notifications = useNotifications();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [stateMessage, setStateMessage] = useState("Loading seller data...");
  const [busyOrderId, setBusyOrderId] = useState("");
  const [form, setForm] = useState({
    categoryId: "",
    title: "",
    description: "",
    price: "0",
    inventoryCount: "0",
    imageUrl: ""
  });

  useEffect(() => {
    if (!user) {
      return;
    }

    let isMounted = true;
    setStateMessage("Loading seller data...");

    Promise.all([getCategories(), getSellerProducts(user), getOrders(user)])
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
  }, [notifications, user]);

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
          imageUrl: form.imageUrl
        },
        user
      );

      setProducts((current) => [product, ...current]);
      setForm((current) => ({
        ...current,
        title: "",
        description: "",
        price: "0",
        inventoryCount: "0",
        imageUrl: ""
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

  async function handleOrderProgress(orderId, step) {
    setBusyOrderId(orderId);

    try {
      const updated = await updateSellerOrderProgress(orderId, step, user);
      setOrders((current) =>
        current.map((order) => (order.id === orderId ? updated : order))
      );
      setStateMessage(`Order ${orderId} updated.`);
      notifications.success(
        step === "confirm"
          ? `Order ${orderId} was confirmed and moved to preparation.`
          : `Order ${orderId} is now ready for rider pickup.`,
        "Seller progress updated"
      );
    } catch (error) {
      setStateMessage(`Failed to update order: ${error.message}`);
      notifications.modalError(error.message, "Seller progress update failed");
    } finally {
      setBusyOrderId("");
    }
  }

  const openOrders = orders.filter((order) => order.status !== "delivered").length;

  return (
    <div className="layout">
      <PageTransition className="page-shell">
        <Navigation />
        <section className="seller-hero portal-hero">
          <div>
            <span className="eyebrow">Seller portal</span>
            <h1>See incoming orders without exposing the exact drop-off point.</h1>
            <p className="hero-copy">
              Sellers manage listings and monitor the full order queue here. The
              map shown for each order is approximate, so the seller can plan the
              area without seeing the rider-level destination coordinates.
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
                <article className="order-card portal-card skeleton-card" key={`seller-order-${index}`}>
                  <div className="skeleton-block skeleton-line short" />
                  <div className="skeleton-block skeleton-line" />
                  <div className="skeleton-block skeleton-map" />
                </article>
              ))
            ) : null}
            {orders.map((order) => {
              const approximateCoordinates =
                order.deliveryLocation?.approximateCoordinates;
              const mapEmbedLink = buildMapEmbedLink(approximateCoordinates);

              return (
                <article className="order-card portal-card" key={order.id}>
                  <div className="section-heading compact">
                    <div>
                      <span className="eyebrow">Order {order.id}</span>
                      <h3>{order.customerName}</h3>
                    </div>
                    <span className={`status-chip ${order.status}`}>{order.status}</span>
                  </div>
                  <p className="muted">{order.deliveryAddress}</p>
                  <p className="muted">
                    Approx. delivery area:{" "}
                    {formatApproximateCoordinates(approximateCoordinates)}
                  </p>
                  {mapEmbedLink ? (
                    <iframe
                      className="map-frame"
                      loading="lazy"
                      src={mapEmbedLink}
                      title={`Approximate map for ${order.id}`}
                    />
                  ) : null}
                  {order.deliveryLocation?.sellerMapLink ? (
                    <a
                      className="ghost-link"
                      href={order.deliveryLocation.sellerMapLink}
                      rel="noreferrer"
                      target="_blank"
                    >
                      Open approximate Google Maps view
                    </a>
                  ) : null}
                  <p className="muted">
                    Delivery: {order.deliveryStatus} | Total:{" "}
                    {formatMoney(order.currency, order.totalCents)}
                  </p>
                  <OrderProgress compact order={order} role="seller" />
                  <div className="delivery-actions">
                    <button
                      className="ghost-button"
                      disabled={busyOrderId === order.id || order.status !== "pending"}
                      onClick={() => handleOrderProgress(order.id, "confirm")}
                      type="button"
                    >
                      {busyOrderId === order.id && order.status === "pending"
                        ? "Updating..."
                        : "Confirm order"}
                    </button>
                    <button
                      className="primary-button"
                      disabled={
                        busyOrderId === order.id ||
                        order.status === "delivered" ||
                        order.deliveryStatus === "assigned" ||
                        order.deliveryStatus === "picked_up" ||
                        order.deliveryStatus === "in_transit" ||
                        order.deliveryStatus === "delivered"
                      }
                      onClick={() => handleOrderProgress(order.id, "ready_for_pickup")}
                      type="button"
                    >
                      {busyOrderId === order.id && order.deliveryStatus !== "assigned"
                        ? "Updating..."
                        : "Ready for pickup"}
                    </button>
                  </div>
                  <ul className="order-items">
                    {order.items.map((item) => (
                      <li key={`${order.id}-${item.productId}`}>
                        {item.title} x{item.quantity}
                      </li>
                    ))}
                  </ul>
                  <Link className="ghost-link" to={`/orders/${order.id}`}>
                    Open fulfillment view
                  </Link>
                </article>
              );
            })}
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
                  placeholder="https://..."
                  value={form.imageUrl}
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
              <span className="muted">{products.length} products</span>
            </div>
            <div className="inventory-grid">
              {products.map((product) => (
                <article className="inventory-card" key={product.id}>
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
                </article>
              ))}
            </div>
          </section>
        </div>
      </PageTransition>
    </div>
  );
}
