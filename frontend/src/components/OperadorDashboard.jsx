import React, { useState, useEffect } from "react";
import { ordenesAPI, authAPI } from "../services/api";
import "./OperadorDashboard.css";

export default function OperadorDashboard({ user, onLogout }) {
  const [ordenes, setOrdenes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    instrumento: "",
    tipo: "Compra",
    cantidad: "",
    precioLimite: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Load user's orders on component mount
  useEffect(() => {
    fetchOrdenes();
  }, []);

  const fetchOrdenes = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await ordenesAPI.getOrders(20);

      if (response.success) {
        setOrdenes(response.ordenes);
      } else {
        setError(response.message || "Error al cargar ordenes");
      }
    } catch (err) {
      setError(err.message || "Error cargando ordenes");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setSubmitting(true);

    try {
      const { instrumento, tipo, cantidad, precioLimite } = formData;

      // Validate inputs
      if (!instrumento || !cantidad) {
        throw new Error("Por favor complete todos los campos requeridos");
      }

      if (parseInt(cantidad) <= 0) {
        throw new Error("La cantidad debe ser mayor a cero");
      }

      const precioFinal = precioLimite ? parseFloat(precioLimite) : null;

      const response = await ordenesAPI.placeOrder(
        instrumento.toUpperCase(),
        tipo,
        parseInt(cantidad),
        precioFinal
      );

      if (response.success) {
        setSuccessMessage(response.message);
        setFormData({
          instrumento: "",
          tipo: "Compra",
          cantidad: "",
          precioLimite: "",
        });

        // Refresh orders list
        setTimeout(() => fetchOrdenes(), 500);
      } else {
        setError(response.message || "Error al colocar orden");
      }
    } catch (err) {
      setError(err.message || "Error colocando orden");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      onLogout();
    } catch (err) {
      console.error("Logout error:", err);
      onLogout();
    }
  };

  return (
    <div className="operador-container">
      <header className="dashboard-header">
        <div className="header-left">
          <h1>NUAM Exchange</h1>
          <p>Panel del Operador</p>
        </div>
        <div className="header-right">
          <div className="user-info">
            <span className="user-name">{user.nombre}</span>
            <span className="user-rol">({user.rol})</span>
            <span className="user-bolsa">{user.perfilBolsa}</span>
          </div>
          <button onClick={handleLogout} className="logout-button">
            Cerrar sesion
          </button>
        </div>
      </header>

      <div className="dashboard-content">
        {/* Order Placement Form */}
        <section className="order-form-section">
          <h2>Colocar Orden (HU03)</h2>

          <form onSubmit={handleSubmitOrder} className="order-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="instrumento">Instrumento (Ticker)</label>
                <input
                  id="instrumento"
                  type="text"
                  name="instrumento"
                  value={formData.instrumento}
                  onChange={handleInputChange}
                  placeholder="p.ej., ENEL, SQM-B"
                  disabled={submitting}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="tipo">Tipo de Orden</label>
                <select
                  id="tipo"
                  name="tipo"
                  value={formData.tipo}
                  onChange={handleInputChange}
                  disabled={submitting}
                >
                  <option value="Compra">Compra (Buy)</option>
                  <option value="Venta">Venta (Sell)</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="cantidad">Cantidad</label>
                <input
                  id="cantidad"
                  type="number"
                  name="cantidad"
                  value={formData.cantidad}
                  onChange={handleInputChange}
                  placeholder="0"
                  min="1"
                  disabled={submitting}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="precioLimite">Precio Limite (Opcional)</label>
                <input
                  id="precioLimite"
                  type="number"
                  name="precioLimite"
                  value={formData.precioLimite}
                  onChange={handleInputChange}
                  placeholder="0.00 para orden de mercado"
                  step="0.01"
                  disabled={submitting}
                />
              </div>
            </div>

            {error && <div className="error-message">{error}</div>}
            {successMessage && (
              <div className="success-message">{successMessage}</div>
            )}

            <button type="submit" disabled={submitting} className="submit-button">
              {submitting ? "Colocando orden..." : "Colocar Orden"}
            </button>
          </form>
        </section>

        {/* Orders History */}
        <section className="orders-section">
          <h2>Mis Ordenes</h2>

          {loading ? (
            <p className="loading">Cargando ordenes...</p>
          ) : ordenes.length > 0 ? (
            <table className="orders-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Instrumento</th>
                  <th>Tipo</th>
                  <th>Cantidad</th>
                  <th>Precio Limite</th>
                  <th>Estado</th>
                  <th>Creada</th>
                </tr>
              </thead>
              <tbody>
                {ordenes.map((orden) => (
                  <tr key={orden.idOrden} className={`status-${orden.estado}`}>
                    <td>{orden.idOrden}</td>
                    <td className="instrumento">{orden.instrumento}</td>
                    <td>
                      <span className={`tipo-badge ${orden.tipo.toLowerCase()}`}>
                        {orden.tipo}
                      </span>
                    </td>
                    <td>{orden.cantidad}</td>
                    <td>${orden.precioLimite?.toFixed(2) || "Mercado"}</td>
                    <td>
                      <span className={`status-badge ${orden.estado.toLowerCase()}`}>
                        {orden.estado}
                      </span>
                    </td>
                    <td>{new Date(orden.fechaCreacion).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="no-orders">No hay ordenes. Cree una arriba!</p>
          )}
        </section>
      </div>
    </div>
  );
}
