import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getStoredToken, setStoredToken, clearStoredToken, apiFetch } from "../utils/api";

export interface AdminUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "Super Admin" | "Admin" | "Employee";
  avatar?: string;
  permissions?: string[];
}

interface AuthContextType {
  adminUser: AdminUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  verifyToken: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(() => {
    try {
      const saved = localStorage.getItem("nivora_admin_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState<string | null>(getStoredToken());
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!token && !!adminUser);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const verifyToken = async (): Promise<boolean> => {
    const currentToken = getStoredToken();
    if (!currentToken) {
      setIsAuthenticated(false);
      setAdminUser(null);
      setToken(null);
      setIsLoading(false);
      return false;
    }

    try {
      const res = await fetch("/api/auth/verify", {
        headers: {
          "Authorization": `Bearer ${currentToken}`
        }
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.user) {
          // Verify user role is an admin role
          const role = data.user.role || "Admin";
          if (["Super Admin", "Admin", "Employee"].includes(role)) {
            const userObj: AdminUser = {
              id: data.user.id || "USR-001",
              firstName: data.user.firstName || "Admin",
              lastName: data.user.lastName || "User",
              email: data.user.email,
              role: role,
              avatar: data.user.avatar || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80"
            };
            setAdminUser(userObj);
            setToken(currentToken);
            setIsAuthenticated(true);
            localStorage.setItem("nivora_admin_user", JSON.stringify(userObj));
            setIsLoading(false);
            return true;
          }
        }
      }

      // Token invalid or unauthorized
      clearStoredToken();
      setAdminUser(null);
      setToken(null);
      setIsAuthenticated(false);
      setIsLoading(false);
      return false;
    } catch (err) {
      console.error("Failed to verify authentication token:", err);
      // Fall back to saved local user if offline / network error but valid token
      if (adminUser && currentToken) {
        setIsAuthenticated(true);
        setIsLoading(false);
        return true;
      }
      setIsAuthenticated(false);
      setIsLoading(false);
      return false;
    }
  };

  useEffect(() => {
    verifyToken();
  }, []);

  const login = async (email: string, password: string, rememberMe = true): Promise<{ success: boolean; message?: string }> => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        const allowedRoles = ["Super Admin", "Admin", "Employee"];
        if (!allowedRoles.includes(data.role)) {
          setIsLoading(false);
          return {
            success: false,
            message: "Forbidden: You do not have administrative access permissions."
          };
        }

        const userObj: AdminUser = {
          id: data.user?.id || "USR-001",
          firstName: data.user?.firstName || "Admin",
          lastName: data.user?.lastName || "User",
          email: data.user?.email || email,
          role: data.role as any,
          avatar: data.user?.avatar || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80"
        };

        const authToken = data.token;
        setStoredToken(authToken, rememberMe);
        localStorage.setItem("nivora_admin_user", JSON.stringify(userObj));

        setToken(authToken);
        setAdminUser(userObj);
        setIsAuthenticated(true);
        setIsLoading(false);

        return { success: true };
      } else {
        setIsLoading(false);
        return {
          success: false,
          message: data.message || "Invalid administrative credentials."
        };
      }
    } catch (err: any) {
      setIsLoading(false);
      return {
        success: false,
        message: err?.message || "Failed to communicate with authentication gateway."
      };
    }
  };

  const logout = () => {
    clearStoredToken();
    setAdminUser(null);
    setToken(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        adminUser,
        token,
        isAuthenticated,
        isLoading,
        login,
        logout,
        verifyToken
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
