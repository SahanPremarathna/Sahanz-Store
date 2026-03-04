import { Route, Routes } from "react-router-dom";
import { AuthProvider } from "../auth/AuthContext";
import ProtectedRoute from "../auth/ProtectedRoute";
import ShopPage from "../pages/shop/ShopPage";
import SellerDashboard from "../pages/seller/SellerDashboard";
import DeliveryDashboard from "../pages/delivery/DeliveryDashboard";

export default function AppRoutes() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<ShopPage />} />
        <Route
          path="/seller"
          element={
            <ProtectedRoute>
              <SellerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/delivery"
          element={
            <ProtectedRoute>
              <DeliveryDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </AuthProvider>
  );
}
