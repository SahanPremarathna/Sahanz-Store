import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Navigation from "../../components/Navigation";
import { useAuth } from "../../auth/AuthContext";
import PageTransition from "../../components/PageTransition";
import SiteFooter from "../../components/SiteFooter";
import SmartImage from "../../components/SmartImage";
import { getSellerProducts } from "../../api/client";
import { useNotifications } from "../../notifications/NotificationContext";

function formatMoney(currency, cents) {
  return `${currency} ${(cents / 100).toFixed(2)}`;
}

export default function SellerListingsPage() {
  const { token, user } = useAuth();
  const notifications = useNotifications();
  const [products, setProducts] = useState([]);
  const [statusMessage, setStatusMessage] = useState("Loading listings...");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!user) {
      return;
    }

    let isMounted = true;

    getSellerProducts(token)
      .then((data) => {
        if (!isMounted) {
          return;
        }

        setProducts(data);
        setStatusMessage(data.length ? "" : "No live listings yet.");
      })
      .catch((error) => {
        if (!isMounted) {
          return;
        }

        setStatusMessage(`Failed to load listings: ${error.message}`);
        notifications.error(error.message, "Listings load failed");
      });

    return () => {
      isMounted = false;
    };
  }, [notifications, token, user]);

  const filteredProducts = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    if (!normalizedSearch) {
      return products;
    }

    return products.filter((product) =>
      [product.title, product.description]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(normalizedSearch))
    );
  }, [products, searchTerm]);

  return (
    <div className="layout">
      <PageTransition className="page-shell">
        <Navigation />
        <section className="page-card">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Inventory</span>
              <h2>All store listings</h2>
            </div>
            <Link className="ghost-link" to="/seller">
              Back to seller portal
            </Link>
          </div>
          <div className="inventory-listings-toolbar">
            <input
              className="inventory-search-input"
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search your listings"
              value={searchTerm}
            />
            <span className="muted">{filteredProducts.length} shown</span>
          </div>
          {statusMessage ? <p className="muted">{statusMessage}</p> : null}
          <div className="inventory-grid inventory-management-grid">
            {filteredProducts.map((product) => (
              <Link
                className="inventory-card inventory-management-card"
                key={product.id}
                to={`/seller/listings/${product.id}/edit`}
              >
                <SmartImage
                  alt={product.title}
                  className="inventory-thumb inventory-management-thumb"
                  src={product.imageUrl}
                />
                <div className="inventory-management-copy">
                  <h3>{product.title}</h3>
                  <p>{product.description}</p>
                  <p className="muted">
                    {formatMoney(product.currency, product.priceCents)} | Stock {product.inventoryCount}
                  </p>
                </div>
                <span className="ghost-link inventory-management-link">Edit listing</span>
              </Link>
            ))}
          </div>
        </section>
        <SiteFooter />
      </PageTransition>
    </div>
  );
}
