import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/client";

const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || null;
    } catch {
      return null;
    }
  });
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token && typeof api?.setToken === "function") {
      api.setToken(token);
    }
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });

    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    if (typeof api?.setToken === "function") api.setToken(data.token);

    setUser(data.user);
  };

  const logout = () => {

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);

    localStorage.removeItem("pz-cart");

    window.dispatchEvent(new Event("pz:cart:clear"));
  };

  return (
    <AuthCtx.Provider value={{ user, login, logout }}>
      {children}
    </AuthCtx.Provider>
  );
}
