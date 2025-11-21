import React, { useState } from 'react';
import { X, Plus, Minus, Trash2, ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import QuoteModal from './QuoteModal';

const CartModal = () => {
    const { 
        isOpen, 
        items, 
        total, 
        itemCount, 
        updateQuantity, 
        removeItem, 
        clearCart, 
        closeCart 
    } = useCart();

    const [showQuoteModal, setShowQuoteModal] = useState(false);

    if (!isOpen) return null;

    // Cerrar modal al hacer clic fuera
    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            closeCart();
        }
    };

    // Verificar si hay items que no cumplan el mínimo
    const itemsWithMinOrderIssues = items.filter(item => item.quantity < item.product.minOrder);

    const handleProceedToQuote = () => {
        if (items.length === 0) {
            alert('El carrito está vacío. Agrega productos para solicitar una cotización.');
            return;
        }

        if (itemsWithMinOrderIssues.length > 0) {
            alert('Algunos productos no cumplen con el pedido mínimo requerido. Por favor ajusta las cantidades.');
            return;
        }

        setShowQuoteModal(true);
    };

    return (
        <>
            <div 
                className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center justify-center p-4"
                onClick={handleBackdropClick}
            >
                <div className="bg-white dark:bg-gray-800 rounded-t-xl sm:rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center space-x-2">
                            <ShoppingCart className="w-6 h-6" />
                            <span>Carrito de Cotización ({itemCount})</span>
                        </h2>
                        <button
                            onClick={closeCart}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto">
                        {items.length === 0 ? (
                            <div className="p-8 text-center">
                                <div className="text-gray-400 dark:text-gray-500 mb-4">
                                    <ShoppingCart className="w-16 h-16 mx-auto" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                    Tu carrito está vacío
                                </h3>
                                <p className="text-gray-600 dark:text-gray-300 mb-4">
                                    Agrega productos para comenzar tu cotización personalizada
                                </p>
                                <button
                                    onClick={closeCart}
                                    className="bg-sky-600 hover:bg-sky-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                                >
                                    Continuar Comprando
                                </button>
                            </div>
                        ) : (
                            <div className="p-6 space-y-4">
                                {items.map(item => (
                                    <div key={item.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                                        <div className="flex items-start space-x-4">
                                            {/* Imagen del producto */}
                                            <img 
                                                src={item.product?.image} 
                                                alt={item.product?.name}
                                                className="w-16 h-16 object-cover rounded-lg"
                                                onError={(e) => {
                                                    e.target.src = 'https://placehold.co/64x64/EFEFEF/666666?text=Imagen';
                                                }}
                                            />

                                            {/* Información del producto */}
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-semibold text-gray-900 dark:text-white">
                                                    {item.product.name}
                                                </h4>
                                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                                    {item.product.category}
                                                </p>

                                                {/* Personalización */}
                                                {Object.keys(item.personalization).length > 0 && (
                                                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                                        <div className="flex flex-wrap gap-2">
                                                            {item.personalization.color && (
                                                                <span className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                                                                    Color: {item.personalization.color}
                                                                </span>
                                                            )}
                                                            {item.personalization.position && (
                                                                <span className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                                                                    Posición: {item.personalization.position}
                                                                </span>
                                                            )}
                                                            {item.personalization.size && (
                                                                <span className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                                                                    Tamaño: {item.personalization.size}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Precio y controles de cantidad */}
                                                <div className="flex items-center justify-between mt-3">
                                                    <div className="flex items-center space-x-2">
                                                        <button
                                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                                                        >
                                                            <Minus className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                                                        </button>
                                                        <span className="font-medium text-gray-900 dark:text-white min-w-[2rem] text-center">
                                                            {item.quantity}
                                                        </span>
                                                        <button
                                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                                                        >
                                                            <Plus className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                                                        </button>
                                                    </div>

                                                    <div className="text-right">
                                                        <div className="font-semibold text-gray-900 dark:text-white">
                                                            ${item.totalPrice.toLocaleString('es-CL')} CLP
                                                        </div>
                                                        <div className="text-sm text-gray-600 dark:text-gray-300">
                                                            ${item.unitPrice.toLocaleString('es-CL')} c/u
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Validación de pedido mínimo */}
                                                {item.quantity < item.product.minOrder && (
                                                    <div className="mt-2 p-2 bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded text-sm text-yellow-800 dark:text-yellow-300">
                                                        ⚠️ Pedido mínimo: {item.product.minOrder} unidades
                                                    </div>
                                                )}
                                            </div>

                                            {/* Botón eliminar */}
                                            <button
                                                onClick={() => removeItem(item.id)}
                                                className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4 text-red-500" />
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                {/* Total */}
                                <div className="border-t dark:border-gray-600 pt-4 mt-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="text-lg font-semibold text-gray-900 dark:text-white">Total:</span>
                                        <span className="text-2xl font-bold text-sky-600 dark:text-sky-400">
                                            ${total.toLocaleString('es-CL')} CLP
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">
                                        * Los precios son estimados. El precio final se confirmará en la cotización oficial.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer con botones */}
                    {items.length > 0 && (
                        <div className="border-t dark:border-gray-700 p-6 space-y-3">
                            <button
                                onClick={handleProceedToQuote}
                                className="w-full bg-sky-600 hover:bg-sky-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
                            >
                                <span>Solicitar Cotización Oficial</span>
                            </button>
                            <div className="flex space-x-3">
                                <button
                                    onClick={closeCart}
                                    className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 py-2 px-4 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                                >
                                    Seguir Comprando
                                </button>
                                <button
                                    onClick={() => {
                                        if (confirm('¿Estás seguro de que quieres vaciar el carrito?')) {
                                            clearCart();
                                        }
                                    }}
                                    className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                                >
                                    Vaciar Carrito
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal de cotización */}
            {showQuoteModal && (
                <QuoteModal 
                    onClose={() => setShowQuoteModal(false)}
                />
            )}
        </>
    );
};

export default CartModal;