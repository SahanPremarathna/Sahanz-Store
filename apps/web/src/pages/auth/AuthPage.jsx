import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { useNotifications } from "../../notifications/NotificationContext";

function getPortalPath(role) {
  if (role === "seller") {
    return "/seller";
  }

  if (role === "delivery") {
    return "/delivery";
  }

  return "/";
}

function roleLabel(role) {
  if (role === "seller") {
    return "Store Owner";
  }

  if (role === "delivery") {
    return "Delivery Partner";
  }

  return "Customer";
}

function createInitialState(role, mode) {
  return {
    identifier: "",
    password: "",
    username: "",
    name: "",
    email: "",
    phone: "",
    address: "",
    businessName: "",
    businessAddress: "",
    serviceArea: "",
    vehicleType: "",
    mode,
    role
  };
}

function AuthBackdrop({ role }) {
  const accent =
    role === "seller"
      ? "#0b5d3d"
      : role === "delivery"
        ? "#0d4f8b"
        : "#925f18";
  const secondary =
    role === "seller"
      ? "#d6f5d1"
      : role === "delivery"
        ? "#d4ecff"
        : "#ffe7c2";

  return (
    <svg
      aria-hidden="true"
      className="auth-art"
      viewBox="0 0 600 600"
    >
      <defs>
        <linearGradient id={`auth-gradient-${role}`} x1="0%" x2="100%" y1="0%" y2="100%">
          <stop offset="0%" stopColor={secondary} />
          <stop offset="100%" stopColor={accent} />
        </linearGradient>
      </defs>
      <rect fill={`url(#auth-gradient-${role})`} height="600" rx="36" width="600" />
      {role === "seller" ? (
        <>
          <path d="M135 170h220l38 58H97l38-58Z" fill="rgba(255,255,255,0.85)" />
          <rect fill="rgba(255,255,255,0.78)" height="170" rx="24" width="270" x="165" y="240" />
          <path d="M205 290h190" stroke={accent} strokeWidth="18" />
          <path d="M240 350h120" stroke={accent} strokeLinecap="round" strokeWidth="20" />
        </>
      ) : role === "delivery" ? (
        <>
          <rect fill="rgba(255,255,255,0.82)" height="140" rx="28" width="250" x="165" y="250" />
          <path d="M415 300h55l30 48h-85Z" fill="rgba(255,255,255,0.72)" />
          <circle cx="240" cy="410" fill="#12344d" r="34" />
          <circle cx="430" cy="410" fill="#12344d" r="34" />
          <path d="M110 180c62-82 200-118 318-54" fill="none" stroke="rgba(255,255,255,0.48)" strokeWidth="16" />
        </>
      ) : (
        <>
          <circle cx="180" cy="180" fill="rgba(255,255,255,0.8)" r="72" />
          <path d="M284 290h188" stroke="rgba(255,255,255,0.86)" strokeLinecap="round" strokeWidth="30" />
          <path d="M210 360h240" stroke="rgba(255,255,255,0.7)" strokeLinecap="round" strokeWidth="24" />
          <path d="M150 460c44-52 112-82 188-82s144 30 188 82" fill="none" stroke="rgba(255,255,255,0.62)" strokeWidth="18" />
        </>
      )}
    </svg>
  );
}

export default function AuthPage({ defaultMode = "login", role = "customer" }) {
  const navigate = useNavigate();
  const { login, register, user } = useAuth();
  const notifications = useNotifications();
  const [form, setForm] = useState(createInitialState(role, defaultMode));
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setForm(createInitialState(role, defaultMode));
  }, [defaultMode, role]);

  if (user?.role === role) {
    return <Navigate to={getPortalPath(role)} replace />;
  }

  function updateField(key, value) {
    setForm((current) => ({
      ...current,
      [key]: value
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setBusy(true);

    try {
      const payload =
        form.mode === "login"
          ? {
              identifier: form.identifier,
              password: form.password,
              role
            }
          : {
              role,
              username: form.username,
              name: form.name,
              email: form.email,
              phone: form.phone,
              password: form.password,
              address: form.address,
              businessName: form.businessName,
              businessAddress: form.businessAddress,
              serviceArea: form.serviceArea,
              vehicleType: form.vehicleType
            };

      const activeUser =
        form.mode === "login" ? await login(payload) : await register(payload);

      notifications.success(
        `${activeUser.name} is now signed in.`,
        form.mode === "login" ? "Welcome back" : "Account created"
      );
      navigate(getPortalPath(role), { replace: true });
    } catch (error) {
      notifications.modalError(error.message, "Authentication failed");
    } finally {
      setBusy(false);
    }
  }

  const isCustomer = role === "customer";
  const title =
    role === "seller"
      ? "Seller portal access"
      : role === "delivery"
        ? "Delivery portal access"
        : form.mode === "signup"
          ? "Create your customer account"
          : "Sign in to continue shopping";
  const copy =
    role === "seller"
      ? "Manage your store, inventory, and incoming orders from a dedicated commerce workspace."
      : role === "delivery"
        ? "Accept delivery tasks, inspect routes, and update rider status from a logistics workspace."
        : "Use your email or username and password to access your customer account.";

  return (
    <div className={`layout auth-layout auth-${role}`}>
      <section className="auth-shell">
        <div className="auth-panel auth-art-panel">
          <div className="auth-copy">
            <span className="eyebrow">{roleLabel(role)}</span>
            <h1>{title}</h1>
            <p className="hero-copy">{copy}</p>
          </div>
          <AuthBackdrop role={role} />
        </div>

        <div className="auth-panel auth-form-panel">
          <div className="auth-header">
            <Link className="brand" to={role === "customer" ? "/" : "/login"}>
              Sahanz Store
            </Link>
            {!isCustomer ? (
              <div className="auth-tabs">
                <button
                  className={`ghost-button ${form.mode === "login" ? "active-tab" : ""}`}
                  onClick={() => updateField("mode", "login")}
                  type="button"
                >
                  Log In
                </button>
                <button
                  className={`ghost-button ${form.mode === "signup" ? "active-tab" : ""}`}
                  onClick={() => updateField("mode", "signup")}
                  type="button"
                >
                  Register
                </button>
              </div>
            ) : null}
          </div>

          <form className="stack auth-form" onSubmit={handleSubmit}>
            {form.mode === "login" ? (
              <>
                <label>
                  Email / Username
                  <input
                    autoComplete="username"
                    onChange={(event) => updateField("identifier", event.target.value)}
                    value={form.identifier}
                  />
                </label>
                <label>
                  Password
                  <input
                    autoComplete={isCustomer ? "current-password" : "current-password"}
                    onChange={(event) => updateField("password", event.target.value)}
                    type="password"
                    value={form.password}
                  />
                </label>
                <button className="primary-button" disabled={busy} type="submit">
                  {busy ? "Signing in..." : "Sign In"}
                </button>
              </>
            ) : (
              <>
                <label>
                  Username
                  <input
                    autoComplete="username"
                    onChange={(event) => updateField("username", event.target.value)}
                    value={form.username}
                  />
                </label>
                <label>
                  {role === "seller" ? "Owner name" : "Full name"}
                  <input
                    autoComplete="name"
                    onChange={(event) => updateField("name", event.target.value)}
                    value={form.name}
                  />
                </label>
                <label>
                  Email
                  <input
                    autoComplete="email"
                    onChange={(event) => updateField("email", event.target.value)}
                    type="email"
                    value={form.email}
                  />
                </label>
                <label>
                  Password
                  <input
                    autoComplete="new-password"
                    onChange={(event) => updateField("password", event.target.value)}
                    type="password"
                    value={form.password}
                  />
                </label>
                {(role === "customer" || role === "delivery") && (
                  <label>
                    Phone number
                    <input
                      autoComplete="tel"
                      onChange={(event) => updateField("phone", event.target.value)}
                      value={form.phone}
                    />
                  </label>
                )}
                {role === "customer" ? (
                  <label>
                    Address
                    <textarea
                      onChange={(event) => updateField("address", event.target.value)}
                      rows="3"
                      value={form.address}
                    />
                  </label>
                ) : null}
                {role === "seller" ? (
                  <>
                    <label>
                      Store name
                      <input
                        onChange={(event) => updateField("businessName", event.target.value)}
                        value={form.businessName}
                      />
                    </label>
                    <label>
                      Store location
                      <textarea
                        onChange={(event) => updateField("businessAddress", event.target.value)}
                        rows="3"
                        value={form.businessAddress}
                      />
                    </label>
                    <label>
                      Contact details
                      <input
                        onChange={(event) => updateField("phone", event.target.value)}
                        value={form.phone}
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
                {role === "delivery" ? (
                  <>
                    <label>
                      Vehicle details
                      <input
                        onChange={(event) => updateField("vehicleType", event.target.value)}
                        value={form.vehicleType}
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
                <button className="primary-button" disabled={busy} type="submit">
                  {busy ? "Creating account..." : "Create Account"}
                </button>
              </>
            )}
          </form>

          {isCustomer ? (
            <>
              <div className="auth-footer">
                {form.mode === "login" ? (
                  <p>
                    Don't have an account? <Link to="/signup">Sign Up</Link>
                  </p>
                ) : (
                  <p>
                    Already have an account? <Link to="/login">Log In</Link>
                  </p>
                )}
              </div>
              {form.mode === "login" ? (
                <div className="auth-role-links">
                  <Link to="/login/store-owner">Are you a Store Owner?</Link>
                  <Link to="/login/delivery">Are you a Delivery Partner?</Link>
                </div>
              ) : null}
            </>
          ) : (
            <div className="auth-footer">
              <p>
                Looking for the customer storefront? <Link to="/login">Customer login</Link>
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
