import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  cancelOrder,
  getOrders,
  updateDeliveryStatus,
  updateSellerOrderProgress
} from "../../api/client";
import { useAuth } from "../../auth/AuthContext";
import Navigation from "../../components/Navigation";
import PageTransition from "../../components/PageTransition";
import SmartImage from "../../components/SmartImage";
import { useNotifications } from "../../notifications/NotificationContext";

function formatMoney(currency, cents) {
  return `${currency} ${(cents / 100).toFixed(2)}`;
}

function getProcessState(order, role) {
  if (order.status === "cancelled" || order.deliveryStatus === "cancelled") {
    return {
      key: "cancelled",
      label: "Cancelled",
      description: order.cancellationReason
        ? `Reason: ${order.cancellationReason}`
        : "This order was cancelled.",
      className: "cancelled"
    };
  }

  if (order.status === "delivered" || order.deliveryStatus === "delivered") {
    return {
      key: "delivered",
      label: "Delivered",
      description: "The order has reached its destination.",
      className: "delivered"
    };
  }

  if (order.deliveryStatus === "in_transit" || order.status === "out_for_delivery") {
    return {
      key: "in_transit",
      label: role === "delivery" ? "Out for delivery" : "On the way",
      description: "The rider is currently travelling with the order.",
      className: "in_transit"
    };
  }

  if (order.deliveryStatus === "picked_up") {
    return {
      key: "picked_up",
      label: "Picked up",
      description: "The rider has collected the order from the seller.",
      className: "picked_up"
    };
  }

  if (order.deliveryStatus === "assigned") {
    return {
      key: "assigned",
      label: "Rider assigned",
      description: "A rider is assigned and the order is waiting for pickup.",
      className: "assigned"
    };
  }

  if (order.status === "processing") {
    return {
      key: "processing",
      label: "Preparing order",
      description: "The seller is collecting and packing the items.",
      className: "processing"
    };
  }

  return {
    key: "pending",
    label: "Waiting for confirmation",
    description: "The order is placed and waiting for seller confirmation.",
    className: "pending"
  };
}

function getJourney(order) {
  const stages = [
    {
      key: "pending",
      title: "Order placed",
      caption: "Received"
    },
    {
      key: "processing",
      title: "Seller preparing",
      caption: "Packing"
    },
    {
      key: "assigned",
      title: "Rider assigned",
      caption: "Matched"
    },
    {
      key: "picked_up",
      title: "Picked up",
      caption: "Collected"
    },
    {
      key: "in_transit",
      title: "On the way",
      caption: "Traveling"
    },
    {
      key: "delivered",
      title: "Delivered",
      caption: "Completed"
    }
  ];
  const current = getProcessState(order, "customer");
  const currentIndex = stages.findIndex((stage) => stage.key === current.key);

  return stages.map((stage, index) => ({
    ...stage,
    state: index < currentIndex ? "complete" : index === currentIndex ? "current" : "upcoming"
  }));
}

function canCancelOrder(order) {
  return !(
    order.status === "cancelled" ||
    order.status === "delivered" ||
    order.status === "out_for_delivery" ||
    order.deliveryStatus === "picked_up" ||
    order.deliveryStatus === "in_transit" ||
    order.deliveryStatus === "delivered" ||
    order.deliveryStatus === "cancelled"
  );
}

function cancellationReasonOptions(role) {
  if (role === "seller") {
    return [
      "Item out of stock",
      "Store cannot fulfill in time",
      "Store issue",
      "Pricing or listing issue",
      "Other"
    ];
  }

  return [
    "Changed my mind",
    "Ordered by mistake",
    "Need to change address",
    "Found another option",
    "Other"
  ];
}

export default function OrderDetailsPage() {
  const { orderId } = useParams();
  const { token, user } = useAuth();
  const notifications = useNotifications();
  const [order, setOrder] = useState(null);
  const [stateMessage, setStateMessage] = useState("Loading order...");
  const [cancelReason, setCancelReason] = useState("");
  const [cancelNote, setCancelNote] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);
  const [isUpdatingProgress, setIsUpdatingProgress] = useState(false);
  const backLink = user?.role === "seller" ? "/seller" : user?.role === "delivery" ? "/delivery" : "/profile";
  const backLabel =
    user?.role === "seller"
      ? "Back to seller portal"
      : user?.role === "delivery"
        ? "Back to delivery portal"
        : "Back to profile";

  useEffect(() => {
    if (!user) {
      return;
    }

    let isMounted = true;
    setStateMessage("Loading order...");

    getOrders(token)
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
  }, [notifications, orderId, token, user]);

  const currentState = useMemo(
    () => (order ? getProcessState(order, user?.role || "customer") : null),
    [order, user?.role]
  );
  const journey = useMemo(() => (order ? getJourney(order) : []), [order]);
  const canCancel = order && user && ["customer", "seller"].includes(user.role) && canCancelOrder(order);
  const canSellerConfirm =
    user?.role === "seller" &&
    order &&
    order.status === "pending" &&
    order.status !== "cancelled";
  const canSellerMarkReady =
    user?.role === "seller" &&
    order &&
    order.status !== "delivered" &&
    order.status !== "cancelled" &&
    order.deliveryStatus !== "assigned" &&
    order.deliveryStatus !== "picked_up" &&
    order.deliveryStatus !== "in_transit" &&
    order.deliveryStatus !== "delivered" &&
    order.deliveryStatus !== "cancelled";
  const canDeliveryPickUp =
    user?.role === "delivery" &&
    Boolean(order?.deliveryTaskId) &&
    order.status !== "cancelled" &&
    order.status !== "delivered" &&
    order.deliveryStatus === "assigned";
  const canDeliveryStartTransit =
    user?.role === "delivery" &&
    Boolean(order?.deliveryTaskId) &&
    order.status !== "cancelled" &&
    order.status !== "delivered" &&
    order.deliveryStatus === "picked_up";
  const canDeliveryComplete =
    user?.role === "delivery" &&
    Boolean(order?.deliveryTaskId) &&
    order.status !== "cancelled" &&
    order.status !== "delivered" &&
    order.deliveryStatus === "in_transit";

  async function handleSellerProgress(step) {
    if (!order) {
      return;
    }

    setIsUpdatingProgress(true);

    try {
      const updated = await updateSellerOrderProgress(order.id, step, token);
      setOrder(updated);
      notifications.success(
        step === "confirm"
          ? "The order was confirmed and moved into preparation."
          : "The order is now marked ready for pickup.",
        "Order updated"
      );
    } catch (error) {
      notifications.modalError(error.message, "Order update failed");
    } finally {
      setIsUpdatingProgress(false);
    }
  }

  async function handleDeliveryProgress(nextStatus) {
    if (!order?.deliveryTaskId) {
      return;
    }

    setIsUpdatingProgress(true);

    try {
      const updatedTask = await updateDeliveryStatus(order.deliveryTaskId, nextStatus, token);
      setOrder(updatedTask.order);
      notifications.success(
        nextStatus === "picked_up"
          ? "The order was marked as picked up."
          : nextStatus === "in_transit"
            ? "The order is now on the way."
            : "The order was marked as delivered.",
        "Delivery updated"
      );
    } catch (error) {
      notifications.modalError(error.message, "Delivery update failed");
    } finally {
      setIsUpdatingProgress(false);
    }
  }

  async function handleCancelOrder(event) {
    event.preventDefault();

    if (!cancelReason) {
      notifications.modalWarning("Select a reason before cancelling the order.", "Cancellation reason needed");
      return;
    }

    setIsCancelling(true);

    try {
      const updated = await cancelOrder(order.id, cancelReason, cancelNote, token);
      setOrder(updated);
      notifications.modalSuccess(
        "The order was cancelled and the reason has been recorded.",
        "Order cancelled"
      );
    } catch (error) {
      notifications.modalError(error.message, "Cancellation failed");
    } finally {
      setIsCancelling(false);
    }
  }

  return (
    <div className="layout">
      <PageTransition className="page-shell">
        <Navigation />
        {!order ? (
          <section className="page-card">
            <div className="section-heading">
              <div>
                <span className="eyebrow">Order</span>
                <h2>{stateMessage}</h2>
              </div>
              <Link className="ghost-link" to={backLink}>
                {backLabel}
              </Link>
            </div>
          </section>
        ) : (
          <>
            <section className="page-card order-detail-header">
              <div className="section-heading">
                <div>
                  <span className="eyebrow">Order</span>
                  <h2>{order.id}</h2>
                </div>
                <Link className="ghost-link" to={backLink}>
                  {backLabel}
                </Link>
              </div>
              <div className="order-live-grid">
                <article className="order-live-card order-live-current">
                  <span className="eyebrow">Current state</span>
                  <strong>{currentState.label}</strong>
                  <p>{currentState.description}</p>
                  <span className={`status-chip ${currentState.className}`}>{currentState.label}</span>
                </article>
                <article className="order-live-card">
                  <span className="eyebrow">Delivery rider</span>
                  <strong>{order.riderName || "Waiting for rider assignment"}</strong>
                  <p>
                    {order.riderName
                      ? "Your order is linked to this delivery partner right now."
                      : "A delivery partner will appear here once the order is assigned."}
                  </p>
                </article>
                <article className="order-live-card">
                  <span className="eyebrow">Delivery address</span>
                  <strong>{order.recipientName || order.customerName}</strong>
                  <p>{order.deliveryAddress}</p>
                </article>
              </div>
            </section>

            <section className="page-card">
              <div className="section-heading compact">
                <div>
                  <span className="eyebrow">Live process</span>
                  <h3>Current journey</h3>
                </div>
              </div>
              {currentState.key === "cancelled" ? (
                <div className="cancelled-order-panel">
                  <span className="status-chip cancelled">Cancelled</span>
                  <strong>
                    {order.cancelledByRole
                      ? `Cancelled by ${order.cancelledByRole}`
                      : "Order cancelled"}
                  </strong>
                  <p>{order.cancellationReason || "No cancellation reason was recorded."}</p>
                  {order.cancellationNote ? <p className="muted">{order.cancellationNote}</p> : null}
                </div>
              ) : (
                <div className="journey-rail" aria-label="Current order process">
                  {journey.map((stage) => (
                    <article className={`journey-node ${stage.state}`} key={stage.key}>
                      <div className="journey-dot" />
                      <strong>{stage.caption}</strong>
                      <span>{stage.title}</span>
                    </article>
                  ))}
                </div>
              )}
            </section>

            {user?.role === "seller" ? (
              <section className="page-card">
                <div className="section-heading compact">
                  <div>
                    <span className="eyebrow">Fulfillment</span>
                    <h3>Update order status</h3>
                  </div>
                </div>
                <div className="detail-actions">
                  <button
                    className="ghost-button"
                    disabled={!canSellerConfirm || isUpdatingProgress}
                    onClick={() => handleSellerProgress("confirm")}
                    type="button"
                  >
                    {isUpdatingProgress && canSellerConfirm ? "Updating..." : "Confirm order"}
                  </button>
                  <button
                    className="primary-button"
                    disabled={!canSellerMarkReady || isUpdatingProgress}
                    onClick={() => handleSellerProgress("ready_for_pickup")}
                    type="button"
                  >
                    {isUpdatingProgress && canSellerMarkReady ? "Updating..." : "Ready for pickup"}
                  </button>
                </div>
              </section>
            ) : null}

            {user?.role === "delivery" ? (
              <section className="page-card">
                <div className="section-heading compact">
                  <div>
                    <span className="eyebrow">Delivery</span>
                    <h3>Update delivery status</h3>
                  </div>
                </div>
                <div className="detail-actions">
                  <button
                    className="ghost-button"
                    disabled={!canDeliveryPickUp || isUpdatingProgress}
                    onClick={() => handleDeliveryProgress("picked_up")}
                    type="button"
                  >
                    {isUpdatingProgress && canDeliveryPickUp ? "Updating..." : "Picked up"}
                  </button>
                  <button
                    className="ghost-button"
                    disabled={!canDeliveryStartTransit || isUpdatingProgress}
                    onClick={() => handleDeliveryProgress("in_transit")}
                    type="button"
                  >
                    {isUpdatingProgress && canDeliveryStartTransit ? "Updating..." : "In transit"}
                  </button>
                  <button
                    className="primary-button"
                    disabled={!canDeliveryComplete || isUpdatingProgress}
                    onClick={() => handleDeliveryProgress("delivered")}
                    type="button"
                  >
                    {isUpdatingProgress && canDeliveryComplete ? "Updating..." : "Delivered"}
                  </button>
                </div>
              </section>
            ) : null}

            {user && ["customer", "seller"].includes(user.role) ? (
              <section className="page-card">
                <div className="section-heading compact">
                  <div>
                    <span className="eyebrow">Cancellation</span>
                    <h3>{order.status === "cancelled" ? "Cancellation details" : "Cancel this order"}</h3>
                  </div>
                </div>
                {order.status === "cancelled" ? (
                  <div className="cancelled-order-panel">
                    <span className="status-chip cancelled">Cancelled</span>
                    <strong>
                      {order.cancelledByRole
                        ? `Cancelled by ${order.cancelledByRole}`
                        : "Order cancelled"}
                    </strong>
                    <p>{order.cancellationReason || "No cancellation reason was recorded."}</p>
                    {order.cancellationNote ? <p className="muted">{order.cancellationNote}</p> : null}
                  </div>
                ) : canCancel ? (
                  <form className="stack cancellation-form" onSubmit={handleCancelOrder}>
                    <label>
                      Reason
                      <select
                        onChange={(event) => setCancelReason(event.target.value)}
                        value={cancelReason}
                      >
                        <option value="">Select a reason</option>
                        {cancellationReasonOptions(user.role).map((reason) => (
                          <option key={reason} value={reason}>
                            {reason}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Extra note
                      <textarea
                        onChange={(event) => setCancelNote(event.target.value)}
                        rows="3"
                        value={cancelNote}
                      />
                    </label>
                    <div className="detail-actions">
                      <button className="danger-button ghost-button" disabled={isCancelling} type="submit">
                        {isCancelling ? "Cancelling..." : "Cancel order"}
                      </button>
                    </div>
                  </form>
                ) : (
                  <p className="muted">
                    This order can no longer be cancelled because it is already too far into fulfillment.
                  </p>
                )}
              </section>
            ) : null}

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
                    <span className="eyebrow">Store and rider</span>
                    <strong>{order.sellerName}</strong>
                    <span className="muted">
                      {order.riderName ? `Rider: ${order.riderName}` : "Rider not assigned yet"}
                    </span>
                  </div>
                  {order.status === "cancelled" ? (
                    <div className="checkout-fixed-row cancellation-summary-row">
                      <span className="eyebrow">Cancellation</span>
                      <strong>{order.cancellationReason || "Cancelled order"}</strong>
                      <span className="muted">
                        {order.cancelledByRole
                          ? `Cancelled by ${order.cancelledByRole}`
                          : "Cancellation source not recorded"}
                      </span>
                      {order.cancellationNote ? (
                        <span className="muted">{order.cancellationNote}</span>
                      ) : null}
                    </div>
                  ) : null}
                  <div className="checkout-fixed-row">
                    <span className="eyebrow">Notes</span>
                    <strong>{order.notes || "No additional notes"}</strong>
                    <span className="muted">Order total: {formatMoney(order.currency, order.totalCents)}</span>
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
