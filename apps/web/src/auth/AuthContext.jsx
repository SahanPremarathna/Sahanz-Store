import { createContext, useContext, useEffect, useState } from "react";
import { getDemoUsers, getProfile, loginDemo, updateProfile } from "../api/client";

const AuthContext = createContext(null);
const STORAGE_KEY = "sahanz-store-user-id";

export function AuthProvider({ children }) {
  const [users, setUsers] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    getDemoUsers()
      .then((availableUsers) => {
        if (!isMounted) {
          return;
        }

        setUsers(availableUsers);

        const savedUserId = window.localStorage.getItem(STORAGE_KEY);
        const defaultUserId = savedUserId || availableUsers[0]?.id;

        if (!defaultUserId) {
          setLoading(false);
          return;
        }

        return loginDemo(defaultUserId).then((response) => {
          if (!isMounted) {
            return;
          }

          setUser(response.user);
          window.localStorage.setItem(STORAGE_KEY, response.user.id);
          setLoading(false);
        });
      })
      .catch(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  async function loginById(userId) {
    const response = await loginDemo(userId);
    setUser(response.user);
    window.localStorage.setItem(STORAGE_KEY, response.user.id);
  }

  async function refreshProfile(activeUser = user) {
    if (!activeUser?.id) {
      return null;
    }

    const profile = await getProfile(activeUser);
    setUser(profile);
    setUsers((currentUsers) =>
      currentUsers.map((entry) => (entry.id === profile.id ? profile : entry))
    );
    return profile;
  }

  async function saveProfile(payload) {
    if (!user?.id) {
      throw new Error("Authentication required");
    }

    const profile = await updateProfile(payload, user);
    setUser(profile);
    setUsers((currentUsers) =>
      currentUsers.map((entry) => (entry.id === profile.id ? profile : entry))
    );
    return profile;
  }

  function logout() {
    setUser(null);
    window.localStorage.removeItem(STORAGE_KEY);
  }

  const value = {
    loading,
    user,
    users,
    loginById,
    refreshProfile,
    saveProfile,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
