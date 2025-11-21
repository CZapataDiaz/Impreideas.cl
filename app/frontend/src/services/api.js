/**
 * Servicio API para ImpreIdeas
 * Maneja todas las llamadas al backend Node.js
 */

// URL del backend desde variables de entorno
const API_URL = 'http://localhost:8001';

/**
 * Función helper para manejar respuestas y errores
 */
const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ 
      error: 'Error de red', 
      message: `Error ${response.status}: ${response.statusText}` 
    }));
    throw new Error(error.message || 'Error en la petición');
  }
  return response.json();
};

/**
 * Función helper para hacer peticiones
 */
const fetchAPI = async (endpoint, options = {}) => {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(`${API_URL}${endpoint}`, config);
    return handleResponse(response);
  } catch (error) {
    console.error(`Error en API ${endpoint}:`, error);
    throw error;
  }
};

// ============================================
// PRODUCTOS
// ============================================

/**
 * Obtener todos los productos
 * @param {Object} params - Parámetros de búsqueda
 * @returns {Promise<Object>} Lista de productos
 */
export const getProducts = async (params = {}) => {
  // AGREGADO: Límite por defecto de 100 productos
  const defaultParams = { limit: 100, ...params };
  const queryParams = new URLSearchParams(defaultParams).toString();
  const endpoint = `/api/products${queryParams ? `?${queryParams}` : ''}`;
  return fetchAPI(endpoint);
};

/**
 * Obtener un producto por ID
 * @param {number} id - ID del producto
 * @returns {Promise<Object>} Producto
 */
export const getProductById = async (id) => {
  return fetchAPI(`/api/products/${id}`);
};

/**
 * Buscar productos
 * @param {string} search - Término de búsqueda
 * @param {Object} filters - Filtros adicionales
 * @returns {Promise<Object>} Lista de productos
 */
export const searchProducts = async (search, filters = {}) => {
  const params = { search, limit: 100, ...filters }; // AGREGADO: límite 100
  return getProducts(params);
};

// ============================================
// CATEGORÍAS
// ============================================

/**
 * Obtener todas las categorías
 * @returns {Promise<Array>} Lista de categorías
 */
export const getCategories = async () => {
  return fetchAPI('/api/categories');
};

/**
 * Obtener productos por categoría
 * @param {number} categoryId - ID de la categoría
 * @returns {Promise<Object>} Lista de productos
 */
export const getProductsByCategory = async (categoryId) => {
  return getProducts({ categoryId, limit: 100 }); // AGREGADO: límite 100
};

// ============================================
// OPCIONES DE PERSONALIZACIÓN
// ============================================

/**
 * Obtener opciones de personalización
 * @param {string} type - Tipo de opción (logo_size, print_method, etc.)
 * @returns {Promise<Array>} Lista de opciones
 */
export const getPersonalizationOptions = async (type = null) => {
  const endpoint = type 
    ? `/api/personalization-options?type=${type}`
    : '/api/personalization-options';
  return fetchAPI(endpoint);
};

// ============================================
// COTIZACIONES (QUOTES)
// ============================================

/**
 * Crear una nueva cotización
 * @param {Object} quoteData - Datos de la cotización
 * @returns {Promise<Object>} Cotización creada
 */
export const createQuote = async (quoteData) => {
  return fetchAPI('/api/quotes', {
    method: 'POST',
    body: JSON.stringify(quoteData),
  });
};

/**
 * Obtener cotizaciones del usuario
 * @param {Object} params - Parámetros de paginación
 * @returns {Promise<Object>} Lista de cotizaciones
 */
export const getUserQuotes = async (params = {}) => {
  const queryParams = new URLSearchParams(params).toString();
  const endpoint = `/api/quotes${queryParams ? `?${queryParams}` : ''}`;
  return fetchAPI(endpoint);
};

/**
 * Obtener cotización por ID
 * @param {string} id - ID de la cotización
 * @returns {Promise<Object>} Cotización
 */
export const getQuoteById = async (id) => {
  return fetchAPI(`/api/quotes/${id}`);
};

/**
 * Obtener cotización por número
 * @param {string} quoteNumber - Número de cotización (ej: Q2025010001)
 * @returns {Promise<Object>} Cotización
 */
export const getQuoteByNumber = async (quoteNumber) => {
  return fetchAPI(`/api/quotes/number/${quoteNumber}`);
};

// ============================================
// AUTENTICACIÓN
// ============================================

/**
 * Registrar nuevo usuario
 * @param {Object} userData - Datos del usuario
 * @returns {Promise<Object>} Usuario registrado
 */
export const register = async (userData) => {
  return fetchAPI('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
};

/**
 * Iniciar sesión
 * @param {string} email - Email del usuario
 * @param {string} password - Contraseña
 * @returns {Promise<Object>} Token y datos del usuario
 */
export const login = async (email, password) => {
  return fetchAPI('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
};

/**
 * Obtener perfil del usuario
 * @param {string} token - Token de autenticación
 * @returns {Promise<Object>} Datos del usuario
 */
export const getProfile = async (token) => {
  return fetchAPI('/api/auth/me', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

/**
 * Actualizar perfil del usuario
 * @param {string} token - Token de autenticación
 * @param {Object} userData - Datos a actualizar
 * @returns {Promise<Object>} Usuario actualizado
 */
export const updateProfile = async (token, userData) => {
  return fetchAPI('/api/auth/me', {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(userData),
  });
};

/**
 * Cambiar contraseña
 * @param {string} token - Token de autenticación
 * @param {string} currentPassword - Contraseña actual
 * @param {string} newPassword - Nueva contraseña
 * @returns {Promise<Object>} Confirmación
 */
export const changePassword = async (token, currentPassword, newPassword) => {
  return fetchAPI('/api/auth/change-password', {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ currentPassword, newPassword }),
  });
};

/**
 * Cerrar sesión
 * @param {string} token - Token de autenticación
 * @returns {Promise<Object>} Confirmación
 */
export const logout = async (token) => {
  return fetchAPI('/api/auth/logout', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// ============================================
// CARRITO DE COMPRAS
// ============================================

/**
 * Obtener carrito actual del usuario
 * @param {string} token - Token de autenticación (opcional)
 * @returns {Promise<Object>} Carrito con items
 */
export const getCart = async (token = null) => {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  return fetchAPI('/api/cart', { headers });
};

/**
 * Agregar item al carrito
 * @param {string} token - Token de autenticación (opcional)
 * @param {Object} itemData - Datos del item
 * @returns {Promise<Object>} Item agregado
 */
export const addToCart = async (token = null, itemData) => {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  return fetchAPI('/api/cart/items', {
    method: 'POST',
    headers,
    body: JSON.stringify(itemData),
  });
};

/**
 * Actualizar cantidad de item en carrito
 * @param {string} token - Token de autenticación (opcional)
 * @param {string} itemId - ID del item
 * @param {number} quantity - Nueva cantidad
 * @returns {Promise<Object>} Item actualizado
 */
export const updateCartItem = async (token = null, itemId, quantity) => {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  return fetchAPI(`/api/cart/items/${itemId}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ quantity }),
  });
};

/**
 * Eliminar item del carrito
 * @param {string} token - Token de autenticación (opcional)
 * @param {string} itemId - ID del item
 * @returns {Promise<Object>} Confirmación
 */
export const removeFromCart = async (token = null, itemId) => {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  return fetchAPI(`/api/cart/items/${itemId}`, {
    method: 'DELETE',
    headers,
  });
};

/**
 * Vaciar carrito
 * @param {string} token - Token de autenticación (opcional)
 * @returns {Promise<Object>} Confirmación
 */
export const clearCart = async (token = null) => {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  return fetchAPI('/api/cart/clear', {
    method: 'POST',
    headers,
  });
};

/**
 * Sincronizar carrito local con servidor
 * @param {string} token - Token de autenticación
 * @param {Array} items - Items del carrito local
 * @returns {Promise<Object>} Carrito sincronizado
 */
export const syncCart = async (token, items) => {
  return fetchAPI('/api/cart/sync', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ items }),
  });
};

// ============================================
// SUBIDA DE ARCHIVOS
// ============================================

/**
 * Subir archivo de logo
 * @param {File} file - Archivo a subir
 * @returns {Promise<Object>} Datos del archivo subido
 */
export const uploadLogo = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_URL}/api/upload/logo`, {
    method: 'POST',
    body: formData,
    // No establecer Content-Type, el browser lo hará automáticamente con boundary
  });

  return handleResponse(response);
};

/**
 * Subir archivo de diseño
 * @param {File} file - Archivo a subir
 * @returns {Promise<Object>} Datos del archivo subido
 */
export const uploadDesign = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_URL}/api/upload/design`, {
    method: 'POST',
    body: formData,
  });

  return handleResponse(response);
};

// ============================================
// HEALTH CHECK
// ============================================

/**
 * Verificar estado del backend
 * @returns {Promise<Object>} Estado del backend
 */
export const healthCheck = async () => {
  return fetchAPI('/api/health');
};

// Exportar también la URL base por si se necesita
export { API_URL };