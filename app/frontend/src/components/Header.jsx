import React, { useState } from 'react';
import { Search, ShoppingCart, Menu, X, Phone, Mail, Lightbulb, Sun, Moon, User, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const Header = ({ searchQuery, setSearchQuery }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const { itemCount, openCart } = useCart();
    const { theme, toggleTheme } = useTheme();
    const { user, logout, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const scrollToSection = (sectionId) => {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
        setIsMenuOpen(false);
    };

    return (
        <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700">
            {/* Top bar */}
            <div className="bg-sky-50 dark:bg-gray-800 border-b border-sky-100 dark:border-gray-700">
                <div className="container mx-auto px-4 py-2">
                    <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-300">
                        <div className="flex items-center space-x-6">
                            <div className="flex items-center space-x-2">
                                <Phone className="w-4 h-4 text-sky-600" />
                                <span>+56 9 9078 6018</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Mail className="w-4 h-4 text-sky-600" />
                                <span>ventas@impreideas.cl</span>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="text-sky-700 dark:text-sky-400 font-medium">
                                Venta mayorista • Mínimo 20 unidades
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main header */}
            <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-sky-600 rounded-lg flex items-center justify-center">
                            <Lightbulb className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">ImpreIdeas</h1>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Impresión & Ideas Corporativas</p>
                        </div>
                    </div>

                    {/* Search bar - Desktop */}
                    <div className="hidden md:flex flex-1 max-w-md mx-8">
                        <div className="relative w-full">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Buscar productos, categorías..."
                                className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg focus:border-sky-500 focus:ring-2 focus:ring-sky-500 focus:ring-opacity-20 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center space-x-6">
                        

                        
                        {/* Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-sky-600 dark:hover:text-sky-400 font-medium transition-colors"
                            title={theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}
                        >
                            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                            <span className="text-sm">{theme === 'dark' ? 'Claro' : 'Oscuro'}</span>
                        </button>
                        
                        {/* User Menu / Login */}
                        {isAuthenticated() ? (
                            <div className="relative">
                                <button
                                    onClick={() => setShowUserMenu(!showUserMenu)}
                                    className="flex items-center space-x-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                >
                                    <User className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                                    <span className="text-sm text-gray-700 dark:text-gray-300">{user?.company_name || user?.companyName || 'Usuario'}</span>
                                </button>
                                
                                {showUserMenu && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2">
                                        <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.contact_name || user?.contactName}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
                                        </div>
                                        <button
                                            onClick={() => {
                                                logout();
                                                setShowUserMenu(false);
                                                navigate('/');
                                            }}
                                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center space-x-2"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            <span>Cerrar Sesión</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <button
                                onClick={() => navigate('/login')}
                                className="flex items-center space-x-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-medium transition-colors"
                            >
                                <User className="w-5 h-5" />
                                <span>Ingresar</span>
                            </button>
                        )}
                        
                        {/* Cart */}
                        <button
                            onClick={openCart}
                            className="relative flex items-center justify-center w-10 h-10 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                            <ShoppingCart className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                            {itemCount > 0 && (
                                <span className="absolute -top-2 -right-2 bg-sky-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                                    {itemCount}
                                </span>
                            )}
                        </button>
                    </nav>

                    {/* Mobile menu button */}
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="md:hidden flex items-center justify-center w-10 h-10 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    >
                        {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>

                {/* Mobile Search */}
                <div className="md:hidden mt-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Buscar productos..."
                            className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg focus:border-sky-500 focus:ring-2 focus:ring-sky-500 focus:ring-opacity-20 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* Mobile Navigation */}
                {isMenuOpen && (
                    <nav className="md:hidden mt-4 pb-4 border-t dark:border-gray-700 pt-4">
                        <div className="flex flex-col space-y-4">
                            <button 
                                onClick={() => scrollToSection('catalog')}
                                className="text-left text-gray-700 dark:text-gray-300 hover:text-sky-600 dark:hover:text-sky-400 font-medium transition-colors"
                            >
                                Catálogo
                            </button>
                            <button 
                                onClick={() => scrollToSection('personalization')}
                                className="text-left text-gray-700 dark:text-gray-300 hover:text-sky-600 dark:hover:text-sky-400 font-medium transition-colors"
                            >
                                Personalización
                            </button>
                            <button 
                                onClick={() => scrollToSection('about')}
                                className="text-left text-gray-700 dark:text-gray-300 hover:text-sky-600 dark:hover:text-sky-400 font-medium transition-colors"
                            >
                                Nosotros
                            </button>
                            <button 
                                onClick={() => scrollToSection('contact')}
                                className="text-left text-gray-700 dark:text-gray-300 hover:text-sky-600 dark:hover:text-sky-400 font-medium transition-colors"
                            >
                                Contacto
                            </button>
                            
                            {/* Mobile Theme Toggle */}
                            <button
                                onClick={toggleTheme}
                                className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-sky-600 dark:hover:text-sky-400 font-medium transition-colors"
                            >
                                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                                <span>{theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}</span>
                            </button>
                            
                            <button 
                                onClick={() => {
                                    openCart();
                                    setIsMenuOpen(false);
                                }}
                                className="flex items-center space-x-2 pt-2 text-gray-700 dark:text-gray-300 hover:text-sky-600 dark:hover:text-sky-400 font-medium transition-colors"
                            >
                                <ShoppingCart className="w-5 h-5" />
                                <span>Carrito ({itemCount})</span>
                            </button>
                        </div>
                    </nav>
                )}
            </div>
        </header>
    );
};

export default Header;