import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { useNotifications } from "../../notifications/NotificationContext";
import { useTheme } from "../../theme/ThemeContext";
import { getThemeLogoPath } from "../../theme/themeAssets";

const RIGHT_BRAND_ROWS = Array.from({ length: 18 }, (_, index) => index);
const RIGHT_BRAND_WORDS = Array.from({ length: 36 }, () => "SahanZ");
const RIGHT_BRAND_COLORS = [
  "#1f4c8f",
  "#2962a3",
  "#2b7a78",
  "#37836f",
  "#8f4a2f",
  "#a35f30",
  "#7a3e9d",
  "#9a4f7f",
  "#2f5f6b",
  "#5f4a2f",
  "#0f766e",
  "#15803d",
  "#166534",
  "#1d4ed8",
  "#3730a3",
  "#7c3aed",
  "#a21caf",
  "#be185d",
  "#be123c",
  "#b45309",
  "#92400e",
  "#c2410c",
  "#0e7490",
  "#334155",
  "#475569",
  "#6d28d9",
  "#0369a1",
  "#4338ca",
  "#047857",
  "#9f1239"
];

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

function getPortalAccessLinks(role) {
  return [
    { to: "/login/store-owner", label: "Store Login", active: role === "seller" },
    { to: "/login/delivery", label: "Deliverer Login", active: role === "delivery" }
  ];
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

function getFieldGroups(role, mode) {
  if (mode === "login") {
    return [
      {
        title: "Access",
        fields: [
          {
            key: "identifier",
            label: "Email / Username",
            autoComplete: "username",
            type: "text"
          },
          {
            key: "password",
            label: "Password",
            autoComplete: "current-password",
            type: "password"
          }
        ]
      }
    ];
  }

  const common = {
    title: "Account",
    fields: [
      { key: "username", label: "Username", autoComplete: "username", type: "text" },
      {
        key: "name",
        label: role === "seller" ? "Owner name" : "Full name",
        autoComplete: "name",
        type: "text"
      },
      { key: "email", label: "Email", autoComplete: "email", type: "email" },
      {
        key: "password",
        label: "Password",
        autoComplete: "new-password",
        type: "password"
      }
    ]
  };

  if (role === "customer") {
    return [
      common,
      {
        title: "Contact",
        fields: [
          { key: "phone", label: "Phone number", autoComplete: "tel", type: "text" },
          { key: "address", label: "Address", rows: 3, type: "textarea" }
        ]
      }
    ];
  }

  if (role === "seller") {
    return [
      common,
      {
        title: "Store",
        fields: [
          { key: "businessName", label: "Store name", type: "text" },
          { key: "businessAddress", label: "Store location", rows: 3, type: "textarea" },
          { key: "phone", label: "Contact details", type: "text" },
          { key: "serviceArea", label: "Service area", type: "text" }
        ]
      }
    ];
  }

  return [
    common,
    {
      title: "Delivery",
      fields: [
        { key: "phone", label: "Phone number", autoComplete: "tel", type: "text" },
        { key: "vehicleType", label: "Vehicle details", type: "text" },
        { key: "serviceArea", label: "Service area", type: "text" }
      ]
    }
  ];
}

export default function AuthPage({ defaultMode = "login", role = "customer" }) {
  const navigate = useNavigate();
  const { login, register, user } = useAuth();
  const notifications = useNotifications();
  const { isDark } = useTheme();
  const logoSrc = getThemeLogoPath(isDark);
  const [form, setForm] = useState(createInitialState(role, defaultMode));
  const [visiblePasswords, setVisiblePasswords] = useState({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setForm(createInitialState(role, defaultMode));
    setVisiblePasswords({});
  }, [defaultMode, role]);

  const fieldGroups = useMemo(() => getFieldGroups(role, form.mode), [role, form.mode]);
  const portalAccessLinks = useMemo(() => getPortalAccessLinks(role), [role]);
  const rightBrandWordColors = useMemo(
    () =>
      RIGHT_BRAND_ROWS.map(() =>
        RIGHT_BRAND_WORDS.map(
          () => RIGHT_BRAND_COLORS[Math.floor(Math.random() * RIGHT_BRAND_COLORS.length)]
        )
      ),
    []
  );
  if (user?.role === role) {
    return <Navigate to={getPortalPath(role)} replace />;
  }

  function updateField(key, value) {
    setForm((current) => ({
      ...current,
      [key]: value
    }));
  }

  function setPasswordPeek(event, fieldKey, visible) {
    event.preventDefault();
    event.stopPropagation();
    setVisiblePasswords((current) => ({
      ...current,
      [fieldKey]: visible
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

      const activeUser = form.mode === "login" ? await login(payload) : await register(payload);

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

  return (
    <div className={`layout auth-layout auth-${role} auth-${form.mode}`}>
      <div className="auth-bg-branding">
        <div className="auth-bg-branding-left">
          <Link aria-label="Go to home page" className="auth-bg-brand-link" to="/">
            <strong>SahanZ</strong>
            <span>Smart Marketplace</span>
          </Link>
        </div>
        <div aria-hidden="true" className="auth-bg-branding-right">
          {RIGHT_BRAND_ROWS.map((row) => (
            <div
              className={`auth-bg-branding-right-row ${row % 2 === 0 ? "scroll-up" : "scroll-down"}`}
              key={row}
            >
              <div className="auth-bg-branding-right-track">
                <div className="auth-bg-branding-right-strip">
                  {RIGHT_BRAND_WORDS.map((word, index) => (
                    <span key={`${row}-a-${index}`} style={{ color: rightBrandWordColors[row][index] }}>
                      {word}
                    </span>
                  ))}
                </div>
                <div aria-hidden="true" className="auth-bg-branding-right-strip">
                  {RIGHT_BRAND_WORDS.map((word, index) => (
                    <span key={`${row}-b-${index}`} style={{ color: rightBrandWordColors[row][index] }}>
                      {word}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <section className="auth-shell">
        <div className="auth-panel auth-form-panel auth-glow-shell">
          <div className="auth-form-card">
            <div className="auth-form-head">
              <div>
                <Link aria-label="Go to home page" className="auth-form-logo-link" to="/">
                  <img alt="Sahanz Store" className="auth-form-logo" src={logoSrc} />
                </Link>
                <span className="eyebrow">{roleLabel(role)}</span>
                <h2>{form.mode === "login" ? "Access account" : "Create account"}</h2>
              </div>
              <div className="auth-mode-switch">
                <button
                  className={form.mode === "login" ? "active-tab" : ""}
                  onClick={() => updateField("mode", "login")}
                  type="button"
                >
                  Log In
                </button>
                <button
                  className={form.mode === "signup" ? "active-tab" : ""}
                  onClick={() => updateField("mode", "signup")}
                  type="button"
                >
                  Sign Up
                </button>
              </div>
            </div>

            <form className="stack auth-form" onSubmit={handleSubmit}>
              {fieldGroups.map((group) => (
                <section className="auth-form-section" key={group.title}>
                  <div className="auth-form-section-head">
                    <span className="auth-form-section-title">{group.title}</span>
                  </div>
                  <div className="auth-form-grid">
                    {group.fields.map((field) => (
                      <label
                        className={field.type === "textarea" ? "auth-field auth-field-wide" : "auth-field"}
                        key={field.key}
                      >
                        <span>{field.label}</span>
                        {field.type === "textarea" ? (
                          <textarea
                            autoComplete={field.autoComplete}
                            onChange={(event) => updateField(field.key, event.target.value)}
                            rows={field.rows || 3}
                            value={form[field.key]}
                          />
                        ) : field.type === "password" ? (
                          <div className="auth-password-wrap">
                            <input
                              autoComplete={field.autoComplete}
                              onChange={(event) => updateField(field.key, event.target.value)}
                              type={visiblePasswords[field.key] ? "text" : "password"}
                              value={form[field.key]}
                            />
                            <button
                              aria-label={visiblePasswords[field.key] ? "Hide password" : "Show password"}
                              className="auth-password-toggle"
                              onBlur={(event) => setPasswordPeek(event, field.key, false)}
                              onFocus={(event) => setPasswordPeek(event, field.key, true)}
                              onPointerCancel={(event) => setPasswordPeek(event, field.key, false)}
                              onPointerDown={(event) => setPasswordPeek(event, field.key, true)}
                              onPointerLeave={(event) => setPasswordPeek(event, field.key, false)}
                              onPointerUp={(event) => setPasswordPeek(event, field.key, false)}
                              type="button"
                            >
                              {visiblePasswords[field.key] ? (
                                <svg aria-hidden="true" viewBox="0 0 24 24">
                                  <path
                                    d="M2.2 12a1.55 1.55 0 010-2C3.5 8.4 7.5 4 13 4s9.5 4.4 10.8 6a1.55 1.55 0 010 2c-1.3 1.6-5.3 6-10.8 6S3.5 13.6 2.2 12z"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="1.8"
                                  />
                                  <circle
                                    cx="12"
                                    cy="11"
                                    fill="none"
                                    r="3.3"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                  />
                                </svg>
                              ) : (
                                <svg aria-hidden="true" viewBox="0 0 24 24">
                                  <path
                                    d="M10.58 10.58A2 2 0 0013.42 13.42"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="1.8"
                                  />
                                  <path
                                    d="M9.88 5.08A10.9 10.9 0 0112 4.9c5.27 0 9.19 4.04 10.49 5.63.36.44.36 1.1 0 1.54-.69.84-2.1 2.4-4.09 3.68M6.61 6.6C4.67 7.87 3.31 9.4 2.64 10.2a1.2 1.2 0 000 1.54c1.3 1.59 5.22 5.63 10.49 5.63 1.08 0 2.11-.17 3.09-.47"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="1.8"
                                  />
                                  <path
                                    d="M3.5 3.5L20.5 20.5"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="1.8"
                                  />
                                </svg>
                              )}
                            </button>
                          </div>
                        ) : (
                          <input
                            autoComplete={field.autoComplete}
                            onChange={(event) => updateField(field.key, event.target.value)}
                            type={field.type}
                            value={form[field.key]}
                          />
                        )}
                      </label>
                    ))}
                  </div>
                </section>
              ))}

              <div className="auth-submit-row">
                <button className="primary-button auth-submit-button" disabled={busy} type="submit">
                  {busy
                    ? form.mode === "login"
                      ? "Signing in..."
                      : "Creating account..."
                    : form.mode === "login"
                      ? "Continue"
                      : "Create Account"}
                </button>
              </div>
            </form>
          </div>
          {portalAccessLinks.length ? (
            <div className="auth-role-links auth-role-links-inline">
              {portalAccessLinks.map((item) => (
                <Link
                  aria-current={item.active ? "page" : undefined}
                  className={item.active ? "auth-role-link-active" : ""}
                  key={item.to}
                  to={item.to}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
