import React, { useState } from 'react';
import { ArrowRight, CheckCircle, Users, Zap, Award } from 'lucide-react';

const HeroSection = () => {
    const [hoveredFeature, setHoveredFeature] = useState(null);

    const features = [
        {
            icon: Users,
            title: "Venta Mayorista",
            description: "Precios especiales para empresas"
        },
        {
            icon: Zap,
            title: "Entrega Rápida",
            description: "Producción y envío en 5-7 días"
        },
        {
            icon: Award,
            title: "Calidad Premium",
            description: "Productos de primera calidad"
        }
    ];

    const scrollToCatalog = () => {
        const catalog = document.getElementById('catalog');
        if (catalog) {
            catalog.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const handleQuoteRequest = () => {
        alert('¡Gracias por tu interés! El equipo de ImpreIdeas te contactará pronto para tu cotización personalizada.');
    };

    return (
        <section className="bg-gradient-to-br from-sky-50 via-white to-sky-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-20">
            <div className="container mx-auto px-4">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Left Content */}
                    <div className="space-y-8">
                        <div className="space-y-6">
                            <div className="inline-flex items-center px-4 py-2 bg-sky-100 dark:bg-sky-900/50 text-sky-800 dark:text-sky-300 rounded-full text-sm font-medium">
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Especialistas en Impresión Corporativa
                            </div>
                            
                            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight">
                                Transforma tus
                                <span className="text-sky-600 dark:text-sky-400 block">Ideas en Productos</span>
                            </h1>
                            
                            <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-lg">
                                Productos promocionales personalizados de alta calidad para empresas. 
                                Desde tazas hasta textiles, convertimos tus ideas corporativas en realidad.
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-4">
                            <button 
                                onClick={scrollToCatalog}
                                className="inline-flex items-center justify-center bg-sky-600 hover:bg-sky-700 text-white px-8 py-6 text-lg font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                            >
                                Ver Catálogo
                                <ArrowRight className="ml-2 w-5 h-5" />
                            </button>
                            
                            <button 
                                onClick={handleQuoteRequest}
                                className="inline-flex items-center justify-center border-2 border-sky-600 text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-900/20 px-8 py-6 text-lg font-semibold rounded-lg transition-all duration-300"
                            >
                                Solicitar Cotización
                            </button>
                        </div>

                        {/* Features */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
                            {features.map((feature, index) => (
                                <div
                                    key={index}
                                    className="flex items-start space-x-3 p-4 rounded-lg transition-all duration-300 hover:bg-white dark:hover:bg-gray-800 hover:shadow-md cursor-pointer"
                                    onMouseEnter={() => setHoveredFeature(index)}
                                    onMouseLeave={() => setHoveredFeature(null)}
                                >
                                    <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 ${
                                        hoveredFeature === index 
                                            ? 'bg-sky-600 text-white' 
                                            : 'bg-sky-100 dark:bg-sky-900/50 text-sky-600 dark:text-sky-400'
                                    }`}>
                                        <feature.icon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{feature.title}</h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-300">{feature.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Content - Visual */}
                    <div className="relative">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-6">
                                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg transform rotate-3 hover:rotate-6 transition-transform duration-300 border dark:border-gray-700">
                                    <img 
                                        src="https://images.unsplash.com/photo-1541167760496-1628856ab772?w=200&h=200&fit=crop" 
                                        alt="Taza corporativa"
                                        className="w-full h-32 object-cover rounded-lg mb-4"
                                    />
                                    <h3 className="font-semibold text-gray-800 dark:text-white">Tazas Personalizadas</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">Desde $0000 CLP c/u</p>
                                </div>
                                
                                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg transform -rotate-2 hover:-rotate-3 transition-transform duration-300 border dark:border-gray-700">
                                    <img 
                                        src="https://images.unsplash.com/photo-1586952518485-11b180e92764?w=200&h=200&fit=crop" 
                                        alt="Lapiceras ejecutivas"
                                        className="w-full h-32 object-cover rounded-lg mb-4"
                                    />
                                    <h3 className="font-semibold text-gray-800 dark:text-white">Lapiceras Premium</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">Desde $0000 CLP c/u</p>
                                </div>
                            </div>
                            
                            <div className="space-y-6 mt-8">
                                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg transform rotate-2 hover:rotate-1 transition-transform duration-300 border dark:border-gray-700">
                                    <img 
                                        src="https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=200&h=200&fit=crop" 
                                        alt="Textil corporativo"
                                        className="w-full h-32 object-cover rounded-lg mb-4"
                                    />
                                    <h3 className="font-semibold text-gray-800 dark:text-white">Textil Corporativo</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">Desde $0000 CLP c/u</p>
                                </div>
                                
                                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg transform -rotate-1 hover:rotate-0 transition-transform duration-300 border dark:border-gray-700">
                                    <img 
                                        src="https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=200&h=200&fit=crop" 
                                        alt="Accesorios promocionales"
                                        className="w-full h-32 object-cover rounded-lg mb-4"
                                    />
                                    <h3 className="font-semibold text-gray-800 dark:text-white">Accesorios</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">Desde $0000 CLP c/u</p>
                                </div>
                            </div>
                        </div>

                        {/* Decorative elements */}
                        <div className="absolute -top-4 -right-4 w-24 h-24 bg-sky-200 dark:bg-sky-800 rounded-full opacity-20 animate-pulse"></div>
                        <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-sky-300 dark:bg-sky-700 rounded-full opacity-10 animate-pulse delay-700"></div>
                    </div>
                </div>

                {/* Stats section */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20 pt-12 border-t border-gray-200 dark:border-gray-700">
                    <div className="text-center">
                        <div className="text-3xl font-bold text-sky-600 dark:text-sky-400">50+</div>
                        <div className="text-gray-600 dark:text-gray-300 font-medium">Empresas Confiaron</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl font-bold text-sky-600 dark:text-sky-400">50k+</div>
                        <div className="text-gray-600 dark:text-gray-300 font-medium">Productos Entregados</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl font-bold text-sky-600 dark:text-sky-400">24h</div>
                        <div className="text-gray-600 dark:text-gray-300 font-medium">Tiempo de Respuesta</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl font-bold text-sky-600 dark:text-sky-400">4-6</div>
                        <div className="text-gray-600 dark:text-gray-300 font-medium">Días de Producción</div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;