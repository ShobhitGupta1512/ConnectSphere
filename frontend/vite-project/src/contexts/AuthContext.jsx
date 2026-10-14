
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import api from "../services/api";
import {
  getAccessToken,
  setAccessToken,
  clearAccessToken,
} from "../services/tokenStore";

const AuthContext = createContext(null);

// Share one session-restoration request across StrictMode effect executions.
let sessionRestorePromise = null;

function restoreUserSession() {
  if (!sessionRestorePromise) {
    sessionRestorePromise = (async () => {
      let token = getAccessToken();

      if (!token) {
        const refreshResponse = await api.post("/users/refresh", {});
        token = refreshResponse.data.accessToken;

        if (!token) {
          throw new Error("No access token returned");
        }

        setAccessToken(token);
      }

      const profileResponse = await api.get("/users/me");
      return profileResponse.data.user;
    })().finally(() => {
      sessionRestorePromise = null;
    });
  }

  return sessionRestorePromise;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadSession = useCallback(async () => {
    try {
      const restoredUser = await restoreUserSession();
      setUser(restoredUser ?? null);
      return restoredUser;
    } catch (error) {
      clearAccessToken();
      setUser(null);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    const restoreSession = async () => {
      try {
        const restoredUser = await restoreUserSession();

        if (active) {
          setUser(restoredUser ?? null);
        }
      } catch {
        clearAccessToken();

        if (active) {
          setUser(null);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    const handleExpired = () => {
      clearAccessToken();
      setUser(null);
    };

    window.addEventListener("auth:expired", handleExpired);
    void restoreSession();

    return () => {
      active = false;
      window.removeEventListener("auth:expired", handleExpired);
    };
  }, []);

  const login = async (credentials) => {
    const response = await api.post("/users/login", credentials);
    const token = response.data.accessToken;

    if (!token) {
      throw new Error("Login response did not contain an access token");
    }

    setAccessToken(token);
    setUser(response.data.user);

    return response.data.user;
  };

  const register = async (details) => {
    await api.post("/users/register", details);

    return login({
      username: details.username,
      password: details.password,
    });
  };

  const logout = async () => {
    try {
      await api.post("/users/logout");
    } finally {
      clearAccessToken();
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        reloadSession: loadSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
