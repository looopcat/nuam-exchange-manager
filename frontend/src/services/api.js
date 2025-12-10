// api.js - Centralized API service for NUAM Exchange
const API_BASE_URL = "http://localhost:8000/api";

// Helper function to get session token from localStorage
const getSessionToken = () => {
  return localStorage.getItem("session_token");
};

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = getSessionToken();
  return {
    "Content-Type": "application/json",
    ...(token && { "Authorization": `Bearer ${token}` })
  };
};

// Helper function to handle API responses
const handleResponse = async (response) => {
  try {
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || `API Error: ${response.status}`);
    }
    
    return data;
  } catch (error) {
    // Network error or JSON parse error
    if (error instanceof SyntaxError) {
      throw new Error("Invalid response from server. Backend may not be running.");
    }
    throw new Error(error.message || "Failed to connect to server. Is the backend running on http://localhost:8000?");
  }
};

export const authAPI = {
  /**
   * Login user with username and password
   * @param {string} username
   * @param {string} password
   * @returns {Promise<{success, message, user, session_token}>}
   */
  login: async (username, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });
      
      return handleResponse(response);
    } catch (error) {
      throw new Error(error.message || "Login failed. Backend not reachable.");
    }
  },

  /**
   * Logout current user
   * @returns {Promise<{success, message}>}
   */
  logout: async () => {
    const response = await fetch(`${API_BASE_URL}/logout`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    
    localStorage.removeItem("session_token");
    localStorage.removeItem("user");
    return handleResponse(response);
  },

  /**
   * Check API health and database connections
   * @returns {Promise<{mongodb, mysql, status}>}
   */
  healthCheck: async () => {
    const response = await fetch(`http://localhost:8000/health`);
    return handleResponse(response);
  },
};

export const ordenesAPI = {
  /**
   * Place a new buy/sell order
   * @param {string} instrumento - Stock ticker
   * @param {string} tipo - "Compra" or "Venta"
   * @param {number} cantidad - Quantity
   * @param {number|null} precioLimite - Limit price (optional)
   * @returns {Promise<{success, message, orden, transaccion}>}
   */
  placeOrder: async (instrumento, tipo, cantidad, precioLimite = null) => {
    const response = await fetch(`${API_BASE_URL}/orden`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        instrumento,
        tipo,
        cantidad,
        precioLimite,
      }),
    });
    
    return handleResponse(response);
  },

  /**
   * Get user's order history
   * @param {number} limite - Maximum number of orders to retrieve (default 20)
   * @returns {Promise<{success, ordenes}>}
   */
  getOrders: async (limite = 20) => {
    const response = await fetch(
      `${API_BASE_URL}/ordenes?limite=${limite}`,
      {
        method: "GET",
        headers: getAuthHeaders(),
      }
    );
    
    return handleResponse(response);
  },
};

export const adminAPI = {
  /**
   * Get transaction report (Admin only)
   * @param {number} limite - Maximum number of transactions (default 10)
   * @returns {Promise<{success, transacciones}>}
   */
  getReports: async (limite = 10) => {
    const response = await fetch(
      `${API_BASE_URL}/reportes?limite=${limite}`,
      {
        method: "GET",
        headers: getAuthHeaders(),
      }
    );
    
    return handleResponse(response);
  },

  /**
   * Configure market rates (Admin only)
   * @param {string} bolsa - "CL", "PE", or "CO"
   * @param {number} tarifa_base - Base rate
   * @returns {Promise<{success, message}>}
   */
  configureTarifas: async (bolsa, tarifa_base) => {
    const response = await fetch(`${API_BASE_URL}/tarifas`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        bolsa,
        tarifa_base,
      }),
    });
    
    return handleResponse(response);
  },

  /**
   * Get configured market rates
   * @returns {Promise<{success, tarifas}>}
   */
  getTarifas: async () => {
    const response = await fetch(`${API_BASE_URL}/tarifas`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    
    return handleResponse(response);
  },
};