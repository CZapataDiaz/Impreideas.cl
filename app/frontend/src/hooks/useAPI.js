import { useState, useEffect } from 'react';
import { getProducts, getCategories, getPersonalizationOptions } from '../services/api';

/**
 * Hook para cargar y gestionar productos desde el backend
 * @param {Object} filters - Filtros para los productos
 * @returns {Object} Productos, categorías, loading, error
 */
export const useProducts = (filters = {}) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const data = await getProducts(filters);
        // Maneja diferentes estructuras de respuesta
        if (Array.isArray(data)) {
          setProducts(data);
        } else if (data && Array.isArray(data.products)) {
          setProducts(data.products);
        } else {
          setProducts([]);
        }
      } catch (err) {
        console.error('Error al cargar productos:', err);
        setError(err.message);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [JSON.stringify(filters)]);

  return { products, loading, error };
};

/**
 * Hook para cargar categorías desde el backend
 * @returns {Object} Categorías, loading, error
 */
export const useCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const data = await getCategories();
        // Maneja diferentes estructuras de respuesta
        if (Array.isArray(data)) {
          setCategories(data);
        } else if (data && Array.isArray(data.categories)) {
          setCategories(data.categories);
        } else {
          setCategories([]);
        }
      } catch (err) {
        console.error('Error al cargar categorías:', err);
        setError(err.message);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return { categories, loading, error };
};

/**
 * Hook para cargar opciones de personalización
 * @param {string} type - Tipo de opción (opcional)
 * @returns {Object} Opciones, loading, error
 */
export const usePersonalizationOptions = (type = null) => {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOptions = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const data = await getPersonalizationOptions(type);
        // Maneja diferentes estructuras de respuesta
        if (Array.isArray(data)) {
          setOptions(data);
        } else if (data && Array.isArray(data.options)) {
          setOptions(data.options);
        } else {
          setOptions([]);
        }
      } catch (err) {
        console.error('Error al cargar opciones:', err);
        setError(err.message);
        setOptions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOptions();
  }, [type]);

  return { options, loading, error };
};

/**
 * Hook para buscar productos
 * @param {string} searchTerm - Término de búsqueda
 * @param {Object} filters - Filtros adicionales
 * @returns {Object} Productos, loading, error
 */
export const useProductSearch = (searchTerm = '', filters = {}) => {
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const searchProducts = async () => {
      if (!searchTerm.trim()) {
        setSearchResults([]);
        return;
      }

      setLoading(true);
      setError(null);
      
      try {
        const data = await getProducts({ 
          search: searchTerm, 
          limit: 50, 
          ...filters 
        });
        
        if (Array.isArray(data)) {
          setSearchResults(data);
        } else if (data && Array.isArray(data.products)) {
          setSearchResults(data.products);
        } else {
          setSearchResults([]);
        }
      } catch (err) {
        console.error('Error en búsqueda:', err);
        setError(err.message);
        setSearchResults([]);
      } finally {
        setLoading(false);
      }
    };

    // Debounce para evitar muchas llamadas
    const timeoutId = setTimeout(searchProducts, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, JSON.stringify(filters)]);

  return { searchResults, loading, error };
};