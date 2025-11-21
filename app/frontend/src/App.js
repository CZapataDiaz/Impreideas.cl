import React, { useState } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import HeroSection from "./components/HeroSection";
import ProductCatalog from "./components/ProductCatalog";
import CartModal from "./components/CartModal";
import Login from "./components/Login";
import Register from "./components/Register";
import { CartProvider } from "./context/CartContext";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import { Toaster } from "./components/ui/toaster";

const Home = () => {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      <Header 
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery}
      />
      <HeroSection />
      <ProductCatalog searchQuery={searchQuery} />
      <CartModal />
      <Toaster />
    </div>
  );
};

function App() {
  return (
    <div className="App">
      <ThemeProvider>
        <AuthProvider>
          <CartProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
              </Routes>
            </BrowserRouter>
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </div>
  );
}

export default App;