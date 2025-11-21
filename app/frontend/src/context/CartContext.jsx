import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Estado inicial del carrito
const initialState = {
    items: [], // Items en el carrito
    isOpen: false, // Modal del carrito abierto/cerrado
    total: 0, // Total del carrito
    itemCount: 0 // Cantidad total de items
};

// Reducer para manejar las acciones del carrito
function cartReducer(state, action) {
    switch (action.type) {
        case 'ADD_ITEM': {
            const { product, quantity, personalization } = action.payload;
            
            if (!product) return state;

            // Calcular precio unitario considerando personalización
            const basePrice = product.base_price || product.basePrice || 0;
            const personalizationPrice = (personalization?.priceModifiers?.size || 0) + 
                                       (personalization?.priceModifiers?.method || 0);
            const unitPrice = basePrice + personalizationPrice;

            const existingItemIndex = state.items.findIndex(
                item => item.productId === product.id && 
                JSON.stringify(item.personalization) === JSON.stringify(personalization)
            );

            let newItems;
            if (existingItemIndex >= 0) {
                // Item ya existe, actualizar cantidad
                newItems = [...state.items];
                newItems[existingItemIndex].quantity += quantity;
                newItems[existingItemIndex].totalPrice = newItems[existingItemIndex].unitPrice * newItems[existingItemIndex].quantity;
            } else {
                // Nuevo item
                const newItem = {
                    id: Date.now(), // ID único para el item del carrito
                    productId: product.id,
                    product: { // Guardamos toda la información del producto
                        id: product.id,
                        name: product.name,
                        image: product.image, // Guardamos la imagen
                        basePrice: basePrice,
                        minOrder: product.minimum_order || product.minOrder || 1,
                        description: product.description,
                        category: product.category || product.Category?.name
                    },
                    quantity,
                    personalization,
                    unitPrice: unitPrice,
                    totalPrice: unitPrice * quantity
                };
                newItems = [...state.items, newItem];
            }

            const newTotal = newItems.reduce((sum, item) => sum + item.totalPrice, 0);
            const newItemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);

            console.log('🛒 Carrito actualizado:', {
                items: newItems,
                total: newTotal,
                itemCount: newItemCount
            });

            return {
                ...state,
                items: newItems,
                total: newTotal,
                itemCount: newItemCount
            };
        }

        case 'UPDATE_QUANTITY': {
            const { itemId, quantity } = action.payload;
            
            if (quantity <= 0) {
                return cartReducer(state, { type: 'REMOVE_ITEM', payload: { itemId } });
            }

            const newItems = state.items.map(item => 
                item.id === itemId 
                    ? { ...item, quantity, totalPrice: item.unitPrice * quantity }
                    : item
            );

            const newTotal = newItems.reduce((sum, item) => sum + item.totalPrice, 0);
            const newItemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);

            return {
                ...state,
                items: newItems,
                total: newTotal,
                itemCount: newItemCount
            };
        }

        case 'REMOVE_ITEM': {
            const { itemId } = action.payload;
            const newItems = state.items.filter(item => item.id !== itemId);
            
            const newTotal = newItems.reduce((sum, item) => sum + item.totalPrice, 0);
            const newItemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);

            return {
                ...state,
                items: newItems,
                total: newTotal,
                itemCount: newItemCount
            };
        }

        case 'CLEAR_CART':
            return {
                ...state,
                items: [],
                total: 0,
                itemCount: 0
            };

        case 'TOGGLE_CART':
            return {
                ...state,
                isOpen: !state.isOpen
            };

        case 'OPEN_CART':
            return {
                ...state,
                isOpen: true
            };

        case 'CLOSE_CART':
            return {
                ...state,
                isOpen: false
            };

        case 'LOAD_CART':
            return {
                ...state,
                ...action.payload
            };

        default:
            return state;
    }
}

// Contexto del carrito
const CartContext = createContext();

// Hook personalizado para usar el contexto del carrito
export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart debe usarse dentro de un CartProvider');
    }
    return context;
};

// Proveedor del contexto del carrito
export const CartProvider = ({ children }) => {
    const [state, dispatch] = useReducer(cartReducer, initialState);

    // Cargar carrito del localStorage al inicializar
    useEffect(() => {
        const savedCart = localStorage.getItem('impreideas-cart');
        if (savedCart) {
            try {
                const cartData = JSON.parse(savedCart);
                dispatch({ type: 'LOAD_CART', payload: cartData });
            } catch (error) {
                console.error('Error al cargar carrito del localStorage:', error);
            }
        }
    }, []);

    // Guardar carrito en localStorage cuando cambie
    useEffect(() => {
        const cartData = {
            items: state.items,
            total: state.total,
            itemCount: state.itemCount
        };
        localStorage.setItem('impreideas-cart', JSON.stringify(cartData));
    }, [state.items, state.total, state.itemCount]);

    // Función principal para agregar items al carrito
    const addItem = (product, quantity, personalization = {}) => {
        console.log('🛒 addItem llamado con:', { product, quantity, personalization });
        
        if (!product || !product.id) {
            console.error('❌ Producto inválido:', product);
            alert('Error: Producto no válido');
            return;
        }

        const minOrder = product.minimum_order || product.minOrder || 1;
        if (quantity < minOrder) {
            alert(`La cantidad mínima para "${product.name}" es ${minOrder} unidades.`);
            return;
        }

        dispatch({
            type: 'ADD_ITEM',
            payload: { product, quantity, personalization }
        });
        
        console.log('✅ Producto agregado al carrito:', product.name);
    };

    const updateQuantity = (itemId, quantity) => {
        dispatch({
            type: 'UPDATE_QUANTITY',
            payload: { itemId, quantity }
        });
    };

    const removeItem = (itemId) => {
        dispatch({
            type: 'REMOVE_ITEM',
            payload: { itemId }
        });
    };

    const clearCart = () => {
        dispatch({ type: 'CLEAR_CART' });
    };

    const openCart = () => {
        dispatch({ type: 'OPEN_CART' });
    };

    const closeCart = () => {
        dispatch({ type: 'CLOSE_CART' });
    };

    const toggleCart = () => {
        dispatch({ type: 'TOGGLE_CART' });
    };

    // Función para solicitar cotización
    const requestQuote = () => {
        if (state.items.length === 0) {
            alert('El carrito está vacío. Agrega productos para solicitar una cotización.');
            return;
        }

        // Simular envío de cotización
        alert(
            `¡Cotización enviada! 
            
Resumen:
- ${state.itemCount} productos
- Total: $${state.total.toLocaleString('es-CL')} CLP

El equipo de ImpreIdeas te contactará en las próximas 24 horas.`
        );

        // Limpiar carrito después de enviar cotización
        clearCart();
        closeCart();
    };

    const value = {
        ...state,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        openCart,
        closeCart,
        toggleCart,
        requestQuote
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};