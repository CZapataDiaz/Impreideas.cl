import React, { useState, useEffect, useMemo } from 'react';
import { ShoppingCart, Eye, Filter, Palette, Loader2, AlertCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useProducts, useCategories } from '../hooks/useAPI';
import ProductModal from './ProductModal';
import PersonalizationModal from './PersonalizationModal';

const ProductCatalog = ({ searchQuery }) => {
    const [selectedCategory, setSelectedCategory] = useState('Todos');
    const [sortBy, setSortBy] = useState('name');
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [personalizationProduct, setPersonalizationProduct] = useState(null);
    const { addItem } = useCart();

    // Cargar productos y categorías desde la API
    const { products, loading: loadingProducts, error: errorProducts } = useProducts();
    const { categories, loading: loadingCategories, error: errorCategories } = useCategories();

    // Función MEJORADA con imágenes que SÍ funcionan
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

            // PAPELERÍA
            'Libreta Ecológica MOD. N37': 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&h=200&fit=crop',
            'Libreta Ecológica MOD. N36': 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&h=200&fit=crop',
            'Cuaderno Ecológico Compost MOD. N38': 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&h=200&fit=crop',
            'Cuaderno Bamboo MOD. N30': 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&h=200&fit=crop',
            'Memo Set Ecológico MOD. N51': 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&h=200&fit=crop',
            'Memo Set Bamboo MOD. N6': 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&h=200&fit=crop',
            'Libreta Color MOD. N33': 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&h=200&fit=crop',
            'Libreta Agenda Cuero Símil MOD. N44': 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&h=200&fit=crop',
            'Cubo Ecológico MOD. N4': 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&h=200&fit=crop',
            'Carpeta Ecológica MOD. N55': 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&h=200&fit=crop',

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

            // TEXTIL
            'Cuello Polar Anti-Peeling MOD. RO2': 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=300&h=200&fit=crop',
            'Gorro de Lana MOD. RO1': 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=300&h=200&fit=crop',
            'Bandana Sublimable MOD. PA1': 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=300&h=200&fit=crop',
            'Chaqueta con Cinta Reflectante': 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=300&h=200&fit=crop',
            'Capa Remo MOD. SK2': 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=300&h=200&fit=crop',
            'Manta Impermeable para Picnic MOD. T17': 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=300&h=200&fit=crop',
            'Manta Polar Anti-Peeling MOD. T18': 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=300&h=200&fit=crop',

            // ACCESORIOS
            'Llavero Metálico MOD. K17': 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=300&h=200&fit=crop',
            'Llavero Bamboo MOD. MA1': 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=300&h=200&fit=crop',
            'Destapador Botella MOD. K20': 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=300&h=200&fit=crop',
            'Posavasos Destapador Olmux MOD. SK29': 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=200&fit=crop',
            'Set de Costura MOD. VA15': 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=300&h=200&fit=crop',
            'Set Manicure MOD. VA6': 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=300&h=200&fit=crop',
            'Espejo + Peine MOD. VA1': 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=300&h=200&fit=crop',
            'Botiquín Primeros Auxilios MOD. PX10': 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=300&h=200&fit=crop',
            'Envase con Alcohol Gel Hanger MOD. AH1': 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=300&h=200&fit=crop',
            'Corazón Anti-Estrés MOD. ANT2': 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=300&h=200&fit=crop',

            // VINOS Y PARRILLA
            'Set de Vino Deluxe Bamboo MOD. W1': 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=300&h=200&fit=crop',
            'Set de Vino Deluxe MOD. W10': 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=300&h=200&fit=crop',
            'Casa de Madera para Vino MOD. W22': 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=300&h=200&fit=crop',
            'Descorchador Encobrizado MOD. W15': 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=300&h=200&fit=crop',
            'Set Parrillero BBQ MOD. T4': 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=300&h=200&fit=crop',
            'Set BBQ MOD. T1': 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=300&h=200&fit=crop',
            'Delantal Parrillero MOD. TP50': 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=300&h=200&fit=crop',
            'Set Tabla de Quesos MOD. TP10': 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=300&h=200&fit=crop',

            // PACKAGING
            'Bolsa Papel Kraft 14x20x8 MOD. BP08': 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&h=200&fit=crop',
            'Bolsa Papel Kraft 22x30x10 MOD. BP10': 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&h=200&fit=crop',
            'Bolsa Papel Kraft 30x41x12 MOD. BP12': 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&h=200&fit=crop',
            'Saco de Yute 10x15 MOD. SY10': 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&h=200&fit=crop',
            'Saco de Yute 20x30 MOD. SY20': 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&h=200&fit=crop',
            'Caja Cartón 19x10x4 MOD. CC04': 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&h=200&fit=crop',
            'Caja Cartón 25x20x7 MOD. CC07': 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&h=200&fit=crop',
            'Caja Cartón 30x20x8 MOD. CC08': 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&h=200&fit=crop',

            // TIMBRES
            'Timbre Automático Rectangular MOD. XL10': 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=300&h=200&fit=crop',
            'Timbre Automático Rectangular MOD. XL20': 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=300&h=200&fit=crop',
            'Timbre Automático Rectangular MOD. XL30': 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=300&h=200&fit=crop',
            'Timbre Automático Redondo MOD. XL 803': 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=300&h=200&fit=crop',
            'Timbre Automático Redondo MOD. XL 804': 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=300&h=200&fit=crop',
            'Timbre Automático de Bolsillo': 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=300&h=200&fit=crop',
            'Tampón Dactilar (Huellero) MOD. 233': 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=300&h=200&fit=crop',
            'Tinta para Timbre Automático MOD. 7111': 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=300&h=200&fit=crop',
            'Goma para Timbre': 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=300&h=200&fit=crop',

            // HOGAR
            'Set de 2 Vasos MOD. M4': 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=300&h=200&fit=crop',
            'Set de 2 Tazas Encobrizadas MOD. M72': 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=300&h=200&fit=crop',
            'Set de 4 Copas Champagne Encobrizadas MOD. M85': 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=300&h=200&fit=crop',
            'Set de 4 Copas + Decantador Encobrizados MOD. M88': 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=300&h=200&fit=crop',
            'Bandeja Encobrizada MOD. M110': 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=200&fit=crop',
            'Set 2 Posavasos Martillado Encobrizada MOD. M112': 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=200&fit=crop',
            'Jiggers / Medidor de Licor MOD. M120': 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=200&fit=crop',
            'Set Coctelera MOD. M125': 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=200&fit=crop',
            'Hielera + Pinzas MOD. M100': 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=200&fit=crop'
        };

        // Si encontramos una imagen específica, la devolvemos
        if (productImages[product.name]) {
            return productImages[product.name];
        }

        // Fallback a placeholder con nombre del producto
        return `https://placehold.co/300x200/6366F1/FFFFFF?font=arial-bold&text=${encodeURIComponent(product.name)}`;
    };

    // Función para manejar errores de imágenes
    const handleImageError = (e, productName) => {
        console.log(`❌ Error cargando imagen para: ${productName}`);
        e.target.src = 'https://placehold.co/300x200/EFEFEF/666666?font=arial&text=Imagen+no+disponible';
    };

    // Filtrar y ordenar productos
    const filteredProducts = useMemo(() => {
        if (!products || products.length === 0) return [];

        let filtered = products;

        // Filtro por categoría
        if (selectedCategory !== 'Todos') {
            filtered = filtered.filter(product => {
                // Verificar tanto por nombre de categoría como por categoryId
                return product.category === selectedCategory || 
                       product.Category?.name === selectedCategory ||
                       (product.categoryId && 
                        categories.find(c => c.id === product.categoryId)?.name === selectedCategory);
            });
        }

        // Filtro por búsqueda
        if (searchQuery) {
            filtered = filtered.filter(product => {
                const searchLower = searchQuery.toLowerCase();
                return (
                    product.name?.toLowerCase().includes(searchLower) ||
                    product.description?.toLowerCase().includes(searchLower) ||
                    product.category?.toLowerCase().includes(searchLower) ||
                    product.Category?.name?.toLowerCase().includes(searchLower)
                );
            });
        }

        // Ordenar productos
        filtered = [...filtered].sort((a, b) => {
            switch (sortBy) {
                case 'price-low':
                    return (a.base_price || a.basePrice) - (b.base_price || b.basePrice);
                case 'price-high':
                    return (b.base_price || b.basePrice) - (a.base_price || a.basePrice);
                case 'min-order':
                    return (a.minimum_order || a.minOrder || 0) - (b.minimum_order || b.minOrder || 0);
                default:
                    return a.name.localeCompare(b.name);
            }
        });

        return filtered;
    }, [products, categories, selectedCategory, searchQuery, sortBy]);

    // Agregar producto rápido (sin personalización)
    const handleQuickAdd = (product) => {
    console.log('🛒 Intentando agregar producto rápido:', product);
    
    if (!product || !product.id) {
        console.error('❌ Producto o ID inválido:', product);
        alert('Error: Producto no válido');
        return;
    }

    const quantity = Math.max(1, product.minimum_order || product.minOrder || 1);
    
    console.log(`🛒 Agregando: ${product.name}, ID: ${product.id}, Cantidad: ${quantity}`);
    
    try {
        // Objeto de personalización vacío pero con estructura válida
        const emptyPersonalization = {
            color: '',
            position: '',
            size: '',
            method: '',
            logo: { type: 'none' },
            additionalNotes: '',
            priceModifiers: { size: 0, method: 0 }
        };
        
        // Pasar el producto COMPLETO, no solo el ID
        addItem(product, quantity, emptyPersonalization);
        console.log('✅ Producto agregado exitosamente al carrito');
        alert(`¡${product.name} agregado al carrito!`);
    } catch (error) {
        console.error('❌ Error al agregar producto:', error);
        alert('Error al agregar el producto al carrito');
    }
};

    // Abrir modal de personalización
    const openPersonalization = (product) => {
        setPersonalizationProduct(product);
    };

    // Preparar lista de categorías (incluyendo "Todos")
    const allCategories = useMemo(() => {
        if (!categories || categories.length === 0) return [{ id: 0, name: 'Todos', count: products?.length || 0 }];
        
        const categoriesWithCounts = [
            { id: 0, name: 'Todos', count: products?.length || 0 },
            ...categories.map(cat => ({
                ...cat,
                count: products?.filter(p => 
                    p.categoryId === cat.id || 
                    p.Category?.id === cat.id ||
                    p.category === cat.name
                ).length || 0
            }))
        ];
        
        return categoriesWithCounts;
    }, [categories, products]);

    // Estado de loading
    if (loadingProducts || loadingCategories) {
        return (
            <section className="py-16 bg-gray-50 dark:bg-gray-900">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col items-center justify-center min-h-[400px]">
                        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                        <p className="text-gray-600 dark:text-gray-300">Cargando productos...</p>
                    </div>
                </div>
            </section>
        );
    }

    // Estado de error
    if (errorProducts || errorCategories) {
        return (
            <section className="py-16 bg-gray-50 dark:bg-gray-900">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col items-center justify-center min-h-[400px]">
                        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                        <p className="text-gray-600 dark:text-gray-300 mb-2">
                            Error al cargar productos
                        </p>
                        <p className="text-sm text-gray-500">
                            {errorProducts || errorCategories}
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Reintentar
                        </button>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section id="catalog" className="py-16 bg-gray-50 dark:bg-gray-900">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                        Catálogo de Productos
                    </h2>
                </div>

                {/* Filtros */}
                <div className="flex flex-col lg:flex-row gap-6 mb-8">
                    {/* Categorías */}
                    <div className="flex flex-wrap gap-2">
                        {allCategories.map(category => (
                            <button
                                key={category.id}
                                onClick={() => setSelectedCategory(category.name)}
                                className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center space-x-2 ${
                                    selectedCategory === category.name
                                        ? 'bg-sky-600 hover:bg-sky-700 text-white'
                                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-sky-50 dark:hover:bg-sky-900/20 hover:text-sky-700 dark:hover:text-sky-400 border border-gray-300 dark:border-gray-600'
                                }`}
                            >
                                <span>{category.name}</span>
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                    selectedCategory === category.name
                                        ? 'bg-sky-500 text-white'
                                        : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                                }`}>
                                    {category.count || 0}
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* Ordenamiento */}
                    <div className="flex items-center gap-4 lg:ml-auto">
                        <div className="flex items-center gap-2">
                            <Filter className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                            <span className="text-sm text-gray-600 dark:text-gray-300">Ordenar por:</span>
                        </div>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-sky-500 focus:ring-2 focus:ring-sky-500 focus:ring-opacity-20"
                        >
                            <option value="name">Nombre A-Z</option>
                            <option value="price-low">Precio: Menor a Mayor</option>
                            <option value="price-high">Precio: Mayor a Menor</option>
                            <option value="min-order">Pedido Mínimo</option>
                        </select>
                    </div>
                </div>

                {/* Contador de resultados */}
                <div className="mb-6">
                    <p className="text-gray-600 dark:text-gray-300">
                        Mostrando {filteredProducts.length} productos
                        {searchQuery && ` para "${searchQuery}"`}
                    </p>
                </div>

                {/* Grilla de productos */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredProducts.map(product => {
                        const basePrice = product.base_price || product.basePrice || 0;
                        const minOrder = product.minimum_order || product.minOrder || 1;
                        const categoryName = (() => {
                            if (product.Category?.name) return String(product.Category.name);
                            if (product.category?.name) return String(product.category.name);
                            if (typeof product.category === 'string') return product.category;
                            return 'Sin categoría';
                        })();
                        
                        return (
                        <div key={product.id} className="group bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border dark:border-gray-700">
                            <div className="relative overflow-hidden">
                                <img
                                    src={getProductImage(product)}
                                    alt={product.name}
                                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                                    onError={(e) => handleImageError(e, product.name)}
                                />
                                <div className="absolute top-3 right-3">
                                    <span className="bg-sky-600 hover:bg-sky-700 text-white px-2 py-1 rounded-md text-xs font-medium">
                                        {categoryName}
                                    </span>
                                </div>
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                                    <button
                                        onClick={() => setSelectedProduct(product)}
                                        className="bg-white text-gray-900 px-4 py-2 rounded-lg font-medium flex items-center space-x-2 shadow-lg"
                                    >
                                        <Eye className="w-4 h-4" />
                                        <span>Ver Detalles</span>
                                    </button>
                                </div>
                            </div>
                            
                            <div className="p-4">
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-1">
                                    {product.name}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
                                    {product.description}
                                </p>
                                
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-2xl font-bold text-sky-600 dark:text-sky-400">
                                            ${Number(basePrice).toLocaleString('es-CL')} CLP
                                        </span>
                                        <span className="text-sm text-gray-500 dark:text-gray-400">por unidad</span>
                                    </div>
                                    
                                    <div className="text-sm text-gray-600 dark:text-gray-300">
                                        <span className="font-medium">Pedido mínimo:</span> {minOrder} unidades
                                    </div>
                                </div>
                            </div>
                            
                            <div className="p-4 pt-0 space-y-2">
                                <button
                                    onClick={() => openPersonalization(product)}
                                    className="w-full bg-sky-600 hover:bg-sky-700 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                                >
                                    <Palette className="w-4 h-4" />
                                    <span>Personalizar</span>
                                </button>
                                <button
                                    onClick={() => handleQuickAdd(product)}
                                    className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                                >
                                    <ShoppingCart className="w-4 h-4" />
                                    <span>Agregar Rápido</span>
                                </button>
                            </div>
                        </div>
                        );
                    })}
                </div>

                {/* Estado vacío */}
                {filteredProducts.length === 0 && (
                    <div className="text-center py-12">
                        <div className="text-gray-400 dark:text-gray-500 mb-4">
                            <Filter className="w-16 h-16 mx-auto" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            No se encontraron productos
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300">
                            Intenta ajustar los filtros o la búsqueda para encontrar lo que buscas.
                        </p>
                    </div>
                )}
            </div>

            {/* Modales */}
            {selectedProduct && (
                <ProductModal 
                    product={selectedProduct}
                    onClose={() => setSelectedProduct(null)}
                    onPersonalize={() => {
                        setPersonalizationProduct(selectedProduct);
                        setSelectedProduct(null);
                    }}
                    onQuickAdd={() => {
                        handleQuickAdd(selectedProduct);
                        setSelectedProduct(null);
                    }}
                />
            )}

            {personalizationProduct && (
                <PersonalizationModal
                    product={personalizationProduct}
                    onClose={() => setPersonalizationProduct(null)}
                />
            )}
        </section>
    );
};

export default ProductCatalog;