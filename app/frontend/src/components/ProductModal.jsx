import React from 'react';
import { X, Palette, ShoppingCart } from 'lucide-react';

const ProductModal = ({ product, onClose, onPersonalize, onQuickAdd }) => {
    if (!product) return null;

    // Cerrar modal al hacer clic fuera
    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={handleBackdropClick}
        >
            <div className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white dark:bg-gray-800 border-b dark:border-gray-700 p-4 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Detalles del Producto</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    <div className="grid md:grid-cols-2 gap-8 mb-8">
                        {/* Imagen */}
                        <div>
                            <img 
                                src={product.image} 
                                alt={product.name}
                                className="w-full h-80 object-cover rounded-lg"
                            />
                        </div>

                        {/* Información */}
                        <div className="space-y-4">
                            <div>
                                <span className="inline-block bg-sky-100 dark:bg-sky-900/50 text-sky-800 dark:text-sky-300 px-3 py-1 rounded-md text-sm font-medium mb-4">
                                    {product.category}
                                </span>
                                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                                    {product.name}
                                </h2>
                                <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
                                    {product.description}
                                </p>
                            </div>

                            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-3xl font-bold text-sky-600 dark:text-sky-400">
                                        ${product.basePrice.toLocaleString('es-CL')} CLP
                                    </span>
                                    <span className="text-gray-600 dark:text-gray-300">por unidad</span>
                                </div>
                                <p className="text-gray-600 dark:text-gray-300">
                                    <span className="font-semibold">Pedido mínimo:</span> {product.minOrder} unidades
                                </p>
                            </div>

                            {/* Colores disponibles */}
                            <div>
                                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Colores disponibles:</h4>
                                <div className="flex flex-wrap gap-2">
                                    {product.availableColors.map(color => (
                                        <span 
                                            key={color}
                                            className="px-3 py-1 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md text-sm border dark:border-gray-500"
                                        >
                                            {color}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Áreas de personalización */}
                            <div>
                                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Áreas de personalización:</h4>
                                <div className="space-y-2">
                                    {product.personalizationAreas.map(area => (
                                        <div 
                                            key={area.id}
                                            className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                                        >
                                            <span className="text-gray-700 dark:text-gray-300">{area.name}</span>
                                            <span className="text-sky-600 dark:text-sky-400 font-semibold">
                                                +${area.price.toLocaleString('es-CL')} CLP
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Botones de acción */}
                    <div className="border-t dark:border-gray-700 pt-6">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <button 
                                onClick={onPersonalize}
                                className="flex-1 bg-sky-600 hover:bg-sky-700 text-white py-4 px-6 rounded-lg font-semibold text-lg transition-colors flex items-center justify-center space-x-2"
                            >
                                <Palette className="w-5 h-5" />
                                <span>Personalizar Producto</span>
                            </button>
                            <button 
                                onClick={onQuickAdd}
                                className="flex-1 border-2 border-sky-600 text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-900/20 py-4 px-6 rounded-lg font-semibold text-lg transition-colors flex items-center justify-center space-x-2"
                            >
                                <ShoppingCart className="w-5 h-5" />
                                <span>Agregar al Carrito</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductModal;