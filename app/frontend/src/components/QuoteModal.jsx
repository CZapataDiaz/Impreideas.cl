import React, { useState } from 'react';
import { X, Building, Mail, Phone, FileText, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';

const QuoteModal = ({ onClose }) => {
    const { items, total, clearCart, closeCart } = useCart();
    
    // Estado del formulario
    const [formData, setFormData] = useState({
        companyName: '',
        contactName: '',
        email: '',
        phone: '',
        rut: '',
        address: '',
        city: '',
        additionalComments: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // URL de la API
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8001';

    // Manejar cambios en el formulario
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Enviar cotización - VERSIÓN CORREGIDA
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrorMessage('');
        setSuccessMessage('');
        
        try {
            console.log('📤 Enviando Solicitud a la Base de Datos');
            console.log('🔍 Datos del formulario:', formData);
            console.log('🔍 Email del formulario:', formData.email);
            console.log('🔍 Tipo de email:', typeof formData.email);
            console.log('🔍 Email vacío?:', !formData.email);
            
            // Formatear los datos según lo que espera el backend
            // Usar campos individuales en lugar de contactInfo
            const quoteData = {
                // Campos individuales (compatibles con tu controller actual)
                companyName: formData.companyName,
                contactName: formData.contactName,
                email: formData.email,
                phone: formData.phone,
                rut: formData.rut,
                address: formData.address,
                city: formData.city,
                additionalComments: formData.additionalComments,
                
                // Items de la cotización
                items: items.map(item => ({
                    productId: item.product.id,
                    quantity: item.quantity,
                    personalization: item.personalization || {}
                }))
            };

            console.log('📤 Datos FINALES que se envían:', JSON.stringify(quoteData, null, 2));
            console.log('📤 Email en quoteData:', quoteData.email);

            const response = await fetch(`${API_URL}/api/quotes`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(quoteData),
            });

            console.log('📥 Status de respuesta:', response.status);

            if (!response.ok) {
                const errorData = await response.json();
                console.log('❌ Error completo del servidor:', errorData);
                
                let errorMessage = 'Error al enviar la cotización';
                
                if (errorData.details && errorData.details.length > 0) {
                    // Mostrar el primer error de validación
                    errorMessage = errorData.details[0].message;
                } else if (errorData.message) {
                    errorMessage = errorData.message;
                }
                
                console.log('❌ Error parseado:', { error: errorData.error, message: errorData.message, details: errorData.details });
                throw new Error(`Error ${response.status}: ${errorMessage}`);
            }

            const result = await response.json();
            console.log('✅ Respuesta del servidor:', result);

            // Éxito - mostrar mensaje y limpiar
            setSuccessMessage('¡Cotización enviada exitosamente! Nos contactaremos contigo pronto.');
            setIsSubmitted(true);
            setIsSubmitting(false);
            
        } catch (error) {
            console.log('❌ Error al enviar cotización:', error);
            setIsSubmitting(false);
            setErrorMessage(error.message || 'Error al enviar la cotización. Por favor, intenta nuevamente.');
        }
    };

    // Cerrar y limpiar carrito después del envío exitoso
    const handleCloseAfterSubmit = () => {
        clearCart();
        closeCart();
        onClose();
    };

    // Cerrar modal al hacer clic fuera
    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget && !isSubmitting) {
            onClose();
        }
    };

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4"
            onClick={handleBackdropClick}
        >
            <div className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[95vh] overflow-y-auto">
                {/* Mensajes de error y éxito */}
                {errorMessage && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 m-4 rounded-lg">
                        <p className="text-red-800 dark:text-red-300">{errorMessage}</p>
                    </div>
                )}
                
                {successMessage && (
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4 m-4 rounded-lg">
                        <p className="text-green-800 dark:text-green-300">{successMessage}</p>
                    </div>
                )}

                {!isSubmitted ? (
                    <>
                        {/* Header */}
                        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b dark:border-gray-700 p-6 flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center space-x-2">
                                <FileText className="w-6 h-6" />
                                <span>Solicitar Cotización Oficial</span>
                            </h2>
                            <button
                                onClick={onClose}
                                disabled={isSubmitting}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
                            >
                                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6">
                            <div className="grid lg:grid-cols-2 gap-8">
                                {/* Formulario */}
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                            Información de la Empresa
                                        </h3>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Nombre de la Empresa *
                                                </label>
                                                <div className="relative">
                                                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                                    <input
                                                        type="text"
                                                        name="companyName"
                                                        value={formData.companyName}
                                                        onChange={handleChange}
                                                        required
                                                        className="pl-10 pr-4 py-3 w-full border border-gray-300 dark:border-gray-600 rounded-lg focus:border-sky-500 focus:ring-2 focus:ring-sky-500 focus:ring-opacity-20 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                                        placeholder="Ej: Tech Solutions S.A."
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    RUT de la Empresa
                                                </label>
                                                <input
                                                    type="text"
                                                    name="rut"
                                                    value={formData.rut}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:border-sky-500 focus:ring-2 focus:ring-sky-500 focus:ring-opacity-20 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                                    placeholder="Ej: 76.123.456-7"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Dirección
                                                </label>
                                                <input
                                                    type="text"
                                                    name="address"
                                                    value={formData.address}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:border-sky-500 focus:ring-2 focus:ring-sky-500 focus:ring-opacity-20 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                                    placeholder="Ej: Av. Providencia 123, Oficina 45"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Ciudad
                                                </label>
                                                <input
                                                    type="text"
                                                    name="city"
                                                    value={formData.city}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:border-sky-500 focus:ring-2 focus:ring-sky-500 focus:ring-opacity-20 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                                    placeholder="Ej: Santiago, Chile"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                            Información de Contacto
                                        </h3>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Nombre del Contacto *
                                                </label>
                                                <input
                                                    type="text"
                                                    name="contactName"
                                                    value={formData.contactName}
                                                    onChange={handleChange}
                                                    required
                                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:border-sky-500 focus:ring-2 focus:ring-sky-500 focus:ring-opacity-20 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                                    placeholder="Ej: María González"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Email *
                                                </label>
                                                <div className="relative">
                                                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                                    <input
                                                        type="email"
                                                        name="email"
                                                        value={formData.email}
                                                        onChange={handleChange}
                                                        required
                                                        className="pl-10 pr-4 py-3 w-full border border-gray-300 dark:border-gray-600 rounded-lg focus:border-sky-500 focus:ring-2 focus:ring-sky-500 focus:ring-opacity-20 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                                        placeholder="maria@empresa.com"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Teléfono *
                                                </label>
                                                <div className="relative">
                                                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                                    <input
                                                        type="tel"
                                                        name="phone"
                                                        value={formData.phone}
                                                        onChange={handleChange}
                                                        required
                                                        className="pl-10 pr-4 py-3 w-full border border-gray-300 dark:border-gray-600 rounded-lg focus:border-sky-500 focus:ring-2 focus:ring-sky-500 focus:ring-opacity-20 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                                        placeholder="+56 9 1234 5678"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Comentarios Adicionales
                                        </label>
                                        <textarea
                                            name="additionalComments"
                                            value={formData.additionalComments}
                                            onChange={handleChange}
                                            rows="4"
                                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:border-sky-500 focus:ring-2 focus:ring-sky-500 focus:ring-opacity-20 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                            placeholder="Información adicional sobre tu pedido, fechas específicas, requerimientos especiales, etc."
                                        />
                                    </div>
                                </div>

                                {/* Resumen del pedido */}
                                <div className="lg:pl-8">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                        Resumen del Pedido
                                    </h3>
                                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-3">
                                        {items.map(item => (
                                            <div key={item.id} className="flex items-center space-x-3 pb-3 border-b dark:border-gray-600 last:border-b-0 last:pb-0">
                                                <img 
                                                    src={item.product.image} 
                                                    alt={item.product.name}
                                                    className="w-12 h-12 object-cover rounded"
                                                />
                                                <div className="flex-1">
                                                    <div className="font-medium text-gray-900 dark:text-white text-sm">
                                                        {item.product.name}
                                                    </div>
                                                    <div className="text-xs text-gray-600 dark:text-gray-300">
                                                        {item.quantity} unidades × ${item.unitPrice.toLocaleString('es-CL')} CLP
                                                    </div>
                                                    {Object.keys(item.personalization).length > 0 && (
                                                        <div className="text-xs text-sky-600 dark:text-sky-400">
                                                            Personalizado
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="text-sm font-semibold text-gray-900 dark:text-white">
                                                    ${item.totalPrice.toLocaleString('es-CL')} CLP
                                                </div>
                                            </div>
                                        ))}

                                        <div className="border-t dark:border-gray-600 pt-3 mt-3">
                                            <div className="flex justify-between items-center">
                                                <span className="font-semibold text-gray-900 dark:text-white">Total Estimado:</span>
                                                <span className="text-xl font-bold text-sky-600 dark:text-sky-400">
                                                    ${total.toLocaleString('es-CL')} CLP
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-600 dark:text-gray-300 mt-2">
                                                * Precio estimado. El precio final será confirmado en la cotización oficial.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Información adicional */}
                                    <div className="mt-6 p-4 bg-sky-50 dark:bg-sky-900/20 rounded-lg">
                                        <h4 className="font-semibold text-sky-800 dark:text-sky-300 mb-2">
                                            ¿Qué sigue después?
                                        </h4>
                                        <ul className="text-sm text-sky-700 dark:text-sky-300 space-y-1">
                                            <li>• Recibirás una cotización oficial en 24-48 horas</li>
                                            <li>• Nuestro equipo te contactará para confirmar detalles</li>
                                            <li>• Tiempo de producción: 5-7 días hábiles</li>
                                            <li>• Envío gratuito en pedidos sobre $50.000 CLP</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* Botones */}
                            <div className="border-t dark:border-gray-700 pt-6 mt-8 flex flex-col sm:flex-row gap-4">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    disabled={isSubmitting}
                                    className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 bg-sky-600 hover:bg-sky-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                            <span>Enviando...</span>
                                        </>
                                    ) : (
                                        <span>Enviar Solicitud de Cotización</span>
                                    )}
                                </button>
                            </div>
                        </form>
                    </>
                ) : (
                    // Pantalla de éxito
                    <div className="p-8 text-center">
                        <div className="mb-6">
                            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                ¡Cotización Enviada!
                            </h2>
                            <p className="text-gray-600 dark:text-gray-300 mb-6">
                                Tu solicitud de cotización ha sido enviada exitosamente. 
                                Nos contactaremos contigo en las próximas 24-48 horas.
                            </p>
                        </div>

                        <button
                            onClick={handleCloseAfterSubmit}
                            className="bg-sky-600 hover:bg-sky-700 text-white py-3 px-8 rounded-lg font-semibold transition-colors"
                        >
                            Continuar Navegando
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default QuoteModal;