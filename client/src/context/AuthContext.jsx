import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem("tender_auth_token") || null);
    const [loading, setLoading] = useState(true);

    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

    useEffect(() => {
        const initAuth = async () => {
            const storedToken = localStorage.getItem("tender_auth_token");
            if (storedToken) {
                try {
                    const res = await fetch(`${API_URL}/auth/me`, {
                        headers: { Authorization: `Bearer ${storedToken}` },
                    });
                    if (res.ok) {
                        const userData = await res.json();
                        setUser(userData);
                        setToken(storedToken);
                    } else {
                        // Token invalid/expired
                        logout();
                    }
                } catch (err) {
                    console.error("Auth init error:", err);
                    logout();
                }
            }
            setLoading(false);
        };

        initAuth();
    }, []);

    const login = async (email, password) => {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        const data = await res.json();
        if (!res.ok) {
            throw new Error(data.error || "Failed to login");
        }

        localStorage.setItem("tender_auth_token", data.token);
        setToken(data.token);
        setUser(data.user);
        return data.user;
    };

    const register = async (userData) => {
        const res = await fetch(`${API_URL}/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(userData),
        });

        const data = await res.json();
        if (!res.ok) {
            throw new Error(data.error || "Failed to register");
        }

        localStorage.setItem("tender_auth_token", data.token);
        setToken(data.token);
        setUser(data.user);
        return data.user;
    };

    const logout = () => {
        localStorage.removeItem("tender_auth_token");
        setToken(null);
        setUser(null);
    };

    const isSuperAdmin = user && user.role === "superadmin";

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                loading,
                login,
                register,
                logout,
                isAuthenticated: !!user,
                isSuperAdmin,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
