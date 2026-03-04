import { createContext, useContext, useEffect, useState } from "react";
import { createOrder, getCatalog } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { useNotifications } from "../notifications/NotificationContext";

const ShopContext = createContext(null);

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

export function ShopProvider({ children }) {
  const { user } = useAuth();
  const notifications = useNotifications();
  const [catalog, setCatalog] = useState([]);
  const [catalogState, setCatalogState] = useState("Loading products...");
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartBusy, setCartBusy] = useState(false);
  const [checkout, setCheckout] = useState({
    recipientName: "",
    deliveryAddress: "12 Lake Road, Colombo 08",
    latitude: "6.914700",
    longitude: "79.877000",
    notes: "Call on arrival.",
    selectedSavedAddressId: ""
  });
  const [locationState, setLocationState] = useState("");

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

        setCatalog(data);
        setCatalogState(data.length ? "" : "No products found.");
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
  }, []);

  async function refreshCatalog() {
    const latestCatalog = await getCatalog();
    setCatalog(latestCatalog);
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
          message: `${product.name} quantity increased in your cart.`,
          title: "Cart updated"
        };
        return currentCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      notification = {
        type: "success",
        message: `${product.name} added to your cart.`,
        title: "Added to cart"
      };
      return [...currentCart, { ...product, quantity: 1 }];
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
      latitude: String(address.latitude),
      longitude: String(address.longitude),
      selectedSavedAddressId: address.id
    }));
  }

  function updateCheckoutField(key, value) {
    setCheckout((current) => ({
      ...current,
      [key]: value
    }));
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
          deliveryCoordinates: {
            latitude: overrideCheckout.latitude,
            longitude: overrideCheckout.longitude
          },
          notes: overrideCheckout.notes
        },
        user
      );

      setCart([]);
      setIsCartOpen(false);
      await refreshCatalog();
      notifications.modalSuccess(
        `Order ${order.id} was placed successfully and sent for seller processing.`,
        "Order placed",
        [
          {
            label: "Keep shopping",
            variant: "ghost"
          },
          {
            label: "OK",
            variant: "primary"
          }
        ]
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

  const cartTotal = cart.reduce(
    (sum, item) => sum + item.priceCents * item.quantity,
    0
  );

  const value = {
    addToCart,
    cart,
    cartBusy,
    cartCount: cart.reduce((sum, item) => sum + item.quantity, 0),
    cartTotal,
    catalog,
    catalogState,
    checkout,
    applySavedAddress,
    checkoutCart,
    clearCart,
    closeCart,
    findProductBySlug: (slug) => findProductBySlug(catalog, slug),
    isCartOpen,
    locationState,
    openCart,
    openCurrentLocationSetter,
    refreshCatalog,
    setCheckout,
    updateCheckoutField,
    updateCartQuantity
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
