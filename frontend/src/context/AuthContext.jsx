// src/context/AuthContext.jsx
import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState("loading");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const storedUser = localStorage.getItem("user");

    if (token) {
      // If user data is in localStorage, use it immediately
      if (storedUser) {
        setUser(JSON.parse(storedUser));
        setAuthState("authenticated");
      } else {
        // Fetch profile if no user data in localStorage
        fetch("http://localhost:5000/auth/profile", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
          .then((response) => {
            if (!response.ok) {
              if (response.status === 401) {
                throw new Error("Unauthorized");
              }
              throw new Error("Failed to fetch profile");
            }
            return response.json();
          })
          .then((data) => {
            const userData = {
              name: data.fullName || "N/A",
              email: data.username,
              profilePic: `https://ui-avatars.com/api/?name=${encodeURIComponent(
                data.fullName || data.username
              )}&background=random`,
            };
            setUser(userData);
            setAuthState("authenticated");
            localStorage.setItem("user", JSON.stringify(userData)); // Sync localStorage
          })
          .catch((err) => {
            console.error("Fetch error:", err.message);
            setAuthState("unauthenticated");
            setUser(null);
          });
      }
    } else {
      setAuthState("unauthenticated");
      setUser(null);
    }
  }, []);

  const handleLogin = (userData, token) => {
    setUser(userData);
    setAuthState("authenticated");
    localStorage.setItem("authToken", token);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    setAuthState("unauthenticated");
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider
      value={{ authState, user, handleLogin, handleLogout }}
    >
      {children}
    </AuthContext.Provider>
  );
};
