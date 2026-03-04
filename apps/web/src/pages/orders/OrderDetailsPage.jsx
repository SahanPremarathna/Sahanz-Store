import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getOrders } from "../../api/client";
import { useAuth } from "../../auth/AuthContext";
import Navigation from "../../components/Navigation";
import OrderProgress from "../../components/OrderProgress";
import PageTransition from "../../components/PageTransition";
import SmartImage from "../../components/SmartImage";
import { useNotifications } from "../../notifications/NotificationContext";

function formatMoney(currency, cents) {
  return `${currency} ${(cents / 100).toFixed(2)}`;
}

export default function OrderDetailsPage() {
  const { orderId } = useParams();
  const { user } = useAuth();
  const notifications = useNotifications();
  const [order, setOrder] = useState(null);
  const [stateMessage, setStateMessage] = useState("Loading order...");

  useEffect(() => {
    if (!user) {
      return;
    }

    let isMounted = true;
    setStateMessage("Loading order...");

    getOrders(user)
      .then((orders) => {
        if (!isMounted) {
          return;
        }

        const matched = orders.find((entry) => entry.id === orderId) || null;
        setOrder(matched);
        setStateMessage(matched ? "" : "Order not found.");
      })
      .catch((error) => {
        if (!isMounted) {
          return;
        }

        setStateMessage(`Failed to load order: ${error.message}`);
        notifications.error(error.message, "Order load failed");
      });

    return () => {
      isMounted = false;
    };
  }, [notifications, orderId, user]);

  return (
    <div className="layout">
      <PageTransition className="page-shell">
        <Navigation />
        {!order ? (
          <section className="page-card">
            <div className="section-heading">
              <div>
                <span className="eyebrow">Order tracking</span>
                <h2>{stateMessage}</h2>
              </div>
              <Link className="ghost-link" to="/profile">
                Back to profile
              </Link>
            </div>
          </section>
        ) : (
          <>
            <section className="seller-hero portal-hero">
              <div>
                <span className="eyebrow">Order {order.id}</span>
                <h1>Track progress and inspect every handoff step.</h1>
                <p className="hero-copy">
                  {user.role === "seller"
                    ? "Monitor fulfillment from confirmation through rider handoff and final delivery."
                    : user.role === "delivery"
                      ? "See pickup readiness, handoff state, and delivery progress for this task."
                      : "Follow each progress stage from seller confirmation to final delivery."}
                </p>
              </div>
              <div className="portal-summary">
                <div className="metric-strip">
                  <article className="metric-card">
                    <span className="eyebrow">Order status</span>
                    <strong className="metric-compact">{order.status}</strong>
                  </article>
                  <article className="metric-card">
                    <span className="eyebrow">Delivery status</span>
                    <strong className="metric-compact">{order.deliveryStatus}</strong>
                  </article>
                </div>
              </div>
            </section>

            <section className="page-card">
              <div className="section-heading">
                <div>
                  <span className="eyebrow">Progress</span>
                  <h2>Order journey</h2>
                </div>
              </div>
              <OrderProgress order={order} role={user.role} />
            </section>

            <div className="checkout-page-grid">
              <section className="page-card">
                <div className="section-heading">
                  <div>
                    <span className="eyebrow">Details</span>
                    <h2>Order information</h2>
                  </div>
                </div>
                <div className="stack">
                  <div className="checkout-fixed-row">
                    <span className="eyebrow">Recipient</span>
                    <strong>{order.recipientName || order.customerName}</strong>
                    <span className="muted">{order.deliveryAddress}</span>
                  </div>
                  <div className="checkout-fixed-row">
                    <span className="eyebrow">Notes</span>
                    <strong>{order.notes || "No additional notes"}</strong>
                    <span className="muted">
                      Seller: {order.sellerName} | Customer: {order.customerName}
                    </span>
                  </div>
                </div>
              </section>

              <section className="page-card">
                <div className="section-heading">
                  <div>
                    <span className="eyebrow">Items</span>
                    <h2>Ordered products</h2>
                  </div>
                </div>
                <div className="stack">
                  {order.items.map((item) => (
                    <div className="checkout-order-item" key={`${order.id}-${item.productId}`}>
                      <div className="checkout-order-main">
                        <SmartImage
                          alt={item.title}
                          className="checkout-order-thumb"
                          src={item.imageUrl}
                        />
                        <div>
                          <strong>{item.title}</strong>
                          <p className="muted">
                            {formatMoney(order.currency, item.priceCents)} each
                          </p>
                        </div>
                      </div>
                      <div className="checkout-order-meta">
                        <span>x{item.quantity}</span>
                        <strong>
                          {formatMoney(order.currency, item.priceCents * item.quantity)}
                        </strong>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </>
        )}
      </PageTransition>
    </div>
  );
}
