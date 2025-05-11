"use client";

import type React from "react";

import { createContext, useContext, useState, useEffect } from "react";

type User = {
  email: string;
  token: string;
  displayName: string;
  profile: string;
  validUser: boolean;

  id?: string;
  college?: string;
  isAnonymous?: boolean;
} | null;

type AuthContextType = {
  user: User;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, college: string) => Promise<void>;
  logout: () => void;
  resetPassword: (email: string) => Promise<void>;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);

  // Simulate checking for existing session
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
  setLoading(true);
  try {
    const API = `${process.env.NEXT_PUBLIC_API_URL}api/auth/login`;
    const response = await fetch(API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Login failed");
    }

    const newUser = {
      id: email,
      email,
      token: data.token,
      profile: data.profile,
      displayName: data.username,
      validUser: true,
      college: "college.edu",
      isAnonymous: false,
    };

    setUser(newUser);
    localStorage.setItem("user", JSON.stringify(newUser));
  } catch (err) {
    console.error("Login error:", err);
    throw err;
  } finally {
    setLoading(false);
  }
  };
  const register = async (email: string, password: string, college: string) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Validate college email
      if (!email.endsWith(".edu")) {
        throw new Error("Only college email addresses are allowed");
      }

      // Mock successful registration
      const newUser = {
        id: "user-" + Math.random().toString(36).substr(2, 9),
        email,
        displayName: "Anonymous Student",
        college,
        isAnonymous: true,
      };

      setUser(newUser);
      localStorage.setItem("user", JSON.stringify(newUser));
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  const resetPassword = async (email: string) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Validate college email
      if (!email.endsWith(".edu")) {
        throw new Error("Only college email addresses are allowed");
      }

      // In a real app, this would send a password reset email
      console.log("Password reset email sent to", email);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, login, register, logout, resetPassword, loading }}
    >
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
