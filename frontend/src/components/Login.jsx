import React, { useState } from "react";
import { authAPI } from "../services/api";
import "./Login.css";

export default function Login({ onLoginSuccess }) {
  const [bolsa, setBolsa] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!bolsa) {
      setError("Por favor selecciona un país/bolsa");
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.login(username, password);

      if (response.success) {
        // Store session token and user data in localStorage
        localStorage.setItem("session_token", response.session_token);
        localStorage.setItem("user", JSON.stringify(response.user));
        localStorage.setItem("bolsa_seleccionada", bolsa);

        // Call parent callback to update app state
        onLoginSuccess(response.user);
      } else {
        setError(response.message || "Fallo al iniciar sesión");
      }
    } catch (err) {
      setError(err.message || "Error al conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      background: 'white',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'auto'
    }}>
      {/* Header */}
      <div style={{
        width: '100%',
        height: 79,
        background: '#FCFFFB',
        boxShadow: '0px 4px 4px 1px rgba(0, 0, 0, 0.25)',
        display: 'flex',
        alignItems: 'center',
        paddingLeft: 24,
        flexShrink: 0
      }}>
        <img 
          src="/nuam-HD.png" 
          alt="NUAM Logo"
          style={{
            height: 50,
            width: 'auto',
            objectFit: 'contain'
          }}
        />
      </div>

      {/* Contenedor Principal (Flex) */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '40px 20px',
        minHeight: 'calc(100vh - 79px)'
      }}>
        
        {/* Título principal */}
        <div style={{
          color: '#FF6600',
          fontSize: 32,
          fontFamily: 'HeadlandOne, serif',
          fontWeight: '400',
          marginBottom: 40,
          textAlign: 'center',
          wordWrap: 'break-word'
        }}>
          Iniciar Sesión
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} style={{
          width: '100%',
          maxWidth: 338,
          display: 'flex',
          flexDirection: 'column'
        }}>
          
          {/* Selector de Bolsa */}
          <div style={{marginBottom: 20}}>
            <label style={{display: 'block', textAlign: 'center', color: '#1E1E1E', fontSize: 14, fontFamily: 'Inter, sans-serif', fontWeight: '400', lineHeight: '18px', marginBottom: 6}}>
              Selector de bolsa
            </label>
            <select
              value={bolsa}
              onChange={(e) => setBolsa(e.target.value)}
              disabled={loading}
              style={{
                width: '100%',
                height: 40,
                paddingTop: 10,
                paddingBottom: 10,
                paddingLeft: 14,
                paddingRight: 40,
                background: 'white',
                borderRadius: 8,
                border: '1px solid #D9D9D9',
                fontSize: 14,
                fontFamily: 'Inter, sans-serif',
                fontWeight: '400',
                lineHeight: '14px',
                color: bolsa ? '#1E1E1E' : '#757575',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
                appearance: 'none',
                backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%231E1E1E' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 8px center',
                backgroundSize: '16px',
                boxSizing: 'border-box'
              }}
            >
              <option value="">Elija un país</option>
              <option value="CL">Chile (CL)</option>
              <option value="PE">Perú (PE)</option>
              <option value="CO">Colombia (CO)</option>
            </select>
          </div>

          {/* Campo Usuario */}
          <div style={{marginBottom: 20}}>
            <label style={{display: 'block', textAlign: 'center', color: '#1E1E1E', fontSize: 14, fontFamily: 'Inter, sans-serif', fontWeight: '400', lineHeight: '18px', marginBottom: 6}}>
              Nombre de usuario
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="p.ej., MirtaAguilar"
              required
              disabled={loading}
              style={{
                width: '100%',
                paddingLeft: 14,
                paddingRight: 14,
                paddingTop: 10,
                paddingBottom: 10,
                background: 'white',
                borderRadius: 8,
                border: '1px solid #D9D9D9',
                fontSize: 14,
                fontFamily: 'Inter, sans-serif',
                fontWeight: '400',
                boxSizing: 'border-box',
                cursor: loading ? 'not-allowed' : 'auto',
                opacity: loading ? 0.6 : 1,
              }}
            />
          </div>

          {/* Campo Contraseña */}
          <div style={{marginBottom: 16}}>
            <label style={{display: 'block', textAlign: 'center', color: '#1E1E1E', fontSize: 14, fontFamily: 'Inter, sans-serif', fontWeight: '400', lineHeight: '18px', marginBottom: 6}}>
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ingrese su contraseña"
              required
              disabled={loading}
              style={{
                width: '100%',
                paddingLeft: 14,
                paddingRight: 14,
                paddingTop: 10,
                paddingBottom: 10,
                background: 'white',
                borderRadius: 8,
                border: '1px solid #D9D9D9',
                fontSize: 14,
                fontFamily: 'Inter, sans-serif',
                fontWeight: '400',
                boxSizing: 'border-box',
                cursor: loading ? 'not-allowed' : 'auto',
                opacity: loading ? 0.6 : 1,
              }}
            />
          </div>

          {/* Mensaje de error */}
          {error && (
            <div style={{color: '#EC221F', fontSize: 13, fontFamily: 'Inter, sans-serif', marginBottom: 16, textAlign: 'center'}}>
              {error}
            </div>
          )}

          {/* Link Olvidó contraseña */}
          <div style={{textAlign: 'center', marginBottom: 20}}>
            <a href="#" onClick={(e) => e.preventDefault()} style={{color: '#3841BB', fontSize: 11, fontFamily: 'Inter, sans-serif', fontWeight: '400', wordWrap: 'break-word', textDecoration: 'none', cursor: 'pointer'}}>
              ¿Olvidó su contraseña?
            </a>
          </div>

          {/* Botón Acceder */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: 191,
              height: 74,
              padding: 12,
              margin: '0 auto',
              display: 'block',
              background: '#EC221F',
              borderRadius: 8,
              border: '1px solid #C00F0C',
              color: '#FEE9E7',
              fontSize: 16,
              fontFamily: 'Inter, sans-serif',
              fontWeight: '400',
              lineHeight: '16px',
              wordWrap: 'break-word',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => !loading && (e.target.style.background = '#D81A17')}
            onMouseLeave={(e) => !loading && (e.target.style.background = '#EC221F')}
          >
            {loading ? 'Cargando...' : 'Acceder'}
          </button>
        </form>

        {/* Credenciales de Prueba */}
        <div style={{marginTop: 40, textAlign: 'center', fontSize: 11, fontFamily: 'Inter, sans-serif', color: '#666'}}>
          <p style={{margin: '0 0 6px 0', fontWeight: 'bold'}}>Credenciales de Prueba:</p>
          <p style={{margin: 3, fontSize: 11}}>Operador: MirtaAguilar / 1234</p>
          <p style={{margin: 3, fontSize: 11}}>Admin: GabrielFuentes / admin</p>
        </div>
      </div>
    </div>
  );
}
