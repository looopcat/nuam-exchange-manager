import React, { useState } from "react";
import { authAPI } from "../services/api";
import "./Login.css";

export default function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await authAPI.login(username, password);

      if (response.success) {
        // Store session token and user data in localStorage
        localStorage.setItem("session_token", response.session_token);
        localStorage.setItem("user", JSON.stringify(response.user));

        // Call parent callback to update app state
        onLoginSuccess(response.user);
      } else {
        setError(response.message || "Login failed");
      }
    } catch (err) {
      setError(err.message || "Error connecting to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>NUAM Exchange</h1>
        <p className="subtitle">Plataforma de Trading Multi-Bolsa</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Nombre de Usuario</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="p.ej., MirtaAguilar"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Contrasena</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ingrese su contrasena"
              required
              disabled={loading}
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" disabled={loading} className="login-button">
            {loading ? "Iniciando sesion..." : "Iniciar sesion"}
          </button>
        </form>

        <div className="test-credentials">
          <p className="test-title">Credenciales de Prueba:</p>
          <ul>
            <li><strong>Operador:</strong> MirtaAguilar / 1234</li>
            <li><strong>Admin:</strong> GabrielFuentes / admin</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
