import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, 
  GamepadIcon, 
  User, 
  Home, 
  LogIn, 
  LogOut, 
  ShoppingCart, 
  Tv,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export function Navigation() {
  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav className="bg-white shadow-lg fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <ShoppingBag className="h-8 w-8 text-indigo-600" />
              <span className="font-bold text-xl text-gray-900">TeeGame</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="nav-link">
              <Home className="h-5 w-5" />
              <span>Home</span>
            </Link>
            <Link to="/shop" className="nav-link">
              <ShoppingBag className="h-5 w-5" />
              <span>Shop</span>
            </Link>
            <Link to="/games" className="nav-link">
              <GamepadIcon className="h-5 w-5" />
              <span>Games</span>
            </Link>
            <Link to="/anime-news" className="nav-link">
              <Tv className="h-5 w-5" />
              <span>Anime News</span>
            </Link>
            <Link to="/cart" className="nav-link">
              <div className="relative">
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-indigo-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </div>
              <span>Cart</span>
            </Link>
            {user ? (
              <>
                <Link to="/dashboard" className="nav-link">
                  <User className="h-5 w-5" />
                  <span>Dashboard</span>
                </Link>
                <button 
                  onClick={handleLogout}
                  className="flex items-center space-x-1 text-red-600 hover:text-red-700 transition-colors duration-200"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <Link 
                to="/login" 
                className="flex items-center space-x-1 text-indigo-600 hover:text-indigo-700 transition-colors duration-200"
              >
                <LogIn className="h-5 w-5" />
                <span>Login</span>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <Link to="/cart" className="mr-4 relative">
              <ShoppingCart className="h-6 w-6 text-gray-700" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-indigo-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md text-gray-700 hover:text-indigo-600 focus:outline-none"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`
        md:hidden fixed inset-0 top-16 bg-white transform transition-transform duration-300 ease-in-out
        ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        <div className="p-4 space-y-4">
          <Link 
            to="/" 
            className="block p-4 text-lg font-medium text-gray-700 hover:bg-indigo-50 rounded-lg"
            onClick={closeMenu}
          >
            <div className="flex items-center space-x-3">
              <Home className="h-5 w-5" />
              <span>Home</span>
            </div>
          </Link>
          <Link 
            to="/shop" 
            className="block p-4 text-lg font-medium text-gray-700 hover:bg-indigo-50 rounded-lg"
            onClick={closeMenu}
          >
            <div className="flex items-center space-x-3">
              <ShoppingBag className="h-5 w-5" />
              <span>Shop</span>
            </div>
          </Link>
          <Link 
            to="/games" 
            className="block p-4 text-lg font-medium text-gray-700 hover:bg-indigo-50 rounded-lg"
            onClick={closeMenu}
          >
            <div className="flex items-center space-x-3">
              <GamepadIcon className="h-5 w-5" />
              <span>Games</span>
            </div>
          </Link>
          <Link 
            to="/anime-news" 
            className="block p-4 text-lg font-medium text-gray-700 hover:bg-indigo-50 rounded-lg"
            onClick={closeMenu}
          >
            <div className="flex items-center space-x-3">
              <Tv className="h-5 w-5" />
              <span>Anime News</span>
            </div>
          </Link>
          {user ? (
            <>
              <Link 
                to="/dashboard" 
                className="block p-4 text-lg font-medium text-gray-700 hover:bg-indigo-50 rounded-lg"
                onClick={closeMenu}
              >
                <div className="flex items-center space-x-3">
                  <User className="h-5 w-5" />
                  <span>Dashboard</span>
                </div>
              </Link>
              <button 
                onClick={handleLogout}
                className="w-full p-4 text-lg font-medium text-red-600 hover:bg-red-50 rounded-lg text-left"
              >
                <div className="flex items-center space-x-3">
                  <LogOut className="h-5 w-5" />
                  <span>Logout</span>
                </div>
              </button>
            </>
          ) : (
            <Link 
              to="/login" 
              className="block p-4 text-lg font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg"
              onClick={closeMenu}
            >
              <div className="flex items-center space-x-3">
                <LogIn className="h-5 w-5" />
                <span>Login</span>
              </div>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}