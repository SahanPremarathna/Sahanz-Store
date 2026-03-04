import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

function getLoginPath(roles) {
  if (roles.includes("seller")) {
    return "/login/store-owner";
  }

  if (roles.includes("delivery")) {
    return "/login/delivery";
  }

  return "/login";
}

export default function ProtectedRoute({ children, roles = [] }) {
  const { loading, user } = useAuth();

  if (loading) {
    return <div className="layout">Loading...</div>;
  }

  if (!user) {
    return <Navigate to={getLoginPath(roles)} replace />;
  }

  if (roles.length && !roles.includes(user.role)) {
    return <Navigate to={user.role === "seller" ? "/seller" : user.role === "delivery" ? "/delivery" : "/"} replace />;
  }

  return children;
}
