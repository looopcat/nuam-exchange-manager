import React, { useState, useEffect } from "react";
import Login from "./components/Login";
import OperadorDashboard from "./components/OperadorDashboard";
import AdminDashboard from "./components/AdminDashboard";
import "./App.css";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in (restore session from localStorage)
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("session_token");

    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error("Error parsing stored user:", err);
        localStorage.removeItem("user");
        localStorage.removeItem("session_token");
      }
    }

    setLoading(false);
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="app">
      {!user ? (
        <Login onLoginSuccess={handleLoginSuccess} />
      ) : user.rol === "Admin" ? (
        <AdminDashboard user={user} onLogout={handleLogout} />
      ) : user.rol === "Operador" ? (
        <OperadorDashboard user={user} onLogout={handleLogout} />
      ) : (
        <div className="error-page">
          <h2>Unknown Role</h2>
          <p>Your user role "{user.rol}" is not recognized.</p>
          <button onClick={handleLogout}>Go back to Login</button>
        </div>
      )}
    </div>
  );
}

export default App;
