import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navigation from "../../components/Navigation";
import { useAuth } from "../../auth/AuthContext";
import PageTransition from "../../components/PageTransition";
import { getDeliveries } from "../../api/client";
import { useNotifications } from "../../notifications/NotificationContext";

function formatCoordinates(coordinates) {
  if (!coordinates) {
    return "No exact coordinates attached";
  }

  return `${coordinates.latitude.toFixed(6)}, ${coordinates.longitude.toFixed(6)}`;
}

function getDeliveryStateText(delivery) {
  if (!delivery.order) {
    return "Order details are not available for this task.";
  }

  if (
    delivery.order.status === "cancelled" ||
    delivery.order.deliveryStatus === "cancelled"
  ) {
    const reason = delivery.order.cancellationReason
      ? `Reason: ${delivery.order.cancellationReason}`
      : "Order cancelled";
    return `${reason}${delivery.order.cancellationNote ? ` | ${delivery.order.cancellationNote}` : ""}`;
  }

  if (delivery.order.deliveryStatus === "awaiting_assignment") {
    return "Waiting for the seller to hand the order over.";
  }

  return `Delivery: ${delivery.status.replace(/_/g, " ")} | Order: ${delivery.order.deliveryStatus.replace(/_/g, " ")}`;
}

export default function DeliveryDashboard() {
  const { token, user } = useAuth();
  const notifications = useNotifications();
  const [deliveries, setDeliveries] = useState([]);
  const [statusMessage, setStatusMessage] = useState("Loading delivery queue...");
  const [currentLocation, setCurrentLocation] = useState(null);

  useEffect(() => {
    if (!user) {
      return;
    }

    let isMounted = true;

    getDeliveries(token)
      .then((data) => {
        if (isMounted) {
          setDeliveries(data);
          setStatusMessage(data.length ? "" : "No active deliveries.");
        }
      })
      .catch((error) => {
        if (isMounted) {
          setStatusMessage(`Failed to load deliveries: ${error.message}`);
          notifications.error(error.message, "Delivery queue load failed");
        }
      });

    return () => {
      isMounted = false;
    };
  }, [notifications, token, user]);

  function captureCurrentLocation() {
    if (!navigator.geolocation) {
      setStatusMessage("Geolocation is not available in this browser.");
      notifications.error("This browser does not support geolocation.", "Location unavailable");
      return;
    }

    setStatusMessage("Fetching the rider's current location...");
    notifications.info("Trying to capture the rider's current origin.", "Location request");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCurrentLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
        setStatusMessage("Current rider location captured.");
        notifications.success("Current rider location captured.", "Location captured");
      },
      () => {
        setStatusMessage("Could not access the rider's current location.");
        notifications.error("Could not access the rider's current location.", "Location failed");
      },
      {
        enableHighAccuracy: true,
        timeout: 10000
      }
    );
  }

  function openNavigation(destinationCoordinates) {
    if (!destinationCoordinates) {
      setStatusMessage("No delivery coordinates attached to this order.");
      notifications.warning(
        "This order does not have exact destination coordinates yet.",
        "Navigation unavailable"
      );
      return;
    }

    const destination = `${destinationCoordinates.latitude},${destinationCoordinates.longitude}`;
    const url = currentLocation
      ? `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
          `${currentLocation.latitude},${currentLocation.longitude}`
        )}&destination=${encodeURIComponent(destination)}`
      : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
          destination
        )}`;

    window.open(url, "_blank", "noopener,noreferrer");
    notifications.info(
      "Google Maps navigation opened in a new tab.",
      "Navigation started"
    );
  }

  return (
    <div className="layout">
      <PageTransition className="page-shell">
        <Navigation />
        <section className="seller-hero portal-hero">
          <div>
            <span className="eyebrow">Delivery portal</span>
            <h1>Assigned drops in one compact delivery queue.</h1>
            <p className="hero-copy">
              Keep the queue light here, then open each order to update the live delivery state.
            </p>
          </div>
          <div className="portal-summary">
            <span className="pill">{statusMessage || "Delivery queue live"}</span>
            <div className="stack">
              <button className="ghost-button" onClick={captureCurrentLocation} type="button">
                Capture current rider location
              </button>
              <span className="muted">
                Current origin: {formatCoordinates(currentLocation)}
              </span>
            </div>
          </div>
        </section>

        <section className="page-card">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Assigned tasks</span>
              <h2>Delivery queue</h2>
            </div>
            <span className="muted">{deliveries.length} active tasks</span>
          </div>
          <div className="portal-grid">
            {!deliveries.length && statusMessage.startsWith("Loading") ? (
              Array.from({ length: 3 }).map((_, index) => (
                <article className="delivery-card portal-card skeleton-card" key={`delivery-skeleton-${index}`}>
                  <div className="skeleton-block skeleton-line short" />
                  <div className="skeleton-block skeleton-line" />
                  <div className="skeleton-block skeleton-map" />
                </article>
              ))
            ) : null}
            {deliveries.map((delivery) => {
              const exactCoordinates = delivery.order?.deliveryLocation?.exactCoordinates;

              return (
                <article className="order-card portal-card seller-stream-card" key={delivery.id}>
                  <div className="section-heading compact">
                    <div>
                      <span className="eyebrow">Task {delivery.id}</span>
                      <h3>{delivery.order?.customerName || "Unknown order"}</h3>
                    </div>
                    <span className={`status-chip ${delivery.status}`}>
                      {delivery.status}
                    </span>
                  </div>
                  <p className="muted">
                    Recipient: {delivery.order?.recipientName || delivery.order?.customerName || "Unknown"}
                  </p>
                  <p className="muted">{delivery.order?.deliveryAddress || "No address attached"}</p>
                  <p className="muted">{getDeliveryStateText(delivery)}</p>
                  <div className="seller-stream-meta">
                    <span>Coordinates: {formatCoordinates(exactCoordinates)}</span>
                    <span>{delivery.order?.items?.length || 0} items</span>
                  </div>
                  <div className="inline-actions compact-order-links">
                    <button
                      className="ghost-button"
                      onClick={() => openNavigation(exactCoordinates)}
                      type="button"
                    >
                      Navigate from current location
                    </button>
                    {delivery.order?.deliveryLocation?.deliveryMapLink ? (
                      <a
                        className="ghost-link"
                        href={delivery.order.deliveryLocation.deliveryMapLink}
                        rel="noreferrer"
                        target="_blank"
                      >
                        Open exact map
                      </a>
                    ) : null}
                    {delivery.order ? (
                      <Link className="ghost-link" to={`/orders/${delivery.order.id}`}>
                        Open fulfillment view
                      </Link>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </PageTransition>
    </div>
  );
}
