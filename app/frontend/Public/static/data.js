// Datos simulados completos para ImpreIdeas -
const mockProducts = [
    // TAZAS
    {
        id: 1,
        name: "Taza Corporativa Premium",
        category: "Tazas",
        basePrice: 0.000,
        minOrder: 50,
        image: "img/no-disponible.jpg",
        description: "Taza cerámica de alta calidad ideal para branding corporativo",
        personalizationAreas: [
            { id: 1, name: "Frente", price: 0.000 },
            { id: 2, name: "Ambos lados", price: 0.000 }
        ],
        availableColors: ["Blanco", "Azul", "Negro", "Rojo"]
    },
    {
        id: 2,
        name: "Taza de Viaje Térmica",
        category: "Tazas",
        basePrice: 0.000,
        minOrder: 25,
        image: "img/no-disponible.jpg",
        description: "Taza térmica con tapa para llevar, perfecta para oficinas móviles",
        personalizationAreas: [
            { id: 1, name: "Lateral", price: 0.000 },
            { id: 2, name: "Tapa", price: 0.000 }
        ],
        availableColors: ["Acero", "Negro mate", "Blanco", "Azul marino"]
    },
    {
        id: 3,
        name: "Taza de Cerámica Artesanal",
        category: "Tazas",
        basePrice: 0.000,
        minOrder: 30,
        image: "img/no-disponible.jpg",
        description: "Taza de cerámica con acabado artesanal, ideal para eventos especiales",
        personalizationAreas: [
            { id: 1, name: "Frente", price: 0.000 },
            { id: 2, name: "Alrededor", price: 0.000 }
        ],
        availableColors: ["Terracota", "Verde oliva", "Azul cobalto", "Crema"]
    },

    // ÚTILES ESCOLARES/OFICINA
    {
        id: 4,
        name: "Lapicera Ejecutiva",
        category: "Útiles",
        basePrice: 0.000,
        minOrder: 100,
        image: "img/no-disponible.jpg",
        description: "Bolígrafo de metal con acabado premium para empresas",
        personalizationAreas: [
            { id: 1, name: "Lateral", price: 0.000 },
            { id: 2, name: "Clip", price: 0.000 }
        ],
        availableColors: ["Plateado", "Dorado", "Negro", "Azul"]
    },
    {
        id: 5,
        name: "Set de Lápices de Colores",
        category: "Útiles",
        basePrice: 0.000,
        minOrder: 50,
        image: "img/no-disponible.jpg",
        description: "Caja de 12 lápices de colores con grabado personalizado",
        personalizationAreas: [
            { id: 1, name: "Caja", price: 0.000 },
            { id: 2, name: "Lápices individuales", price: 0.000 }
        ],
        availableColors: ["Caja natural", "Caja negra", "Caja blanca"]
    },
    {
        id: 6,
        name: "Marcadores Permanentes Set",
        category: "Útiles",
        basePrice: 0.000,
        minOrder: 80,
        image: "img/no-disponible.jpg",
        description: "Set de 4 marcadores permanentes con estuche personalizado",
        personalizationAreas: [
            { id: 1, name: "Estuche", price: 0.000 }
        ],
        availableColors: ["Estuche negro", "Estuche gris", "Estuche azul"]
    },
    {
        id: 7,
        name: "Calculadora de Escritorio",
        category: "Útiles",
        basePrice: 0.000,
        minOrder: 20,
        image: "img/no-disponible.jpg",
        description: "Calculadora profesional con pantalla grande y grabado láser",
        personalizationAreas: [
            { id: 1, name: "Parte superior", price: 0.000 },
            { id: 2, name: "Lateral", price: 0.000 }
        ],
        availableColors: ["Negro", "Gris", "Plata"]
    },

    // PAPELERÍA
    {
        id: 8,
        name: "Libreta Corporativa",
        category: "Papelería",
        basePrice: 0.000,
        minOrder: 25,
        image: "img/no-disponible.jpg",
        description: "Cuaderno tapa dura con hojas punteadas, ideal para ejecutivos",
        personalizationAreas: [
            { id: 1, name: "Portada", price: 0.000 },
            { id: 2, name: "Contraportada", price: 0.000 }
        ],
        availableColors: ["Negro", "Azul marino", "Gris", "Marrón"]
    },
    {
        id: 9,
        name: "Agenda Ejecutiva 2024",
        category: "Papelería",
        basePrice: 0.000,
        minOrder: 15,
        image: "img/no-disponible.jpg",
        description: "Agenda anual de cuero sintético con secciones organizadas",
        personalizationAreas: [
            { id: 1, name: "Portada frontal", price: 0.000 },
            { id: 2, name: "Páginas internas", price: 0.000 }
        ],
        availableColors: ["Negro", "Marrón oscuro", "Azul ejecutivo", "Burdeos"]
    },
    {
        id: 10,
        name: "Block de Notas Adhesivas",
        category: "Papelería",
        basePrice: 0.000,
        minOrder: 100,
        image: "img/no-disponible.jpg",
        description: "Set de notas adhesivas de diferentes tamaños con logo impreso",
        personalizationAreas: [
            { id: 1, name: "Cada hoja", price: 0.000 },
            { id: 2, name: "Portada del bloque", price: 0.000 }
        ],
        availableColors: ["Amarillo", "Rosa", "Azul", "Verde", "Multi-color"]
    },
    {
        id: 11,
        name: "Carpeta Corporativa A4",
        category: "Papelería",
        basePrice: 0.000,
        minOrder: 50,
        image: "img/no-disponible.jpg",
        description: "Carpeta de presentación con bolsillos internos y cierre elástico",
        personalizationAreas: [
            { id: 1, name: "Portada", price: 0.000 },
            { id: 2, name: "Lomo", price: 0.000 }
        ],
        availableColors: ["Negro", "Azul", "Rojo", "Verde", "Gris"]
    },

    // ACCESORIOS
    {
        id: 12,
        name: "Llavero Metálico",
        category: "Accesorios",
        basePrice: 0.000,
        minOrder: 200,
        image: "img/no-disponible.jpg",
        description: "Llavero de metal resistente con grabado láser",
        personalizationAreas: [
            { id: 1, name: "Una cara", price: 0.000 },
            { id: 2, name: "Ambas caras", price: 0.000 }
        ],
        availableColors: ["Plateado", "Dorado", "Negro mate"]
    },
    {
        id: 13,
        name: "Botella Térmica",
        category: "Accesorios",
        basePrice: 0.000,
        minOrder: 30,
        image: "img/no-disponible.jpg",
        description: "Botella de acero inoxidable con aislamiento térmico",
        personalizationAreas: [
            { id: 1, name: "Lateral", price: 0.000 },
            { id: 2, name: "Base", price: 0.000 }
        ],
        availableColors: ["Plateado", "Negro", "Azul", "Blanco"]
    },
    {
        id: 14,
        name: "Power Bank Corporativo",
        category: "Accesorios",
        basePrice: 0.000,
        minOrder: 20,
        image: "img/no-disponible.jpg",
        description: "Cargador portátil de 10,000mAh con grabado láser personalizado",
        personalizationAreas: [
            { id: 1, name: "Superficie principal", price: 0.000 },
            { id: 2, name: "Lateral", price: 0.000 }
        ],
        availableColors: ["Negro", "Plata", "Azul", "Rojo"]
    },
    {
        id: 15,
        name: "Mousepad Ergonómico",
        category: "Accesorios",
        basePrice: 0.000,
        minOrder: 50,
        image: "img/no-disponible.jpg",
        description: "Mousepad con reposamuñecas y superficie antideslizante",
        personalizationAreas: [
            { id: 1, name: "Superficie completa", price: 0.000 },
            { id: 2, name: "Esquina inferior", price: 0.000 }
        ],
        availableColors: ["Negro", "Azul", "Gris", "Verde"]
    },
    {
        id: 16,
        name: "Soporte para Celular",
        category: "Accesorios",
        basePrice: 0.000,
        minOrder: 40,
        image: "img/no-disponible.jpg",
        description: "Soporte ajustable de escritorio para smartphones y tablets",
        personalizationAreas: [
            { id: 1, name: "Base frontal", price: 0.000 },
            { id: 2, name: "Brazo soporte", price: 0.000 }
        ],
        availableColors: ["Negro", "Blanco", "Plata", "Azul"]
    },

    // TEXTIL
    {
        id: 17,
        name: "Camiseta Polo Empresarial",
        category: "Textil",
        basePrice: 0.000,
        minOrder: 20,
        image: "img/no-disponible.jpg",
        description: "Polo de algodón peinado, ideal para uniformes corporativos",
        personalizationAreas: [
            { id: 1, name: "Pecho izquierdo", price: 0.000 },
            { id: 2, name: "Espalda", price: 0.000 },
            { id: 3, name: "Manga", price: 0.000 }
        ],
        availableColors: ["Blanco", "Azul marino", "Gris", "Negro", "Rojo"]
    },
    {
        id: 18,
        name: "Camiseta Básica Corporativa",
        category: "Textil",
        basePrice: 0.000,
        minOrder: 25,
        image: "img/no-disponible.jpg",
        description: "Camiseta 100% algodón, perfecta para eventos y promociones",
        personalizationAreas: [
            { id: 1, name: "Frente", price: 0.000 },
            { id: 2, name: "Espalda completa", price: 0.000 },
            { id: 3, name: "Manga", price: 0.000 }
        ],
        availableColors: ["Blanco", "Negro", "Gris", "Azul", "Rojo", "Verde", "Amarillo"]
    },
    {
        id: 19,
        name: "Hoodie Corporativo",
        category: "Textil",
        basePrice: 0.000,
        minOrder: 15,
        image: "img/no-disponible.jpg",
        description: "Sudadera con capucha, mezcla algodón-poliéster, bordado incluido",
        personalizationAreas: [
            { id: 1, name: "Pecho", price: 0.000 },
            { id: 2, name: "Espalda grande", price: 0.000 },
            { id: 3, name: "Manga", price: 0.000 },
            { id: 4, name: "Capucha", price: 0.000 }
        ],
        availableColors: ["Gris melange", "Negro", "Azul marino", "Burdeos", "Verde militar"]
    },
    {
        id: 20,
        name: "Chaleco Corporativo",
        category: "Textil",
        basePrice: 0.000,
        minOrder: 20,
        image: "img/no-disponible.jpg",
        description: "Chaleco polar con cierre, perfecto para equipos de trabajo",
        personalizationAreas: [
            { id: 1, name: "Pecho derecho", price: 0.000 },
            { id: 2, name: "Espalda", price: 0.000 },
            { id: 3, name: "Manga", price: 0.000 }
        ],
        availableColors: ["Azul marino", "Negro", "Gris", "Verde", "Rojo"]
    },
    {
        id: 21,
        name: "Gorra Corporativa",
        category: "Textil",
        basePrice: 0.000,
        minOrder: 50,
        image: "img/no-disponible.jpg",
        description: "Gorra de 6 paneles con cierre ajustable y bordado frontal",
        personalizationAreas: [
            { id: 1, name: "Frente", price: 0.000 },
            { id: 2, name: "Lateral", price: 0.000 },
            { id: 3, name: "Visera", price: 0.000 }
        ],
        availableColors: ["Negro", "Azul marino", "Blanco", "Gris", "Rojo", "Verde"]
    },

    // TECNOLOGÍA
    {
        id: 22,
        name: "Memoria USB Corporativa",
        category: "Tecnología",
        basePrice: 0.000,
        minOrder: 50,
        image: "img/no-disponible.jpg",
        description: "USB 3.0 de 16GB con carcasa metálica y grabado láser",
        personalizationAreas: [
            { id: 1, name: "Superficie principal", price: 0.000 },
            { id: 2, name: "Tapa", price: 0.000 }
        ],
        availableColors: ["Plateado", "Dorado", "Negro", "Azul"]
    },
    {
        id: 23,
        name: "Auriculares Inalámbricos",
        category: "Tecnología",
        basePrice: 0.000,
        minOrder: 20,
        image: "img/no-disponible.jpg",
        description: "Auriculares Bluetooth con estuche de carga personalizado",
        personalizationAreas: [
            { id: 1, name: "Estuche", price: 0.000 },
            { id: 2, name: "Auriculares", price: 0.000 }
        ],
        availableColors: ["Negro", "Blanco", "Azul", "Gris"]
    },
    {
        id: 24,
        name: "Cable USB Personalizado",
        category: "Tecnología",
        basePrice: 0.000,
        minOrder: 100,
        image: "img/no-disponible.jpg",
        description: "Cable USB-C/Lightning de 1m con logo impreso en cable",
        personalizationAreas: [
            { id: 1, name: "Cable", price: 0.000 },
            { id: 2, name: "Conectores", price: 0.000 }
        ],
        availableColors: ["Negro", "Blanco", "Azul", "Rojo"]
    },

    // HOGAR Y COCINA
    {
        id: 25,
        name: "Set de Mate Corporativo",
        category: "Hogar",
        basePrice: 0.000,
        minOrder: 25,
        image: "img/no-disponible.jpg",
        description: "Mate de calabaza con bombilla de acero y grabado personalizado",
        personalizationAreas: [
            { id: 1, name: "Mate", price: 0.000 },
            { id: 2, name: "Bombilla", price: 0.000 }
        ],
        availableColors: ["Natural", "Barnizado", "Pintado negro"]
    },
    {
        id: 26,
        name: "Tabla de Corte de Bambú",
        category: "Hogar",
        basePrice: 0.000,
        minOrder: 30,
        image: "img/no-disponible.jpg",
        description: "Tabla de corte ecológica de bambú con grabado láser",
        personalizationAreas: [
            { id: 1, name: "Centro", price: 0.000 },
            { id: 2, name: "Esquina", price: 0.000 }
        ],
        availableColors: ["Natural", "Carbonizado"]
    },
    {
        id: 27,
        name: "Termo de Acero Premium",
        category: "Hogar",
        basePrice: 0.000,
        minOrder: 20,
        image: "img/no-disponible.jpg",
        description: "Termo de 1L con doble aislamiento y grabado láser",
        personalizationAreas: [
            { id: 1, name: "Cuerpo principal", price: 0.000 },
            { id: 2, name: "Tapa", price: 0.000 }
        ],
        availableColors: ["Acero natural", "Negro mate", "Azul", "Rojo"]
    },

    // EVENTOS Y PROMOCIONALES
    {
        id: 28,
        name: "Bolsa Ecológica de Lona",
        category: "Promocionales",
        basePrice: 0.000,
        minOrder: 100,
        image: "img/no-disponible.jpg",
        description: "Bolsa reutilizable de algodón con asas reforzadas",
        personalizationAreas: [
            { id: 1, name: "Frente", price: 0.000 },
            { id: 2, name: "Ambos lados", price: 0.000 }
        ],
        availableColors: ["Natural", "Negro", "Azul", "Rojo", "Verde"]
    },
    {
        id: 29,
        name: "Paraguas Corporativo",
        category: "Promocionales",
        basePrice: 0.000,
        minOrder: 50,
        image: "img/no-disponible.jpg",
        description: "Paraguas automático con logo impreso en gajos",
        personalizationAreas: [
            { id: 1, name: "Un gajo", price: 0.000 },
            { id: 2, name: "Varios gajos", price: 0.000 }
        ],
        availableColors: ["Negro", "Azul marino", "Rojo", "Verde", "Gris"]
    },
    {
        id: 30,
        name: "Imán Publicitario",
        category: "Promocionales",
        basePrice: 0.000,
        minOrder: 500,
        image: "img/no-disponible.jpg",
        description: "Imán de refrigerador con impresión full color personalizada",
        personalizationAreas: [
            { id: 1, name: "Superficie completa", price: 0.000 }
        ],
        availableColors: ["Impresión full color"]
    }
];

// Categorías de productos con contadores automáticos
const mockCategories = [
    { id: 1, name: "Todos", count: mockProducts.length },
    { id: 2, name: "Tazas", count: mockProducts.filter(p => p.category === "Tazas").length },
    { id: 3, name: "Útiles", count: mockProducts.filter(p => p.category === "Útiles").length },
    { id: 4, name: "Papelería", count: mockProducts.filter(p => p.category === "Papelería").length },
    { id: 5, name: "Accesorios", count: mockProducts.filter(p => p.category === "Accesorios").length },
    { id: 6, name: "Textil", count: mockProducts.filter(p => p.category === "Textil").length },
    { id: 7, name: "Tecnología", count: mockProducts.filter(p => p.category === "Tecnología").length },
    { id: 8, name: "Hogar", count: mockProducts.filter(p => p.category === "Hogar").length },
    { id: 9, name: "Promocionales", count: mockProducts.filter(p => p.category === "Promocionales").length }
];

// Testimonios de clientes
const mockTestimonials = [
    {
        id: 1,
        company: "Tech Solutions S.A.",
        testimonial: "ImpreIdeas superó nuestras expectativas. Los productos llegaron perfectos y a tiempo.",
        rating: 5,
        contactName: "María González",
        position: "Gerente RRHH"
    },
    {
        id: 2,
        company: "Constructora Del Valle",
        testimonial: "Excelente servicio y calidad. ImpreIdeas es nuestro proveedor de confianza.",
        rating: 5,
        contactName: "Carlos Mendoza",
        position: "Director Comercial"
    },
    {
        id: 3,
        company: "Consultores Unidos",
        testimonial: "Perfecto para eventos corporativos. La personalización con ImpreIdeas quedó impecable.",
        rating: 4,
        contactName: "Ana Rodríguez",
        position: "Coordinadora de Marketing"
    },
    {
        id: 4,
        company: "Banco Regional",
        testimonial: "Trabajamos con ImpreIdeas para todos nuestros eventos. Siempre cumplen con los tiempos.",
        rating: 5,
        contactName: "Roberto Silva",
        position: "Jefe de Marketing"
    },
    {
        id: 5,
        company: "Universidad Nacional",
        testimonial: "Los productos promocionales para estudiantes fueron un éxito total. Muy recomendable.",
        rating: 5,
        contactName: "Patricia López",
        position: "Directora de Extensión"
    }
];

// Opciones de personalización disponibles
const mockPersonalizationOptions = {
    // Posiciones disponibles para el logo
    logoPositions: [
        { id: 1, name: "Centrado", description: "Logo en el centro del producto" },
        { id: 2, name: "Esquina superior izquierda", description: "Posición discreta y profesional" },
        { id: 3, name: "Esquina superior derecha", description: "Visible pero no invasivo" },
        { id: 4, name: "Parte inferior", description: "Ubicación sutil en la base" },
        { id: 5, name: "Lateral", description: "En el costado del producto" },
        { id: 6, name: "Espalda/Reverso", description: "En la parte posterior" }
    ],
    // Tamaños de logo con precios
    logoSizes: [
        { id: 1, name: "Pequeño", size: "2x2cm", price: 0.000 },
        { id: 2, name: "Mediano", size: "4x4cm", price: 0.000 },
        { id: 3, name: "Grande", size: "6x6cm", price: 0.000 },
        { id: 4, name: "Extra Grande", size: "8x8cm", price: 0.000 }
    ],
    // Métodos de impresión disponibles
    printingMethods: [
        { id: 1, name: "Serigrafía", description: "Ideal para grandes cantidades, colores sólidos", minOrder: 50, durability: "Alta" },
        { id: 2, name: "Sublimación", description: "Colores vibrantes y duraderos, ideal para poliéster", minOrder: 25, durability: "Muy Alta" },
        { id: 3, name: "Grabado láser", description: "Acabado premium y permanente", minOrder: 20, durability: "Permanente" },
        { id: 4, name: "Bordado", description: "Elegante y duradero para textiles", minOrder: 15, durability: "Muy Alta" },
        { id: 5, name: "Impresión digital", description: "Full color, ideal para diseños complejos", minOrder: 10, durability: "Media-Alta" },
        { id: 6, name: "Tampografía", description: "Para superficies irregulares", minOrder: 100, durability: "Alta" },
        { id: 7, name: "Transfer", description: "Aplicación rápida, múltiples colores", minOrder: 30, durability: "Media" }
    ],
    // Materiales disponibles
    materials: [
        { id: 1, name: "Algodón 100%", description: "Natural y transpirable" },
        { id: 2, name: "Algodón-Poliéster", description: "Resistente y fácil cuidado" },
        { id: 3, name: "Cerámica", description: "Elegante y duradera" },
        { id: 4, name: "Acero Inoxidable", description: "Premium y resistente" },
        { id: 5, name: "Plástico ABS", description: "Liviano y resistente" },
        { id: 6, name: "Cuero Sintético", description: "Elegante apariencia ejecutiva" },
        { id: 7, name: "Bambú", description: "Ecológico y sustentable" },
        { id: 8, name: "Metal", description: "Duradero y premium" }
    ],
    // Industrias objetivo
    industries: [
        { id: 1, name: "Tecnología", description: "Empresas IT, startups, desarrollo" },
        { id: 2, name: "Salud", description: "Clínicas, hospitales, laboratorios" },
        { id: 3, name: "Educación", description: "Colegios, universidades, institutos" },
        { id: 4, name: "Finanzas", description: "Bancos, aseguradoras, consultoras" },
        { id: 5, name: "Construcción", description: "Constructoras, arquitectura, inmobiliarias" },
        { id: 6, name: "Retail", description: "Tiendas, centros comerciales, franquicias" },
        { id: 7, name: "Alimentaria", description: "Restaurantes, food trucks, catering" },
        { id: 8, name: "Eventos", description: "Organizadores, wedding planners, ferias" }
    ]
};