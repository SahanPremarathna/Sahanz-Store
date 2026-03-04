import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navigation from "../../components/Navigation";
import { useAuth } from "../../auth/AuthContext";
import OrderProgress from "../../components/OrderProgress";
import PageTransition from "../../components/PageTransition";
import { getDeliveries, updateDeliveryStatus } from "../../api/client";
import { useNotifications } from "../../notifications/NotificationContext";

function formatCoordinates(coordinates) {
  if (!coordinates) {
    return "No exact coordinates attached";
  }

  return `${coordinates.latitude.toFixed(6)}, ${coordinates.longitude.toFixed(6)}`;
}

function buildMapEmbedLink(coordinates) {
  if (!coordinates) {
    return null;
  }

  return `https://www.google.com/maps?q=${coordinates.latitude},${coordinates.longitude}&z=17&output=embed`;
}

export default function DeliveryDashboard() {
  const { user } = useAuth();
  const notifications = useNotifications();
  const [deliveries, setDeliveries] = useState([]);
  const [statusMessage, setStatusMessage] = useState("Loading delivery queue...");
  const [currentLocation, setCurrentLocation] = useState(null);
  const [busyDeliveryId, setBusyDeliveryId] = useState("");

  useEffect(() => {
    if (!user) {
      return;
    }

    let isMounted = true;

    getDeliveries(user)
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
  }, [notifications, user]);

  async function handleStatusChange(deliveryId, nextStatus) {
    setBusyDeliveryId(deliveryId);

    try {
      const updated = await updateDeliveryStatus(deliveryId, nextStatus, user);
      setDeliveries((current) =>
        current.map((delivery) =>
          delivery.id === deliveryId ? updated : delivery
        )
      );
      setStatusMessage(`Delivery ${deliveryId} marked ${nextStatus}.`);
      if (nextStatus === "delivered") {
        notifications.modalSuccess(
          `Delivery ${deliveryId} was completed successfully.`,
          "Delivery completed",
          [
            {
              label: "Close",
              variant: "primary"
            }
          ]
        );
      } else {
        notifications.success(
          `Delivery ${deliveryId} was marked ${nextStatus.replace(/_/g, " ")}.`,
          "Delivery updated"
        );
      }
    } catch (error) {
      setStatusMessage(`Failed to update delivery: ${error.message}`);
      notifications.modalError(error.message, "Delivery update failed");
    } finally {
      setBusyDeliveryId("");
    }
  }

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
            <h1>Riders get the exact coordinates and a live route to the drop-off.</h1>
            <p className="hero-copy">
              This portal exposes the precise destination coordinates, order
              contents, and direct Google Maps navigation from the rider's
              current position to the delivery point.
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
              const exactCoordinates =
                delivery.order?.deliveryLocation?.exactCoordinates;
              const mapEmbedLink = buildMapEmbedLink(exactCoordinates);
              const isWaitingForSeller =
                delivery.order?.deliveryStatus === "awaiting_assignment";
              const isPickedUp = delivery.status === "picked_up";
              const isInTransit = delivery.status === "in_transit";
              const isDelivered = delivery.status === "delivered";

              return (
                <article className="delivery-card portal-card" key={delivery.id}>
                  <div className="section-heading compact">
                    <div>
                      <span className="eyebrow">Task {delivery.id}</span>
                      <h2>{delivery.order?.customerName || "Unknown order"}</h2>
                    </div>
                    <span className={`status-chip ${delivery.status}`}>
                      {delivery.status}
                    </span>
                  </div>
                  <p>{delivery.order?.deliveryAddress}</p>
                  <p className="muted">
                    Exact coordinates: {formatCoordinates(exactCoordinates)}
                  </p>
                  {mapEmbedLink ? (
                    <iframe
                      className="map-frame"
                      loading="lazy"
                      src={mapEmbedLink}
                      title={`Exact map for ${delivery.id}`}
                    />
                  ) : null}
                  <div className="inline-actions">
                    {delivery.order?.deliveryLocation?.deliveryMapLink ? (
                      <a
                        className="ghost-link"
                        href={delivery.order.deliveryLocation.deliveryMapLink}
                        rel="noreferrer"
                        target="_blank"
                      >
                        Open exact Google Maps view
                      </a>
                    ) : null}
                    <button
                      className="ghost-button"
                      onClick={() => openNavigation(exactCoordinates)}
                      type="button"
                    >
                      Navigate from current location
                    </button>
                    {delivery.order ? (
                      <Link className="ghost-link" to={`/orders/${delivery.order.id}`}>
                        Open delivery progress
                      </Link>
                    ) : null}
                  </div>
                  {delivery.order ? (
                    <OrderProgress compact order={delivery.order} role="delivery" />
                  ) : null}
                  {isWaitingForSeller ? (
                    <p className="muted">
                      Waiting for the seller to confirm and hand off this order.
                    </p>
                  ) : null}
                  <ul className="order-items">
                    {(delivery.order?.items || []).map((item) => (
                      <li key={`${delivery.id}-${item.productId}`}>
                        {item.title} x{item.quantity}
                      </li>
                    ))}
                  </ul>
                  <div className="delivery-actions">
                    <button
                      className="ghost-button"
                      disabled={
                        busyDeliveryId === delivery.id ||
                        isWaitingForSeller ||
                        isPickedUp ||
                        isInTransit ||
                        isDelivered
                      }
                      onClick={() => handleStatusChange(delivery.id, "picked_up")}
                      type="button"
                    >
                      {busyDeliveryId === delivery.id ? "Updating..." : "Picked up"}
                    </button>
                    <button
                      className="ghost-button"
                      disabled={
                        busyDeliveryId === delivery.id ||
                        !isPickedUp ||
                        isInTransit ||
                        isDelivered
                      }
                      onClick={() => handleStatusChange(delivery.id, "in_transit")}
                      type="button"
                    >
                      In transit
                    </button>
                    <button
                      className="primary-button"
                      disabled={
                        busyDeliveryId === delivery.id || !isInTransit || isDelivered
                      }
                      onClick={() => handleStatusChange(delivery.id, "delivered")}
                      type="button"
                    >
                      Delivered
                    </button>
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
