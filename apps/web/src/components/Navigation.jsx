import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { useNotifications } from "../notifications/NotificationContext";

export default function Navigation() {
  const { loading, loginById, logout, user, users } = useAuth();
  const notifications = useNotifications();

  async function handleRoleSwitch(accountId) {
    try {
      await loginById(accountId);
      const account = users.find((entry) => entry.id === accountId);
      notifications.success(
        `You are now signed in as ${account?.name || "the selected user"}.`,
        "Role switched"
      );
    } catch (error) {
      notifications.error(error.message, "Role switch failed");
    }
  }

  function handleLogout() {
    logout();
    notifications.info("You have been signed out of the demo account.", "Signed out");
  }

  return (
    <header className="topbar">
      <div>
        <Link className="brand" to="/">
          Sahanz Store
        </Link>
        <p className="brand-tagline">
          Customer storefront first, with separate seller and delivery portals.
        </p>
      </div>
      <div className="nav-shell">
        <nav className="nav">
          <NavLink to="/">Customer Store</NavLink>
          <NavLink to="/profile">Profile</NavLink>
          <NavLink to="/seller">Seller Portal</NavLink>
          <NavLink to="/delivery">Delivery Portal</NavLink>
        </nav>
        <div className="auth-cluster">
          {loading ? <span className="pill">Loading users...</span> : null}
          {user ? (
            <span className="pill">Signed in as {user.name}</span>
          ) : (
            <span className="pill">Signed out</span>
          )}
          {users.map((account) => (
            <button
              key={account.id}
              className={`role-button ${user?.id === account.id ? "active" : ""}`}
              onClick={() => handleRoleSwitch(account.id)}
              type="button"
            >
              {account.role}
            </button>
          ))}
          {user ? (
            <button className="ghost-button" onClick={handleLogout} type="button">
              Sign out
            </button>
          ) : null}
        </div>
      </div>
    </header>
  );
}
