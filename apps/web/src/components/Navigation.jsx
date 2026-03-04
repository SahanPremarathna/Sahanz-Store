import { useEffect, useMemo, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { useShop } from "../shop/ShopContext";
import { getCategories } from "../api/client";

function ProfileBadge({ user }) {
  const initials = useMemo(
    () =>
      String(user?.name || "User")
        .split(" ")
        .map((part) => part[0] || "")
        .join("")
        .slice(0, 2)
        .toUpperCase(),
    [user]
  );

  return <span className="profile-badge">{initials}</span>;
}

export default function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const {
    catalog,
    filters,
    updateFilters,
    resetFilters
  } = useShop();
  const [showFilters, setShowFilters] = useState(false);
  const [isFilterClosing, setIsFilterClosing] = useState(false);
  const [searchDraft, setSearchDraft] = useState(filters.searchTerm);
  const filterCloseTimeoutRef = useRef(null);
  const filterUnmountTimeoutRef = useRef(null);
  const [filterDraft, setFilterDraft] = useState({
    category: filters.category,
    minPriceCents: filters.minPriceCents,
    maxPriceCents: filters.maxPriceCents,
    dateAdded: filters.dateAdded,
    inStockOnly: filters.inStockOnly
  });
  const [categories, setCategories] = useState([]);
  const isCustomerView =
    (!user || user.role === "customer") &&
    !location.pathname.startsWith("/seller") &&
    !location.pathname.startsWith("/delivery");
  const defaultMaxPriceCents = useMemo(() => {
    const allProducts = catalog.flatMap((category) => category.products);
    return allProducts.length
      ? Math.max(...allProducts.map((product) => product.priceCents))
      : 0;
  }, [catalog]);
  const hasAppliedFilters =
    Boolean(filters.category) ||
    Number(filters.minPriceCents) > 0 ||
    Number(filters.maxPriceCents) !== Number(defaultMaxPriceCents) ||
    filters.dateAdded !== "all" ||
    filters.inStockOnly;

  useEffect(() => {
    setSearchDraft(filters.searchTerm);
  }, [filters.searchTerm]);

  useEffect(() => {
    setFilterDraft({
      category: filters.category,
      minPriceCents: filters.minPriceCents,
      maxPriceCents: filters.maxPriceCents,
      dateAdded: filters.dateAdded,
      inStockOnly: filters.inStockOnly
    });
  }, [
    filters.category,
    filters.dateAdded,
    filters.inStockOnly,
    filters.maxPriceCents,
    filters.minPriceCents
  ]);

  useEffect(() => {
    let isMounted = true;

    getCategories()
      .then((categoryData) => {
        if (isMounted) {
          setCategories(categoryData);
        }
      })
      .catch(() => {
        if (isMounted) {
          setCategories([]);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  function handleSearchSubmit(event) {
    event.preventDefault();
    updateFilters({ searchTerm: searchDraft });
  }

  function cancelScheduledFilterClose() {
    if (filterCloseTimeoutRef.current) {
      window.clearTimeout(filterCloseTimeoutRef.current);
      filterCloseTimeoutRef.current = null;
    }

    if (filterUnmountTimeoutRef.current) {
      window.clearTimeout(filterUnmountTimeoutRef.current);
      filterUnmountTimeoutRef.current = null;
    }
  }

  function closeFilters() {
    cancelScheduledFilterClose();
    setIsFilterClosing(true);
    filterUnmountTimeoutRef.current = window.setTimeout(() => {
      setShowFilters(false);
      setIsFilterClosing(false);
      filterUnmountTimeoutRef.current = null;
    }, 220);
  }

  function openFilters() {
    cancelScheduledFilterClose();
    setIsFilterClosing(false);
    setShowFilters(true);
  }

  function scheduleFilterClose() {
    cancelScheduledFilterClose();
    filterCloseTimeoutRef.current = window.setTimeout(() => {
      closeFilters();
      filterCloseTimeoutRef.current = null;
    }, 180);
  }

  function handleApplyFilters() {
    updateFilters(filterDraft);
    closeFilters();
  }

  function handleResetFilters() {
    resetFilters();
    closeFilters();
  }

  useEffect(
    () => () => {
      cancelScheduledFilterClose();
    },
    []
  );

  const shouldRenderFilters = showFilters || isFilterClosing;

  return (
    <header className="topbar">
      <div className="brand-lockup">
        <Link aria-label="Sahanz Store" className="brand" to="/">
          <img alt="" aria-hidden="true" className="brand-logo" src="/my_logo.png" />
        </Link>
      </div>

      <div className="nav-shell">
        <nav className="nav">
          {user?.role === "seller" ? <NavLink to="/seller">Seller Portal</NavLink> : null}
          {user?.role === "delivery" ? <NavLink to="/delivery">Delivery Portal</NavLink> : null}
        </nav>

        {isCustomerView ? (
          <div className="customer-toolbar">
            <div
              className="search-shell"
              onMouseEnter={cancelScheduledFilterClose}
              onMouseLeave={scheduleFilterClose}
            >
              <form className="search-form" onSubmit={handleSearchSubmit}>
                <input
                  className="search-input"
                  onChange={(event) => setSearchDraft(event.target.value)}
                  placeholder="Search products across all stores"
                  value={searchDraft}
                />
                <button
                  aria-label="Search products"
                  className="search-button"
                  type="submit"
                >
                  <svg
                    aria-hidden="true"
                    fill="none"
                    height="18"
                    viewBox="0 0 24 24"
                    width="18"
                  >
                    <circle
                      cx="11"
                      cy="11"
                      r="6.5"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <path
                      d="M16 16L21 21"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeWidth="2"
                    />
                  </svg>
                </button>
              </form>
              <button
                className={`filter-toggle ${hasAppliedFilters ? "has-active-filters" : ""}`}
                onClick={() => {
                  if (showFilters && !isFilterClosing) {
                    closeFilters();
                    return;
                  }

                  openFilters();
                }}
                type="button"
              >
                <span>Filter</span>
                {hasAppliedFilters ? (
                  <span className="filter-toggle-status">
                    <span aria-hidden="true" className="filter-toggle-badge">
                      !
                    </span>
                    <span className="filter-toggle-label">Applied filters</span>
                    <span
                      aria-label="Clear applied filters"
                      className="filter-toggle-clear"
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        resetFilters();
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          event.stopPropagation();
                          resetFilters();
                        }
                      }}
                      role="button"
                      tabIndex={0}
                    >
                      ×
                    </span>
                  </span>
                ) : null}
              </button>
              {shouldRenderFilters ? (
                <div
                  className={`filter-panel ${isFilterClosing ? "is-closing" : "is-open"}`}
                  onMouseEnter={cancelScheduledFilterClose}
                >
                  <label>
                    Category
                    <select
                      onChange={(event) =>
                        setFilterDraft((current) => ({
                          ...current,
                          category: event.target.value
                        }))
                      }
                      value={filterDraft.category}
                    >
                      <option value="">All categories</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.slug}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Minimum price
                    <input
                      min="0"
                      onChange={(event) =>
                        setFilterDraft((current) => ({
                          ...current,
                          minPriceCents: Number(event.target.value || 0) * 100
                        }))
                      }
                      step="0.01"
                      type="number"
                      value={(filterDraft.minPriceCents / 100).toFixed(2)}
                    />
                  </label>
                  <label>
                    Maximum price
                    <input
                      min="0"
                      onChange={(event) =>
                        setFilterDraft((current) => ({
                          ...current,
                          maxPriceCents: Number(event.target.value || 0) * 100
                        }))
                      }
                      step="0.01"
                      type="number"
                      value={(filterDraft.maxPriceCents / 100).toFixed(2)}
                    />
                  </label>
                  <label>
                    Date added
                    <select
                      onChange={(event) =>
                        setFilterDraft((current) => ({
                          ...current,
                          dateAdded: event.target.value
                        }))
                      }
                      value={filterDraft.dateAdded}
                    >
                      <option value="all">Any time</option>
                      <option value="day">Last 24 hours</option>
                      <option value="week">Last 7 days</option>
                      <option value="month">Last 30 days</option>
                    </select>
                  </label>
                  <label className="checkbox-row inline-checkbox">
                    <input
                      checked={filterDraft.inStockOnly}
                      onChange={(event) =>
                        setFilterDraft((current) => ({
                          ...current,
                          inStockOnly: event.target.checked
                        }))
                      }
                      type="checkbox"
                    />
                    <span>In-stock only</span>
                  </label>
                  <div className="filter-panel-actions">
                    <button className="ghost-button" onClick={handleResetFilters} type="button">
                      Clear filters
                    </button>
                    <button className="primary-button" onClick={handleApplyFilters} type="button">
                      Apply filters
                    </button>
                  </div>
                </div>
              ) : null}
            </div>

            {user ? (
              <>
                <Link className="profile-link" to="/profile">
                  <ProfileBadge user={user} />
                  <span>{user.name}</span>
                </Link>
                <button
                  aria-label="Logout"
                  className="icon-button logout-button"
                  onClick={handleLogout}
                  type="button"
                >
                  <svg
                    aria-hidden="true"
                    fill="none"
                    height="18"
                    viewBox="0 0 24 24"
                    width="18"
                  >
                    <path
                      d="M12 3V11"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeWidth="2"
                    />
                    <path
                      d="M7.05 5.05A8 8 0 1 0 16.95 5.05"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeWidth="2"
                    />
                  </svg>
                </button>
              </>
            ) : (
              <div className="auth-inline-links">
                <Link className="ghost-link" to="/login">
                  Log In
                </Link>
                <Link className="primary-button auth-link-button" to="/signup">
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="auth-cluster">
            {user ? (
              <>
                <Link className="pill" to="/profile">
                  {user.name}
                </Link>
                <button className="ghost-button" onClick={handleLogout} type="button">
                  Logout
                </button>
              </>
            ) : (
              <Link className="ghost-link" to="/login">
                Log In
              </Link>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
