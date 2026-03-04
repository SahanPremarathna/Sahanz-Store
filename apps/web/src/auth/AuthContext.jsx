import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  deleteAccount as deleteAccountRequest,
  deleteListings as deleteListingsRequest,
  deleteStore as deleteStoreRequest,
  getProfile,
  login,
  register,
  updateProfile
} from "../api/client";

const AuthContext = createContext(null);
const STORAGE_KEY = "sahanz-store-session";

function readStoredSession() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);

    if (!parsed?.token) {
      return null;
    }

    return parsed;
  } catch (_error) {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const storedSession = readStoredSession();

    if (!storedSession?.token) {
      setLoading(false);
      return undefined;
    }

    setToken(storedSession.token);

    getProfile(storedSession.token)
      .then((profile) => {
        if (!isMounted) {
          return;
        }

        setUser(profile);
      })
      .catch(() => {
        if (!isMounted) {
          return;
        }

        window.localStorage.removeItem(STORAGE_KEY);
        setToken(null);
        setUser(null);
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  function persistSession(nextToken, nextUser) {
    setToken(nextToken);
    setUser(nextUser);
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        token: nextToken
      })
    );
  }

  async function loginWithCredentials(payload) {
    const response = await login(payload);
    persistSession(response.token, response.user);
    return response.user;
  }

  async function registerUser(payload) {
    const response = await register(payload);
    persistSession(response.token, response.user);
    return response.user;
  }

  async function refreshProfile() {
    if (!token) {
      return null;
    }

    const profile = await getProfile(token);
    setUser(profile);
    return profile;
  }

  async function saveProfile(payload) {
    if (!token) {
      throw new Error("Authentication required");
    }

    const profile = await updateProfile(payload, token);
    setUser((current) => ({
      ...current,
      ...profile
    }));
    return profile;
  }

  async function deleteAccount() {
    if (!token) {
      throw new Error("Authentication required");
    }

    await deleteAccountRequest(token);
    logout();
  }

  async function deleteStore() {
    if (!token) {
      throw new Error("Authentication required");
    }

    await deleteStoreRequest(token);
    logout();
  }

  async function deleteListings() {
    if (!token) {
      throw new Error("Authentication required");
    }

    await deleteListingsRequest(token);
  }

  function logout() {
    setToken(null);
    setUser(null);
    window.localStorage.removeItem(STORAGE_KEY);
  }

  const value = useMemo(
    () => ({
      deleteAccount,
      deleteListings,
      deleteStore,
      isAuthenticated: Boolean(token && user),
      loading,
      login: loginWithCredentials,
      logout,
      refreshProfile,
      register: registerUser,
      saveProfile,
      token,
      user
    }),
    [loading, token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
