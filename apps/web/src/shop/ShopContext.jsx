import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { createOrder, getCatalog } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { useNotifications } from "../notifications/NotificationContext";

const ShopContext = createContext(null);

function OrderPlacedIllustration() {
  return (
    <svg viewBox="0 0 160 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="14" y="28" width="132" height="76" rx="20" fill="url(#order-card)" />
      <rect x="32" y="18" width="96" height="62" rx="16" fill="white" fillOpacity="0.94" />
      <path
        d="M56 51L72 65L104 35"
        stroke="#28A164"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="46" y="84" width="68" height="8" rx="4" fill="white" fillOpacity="0.5" />
      <circle cx="122" cy="38" r="16" fill="#E34A3A" />
      <path
        d="M117 38.5L121 42.5L128 34.5"
        stroke="white"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <defs>
        <linearGradient id="order-card" x1="24" y1="22" x2="132" y2="112" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFF3E8" />
          <stop offset="1" stopColor="#F5D4C9" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function composeDeliveryAddress(parts = {}) {
  return [
    parts.deliveryAddressLine1,
    parts.deliveryAddressLine2,
    parts.deliveryCity,
    parts.deliveryPostalCode
  ]
    .map((entry) => String(entry || "").trim())
    .filter(Boolean)
    .join(", ");
}

function findProductBySlug(catalog, slug) {
  for (const category of catalog) {
    const product = category.products.find((entry) => entry.slug === slug);

    if (product) {
      return {
        ...product,
        categoryName: category.name,
        categorySlug: category.slug
      };
    }
  }

  return null;
}

function filterProducts(catalog, filters) {
  const normalizedSearch = filters.searchTerm.trim().toLowerCase();
  const now = Date.now();

  return catalog
    .map((category) => {
      const products = category.products.filter((product) => {
        const matchesSearch =
          !normalizedSearch ||
          `${product.name} ${product.description} ${product.sellerName}`
            .toLowerCase()
            .includes(normalizedSearch);
        const matchesCategory =
          !filters.category || category.slug === filters.category;
        const matchesPrice =
          product.priceCents >= Number(filters.minPriceCents) &&
          product.priceCents <= Number(filters.maxPriceCents);
        const matchesAvailability =
          !filters.inStockOnly || product.inventoryCount > 0;
        const matchesDate =
          filters.dateAdded === "all" ||
          now - new Date(product.createdAt).getTime() <=
            {
              day: 1000 * 60 * 60 * 24,
              week: 1000 * 60 * 60 * 24 * 7,
              month: 1000 * 60 * 60 * 24 * 30
            }[filters.dateAdded];

        return (
          matchesSearch &&
          matchesCategory &&
          matchesPrice &&
          matchesAvailability &&
          matchesDate
        );
      });

      return {
        ...category,
        products
      };
    })
    .filter((category) => category.products.length > 0);
}

export function ShopProvider({ children }) {
  const { token, user } = useAuth();
  const notifications = useNotifications();
  const [catalog, setCatalog] = useState([]);
  const [catalogState, setCatalogState] = useState("Loading products...");
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartBusy, setCartBusy] = useState(false);
  const [checkout, setCheckout] = useState({
    recipientName: "",
    deliveryAddress: "12 Lake Road, Colombo 08",
    deliveryAddressLine1: "12 Lake Road",
    deliveryAddressLine2: "",
    deliveryCity: "Colombo 08",
    deliveryPostalCode: "00800",
    latitude: "6.914700",
    longitude: "79.877000",
    notes: "Call on arrival.",
    selectedSavedAddressId: ""
  });
  const [locationState, setLocationState] = useState("");
  const [filters, setFilters] = useState({
    searchTerm: "",
    category: "",
    minPriceCents: 0,
    maxPriceCents: 0,
    dateAdded: "all",
    inStockOnly: false
  });

  useEffect(() => {
    if (!user || user.role !== "customer") {
      return;
    }

    const defaultAddress =
      user.savedAddresses?.find((entry) => entry.isDefault) ||
      user.savedAddresses?.[0] ||
      null;

    setCheckout((current) => ({
      ...current,
      recipientName: current.recipientName || user.name || "",
      deliveryAddress: defaultAddress?.address || user.address || current.deliveryAddress,
      deliveryAddressLine1:
        defaultAddress?.addressLine1 ||
        defaultAddress?.address ||
        user.address ||
        current.deliveryAddressLine1,
      deliveryAddressLine2: defaultAddress?.addressLine2 || current.deliveryAddressLine2,
      deliveryCity: defaultAddress?.city || current.deliveryCity,
      deliveryPostalCode: defaultAddress?.postalCode || current.deliveryPostalCode,
      latitude:
        defaultAddress?.latitude !== undefined
          ? String(defaultAddress.latitude)
          : current.latitude,
      longitude:
        defaultAddress?.longitude !== undefined
          ? String(defaultAddress.longitude)
          : current.longitude,
      selectedSavedAddressId: defaultAddress?.id || current.selectedSavedAddressId
    }));
  }, [user]);

  useEffect(() => {
    let isMounted = true;

    getCatalog()
      .then((data) => {
        if (!isMounted) {
          return;
        }

        const allProducts = data.flatMap((category) => category.products);
        const maxPriceCents = allProducts.length
          ? Math.max(...allProducts.map((product) => product.priceCents))
          : 0;

        setCatalog(data);
        setCatalogState(data.length ? "" : "No products found.");
        setFilters((current) => ({
          ...current,
          maxPriceCents: current.maxPriceCents || maxPriceCents
        }));
      })
      .catch((error) => {
        if (!isMounted) {
          return;
        }

        setCatalogState(`Product load failed: ${error.message}`);
        notifications.error(error.message, "Catalog load failed");
      });

    return () => {
      isMounted = false;
    };
  }, [notifications]);

  async function refreshCatalog() {
    const latestCatalog = await getCatalog();
    setCatalog(latestCatalog);
  }

  function updateFilters(patch) {
    setFilters((current) => ({
      ...current,
      ...patch
    }));
  }

  function resetFilters() {
    const allProducts = catalog.flatMap((category) => category.products);
    const maxPriceCents = allProducts.length
      ? Math.max(...allProducts.map((product) => product.priceCents))
      : 0;

    setFilters({
      searchTerm: "",
      category: "",
      minPriceCents: 0,
      maxPriceCents,
      dateAdded: "all",
      inStockOnly: false
    });
  }

  function openCart() {
    setIsCartOpen(true);
  }

  function closeCart() {
    setIsCartOpen(false);
  }

  function addToCart(product, options = {}) {
    let wasAdded = false;
    let notification = null;
    const requestedQuantity = Math.max(
      1,
      Number.isFinite(Number(options.quantity)) ? Math.floor(Number(options.quantity)) : 1
    );

    setCart((currentCart) => {
      if (currentCart.length && currentCart[0].sellerId !== product.sellerId) {
        notification = {
          type: "warning",
          message: "You can only place one seller's products in a single order.",
          title: "Mixed seller cart blocked"
        };
        return currentCart;
      }

      const existing = currentCart.find((item) => item.id === product.id);
      wasAdded = true;

      if (existing) {
        notification = {
          type: "info",
          message:
            requestedQuantity > 1
              ? `${requestedQuantity} more ${product.name} added to your cart.`
              : `${product.name} quantity increased in your cart.`,
          title: "Cart updated"
        };
        return currentCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + requestedQuantity }
            : item
        );
      }

      notification = {
        type: "success",
        message:
          requestedQuantity > 1
            ? `${requestedQuantity} ${product.name} added to your cart.`
            : `${product.name} added to your cart.`,
        title: "Added to cart"
      };
      return [...currentCart, { ...product, quantity: requestedQuantity }];
    });

    if (notification) {
      notifications[notification.type](notification.message, notification.title);
    }

    if (wasAdded && options.openCart) {
      setIsCartOpen(true);
    }

    return wasAdded;
  }

  function updateCartQuantity(productId, quantity) {
    if (quantity <= 0) {
      setCart((currentCart) => currentCart.filter((item) => item.id !== productId));
      notifications.info("Item removed from your cart.", "Cart updated");
      return;
    }

    setCart((currentCart) =>
      currentCart.map((item) =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
    notifications.info("Cart quantity updated.", "Cart updated");
  }

  function clearCart() {
    setCart([]);
  }

  function applySavedAddress(address) {
    if (!address) {
      return;
    }

    setCheckout((current) => ({
      ...current,
      recipientName: address.recipientName || user?.name || current.recipientName,
      deliveryAddress: address.address,
      deliveryAddressLine1: address.addressLine1 || address.address || "",
      deliveryAddressLine2: address.addressLine2 || "",
      deliveryCity: address.city || "",
      deliveryPostalCode: address.postalCode || "",
      latitude: String(address.latitude),
      longitude: String(address.longitude),
      selectedSavedAddressId: address.id
    }));
  }

  function updateCheckoutField(key, value) {
    setCheckout((current) => {
      const next = {
        ...current,
        [key]: value
      };

      if (
        [
          "deliveryAddressLine1",
          "deliveryAddressLine2",
          "deliveryCity",
          "deliveryPostalCode"
        ].includes(key)
      ) {
        next.deliveryAddress = composeDeliveryAddress(next);
      }

      return next;
    });
  }

  function openCurrentLocationSetter() {
    if (!navigator.geolocation) {
      setLocationState("Geolocation is not available in this browser.");
      notifications.error("This browser does not support geolocation.", "Location unavailable");
      return;
    }

    setLocationState("Fetching your current location...");
    notifications.info("Trying to capture your current coordinates.", "Location request");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCheckout((current) => ({
          ...current,
          latitude: position.coords.latitude.toFixed(6),
          longitude: position.coords.longitude.toFixed(6),
          selectedSavedAddressId: ""
        }));
        setLocationState("Live coordinates attached to this order.");
        notifications.success(
          "Current location attached to the order form.",
          "Location captured"
        );
      },
      () => {
        setLocationState("Could not access your current location.");
        notifications.error("Could not access your current location.", "Location failed");
      },
      {
        enableHighAccuracy: true,
        timeout: 10000
      }
    );
  }

  async function checkoutCart(overrideCheckout = checkout) {
    if (!user || user.role !== "customer" || !cart.length) {
      return null;
    }

    setCartBusy(true);

    try {
      const order = await createOrder(
        {
          items: cart.map((item) => ({
            productId: item.id,
            quantity: item.quantity
          })),
          recipientName: overrideCheckout.recipientName,
          deliveryAddress: overrideCheckout.deliveryAddress,
          deliveryAddressLine1: overrideCheckout.deliveryAddressLine1,
          deliveryAddressLine2: overrideCheckout.deliveryAddressLine2,
          deliveryCity: overrideCheckout.deliveryCity,
          deliveryPostalCode: overrideCheckout.deliveryPostalCode,
          deliveryCoordinates: {
            latitude: overrideCheckout.latitude,
            longitude: overrideCheckout.longitude
          },
          notes: overrideCheckout.notes
        },
        token
      );

      setCart([]);
      setIsCartOpen(false);
      await refreshCatalog();
      notifications.modalSuccess(
        "Your order is in. The shop has it now, and you can keep browsing while it gets prepared.",
        "Order received",
        [
          {
            label: "Keep shopping",
            variant: "ghost"
          },
          {
            label: "OK",
            variant: "primary"
          }
        ],
        <OrderPlacedIllustration />
      );

      return order;
    } catch (error) {
      const isOutOfStock = /stock/i.test(error.message);
      notifications[isOutOfStock ? "modalWarning" : "modalError"](
        error.message,
        isOutOfStock ? "Out of stock" : "Checkout failed",
        [
          {
            label: "Review cart",
            variant: "ghost",
            onClick: () => setIsCartOpen(true)
          },
          {
            label: "Close",
            variant: "primary"
          }
        ]
      );
      throw error;
    } finally {
      setCartBusy(false);
    }
  }

  const visibleCatalog = useMemo(() => filterProducts(catalog, filters), [catalog, filters]);
  const cartTotal = cart.reduce(
    (sum, item) => sum + item.priceCents * item.quantity,
    0
  );

  const value = {
    addToCart,
    applySavedAddress,
    cart,
    cartBusy,
    cartCount: cart.reduce((sum, item) => sum + item.quantity, 0),
    cartTotal,
    catalog,
    catalogState,
    checkout,
    checkoutCart,
    clearCart,
    closeCart,
    filters,
    findProductBySlug: (slug) => findProductBySlug(catalog, slug),
    isCartOpen,
    locationState,
    openCart,
    openCurrentLocationSetter,
    refreshCatalog,
    resetFilters,
    setCheckout,
    updateCheckoutField,
    updateCartQuantity,
    updateFilters,
    visibleCatalog
  };

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export function useShop() {
  const context = useContext(ShopContext);

  if (!context) {
    throw new Error("useShop must be used within ShopProvider");
  }

  return context;
}
