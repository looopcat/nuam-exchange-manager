import React, { useState, useEffect } from "react";
import { ordenesAPI, authAPI } from "../services/api";
import "./OperadorDashboard.css";

export default function OperadorDashboard({ user, onLogout }) {
  const [ordenes, setOrdenes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedBolsa, setSelectedBolsa] = useState("CL");
  const [formData, setFormData] = useState({
    instrumento: "",
    tipo: "Compra",
    cantidad: "",
    precioLimite: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [createdOrder, setCreatedOrder] = useState(null);

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
        setCreatedOrder(response.orden || {
          idOrden: "Nueva",
          instrumento: instrumento.toUpperCase(),
          tipo: tipo,
          cantidad: cantidad,
          precioLimite: precioFinal,
          estado: "Pendiente",
          fechaCreacion: new Date().toLocaleString(),
        });
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

  const handleCancelCreate = () => {
    setShowCreateForm(false);
    setFormData({
      instrumento: "",
      tipo: "Compra",
      cantidad: "",
      precioLimite: "",
    });
    setError("");
    setSuccessMessage("");
    setCreatedOrder(null);
  };

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'white', flexDirection: 'column' }}>
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
        zIndex: 100,
        boxSizing: 'border-box',
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
          onClick={() => setShowCreateForm(!showCreateForm)}
          style={{
            padding: 12,
            background: '#EC221F',
            border: '1px solid #C00F0C',
            borderRadius: 8,
            color: '#FEE9E7',
            fontSize: 14,
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

      {/* Main Content - 3 Sections Layout */}
      <div style={{
        display: 'flex',
        marginTop: 79,
        height: 'calc(100vh - 79px)',
        width: '100vw',
        boxSizing: 'border-box',
      }}>
        {/* Left Section - Bolsa Selector & Content */}
        <div style={{
          flex: 1,
          background: '#FF5F1F',
          padding: 24,
          overflowY: 'auto',
          flexShrink: 0,
          boxSizing: 'border-box',
        }}>
          <div style={{
            marginBottom: 32,
          }}>
            <h3 style={{
              color: '#FFF8DC',
              fontSize: 12,
              fontFamily: 'Inter, sans-serif',
              fontWeight: '500',
              marginBottom: 16,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}>
              Seleccionar Bolsa
            </h3>

            <div style={{
              display: 'flex',
              gap: 12,
              flexWrap: 'wrap',
            }}>
              {['CL', 'PE', 'CO'].map((bolsa) => (
                <button
                  key={bolsa}
                  onClick={() => setSelectedBolsa(bolsa)}
                  style={{
                    flex: '1 1 calc(50% - 6px)',
                    padding: 12,
                    background: selectedBolsa === bolsa ? 'white' : '#FF6600',
                    border: 'none',
                    borderRadius: 8,
                    color: selectedBolsa === bolsa ? '#FF5F1F' : 'white',
                    fontSize: 12,
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={(e) => !selectedBolsa === bolsa && (e.target.style.background = '#FFB366')}
                  onMouseLeave={(e) => (e.target.style.background = selectedBolsa === bolsa ? 'white' : '#FF6600')}
                >
                  {bolsa === 'CL' && 'Chile'}
                  {bolsa === 'PE' && 'Perú'}
                  {bolsa === 'CO' && 'Colombia'}
                </button>
              ))}
            </div>
          </div>

          <div style={{
            background: 'rgba(0,0,0,0.1)',
            padding: 16,
            borderRadius: 8,
          }}>
            <h4 style={{
              color: '#FFF8DC',
              fontSize: 12,
              fontFamily: 'Inter, sans-serif',
              fontWeight: '600',
              marginBottom: 12,
            }}>
              Información de Bolsa
            </h4>
            <p style={{
              color: '#FFF8DC',
              fontSize: 11,
              fontFamily: 'Inter, sans-serif',
              lineHeight: '1.5',
              margin: 0,
            }}>
              {selectedBolsa === 'CL' && 'Chile - Bolsa de Comercio de Santiago'}
              {selectedBolsa === 'PE' && 'Perú - Bolsa de Valores de Lima'}
              {selectedBolsa === 'CO' && 'Colombia - Bolsa de Valores de Colombia'}
            </p>
          </div>
        </div>

        {/* Center Section - Create Order Form or Empty State */}
        <div style={{
          flex: 1,
          padding: 32,
          overflowY: 'auto',
          background: 'white',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          boxSizing: 'border-box',
        }}>
          {showCreateForm ? (
            <div style={{
              width: '100%',
              maxWidth: 500,
            }}>
              <h2 style={{
                color: '#E54E4E',
                fontSize: 20,
                fontFamily: 'Inter, sans-serif',
                fontWeight: '600',
                marginBottom: 24,
                textAlign: 'center',
              }}>
                Crear Nueva Orden
              </h2>

              <form onSubmit={handleSubmitOrder} style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 20,
              }}>
                {error && (
                  <div style={{
                    background: '#FEE9E7',
                    color: '#EC221F',
                    padding: 16,
                    borderRadius: 8,
                    fontSize: 12,
                    fontFamily: 'Inter, sans-serif',
                  }}>
                    {error}
                  </div>
                )}
                {successMessage && (
                  <div style={{
                    background: '#E8F5E9',
                    color: '#2E7D32',
                    padding: 16,
                    borderRadius: 8,
                    fontSize: 12,
                    fontFamily: 'Inter, sans-serif',
                  }}>
                    {successMessage}
                  </div>
                )}

                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: 8,
                    fontSize: 12,
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: '500',
                    color: '#1E1E1E',
                  }}>
                    Instrumento (Ticker)
                  </label>
                  <input
                    type="text"
                    name="instrumento"
                    value={formData.instrumento}
                    onChange={handleInputChange}
                    placeholder="p.ej., ENEL, SQM-B"
                    disabled={submitting}
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

                <div style={{
                  display: 'flex',
                  gap: 16,
                }}>
                  <div style={{ flex: 1 }}>
                    <label style={{
                      display: 'block',
                      marginBottom: 8,
                      fontSize: 12,
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: '500',
                      color: '#1E1E1E',
                    }}>
                      Tipo de Orden
                    </label>
                    <select
                      name="tipo"
                      value={formData.tipo}
                      onChange={handleInputChange}
                      disabled={submitting}
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
                      <option value="Compra">Compra (Buy)</option>
                      <option value="Venta">Venta (Sell)</option>
                    </select>
                  </div>

                  <div style={{ flex: 1 }}>
                    <label style={{
                      display: 'block',
                      marginBottom: 8,
                      fontSize: 12,
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: '500',
                      color: '#1E1E1E',
                    }}>
                      Cantidad
                    </label>
                    <input
                      type="number"
                      name="cantidad"
                      value={formData.cantidad}
                      onChange={handleInputChange}
                      placeholder="0"
                      min="1"
                      disabled={submitting}
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

                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: 8,
                    fontSize: 12,
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: '500',
                    color: '#1E1E1E',
                  }}>
                    Precio Límite (Opcional)
                  </label>
                  <input
                    type="number"
                    name="precioLimite"
                    value={formData.precioLimite}
                    onChange={handleInputChange}
                    placeholder="0.00 para orden de mercado"
                    step="0.01"
                    disabled={submitting}
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

                <div style={{
                  display: 'flex',
                  gap: 12,
                  marginTop: 16,
                }}>
                  <button
                    type="submit"
                    disabled={submitting}
                    style={{
                      flex: 1,
                      padding: 12,
                      background: '#EC221F',
                      border: '1px solid #C00F0C',
                      borderRadius: 8,
                      color: '#FEE9E7',
                      fontSize: 12,
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: '600',
                      cursor: submitting ? 'not-allowed' : 'pointer',
                      opacity: submitting ? 0.7 : 1,
                      transition: 'all 0.3s ease',
                    }}
                    onMouseEnter={(e) => !submitting && (e.target.style.background = '#D81A17')}
                    onMouseLeave={(e) => !submitting && (e.target.style.background = '#EC221F')}
                  >
                    {submitting ? 'Colocando...' : 'Colocar Orden'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelCreate}
                    disabled={submitting}
                    style={{
                      flex: 1,
                      padding: 12,
                      background: '#D9D9D9',
                      border: '1px solid #999999',
                      borderRadius: 8,
                      color: '#1E1E1E',
                      fontSize: 12,
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                    }}
                    onMouseEnter={(e) => e.target.style.background = '#BFBFBF'}
                    onMouseLeave={(e) => e.target.style.background = '#D9D9D9'}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div style={{
              textAlign: 'center',
            }}>
              <div style={{
                width: 64,
                height: 64,
                background: '#FF5F1F',
                borderRadius: '50%',
                margin: '0 auto 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <span style={{
                  fontSize: 32,
                  color: 'white',
                }}>
                  +
                </span>
              </div>
              <h3 style={{
                color: '#1E1E1E',
                fontSize: 14,
                fontFamily: 'Inter, sans-serif',
                fontWeight: '600',
                marginBottom: 8,
              }}>
                Crea una nueva orden
              </h3>
              <p style={{
                color: '#666666',
                fontSize: 12,
                fontFamily: 'Inter, sans-serif',
                margin: 0,
              }}>
                Haz clic en "Nueva orden" para empezar
              </p>
            </div>
          )}
        </div>

        {/* Right Section - My Orders */}
        <div style={{
          flex: 1,
          background: '#FF5F1F',
          padding: 24,
          overflowY: 'auto',
          flexShrink: 0,
          borderLeft: '1px solid rgba(0,0,0,0.1)',
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box',
        }}>
          <div style={{
            marginBottom: 24,
          }}>
            <h3 style={{
              color: '#FFF8DC',
              fontSize: 12,
              fontFamily: 'Inter, sans-serif',
              fontWeight: '500',
              margin: '0 0 8px 0',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}>
              Órdenes
            </h3>
            <h2 style={{
              color: 'white',
              fontSize: 14,
              fontFamily: 'Inter, sans-serif',
              fontWeight: '600',
              margin: 0,
            }}>
              Mis órdenes
            </h2>
          </div>

          <div style={{
            height: 1,
            background: '#FFB366',
            marginBottom: 24,
          }} />

          {/* Created Order - appears after form submission */}
          {createdOrder && (
            <div style={{
              background: 'rgba(0,0,0,0.15)',
              padding: 12,
              borderRadius: 8,
              marginBottom: 16,
            }}>
              <h4 style={{
                color: 'white',
                fontSize: 11,
                fontFamily: 'Inter, sans-serif',
                fontWeight: '600',
                margin: '0 0 8px 0',
                textTransform: 'uppercase',
              }}>
                Última Orden Creada
              </h4>
              <div style={{
                fontSize: 11,
                fontFamily: 'Inter, sans-serif',
                color: '#FFF8DC',
                lineHeight: '1.6',
              }}>
                <div><strong>{createdOrder.instrumento}</strong> - {createdOrder.tipo}</div>
                <div>Cantidad: {createdOrder.cantidad}</div>
                <div>Precio: ${createdOrder.precioLimite?.toFixed(2) || 'Mercado'}</div>
                <div>Estado: {createdOrder.estado}</div>
              </div>
            </div>
          )}

          {/* Orders List */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
          }}>
            {loading ? (
              <p style={{
                color: '#FFF8DC',
                fontSize: 11,
                fontFamily: 'Inter, sans-serif',
              }}>
                Cargando órdenes...
              </p>
            ) : ordenes.length > 0 ? (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}>
                {ordenes.map((orden) => (
                  <div
                    key={orden.idOrden}
                    style={{
                      background: 'rgba(0,0,0,0.15)',
                      padding: 12,
                      borderRadius: 8,
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.25)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.15)'}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: 8,
                    }}>
                      <span style={{
                        color: 'white',
                        fontSize: 11,
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: '600',
                      }}>
                        Orden {orden.idOrden}
                      </span>
                      <span style={{
                        color: '#FFF8DC',
                        fontSize: 9,
                        fontFamily: 'Inter, sans-serif',
                      }}>
                        {orden.tipo === 'Compra' ? '↓' : '↑'}
                      </span>
                    </div>
                    <div style={{
                      color: '#FFF8DC',
                      fontSize: 10,
                      fontFamily: 'Inter, sans-serif',
                      lineHeight: '1.5',
                    }}>
                      <div><strong>{orden.instrumento}</strong></div>
                      <div>Cantidad: {orden.cantidad}</div>
                      <div>Precio: ${orden.precioLimite?.toFixed(2) || 'Mercado'}</div>
                      <div style={{
                        marginTop: 4,
                        padding: '4px 8px',
                        background: orden.estado === 'Ejecutada' ? '#4CAF50' : orden.estado === 'Cancelada' ? '#F44336' : '#FF9800',
                        borderRadius: 4,
                        display: 'inline-block',
                        fontSize: 9,
                        fontWeight: '600',
                        color: 'white',
                      }}>
                        {orden.estado}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{
                color: '#FFF8DC',
                fontSize: 11,
                fontFamily: 'Inter, sans-serif',
              }}>
                Sin órdenes aún. ¡Crea una!
              </p>
            )}
          </div>

          {/* Bottom Buttons */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            marginTop: 24,
          }}>
            <button
              onClick={handleLogout}
              style={{
                padding: 12,
                background: '#E54E4E',
                border: 'none',
                borderRadius: 8,
                color: 'white',
                fontSize: 12,
                fontFamily: 'Inter, sans-serif',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => e.target.style.background = '#D81A17'}
              onMouseLeave={(e) => e.target.style.background = '#E54E4E'}
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
