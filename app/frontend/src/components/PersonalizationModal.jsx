import React, { useState, useEffect } from 'react';
import { X, Upload, Plus, Minus } from 'lucide-react';
import { useCart } from '../context/CartContext';

const PersonalizationModal = ({ product, onClose, personalizationOptions }) => {
    // Validación solo del producto
    if (!product) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Error</h2>
                    <p className="text-gray-600 dark:text-gray-300">Producto no disponible.</p>
                    <button onClick={onClose} className="mt-4 w-full bg-sky-600 hover:bg-sky-700 text-white py-2 px-4 rounded-lg">
                        Cerrar
                    </button>
                </div>
            </div>
        );
    }

    // Opciones por defecto si personalizationOptions es null/undefined
    const safeOptions = personalizationOptions || {
        logo_area: [
            { id: 1, name: 'Centrado', value: 'center', priceModifier: 0 },
            { id: 2, name: 'Esquina Superior Izquierda', value: 'top-left', priceModifier: 0 }
        ],
        logo_size: [
            { id: 1, name: 'Pequeño', value: 'small', priceModifier: 0 },
            { id: 2, name: 'Mediano', value: 'medium', priceModifier: 300 },
            { id: 3, name: 'Grande', value: 'large', priceModifier: 600 }
        ],
        print_method: [
            { id: 1, name: 'Serigrafía', value: 'screen_printing', priceModifier: 0 },
            { id: 2, name: 'Bordado', value: 'embroidery', priceModifier: 800 }
        ]
    };

    // Estados
    const [selectedColor, setSelectedColor] = useState(product?.availableColors?.[0] || '');
    const [selectedPosition, setSelectedPosition] = useState(safeOptions?.logo_area?.[0] || {});
    const [selectedSize, setSelectedSize] = useState(safeOptions?.logo_size?.[1] || safeOptions?.logo_size?.[0] || {});
    const [selectedMethod, setSelectedMethod] = useState(safeOptions?.print_method?.[0] || {});
    const [logoType, setLogoType] = useState('file');
    const [logoFile, setLogoFile] = useState(null);
    const [logoText, setLogoText] = useState('');
    const [quantity, setQuantity] = useState(product?.minOrder || 1);
    const [additionalNotes, setAdditionalNotes] = useState('');
    
    const { addItem } = useCart();

    const getProductImage = (product) => {
    // Mapeo con imágenes GARANTIZADAS que funcionan
    const productImages = {
        // TAZAS - Imágenes de tazas reales
        'Mug Térmico MOD. M10': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop',
        'Mug Térmico MOD. M15': 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=300&h=200&fit=crop',
        'Mug Térmico MOD. M11': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop',
        'Mug Térmico MOD. M13': 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=300&h=200&fit=crop',
        'Taza Corporativa Premium': 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=300&h=200&fit=crop',
        'Mug Sublimable MOD. M81 SUB': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop',
        'Tazón Sublimación con Caja MOD. 99223': 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=300&h=200&fit=crop',
        'Vaso Mug MOD. M19': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop',

        // BOLSAS Y MOCHILAS
        'Bolsa Tela TNT MOD. G00': 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&h=200&fit=crop',
        'Bolsa Tela TNT MOD. G01': 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&h=200&fit=crop',
        'Bolsa Tela TNT MOD. G03': 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&h=200&fit=crop',
        'Bolsa Plegable MOD. BB10': 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&h=200&fit=crop',
        'Mochila Plegable Mathis MOD. SK24-SK25-SK26': 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&h=200&fit=crop',
        'Mochila Discovery MOD. SK47': 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&h=200&fit=crop',
        'Morral Tela TNT MOD. E8': 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&h=200&fit=crop',
        'Mochila Porta Notebook MOD. E45': 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&h=200&fit=crop',
        'Mochila Town II MOD. E9': 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&h=200&fit=crop',
        'Nevera Hertum MOD. SK35': 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&h=200&fit=crop',

        // ÚTILES - Imágenes de escritura
        'Bolígrafo Encobrizado MOD. L75': 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=300&h=200&fit=crop',
        'Bolígrafo Encobrizado con Estuche MOD. L75+B': 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=300&h=200&fit=crop',
        'Bolígrafo Metálico MOD. L45': 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=300&h=200&fit=crop',
        'Bolígrafo Bamboo MOD. B2': 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=300&h=200&fit=crop',
        'Bolígrafo Plástico MOD. L34': 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=300&h=200&fit=crop',
        'Set de Escritura Bamboo MOD. B91': 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=300&h=200&fit=crop',
        'Lápiz Grafito MOD. L26': 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=300&h=200&fit=crop',
        'Set de Lápices de Colores MOD. S1': 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=300&h=200&fit=crop',
        'Roller Encobrizado MOD. L76': 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=300&h=200&fit=crop',
        'Bolígrafo Metálico Premium MOD. B40': 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=300&h=200&fit=crop',

        // TECNOLOGÍA
        'Pendrive Bamboo MOD. PD2': 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=300&h=200&fit=crop',
        'Pendrive Bamboo MOD. PD1': 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=300&h=200&fit=crop',
        'Pendrive Símil Cuero MOD. PD8': 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=300&h=200&fit=crop',
        'Power Bank Bamboo MOD. BP4': 'https://images.unsplash.com/photo-1609592810793-abeb6c64b5c6?w=300&h=200&fit=crop',
        'Power Bank MOD. BP1': 'https://images.unsplash.com/photo-1609592810793-abeb6c64b5c6?w=300&h=200&fit=crop',
        'Altavoz Bamboo MOD. SK53': 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=300&h=200&fit=crop',
        'Altavoz Martins MOD. SK21': 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=300&h=200&fit=crop',
        'Calculadora Bamboo MOD. T75': 'https://images.unsplash.com/photo-1587145820266-a5951ee6f620?w=300&h=200&fit=crop',
        'Cable Conector Multicargador MOD. T55': 'https://images.unsplash.com/photo-1609592810793-abeb6c64b5c6?w=300&h=200&fit=crop',
        'Localizador Krosky MOD. SK23': 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=300&h=200&fit=crop',

        // Agrega aquí el resto de tus productos...
    };

    // Si encontramos una imagen específica, la devolvemos
    if (productImages[product.name]) {
        return productImages[product.name];
    }

    // Fallback a placeholder con nombre del producto
    return `https://placehold.co/300x200/6366F1/FFFFFF?font=arial-bold&text=${encodeURIComponent(product.name)}`;
};

    // Calcular precio total
    const [totalPrice, setTotalPrice] = useState(0);

    useEffect(() => {
        const basePrice = product?.basePrice || 0;
        const sizePrice = selectedSize?.priceModifier || 0;
        const total = (basePrice + sizePrice) * quantity;
        setTotalPrice(total);
    }, [product?.basePrice, selectedSize?.priceModifier, quantity]);

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/svg+xml', 'application/pdf'];
            const maxSize = 5 * 1024 * 1024;

            if (!validTypes.includes(file.type)) {
                alert('Por favor selecciona un archivo JPG, PNG, SVG o PDF.');
                return;
            }

            if (file.size > maxSize) {
                alert('El archivo debe ser menor a 5MB.');
                return;
            }

            setLogoFile(file);
        }
    };
    
// Agregar al carrito con personalización
const handleAddToCart = () => {
    if (logoType === 'file' && !logoFile) {
        alert('Por favor selecciona un archivo de logo.');
        return;
    }

    if (logoType === 'text' && !logoText.trim()) {
        alert('Por favor ingresa el texto para el logo.');
        return;
    }

    // Crear objeto de personalización con estructura de BD
    const personalization = {
        color: selectedColor?.name || selectedColor,
        position: selectedPosition?.name,
        size: selectedSize?.name,
        method: selectedMethod?.name,
        logo: logoType === 'file' ? {
            type: 'file',
            name: logoFile.name,
            size: logoFile.size
        } : {
            type: 'text',
            content: logoText
        },
        additionalNotes,
        priceModifiers: {
            size: selectedSize?.priceModifier || 0,
            method: selectedMethod?.priceModifier || 0
        }
    };

    // Pasar el producto COMPLETO, no solo el ID
    addItem(product, quantity, personalization);
    onClose();
    alert(`¡${product.name} agregado al carrito!`);
};

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
            <div className="bg-white dark:bg-gray-800 rounded-xl max-w-5xl w-full max-h-[95vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white dark:bg-gray-800 border-b dark:border-gray-700 p-4 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Personalizar Producto</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    </button>
                </div>

                <div className="p-6">
                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Preview del producto */}
                        <div className="lg:col-span-1">
                            <div className="sticky top-4">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Vista Previa</h3>
                                <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-6 text-center">
                                    <img 
                                        src={getProductImage(product)} 
                                        alt={product.name}
                                        className="w-full h-48 object-cover rounded-lg mb-4"
                                        onError={(e) => {
                                            e.target.src = 'https://placehold.co/300x200/EFEFEF/666666?font=arial&text=Imagen+no+disponible';
                                            console.log(`❌ Error cargando imagen para: ${product.name}`);
                                        }}
                                    />
                                    <h4 className="font-semibold text-gray-900 dark:text-white">{product.name}</h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Color: {selectedColor?.name || selectedColor}</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">Posición: {selectedPosition?.name}</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">Tamaño: {selectedSize?.name}</p>
                                </div>
                                
                                {/* Resumen de precio */}
                                <div className="mt-4 bg-sky-50 dark:bg-sky-900/20 rounded-lg p-4">
                                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Resumen</h4>
                                    <div className="space-y-1 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600 dark:text-gray-300">Precio base:</span>
                                            <span className="text-gray-900 dark:text-white">${product.basePrice.toLocaleString('es-CL')} CLP</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600 dark:text-gray-300">Tamaño ({selectedSize?.name}):</span>
                                            <span className="text-gray-900 dark:text-white">+${(selectedSize?.priceModifier || 0).toLocaleString('es-CL')} CLP</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600 dark:text-gray-300">Cantidad:</span>
                                            <span className="text-gray-900 dark:text-white">{quantity} unidades</span>
                                        </div>
                                        <div className="border-t dark:border-gray-600 pt-1 mt-2">
                                            <div className="flex justify-between font-semibold">
                                                <span className="text-gray-900 dark:text-white">Total:</span>
                                                <span className="text-sky-600 dark:text-sky-400">${totalPrice.toLocaleString('es-CL')} CLP</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Opciones de personalización */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Color del producto */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Color del Producto</h3>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    {product.availableColors?.map(color => (
                                        <button
                                            key={color}
                                            onClick={() => setSelectedColor(color)}
                                            className={`p-3 border-2 rounded-lg text-center transition-colors ${
                                                selectedColor === color
                                                    ? 'border-sky-600 bg-sky-50 dark:bg-sky-900/20 text-sky-700 dark:text-sky-300'
                                                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 bg-white dark:bg-gray-800'
                                            }`}
                                        >
                                            <span className="text-sm font-medium text-gray-900 dark:text-white">{color}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Posición del logo */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Posición del Logo</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {safeOptions?.logo_area?.map(position => (
                                        <button
                                            key={position.id}
                                            onClick={() => setSelectedPosition(position)}
                                            className={`p-4 border-2 rounded-lg text-left transition-colors ${
                                                selectedPosition?.id === position.id
                                                    ? 'border-sky-600 bg-sky-50 dark:bg-sky-900/20'
                                                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 bg-white dark:bg-gray-800'
                                            }`}
                                        >
                                            <div className="font-medium text-gray-900 dark:text-white">{position.name}</div>
                                            <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">Posición: {position.value}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Tamaño del logo */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Tamaño del Logo</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                    {safeOptions?.logo_size?.map(size => (
                                        <button
                                            key={size.id}
                                            onClick={() => setSelectedSize(size)}
                                            className={`p-4 border-2 rounded-lg text-center transition-colors ${
                                                selectedSize?.id === size.id
                                                    ? 'border-sky-600 bg-sky-50 dark:bg-sky-900/20'
                                                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 bg-white dark:bg-gray-800'
                                            }`}
                                        >
                                            <div className="font-medium text-gray-900 dark:text-white">{size.name}</div>
                                            <div className="text-sm text-gray-600 dark:text-gray-300">{size.value}</div>
                                            <div className="text-sm text-sky-600 dark:text-sky-400 font-medium">
                                                +${size.priceModifier.toLocaleString('es-CL')} CLP
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Método de impresión */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Método de Impresión</h3>
                                <div className="grid grid-cols-1 gap-3">
                                    {safeOptions?.print_method?.map(method => (
                                        <button
                                            key={method.id}
                                            onClick={() => setSelectedMethod(method)}
                                            className={`p-4 border-2 rounded-lg text-left transition-colors ${
                                                selectedMethod?.id === method.id
                                                    ? 'border-sky-600 bg-sky-50 dark:bg-sky-900/20'
                                                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 bg-white dark:bg-gray-800'
                                            }`}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <div className="font-medium text-gray-900 dark:text-white">{method.name}</div>
                                                    <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">{method.value}</div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-sm text-sky-600 dark:text-sky-400">
                                                        +${method.priceModifier.toLocaleString('es-CL')} CLP
                                                    </div>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Cantidad */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Cantidad</h3>
                                <div className="flex items-center space-x-4">
                                    <button
                                        onClick={() => setQuantity(Math.max(product.minOrder, quantity - 1))}
                                        disabled={quantity <= product.minOrder}
                                        className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Minus className="w-4 h-4" />
                                    </button>
                                    <span className="text-xl font-semibold text-gray-900 dark:text-white min-w-[3rem] text-center">{quantity}</span>
                                    <button
                                        onClick={() => setQuantity(quantity + 1)}
                                        className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                    <span className="text-sm text-gray-600 dark:text-gray-300">
                                        (Mínimo: {product.minOrder} unidades)
                                    </span>
                                </div>
                            </div>

                            {/* Notas adicionales */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Notas Adicionales (Opcional)</h3>
                                <textarea
                                    value={additionalNotes}
                                    onChange={(e) => setAdditionalNotes(e.target.value)}
                                    placeholder="Instrucciones especiales, colores específicos, etc."
                                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:border-sky-500 focus:ring-2 focus:ring-sky-500 focus:ring-opacity-20 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                    rows="3"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Botón de agregar al carrito */}
                    <div className="border-t dark:border-gray-700 pt-6 mt-8">
                        <button
                            onClick={handleAddToCart}
                            className="w-full bg-sky-600 hover:bg-sky-700 text-white py-4 px-6 rounded-lg font-semibold text-lg transition-colors flex items-center justify-center space-x-2"
                        >
                            <span>Agregar al Carrito - ${totalPrice.toLocaleString('es-CL')} CLP</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PersonalizationModal;