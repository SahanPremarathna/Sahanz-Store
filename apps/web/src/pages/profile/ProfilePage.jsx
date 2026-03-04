import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getOrders } from "../../api/client";
import Navigation from "../../components/Navigation";
import SmartImage from "../../components/SmartImage";
import PageTransition from "../../components/PageTransition";
import { useAuth } from "../../auth/AuthContext";
import { useNotifications } from "../../notifications/NotificationContext";
import OrderProgress from "../../components/OrderProgress";

function createFormState(user) {
  return {
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    address: user?.address || "",
    businessName: user?.businessName || "",
    businessAddress: user?.businessAddress || "",
    serviceArea: user?.serviceArea || "",
    vehicleType: user?.vehicleType || "",
    profileNote: user?.profileNote || "",
    avatarUrl: user?.avatarUrl || ""
  };
}

function roleHeading(role) {
  if (role === "seller") {
    return "Store profile";
  }

  if (role === "delivery") {
    return "Rider profile";
  }

  return "Customer profile";
}

function normalizeOrdersFromProfile(profile) {
  return Array.isArray(profile?.recentOrders) ? profile.recentOrders : null;
}

export default function ProfilePage() {
  const { loading, refreshProfile, saveProfile, user } = useAuth();
  const notifications = useNotifications();
  const [form, setForm] = useState(createFormState(user));
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState("Loading profile...");
  const [ordersStatus, setOrdersStatus] = useState("Loading orders...");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) {
      return;
    }

    let isMounted = true;
    setStatus("Loading profile...");
    setOrdersStatus("Loading orders...");

    refreshProfile(user)
      .then((profile) => {
        if (!isMounted || !profile) {
          return;
        }

        setForm(createFormState(profile));
        setStatus("");

        const embeddedOrders = normalizeOrdersFromProfile(profile);

        if (embeddedOrders) {
          setOrders(embeddedOrders);
          setOrdersStatus(embeddedOrders.length ? "" : "No related orders yet.");
          return;
        }

        return getOrders(profile).then((loadedOrders) => {
          if (!isMounted) {
            return;
          }

          setOrders(loadedOrders);
          setOrdersStatus(loadedOrders.length ? "" : "No related orders yet.");
        });
      })
      .catch((error) => {
        if (!isMounted) {
          return;
        }

        setStatus(`Failed to load profile: ${error.message}`);
        notifications.error(error.message, "Profile load failed");

        getOrders(user)
          .then((loadedOrders) => {
            if (!isMounted) {
              return;
            }

            setOrders(loadedOrders);
            setOrdersStatus(loadedOrders.length ? "" : "No related orders yet.");
          })
          .catch((ordersError) => {
            if (!isMounted) {
              return;
            }

            setOrders([]);
            setOrdersStatus(`Failed to load orders: ${ordersError.message}`);
            notifications.error(ordersError.message, "Orders load failed");
          });
      });

    return () => {
      isMounted = false;
    };
  }, [refreshProfile, user]);

  useEffect(() => {
    setForm(createFormState(user));
    const embeddedOrders = normalizeOrdersFromProfile(user);

    if (embeddedOrders) {
      setOrders(embeddedOrders);
      setOrdersStatus(embeddedOrders.length ? "" : "No related orders yet.");
    }
  }, [user]);

  function updateField(key, value) {
    setForm((current) => ({
      ...current,
      [key]: value
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);

    try {
      const profile = await saveProfile(form);
      setForm(createFormState(profile));
      setStatus("Profile saved.");
      notifications.modalSuccess(
        `${roleHeading(profile.role)} details were updated successfully.`,
        "Profile updated"
      );
    } catch (error) {
      setStatus(`Profile update failed: ${error.message}`);
      notifications.modalError(error.message, "Profile update failed");
    } finally {
      setSaving(false);
    }
  }

  if (loading || !user) {
    return (
      <div className="layout">
        <PageTransition className="page-shell">
          <Navigation />
          <section className="page-card">
            <div className="loading-detail">
              <div className="skeleton-block skeleton-line short" />
              <div className="skeleton-block skeleton-line" />
              <div className="skeleton-block skeleton-line medium" />
            </div>
          </section>
        </PageTransition>
      </div>
    );
  }

  return (
    <div className="layout">
      <PageTransition className="page-shell">
        <Navigation />
        <section className="seller-hero portal-hero">
          <div className="profile-hero">
            <SmartImage
              alt={user.name}
              className="profile-avatar"
              src={user.avatarUrl}
            />
            <div>
              <span className="eyebrow">Profile</span>
              <h1>{roleHeading(user.role)} details.</h1>
              <p className="hero-copy">
                {user.role === "seller"
                  ? "Store accounts can manage business identity, coverage area, and seller-facing contact details."
                  : user.role === "delivery"
                    ? "Rider accounts can manage delivery contact details, service area, vehicle info, and operational notes."
                    : "Customers can manage contact details, default address, and delivery notes."}
              </p>
            </div>
          </div>
          <div className="portal-summary">
            <span className="pill">{status || "Profile ready"}</span>
            <div className="metric-strip">
              <article className="metric-card">
                <span className="eyebrow">Role</span>
                <strong>{user.role}</strong>
              </article>
              <article className="metric-card">
                <span className="eyebrow">Email</span>
                <strong className="metric-compact">{user.email}</strong>
              </article>
            </div>
          </div>
        </section>

        <section className="page-card">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Orders</span>
              <h2>
                {user.role === "customer"
                  ? "Recent orders"
                  : user.role === "seller"
                    ? "Recent store orders"
                    : "Recent assigned orders"}
              </h2>
            </div>
            <span className="muted">{orders.length} orders</span>
          </div>
          {ordersStatus ? <p className="muted">{ordersStatus}</p> : null}
          {orders.length ? (
            <div className="stack">
              {orders.map((order) => (
                <article className="page-card inset-card" key={order.id}>
                  <div className="section-heading compact">
                    <div>
                      <h3>{order.id}</h3>
                      <p className="muted">{order.deliveryAddress}</p>
                    </div>
                    <div className="stack">
                      <span className={`status-chip ${order.status}`}>{order.status}</span>
                      <Link className="ghost-link" to={`/orders/${order.id}`}>
                        View progress
                      </Link>
                    </div>
                  </div>
                  <OrderProgress compact order={order} role={user.role} />
                </article>
              ))}
            </div>
          ) : (
            <p className="muted">No related orders yet.</p>
          )}
        </section>

        <section className="page-card">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Settings</span>
              <h2>Update your profile</h2>
            </div>
          </div>
          <form className="stack form-grid profile-form" onSubmit={handleSubmit}>
            <label>
              Profile photo URL
              <input
                onChange={(event) => updateField("avatarUrl", event.target.value)}
                value={form.avatarUrl}
              />
            </label>
            <label>
              {user.role === "seller" ? "Manager / owner name" : "Full name"}
              <input
                onChange={(event) => updateField("name", event.target.value)}
                value={form.name}
              />
            </label>
            <label>
              Email
              <input
                onChange={(event) => updateField("email", event.target.value)}
                type="email"
                value={form.email}
              />
            </label>
            <label>
              Phone
              <input
                onChange={(event) => updateField("phone", event.target.value)}
                value={form.phone}
              />
            </label>

            {user.role === "customer" ? (
              <label>
                Default delivery address
                <textarea
                  onChange={(event) => updateField("address", event.target.value)}
                  rows="3"
                  value={form.address}
                />
              </label>
            ) : null}

            {user.role === "seller" ? (
              <>
                <label>
                  Store name
                  <input
                    onChange={(event) => updateField("businessName", event.target.value)}
                    value={form.businessName}
                  />
                </label>
                <label>
                  Store address
                  <textarea
                    onChange={(event) =>
                      updateField("businessAddress", event.target.value)
                    }
                    rows="3"
                    value={form.businessAddress}
                  />
                </label>
                <label>
                  Service area
                  <input
                    onChange={(event) => updateField("serviceArea", event.target.value)}
                    value={form.serviceArea}
                  />
                </label>
              </>
            ) : null}

            {user.role === "delivery" ? (
              <>
                <label>
                  Vehicle type
                  <input
                    onChange={(event) => updateField("vehicleType", event.target.value)}
                    value={form.vehicleType}
                  />
                </label>
                <label>
                  Delivery zone
                  <input
                    onChange={(event) => updateField("serviceArea", event.target.value)}
                    value={form.serviceArea}
                  />
                </label>
              </>
            ) : null}

            <label>
              {user.role === "seller"
                ? "Store note"
                : user.role === "delivery"
                  ? "Rider note"
                  : "Delivery note"}
              <textarea
                onChange={(event) => updateField("profileNote", event.target.value)}
                rows="4"
                value={form.profileNote}
              />
            </label>

            <div className="profile-actions">
              <button
                className={`primary-button ${saving ? "is-loading" : ""}`}
                disabled={saving}
                type="submit"
              >
                {saving ? "Saving..." : "Save profile"}
              </button>
            </div>
          </form>
        </section>
      </PageTransition>
    </div>
  );
}
