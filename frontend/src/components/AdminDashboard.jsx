import React, { useState, useEffect } from "react";
import { adminAPI, authAPI, ordenesAPI } from "../services/api";
import "./AdminDashboard.css";

export default function AdminDashboard({ user, onLogout }) {
  const [activeSection, setActiveSection] = useState("tarifas");
  const [transacciones, setTransacciones] = useState([]);
  const [tarifas, setTarifas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [selectedBolsa, setSelectedBolsa] = useState("CL");

  // Tarifa form state
  const [tarifaForm, setTarifaForm] = useState({
    bolsa: "CL",
    tarifa_base: "",
  });
  const [submittingTarifa, setSubmittingTarifa] = useState(false);

  // Load data when section changes
  useEffect(() => {
    if (activeSection === "reportes") {
      fetchReportes();
    } else if (activeSection === "tarifas") {
      fetchTarifas();
    }
  }, [activeSection]);

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
    <div style={{ display: 'flex', minHeight: '100vh', background: 'white' }}>
      {/* Header */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 79,
        background: '#FCFFFB',
        boxShadow: '0px 4px 4px 1px rgba(0, 0, 0, 0.25)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingLeft: 24,
        paddingRight: 24,
        zIndex: 100
      }}>
        {/* Logo */}
        <img 
          src="/nuam-HD.png" 
          alt="NUAM Logo"
          style={{
            height: 50,
            width: 'auto',
            objectFit: 'contain'
          }}
        />

        {/* Right section - Nueva Orden Button */}
        <button
          onClick={() => {}}
          style={{
            padding: 12,
            background: '#EC221F',
            border: '1px solid #C00F0C',
            borderRadius: 8,
            color: '#FEE9E7',
            fontSize: 12,
            fontFamily: 'Inter, sans-serif',
            fontWeight: '400',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => e.target.style.background = '#D81A17'}
          onMouseLeave={(e) => e.target.style.background = '#EC221F'}
        >
          Nueva orden
        </button>
      </div>

      {/* Sidebar */}
      <div style={{
        marginTop: 79,
        width: 363,
        background: '#FF5F1F',
        minHeight: 'calc(100vh - 79px)',
        padding: 12,
        overflowY: 'auto',
        flexShrink: 0,
      }}>
        {/* Gestión de Usuarios - Título (no funcional) */}
        <div style={{
          width: '100%',
          padding: '18px 16px',
          background: '#FF5F1F',
          borderRadius: 16,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          marginBottom: 12,
          fontSize: 12,
          fontFamily: 'Roboto, sans-serif',
          fontWeight: '500',
          color: '#FFF8DC',
        }}>
          Gestión de Usuarios
        </div>

        {/* Usuarios Activos - No funcional */}
        <div style={{
          width: '100%',
          height: 56,
          background: '#FF5F1F',
          borderRadius: 100,
          padding: '16px 19px',
          marginBottom: 12,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          fontSize: 12,
          fontFamily: 'Roboto, sans-serif',
          fontWeight: '500',
          color: '#FFF8DC',
        }}>
          <span>Usuarios activos</span>
          <span style={{ marginLeft: 'auto' }}>24</span>
        </div>

        {/* Roles y Permisos - No funcional */}
        <div style={{
          width: '100%',
          height: 56,
          borderRadius: 100,
          padding: '16px 19px',
          marginBottom: 12,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          fontSize: 12,
          fontFamily: 'Roboto, sans-serif',
          fontWeight: '500',
          color: '#FFF8DC',
          background: '#FF5F1F',
        }}>
          Roles y Permisos
        </div>

        {/* Logs de Acceso - No funcional */}
        <div style={{
          width: '100%',
          height: 56,
          borderRadius: 100,
          padding: '16px 19px',
          marginBottom: 12,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          fontSize: 12,
          fontFamily: 'Roboto, sans-serif',
          fontWeight: '500',
          color: '#FFF8DC',
          background: '#FF5F1F',
        }}>
          Logs de Acceso
        </div>

        {/* Políticas de Seguridad - No funcional */}
        <div style={{
          width: '100%',
          height: 56,
          borderRadius: 100,
          padding: '16px 19px',
          marginBottom: 20,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          fontSize: 12,
          fontFamily: 'Roboto, sans-serif',
          fontWeight: '500',
          color: '#FFF8DC',
          background: '#FF5F1F',
        }}>
          Políticas de Seguridad
        </div>

        {/* Divider */}
        <div style={{
          width: '100%',
          height: 1,
          background: '#E8996D',
          marginBottom: 12,
        }}></div>

        {/* Configuración de Mercados - Título (no funcional) */}
        <div style={{
          width: '100%',
          padding: '18px 16px',
          background: '#FF5F1F',
          borderRadius: 100,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          marginBottom: 12,
          fontSize: 12,
          fontFamily: 'Roboto, sans-serif',
          fontWeight: '500',
          color: '#FFF8DC',
        }}>
          Configuración de Mercados
        </div>

        {/* Tarifas y Comisiones - FUNCIONAL */}
        <div
          onClick={() => setActiveSection('tarifas')}
          style={{
            width: '100%',
            height: 56,
            borderRadius: 100,
            padding: '16px 19px',
            marginBottom: 12,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            fontSize: 12,
            fontFamily: 'Roboto, sans-serif',
            fontWeight: '500',
            color: '#1E1E1E',
            cursor: 'pointer',
            background: activeSection === 'tarifas' ? 'white' : '#FF5F1F',
            color: activeSection === 'tarifas' ? '#1E1E1E' : '#FFF8DC',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => e.target.style.background = 'white'}
          onMouseLeave={(e) => e.target.style.background = activeSection === 'tarifas' ? 'white' : '#FF5F1F'}
        >
          Tarifas y Comisiones
        </div>

        {/* Horarios Operativos - No funcional */}
        <div style={{
          width: '100%',
          height: 56,
          borderRadius: 100,
          padding: '16px 19px',
          marginBottom: 12,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          fontSize: 12,
          fontFamily: 'Roboto, sans-serif',
          fontWeight: '500',
          color: '#FFF8DC',
          background: '#FF5F1F',
        }}>
          Horarios Operativos
        </div>

        {/* Reglas de trading - No funcional */}
        <div style={{
          width: '100%',
          height: 56,
          borderRadius: 100,
          padding: '16px 19px',
          marginBottom: 20,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          fontSize: 12,
          fontFamily: 'Roboto, sans-serif',
          fontWeight: '500',
          color: '#FFF8DC',
          background: '#FF5F1F',
        }}>
          Reglas de trading
        </div>

        {/* Divider */}
        <div style={{
          width: '100%',
          height: 1,
          background: '#E8996D',
          marginBottom: 12,
        }}></div>

        {/* Reporte de Transacciones - FUNCIONAL */}
        <div
          onClick={() => setActiveSection('reportes')}
          style={{
            width: '100%',
            padding: '18px 16px',
            background: activeSection === 'reportes' ? 'white' : '#FF5F1F',
            color: activeSection === 'reportes' ? '#1E1E1E' : '#FFF8DC',
            borderRadius: 100,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            marginBottom: 12,
            fontSize: 12,
            fontFamily: 'Roboto, sans-serif',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => e.target.style.background = 'white'}
          onMouseLeave={(e) => e.target.style.background = activeSection === 'reportes' ? 'white' : '#FF5F1F'}
        >
          Reporte de Transacciones
        </div>

        {/* Divider */}
        <div style={{
          width: '100%',
          height: 1,
          background: '#E8996D',
          marginBottom: 12,
        }}></div>

        {/* Monitoreo del Sistema - Título (no funcional) */}
        <div style={{
          width: '100%',
          padding: '18px 16px',
          borderRadius: 100,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          marginBottom: 12,
          fontSize: 12,
          fontFamily: 'Roboto, sans-serif',
          fontWeight: '500',
          color: '#FFF8DC',
          background: '#FF5F1F',
        }}>
          Monitoreo del Sistema
        </div>

        {/* Estado Servidores - No funcional */}
        <div style={{
          width: '100%',
          height: 56,
          borderRadius: 100,
          padding: '16px 19px',
          marginBottom: 12,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          fontSize: 12,
          fontFamily: 'Roboto, sans-serif',
          fontWeight: '500',
          color: '#FFF8DC',
          background: '#FF5F1F',
        }}>
          Estado Servidores
        </div>

        {/* Métricas Rendimiento - No funcional */}
        <div style={{
          width: '100%',
          height: 56,
          borderRadius: 100,
          padding: '16px 19px',
          marginBottom: 12,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          fontSize: 12,
          fontFamily: 'Roboto, sans-serif',
          fontWeight: '500',
          color: '#FFF8DC',
          background: '#FF5F1F',
        }}>
          Métricas Rendimiento
        </div>

        {/* Alertas del sistema - No funcional */}
        <div style={{
          width: '100%',
          height: 56,
          borderRadius: 100,
          padding: '16px 19px',
          marginBottom: 20,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          fontSize: 12,
          fontFamily: 'Roboto, sans-serif',
          fontWeight: '500',
          color: '#FFF8DC',
          background: '#FF5F1F',
        }}>
          Alertas del sistema
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          style={{
            width: '100%',
            padding: '12px',
            background: '#E54E4E',
            border: 'none',
            borderRadius: 8,
            color: 'white',
            fontSize: 12,
            fontFamily: 'Inter, sans-serif',
            fontWeight: '600',
            cursor: 'pointer',
            marginTop: 'auto',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => e.target.style.background = '#D81A17'}
          onMouseLeave={(e) => e.target.style.background = '#E54E4E'}
        >
          Cerrar Sesión
        </button>
      </div>

      {/* Main Content */}
      <div style={{
        marginTop: 79,
        marginLeft: 363,
        flex: 1,
        width: 'calc(100% - 363px)',
        padding: 32,
        overflowY: 'auto',
        minHeight: 'calc(100vh - 79px)',
        background: 'white',
        boxSizing: 'border-box',
      }}>
        {error && <div style={{background: '#FEE9E7', color: '#EC221F', padding: 16, borderRadius: 8, marginBottom: 20}}>{error}</div>}
        {successMessage && <div style={{background: '#E8F5E9', color: '#2E7D32', padding: 16, borderRadius: 8, marginBottom: 20}}>{successMessage}</div>}

        {/* Tarifas Section */}
        {activeSection === "tarifas" && (
          <div>
            <div style={{ marginBottom: 32 }}>
              <h2 style={{ color: '#E54E4E', fontSize: 20, fontFamily: 'Inter, sans-serif', fontWeight: '600', marginBottom: 24 }}>
                Configuracion de Tarifas
              </h2>

              {/* Bolsa Selector */}
              <div style={{ marginBottom: 32 }}>
                <select
                  value={selectedBolsa}
                  onChange={(e) => setSelectedBolsa(e.target.value)}
                  style={{
                    width: 359,
                    height: 42,
                    padding: '16px',
                    background: '#F5F5F5',
                    border: '1px solid #D9D9D9',
                    borderRadius: 8,
                    fontSize: 12,
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  <option value="CL">Selector Bolsa: Chile</option>
                  <option value="PE">Selector Bolsa: Perú</option>
                  <option value="CO">Selector Bolsa: Colombia</option>
                </select>
              </div>

              {/* Configuration Form */}
              <form onSubmit={handleSubmitTarifa} style={{ marginTop: 32, paddingTop: 32, borderTop: '1px solid #D9D9D9' }}>
                <h3 style={{ color: '#E54E4E', fontSize: 15, fontFamily: 'Inter, sans-serif', fontWeight: '600', marginBottom: 20 }}>
                  Establecer Nueva Tarifa
                </h3>

                <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: 8, fontSize: 12, fontFamily: 'Inter, sans-serif', fontWeight: '500', color: '#1E1E1E' }}>
                      Bolsa
                    </label>
                    <select
                      name="bolsa"
                      value={tarifaForm.bolsa}
                      onChange={handleTarifaChange}
                      disabled={submittingTarifa}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        border: '1px solid #D9D9D9',
                        borderRadius: 8,
                        fontSize: 12,
                        fontFamily: 'Inter, sans-serif',
                        background: 'white',
                      }}
                    >
                      <option value="CL">Chile (CL)</option>
                      <option value="PE">Perú (PE)</option>
                      <option value="CO">Colombia (CO)</option>
                    </select>
                  </div>

                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: 8, fontSize: 12, fontFamily: 'Inter, sans-serif', fontWeight: '500', color: '#1E1E1E' }}>
                      Tarifa Base (%)
                    </label>
                    <input
                      type="number"
                      name="tarifa_base"
                      value={tarifaForm.tarifa_base}
                      onChange={handleTarifaChange}
                      placeholder="0.005"
                      step="0.001"
                      min="0"
                      disabled={submittingTarifa}
                      required
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        border: '1px solid #D9D9D9',
                        borderRadius: 8,
                        fontSize: 12,
                        fontFamily: 'Inter, sans-serif',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submittingTarifa}
                  style={{
                    padding: '12px 32px',
                    background: '#EC221F',
                    border: '1px solid #C00F0C',
                    borderRadius: 8,
                    color: '#FEE9E7',
                    fontSize: 12,
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: '600',
                    cursor: submittingTarifa ? 'not-allowed' : 'pointer',
                    opacity: submittingTarifa ? 0.7 : 1,
                    transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={(e) => !submittingTarifa && (e.target.style.background = '#D81A17')}
                  onMouseLeave={(e) => !submittingTarifa && (e.target.style.background = '#EC221F')}
                >
                  {submittingTarifa ? 'Configurando...' : 'Configurar Tarifa'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Reportes Section */}
        {activeSection === "reportes" && (
          <div>
            <h2 style={{ color: '#E54E4E', fontSize: 20, fontFamily: 'Inter, sans-serif', fontWeight: '600', marginBottom: 24 }}>
              Reporte de Transacciones
            </h2>

            {loading ? (
              <p style={{ fontSize: 12, color: '#666' }}>Cargando reportes...</p>
            ) : transacciones.length > 0 ? (
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                borderRadius: 8,
                overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              }}>
                <thead>
                  <tr style={{ background: '#F5F5F5', borderBottom: '1px solid #D9D9D9' }}>
                    <th style={{ padding: 12, textAlign: 'left', fontWeight: '600', fontSize: 12, color: '#1E1E1E' }}>ID</th>
                    <th style={{ padding: 12, textAlign: 'left', fontWeight: '600', fontSize: 12, color: '#1E1E1E' }}>Bolsa</th>
                    <th style={{ padding: 12, textAlign: 'left', fontWeight: '600', fontSize: 12, color: '#1E1E1E' }}>Orden Compra</th>
                    <th style={{ padding: 12, textAlign: 'left', fontWeight: '600', fontSize: 12, color: '#1E1E1E' }}>Orden Venta</th>
                    <th style={{ padding: 12, textAlign: 'left', fontWeight: '600', fontSize: 12, color: '#1E1E1E' }}>Cantidad</th>
                    <th style={{ padding: 12, textAlign: 'left', fontWeight: '600', fontSize: 12, color: '#1E1E1E' }}>Precio Ejecución</th>
                    <th style={{ padding: 12, textAlign: 'left', fontWeight: '600', fontSize: 12, color: '#1E1E1E' }}>Monto Total</th>
                    <th style={{ padding: 12, textAlign: 'left', fontWeight: '600', fontSize: 12, color: '#1E1E1E' }}>Ejecutada</th>
                  </tr>
                </thead>
                <tbody>
                  {transacciones.map((t) => (
                    <tr key={t.idTransaccion} style={{ borderBottom: '1px solid #EEE', transition: 'background 0.2s' }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#F9F9F9'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'white'}>
                      <td style={{ padding: 12, fontSize: 12, color: '#1E1E1E' }}>{t.idTransaccion}</td>
                      <td style={{ padding: 12, fontSize: 12, color: '#1E1E1E' }}>
                        <span style={{ background: '#E46962', color: 'white', padding: '4px 12px', borderRadius: 4, fontSize: 12, fontWeight: '600' }}>
                          {t.bolsaOrigen}
                        </span>
                      </td>
                      <td style={{ padding: 12, fontSize: 12, color: '#1E1E1E' }}>{t.idOrdenCompra}</td>
                      <td style={{ padding: 12, fontSize: 12, color: '#1E1E1E' }}>{t.idOrdenVenta}</td>
                      <td style={{ padding: 12, fontSize: 12, color: '#1E1E1E' }}>{t.cantidadEjecutada}</td>
                      <td style={{ padding: 12, fontSize: 12, color: '#1E1E1E' }}>${t.precioEjecucion.toFixed(2)}</td>
                      <td style={{ padding: 12, fontSize: 12, color: '#1E1E1E', fontWeight: '600' }}>${t.monto.toFixed(2)}</td>
                      <td style={{ padding: 12, fontSize: 12, color: '#1E1E1E' }}>{new Date(t.fechaEjecucion).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p style={{ fontSize: 12, color: '#666' }}>No hay transacciones aún.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
