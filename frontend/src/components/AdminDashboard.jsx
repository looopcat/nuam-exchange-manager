import React, { useState, useEffect } from "react";
import { adminAPI, authAPI, ordenesAPI } from "../services/api";
import "./AdminDashboard.css";

export default function AdminDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState("reportes");
  const [transacciones, setTransacciones] = useState([]);
  const [tarifas, setTarifas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Tarifa form state
  const [tarifaForm, setTarifaForm] = useState({
    bolsa: "CL",
    tarifa_base: "",
  });
  const [submittingTarifa, setSubmittingTarifa] = useState(false);

  // Load data when tab changes
  useEffect(() => {
    if (activeTab === "reportes") {
      fetchReportes();
    } else if (activeTab === "tarifas") {
      fetchTarifas();
    }
  }, [activeTab]);

  const fetchReportes = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await adminAPI.getReports(20);

      if (response.success) {
        setTransacciones(response.transacciones);
      } else {
        setError(response.message || "Error al cargar reportes");
      }
    } catch (err) {
      setError(err.message || "Error cargando reportes");
    } finally {
      setLoading(false);
    }
  };

  const fetchTarifas = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await adminAPI.getTarifas();

      if (response.success) {
        setTarifas(response.tarifas);
      } else {
        setError(response.message || "Error al cargar tarifas");
      }
    } catch (err) {
      setError(err.message || "Error cargando tarifas");
    } finally {
      setLoading(false);
    }
  };

  const handleTarifaChange = (e) => {
    const { name, value } = e.target;
    setTarifaForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmitTarifa = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setSubmittingTarifa(true);

    try {
      const { bolsa, tarifa_base } = tarifaForm;

      if (!tarifa_base || parseFloat(tarifa_base) < 0) {
        throw new Error("Por favor ingrese una tarifa valida");
      }

      const response = await adminAPI.configureTarifas(
        bolsa,
        parseFloat(tarifa_base)
      );

      if (response.success) {
        setSuccessMessage(response.message);
        setTarifaForm({ bolsa: "CL", tarifa_base: "" });

        // Refresh tarifas list
        setTimeout(() => fetchTarifas(), 500);
      } else {
        setError(response.message || "Error al configurar tarifa");
      }
    } catch (err) {
      setError(err.message || "Error configurando tarifa");
    } finally {
      setSubmittingTarifa(false);
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
    <div className="admin-container">
      <header className="dashboard-header">
        <div className="header-left">
          <h1>NUAM Exchange</h1>
          <p>Panel de Administrador</p>
        </div>
        <div className="header-right">
          <div className="user-info">
            <span className="user-name">{user.nombre}</span>
            <span className="user-rol">({user.rol})</span>
            <span className="user-region">{user.perfilBolsa}</span>
          </div>
          <button onClick={handleLogout} className="logout-button">
            Cerrar sesion
          </button>
        </div>
      </header>

      <div className="dashboard-content">
        <nav className="tab-navigation">
          <button
            className={`tab-button ${activeTab === "reportes" ? "active" : ""}`}
            onClick={() => setActiveTab("reportes")}
          >
            Reportes de Transacciones (HU04)
          </button>
          <button
            className={`tab-button ${activeTab === "tarifas" ? "active" : ""}`}
            onClick={() => setActiveTab("tarifas")}
          >
            Configurar Tarifas (HU02)
          </button>
        </nav>

        {error && <div className="error-message">{error}</div>}
        {successMessage && (
          <div className="success-message">{successMessage}</div>
        )}

        {/* Reports Tab */}
        {activeTab === "reportes" && (
          <section className="reportes-section">
            <h2>Reporte Consolidado de Transacciones</h2>

            {loading ? (
              <p className="loading">Cargando reportes...</p>
            ) : transacciones.length > 0 ? (
              <table className="transactions-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Bolsa</th>
                    <th>Orden Compra</th>
                    <th>Orden Venta</th>
                    <th>Cantidad</th>
                    <th>Precio Ejecucion</th>
                    <th>Monto Total</th>
                    <th>Ejecutada</th>
                  </tr>
                </thead>
                <tbody>
                  {transacciones.map((t) => (
                    <tr key={t.idTransaccion}>
                      <td>{t.idTransaccion}</td>
                      <td className="bolsa-badge">{t.bolsaOrigen}</td>
                      <td>{t.idOrdenCompra}</td>
                      <td>{t.idOrdenVenta}</td>
                      <td>{t.cantidadEjecutada}</td>
                      <td>${t.precioEjecucion.toFixed(2)}</td>
                      <td className="amount">${t.monto.toFixed(2)}</td>
                      <td>{new Date(t.fechaEjecucion).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="no-data">No hay transacciones aun.</p>
            )}
          </section>
        )}

        {/* Tarifas Tab */}
        {activeTab === "tarifas" && (
          <section className="tarifas-section">
            <h2>Configuracion de Tarifas de Mercado</h2>

            <div className="tarifas-content">
              {/* Configuration Form */}
              <div className="tarifa-form-container">
                <h3>Establecer Nueva Tarifa</h3>
                <form onSubmit={handleSubmitTarifa} className="tarifa-form">
                  <div className="form-group">
                    <label htmlFor="bolsa">Bolsa (Exchange)</label>
                    <select
                      id="bolsa"
                      name="bolsa"
                      value={tarifaForm.bolsa}
                      onChange={handleTarifaChange}
                      disabled={submittingTarifa}
                    >
                      <option value="CL">Chile (CL)</option>
                      <option value="PE">Peru (PE)</option>
                      <option value="CO">Colombia (CO)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="tarifa_base">Tarifa Base (%)</label>
                    <input
                      id="tarifa_base"
                      type="number"
                      name="tarifa_base"
                      value={tarifaForm.tarifa_base}
                      onChange={handleTarifaChange}
                      placeholder="0.005"
                      step="0.001"
                      min="0"
                      disabled={submittingTarifa}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submittingTarifa}
                    className="submit-button"
                  >
                    {submittingTarifa ? "Configurando..." : "Configurar Tarifa"}
                  </button>
                </form>
              </div>

              {/* Current Tarifas */}
              <div className="tarifas-list-container">
                <h3>Tarifas Actuales</h3>
                {loading ? (
                  <p className="loading">Cargando tarifas...</p>
                ) : tarifas.length > 0 ? (
                  <div className="tarifas-grid">
                    {tarifas.map((tarifa, idx) => (
                      <div key={idx} className="tarifa-card">
                        <h4>{tarifa.idMercado || "Desconocido"}</h4>
                        <p className="rate">
                          {(tarifa.tarifa_base * 100).toFixed(3)}%
                        </p>
                        {tarifa.timestamp && (
                          <p className="timestamp">
                            Actualizada: {new Date(tarifa.timestamp).toLocaleString()}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-data">No hay tarifas configuradas aun.</p>
                )}
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
