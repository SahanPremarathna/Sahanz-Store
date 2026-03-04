import { Route, Routes } from "react-router-dom";
import { AuthProvider } from "../auth/AuthContext";
import ProtectedRoute from "../auth/ProtectedRoute";
import {
  NotificationProvider,
  NotificationViewport
} from "../notifications/NotificationContext";
import { ShopProvider } from "../shop/ShopContext";
import ProductDetailsPage from "../pages/shop/ProductDetailsPage";
import ProfilePage from "../pages/profile/ProfilePage";
import OrderDetailsPage from "../pages/orders/OrderDetailsPage";
import CheckoutPage from "../pages/shop/CheckoutPage";
import CategoriesPage from "../pages/shop/CategoriesPage";
import ShopPage from "../pages/shop/ShopPage";
import SellerDashboard from "../pages/seller/SellerDashboard";
import DeliveryDashboard from "../pages/delivery/DeliveryDashboard";
import AuthPage from "../pages/auth/AuthPage";

export default function AppRoutes() {
  return (
    <NotificationProvider>
      <AuthProvider>
        <ShopProvider>
          <Routes>
            <Route path="/" element={<ShopPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/categories/:categorySlug" element={<ShopPage />} />
            <Route path="/products/:slug" element={<ProductDetailsPage />} />
            <Route path="/login" element={<AuthPage role="customer" />} />
            <Route
              path="/signup"
              element={<AuthPage defaultMode="signup" role="customer" />}
            />
            <Route
              path="/login/store-owner"
              element={<AuthPage role="seller" />}
            />
            <Route
              path="/login/delivery"
              element={<AuthPage role="delivery" />}
            />
            <Route
              path="/checkout"
              element={
                <ProtectedRoute roles={["customer"]}>
                  <CheckoutPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/orders/:orderId"
              element={
                <ProtectedRoute>
                  <OrderDetailsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/seller"
              element={
                <ProtectedRoute roles={["seller"]}>
                  <SellerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/delivery"
              element={
                <ProtectedRoute roles={["delivery"]}>
                  <DeliveryDashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
        </ShopProvider>
        <NotificationViewport />
      </AuthProvider>
    </NotificationProvider>
  );
}
