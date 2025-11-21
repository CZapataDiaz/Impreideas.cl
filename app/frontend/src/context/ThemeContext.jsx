import React, { createContext, useContext, useState, useEffect } from 'react';

// Contexto del tema
const ThemeContext = createContext();

// Hook personalizado para usar el contexto del tema
export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme debe usarse dentro de un ThemeProvider');
    }
    return context;
};

// Proveedor del contexto del tema
export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState('light');

    // Cargar tema guardado al inicializar
    useEffect(() => {
        const savedTheme = localStorage.getItem('impreideas-theme') || 'light';
        setTheme(savedTheme);
        applyThemeToDocument(savedTheme);
    }, []);

    // Aplicar tema al documento
    const applyThemeToDocument = (newTheme) => {
        document.documentElement.setAttribute('data-theme', newTheme);
        document.body.setAttribute('data-theme', newTheme);
        
        // Aplicar clases de Tailwind para modo oscuro
        if (newTheme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };

    // Alternar tema
    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        localStorage.setItem('impreideas-theme', newTheme);
        applyThemeToDocument(newTheme);
    };

    // Establecer tema específico
    const setSpecificTheme = (newTheme) => {
        setTheme(newTheme);
        localStorage.setItem('impreideas-theme', newTheme);
        applyThemeToDocument(newTheme);
    };

    const value = {
        theme,
        toggleTheme,
        setTheme: setSpecificTheme,
        isDark: theme === 'dark'
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};