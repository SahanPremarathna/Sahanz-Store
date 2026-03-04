import { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import CheckoutMap from "../../components/CheckoutMap";
import Navigation from "../../components/Navigation";
import PageTransition from "../../components/PageTransition";
import SmartImage from "../../components/SmartImage";
import { useAuth } from "../../auth/AuthContext";
import { useNotifications } from "../../notifications/NotificationContext";
import { useShop } from "../../shop/ShopContext";

function formatMoney(currency, cents) {
  return `${currency} ${(cents / 100).toFixed(2)}`;
}

function buildSavedAddress(address, fallbackName) {
  return {
    id: `addr-${Date.now()}`,
    label: address.label || `Saved ${new Date().toLocaleDateString()}`,
    recipientName: address.recipientName || fallbackName,
    address: address.deliveryAddress,
    addressLine1: address.deliveryAddressLine1,
    addressLine2: address.deliveryAddressLine2,
    city: address.deliveryCity,
    postalCode: address.deliveryPostalCode,
    latitude: Number(address.latitude),
    longitude: Number(address.longitude),
    isDefault: false
  };
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { saveProfile, user } = useAuth();
  const notifications = useNotifications();
  const {
    cart,
    cartBusy,
    cartTotal,
    checkout,
    checkoutCart,
    applySavedAddress,
    openCurrentLocationSetter,
    setCheckout,
    updateCheckoutField
  } = useShop();
  const [saveAddress, setSaveAddress] = useState(false);
  const [saveAsDefault, setSaveAsDefault] = useState(false);

  const savedAddresses = user?.savedAddresses || [];
  const coordinates = useMemo(
    () => ({
      latitude: Number(checkout.latitude) || 6.9147,
      longitude: Number(checkout.longitude) || 79.877
    }),
    [checkout.latitude, checkout.longitude]
  );

  useEffect(() => {
    if (!user) {
      return;
    }

    if (!checkout.recipientName && user.name) {
      updateCheckoutField("recipientName", user.name);
    }
  }, [checkout.recipientName, updateCheckoutField, user]);

  if (!cart.length) {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      if (saveAddress && user?.role === "customer") {
        const nextAddress = buildSavedAddress(checkout, user.name);
        const nextSavedAddresses = [
          ...savedAddresses.map((entry) => ({
            ...entry,
            isDefault: saveAsDefault ? false : entry.isDefault
          })),
          {
            ...nextAddress,
            isDefault: saveAsDefault
          }
        ];
        const updatedProfile = await saveProfile({
          savedAddresses: nextSavedAddresses,
          address: saveAsDefault ? checkout.deliveryAddress : user.address
        });

        if (saveAsDefault) {
          notifications.success("New address saved as your default checkout address.", "Address saved");
        } else {
          notifications.success("New address saved to your profile.", "Address saved");
        }

        const defaultAddress = updatedProfile.savedAddresses.find((entry) => entry.id === nextAddress.id);

        if (defaultAddress) {
          applySavedAddress(defaultAddress);
        }
      }

      await checkoutCart(checkout);
      navigate("/");
    } catch (_error) {
      // Notifications already handled.
    }
  }

  return (
    <div className="layout">
      <PageTransition className="page-shell">
        <Navigation />
        <section className="seller-hero portal-hero">
          <div>
            <span className="eyebrow">Checkout</span>
            <h1>Confirm delivery details before placing the order.</h1>
            <p className="hero-copy">
              Use your default name, choose a saved delivery address, or enter a
              new one. Then place the delivery pin exactly on the map.
            </p>
          </div>
          <div className="portal-summary">
            <div className="metric-strip">
              <article className="metric-card">
                <span className="eyebrow">Items</span>
                <strong>{cart.length}</strong>
              </article>
              <article className="metric-card">
                <span className="eyebrow">Total</span>
                <strong className="metric-compact">LKR {(cartTotal / 100).toFixed(2)}</strong>
              </article>
            </div>
          </div>
        </section>

        <div className="checkout-page-grid">
          <section className="page-card">
            <div className="section-heading">
              <div>
                <span className="eyebrow">Delivery details</span>
                <h2>Address and contact</h2>
              </div>
            </div>

            <form className="stack checkout-page-form" onSubmit={handleSubmit}>
              <div className="checkout-fixed-row">
                <span className="eyebrow">Recipient</span>
                <strong>{user?.name}</strong>
                <span className="muted">
                  Orders will be placed under your default customer profile.
                </span>
              </div>

              {savedAddresses.length ? (
                <div className="saved-addresses">
                  <span className="eyebrow">Saved addresses</span>
                  <div className="saved-address-list">
                {savedAddresses.map((address) => (
                      <button
                        className={`saved-address-card ${
                          checkout.selectedSavedAddressId === address.id ? "active" : ""
                        }`}
                        key={address.id}
                        onClick={() => applySavedAddress(address)}
                        type="button"
                      >
                        <strong>{address.label}</strong>
                        <span>{address.address}</span>
                        <span className="muted">
                          {address.recipientName} | {address.isDefault ? "Default" : "Saved"}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="form-grid checkout-address-grid">
                <label>
                  Address line 1
                  <input
                    onChange={(event) => {
                      updateCheckoutField("deliveryAddressLine1", event.target.value);
                      updateCheckoutField("selectedSavedAddressId", "");
                    }}
                    value={checkout.deliveryAddressLine1}
                  />
                </label>
                <label>
                  Address line 2
                  <input
                    onChange={(event) => {
                      updateCheckoutField("deliveryAddressLine2", event.target.value);
                      updateCheckoutField("selectedSavedAddressId", "");
                    }}
                    value={checkout.deliveryAddressLine2}
                  />
                </label>
                <label>
                  City
                  <input
                    onChange={(event) => {
                      updateCheckoutField("deliveryCity", event.target.value);
                      updateCheckoutField("selectedSavedAddressId", "");
                    }}
                    value={checkout.deliveryCity}
                  />
                </label>
                <label>
                  Postal code
                  <input
                    onChange={(event) => {
                      updateCheckoutField("deliveryPostalCode", event.target.value);
                      updateCheckoutField("selectedSavedAddressId", "");
                    }}
                    value={checkout.deliveryPostalCode}
                  />
                </label>
              </div>

              <div className="checkout-fixed-row compact">
                <span className="eyebrow">Formatted address</span>
                <strong>{checkout.deliveryAddress || "Add the address fields above"}</strong>
              </div>

              <div className="coordinate-grid">
                <label>
                  Latitude
                  <input
                    onChange={(event) => {
                      updateCheckoutField("latitude", event.target.value);
                      updateCheckoutField("selectedSavedAddressId", "");
                    }}
                    step="0.000001"
                    type="number"
                    value={checkout.latitude}
                  />
                </label>
                <label>
                  Longitude
                  <input
                    onChange={(event) => {
                      updateCheckoutField("longitude", event.target.value);
                      updateCheckoutField("selectedSavedAddressId", "");
                    }}
                    step="0.000001"
                    type="number"
                    value={checkout.longitude}
                  />
                </label>
              </div>

              <label>
                Notes for seller or rider
                <textarea
                  onChange={(event) => updateCheckoutField("notes", event.target.value)}
                  rows="3"
                  value={checkout.notes}
                />
              </label>

              <label className="checkbox-row">
                <input
                  checked={saveAddress}
                  onChange={(event) => setSaveAddress(event.target.checked)}
                  type="checkbox"
                />
                Save this address to my profile
              </label>

              {saveAddress ? (
                <label className="checkbox-row">
                  <input
                    checked={saveAsDefault}
                    onChange={(event) => setSaveAsDefault(event.target.checked)}
                    type="checkbox"
                  />
                  Make this my default address
                </label>
              ) : null}

              <div className="checkout-footer">
                <button className="ghost-button" onClick={() => navigate(-1)} type="button">
                  Back
                </button>
                <button
                  className={`primary-button ${cartBusy ? "is-loading" : ""}`}
                  disabled={cartBusy}
                  type="submit"
                >
                  {cartBusy ? "Placing..." : "Place order"}
                </button>
              </div>
            </form>
          </section>

          <section className="page-card">
            <div className="section-heading">
              <div>
                <span className="eyebrow">Map pin</span>
                <h2>Select the exact delivery point</h2>
              </div>
            </div>
            <div className="inline-actions checkout-map-actions">
              <button
                className="ghost-button"
                onClick={openCurrentLocationSetter}
                type="button"
              >
                Add live location
              </button>
              <span className="muted">
                Use your current position, then adjust the pin on the map if needed.
              </span>
            </div>
            <CheckoutMap
              coordinates={coordinates}
              onChange={({ latitude, longitude }) => {
                updateCheckoutField("latitude", latitude.toFixed(6));
                updateCheckoutField("longitude", longitude.toFixed(6));
                updateCheckoutField("selectedSavedAddressId", "");
              }}
            />
            <div className="checkout-summary">
              <h3>Order summary</h3>
              <div className="stack">
                {cart.map((item) => (
                  <div className="checkout-order-item" key={item.id}>
                    <div className="checkout-order-main">
                      <SmartImage
                        alt={item.name}
                        className="checkout-order-thumb"
                        src={item.imageUrl}
                      />
                      <div>
                        <strong>{item.name}</strong>
                        <p className="muted">
                          {formatMoney(item.currency, item.priceCents)} each
                        </p>
                      </div>
                    </div>
                    <div className="checkout-order-meta">
                      <span>x{item.quantity}</span>
                      <strong>
                        {formatMoney(item.currency, item.priceCents * item.quantity)}
                      </strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </PageTransition>
    </div>
  );
}
