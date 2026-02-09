import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

const AuthContext = createContext();

const API_BASE_URL = (process.env.REACT_APP_BACKEND_BASE_URL || "http://127.0.0.1:8000/_b_a_c_k_e_n_d/travellerinwebsite").replace(/\/$/, "");

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [userType, setUserType] = useState(localStorage.getItem("userType") || null);
  const [loading, setLoading] = useState(true);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedType = localStorage.getItem("userType");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    if (storedType) {
      setUserType(storedType);
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (phone, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, password }),
      });
      const data = await response.json();
      if (response.ok) {
        setUser(data.user);
        setToken(data.tokens.access);
        setUserType('customer');
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("token", data.tokens.access);
        localStorage.setItem("refresh_token", data.tokens.refresh);
        localStorage.setItem("userType", 'customer');
        return { success: true };
      }
      return { success: false, error: data.error || "Login failed" };
    } catch (err) {
      return { success: false, error: "Network error" };
    }
  }, []);

  const adminLogin = useCallback(async (phone, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/admin/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, password }),
      });
      const data = await response.json();
      if (response.ok) {
        setUser(data.user);
        setToken(data.tokens.access);
        setUserType('admin');
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("token", data.tokens.access);
        localStorage.setItem("refresh_token", data.tokens.refresh);
        localStorage.setItem("userType", 'admin');
        return { success: true };
      }
      return { success: false, error: data.error || "Login failed" };
    } catch (err) {
      return { success: false, error: "Network error" };
    }
  }, []);

  const signup = useCallback(async (userData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });
      const data = await response.json();
      if (response.ok) {
        setUser(data.user);
        setToken(data.tokens.access);
        setUserType('customer');
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("token", data.tokens.access);
        localStorage.setItem("refresh_token", data.tokens.refresh);
        localStorage.setItem("userType", 'customer');
        return { success: true };
      }
      return { success: false, error: data.error || "Signup failed" };
    } catch (err) {
      return { success: false, error: "Network error" };
    }
  }, []);

  const googleLogin = useCallback(async (token, phone = null) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/google/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, phone }),
      });
      const data = await response.json();

      if (response.status === 200 || response.status === 201) {
        setUser(data.user);
        setToken(data.tokens.access);
        setUserType('customer');
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("token", data.tokens.access);
        localStorage.setItem("refresh_token", data.tokens.refresh);
        localStorage.setItem("userType", 'customer');
        return { success: true, isNewUser: data.is_new_user };
      } else if (response.status === 202) {
        // User needs to provide phone number
        return { success: false, requiresPhone: true, email: data.email, name: data.name };
      }

      return { success: false, error: data.error || "Google Login failed" };
    } catch (err) {
      return { success: false, error: "Network error" };
    }
  }, []);

  const updateUser = useCallback((updatedUserData) => {
    setUser(prev => ({ ...prev, ...updatedUserData }));
    localStorage.setItem("user", JSON.stringify({ ...user, ...updatedUserData }));
  }, [user]);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    setUserType(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("userType");
  }, []);

  const toggleLoginModal = useCallback(() => {
    setIsLoginModalOpen(prev => !prev);
  }, []);

  const openLoginModal = useCallback(() => {
    setIsLoginModalOpen(true);
  }, []);

  const closeLoginModal = useCallback(() => {
    setIsLoginModalOpen(false);
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      token,
      userType,
      isAdmin: userType === 'admin',
      loading,
      login,
      adminLogin,
      signup,
      googleLogin,
      updateUser,
      logout,
      isLoginModalOpen,
      toggleLoginModal,
      openLoginModal,
      closeLoginModal
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);