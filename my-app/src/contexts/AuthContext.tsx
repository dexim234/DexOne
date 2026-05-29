"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  checkAuth: () => boolean;
  setAuthenticated: (value: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = () => {
    // Check if user has logged in before
    const hasAuth = localStorage.getItem('user-authenticated') === 'true';
    setIsAuthenticated(hasAuth);
    return hasAuth;
  };

  useEffect(() => {
    // Check auth on mount
    const auth = checkAuth();
    setIsAuthenticated(auth);
    setIsLoading(false);
  }, []);

  const setAuthenticated = (value: boolean) => {
    setIsAuthenticated(value);
    localStorage.setItem('user-authenticated', value.toString());
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, checkAuth, setAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}