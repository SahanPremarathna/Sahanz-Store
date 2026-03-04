import { useEffect, useMemo, useState } from "react";
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

function getPortalAccessLinks(role) {
  if (role === "seller") {
    return [
      { to: "/login", label: "Customer access" },
      { to: "/login/delivery", label: "Delivery partner access" }
    ];
  }

  if (role === "delivery") {
    return [
      { to: "/login", label: "Customer access" },
      { to: "/login/store-owner", label: "Store owner access" }
    ];
  }

  return [
    { to: "/login/store-owner", label: "Store owner access" },
    { to: "/login/delivery", label: "Delivery partner access" }
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

function getAuthScene(role, mode) {
  if (role === "seller") {
    return {
      title: "",
      copy: "",
      highlights: []
    };
  }

  if (role === "delivery") {
    return {
      title: "",
      copy: "",
      highlights: []
    };
  }

  return {
    title: "",
    copy: "",
    highlights: []
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

function AuthBackdrop({ role }) {
  const source =
    role === "seller" ? "/shop_svg.svg" : role === "delivery" ? "/delivery_svg.svg" : "/login_svg.svg";

  return <img alt="" aria-hidden="true" className="auth-art" src={source} />;
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

  const scene = useMemo(() => getAuthScene(role, form.mode), [role, form.mode]);
  const fieldGroups = useMemo(() => getFieldGroups(role, form.mode), [role, form.mode]);
  const portalAccessLinks = useMemo(() => getPortalAccessLinks(role), [role]);
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
      <div className="auth-page-topbar">
        <div className="auth-brand-lockup">
          <Link aria-label="Sahanz Store" className="brand" to="/">
            <img alt="" aria-hidden="true" className="brand-logo" src="/my_logo.png" />
          </Link>
        </div>
      </div>
      <section className={`auth-shell ${form.mode === "login" ? "auth-shell-login" : ""}`}>
        {scene.title || scene.copy || scene.highlights.length ? (
          <div className="auth-panel auth-art-panel">
            <div className="auth-copy">
              <h1>{scene.title}</h1>
              <p className="hero-copy">{scene.copy}</p>
            </div>

            {scene.highlights.length ? (
              <div className="auth-highlight-grid">
                {scene.highlights.map((item) => (
                  <article className="auth-highlight-card" key={item}>
                    <span className="auth-highlight-dot" />
                    <strong>{item}</strong>
                  </article>
                ))}
              </div>
            ) : null}

            <AuthBackdrop role={role} />
          </div>
        ) : (
          <div className="auth-panel auth-art-panel auth-art-panel-minimal">
            <AuthBackdrop role={role} />
          </div>
        )}

        <div className="auth-panel auth-form-panel">
          <div className="auth-form-card">
            <div className="auth-form-head">
              <div>
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
        </div>
      </section>
      {portalAccessLinks.length ? (
        <div className="auth-role-links auth-role-links-page">
          {portalAccessLinks.map((item) => (
            <Link key={item.to} to={item.to}>
              {item.label}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
