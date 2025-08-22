import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ShoppingBag, Minus, Plus, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const product = {
  id: '1',
  name: 'Premium Black T-Shirt',
  price: 29.99,
  pointsRequired: 500,
  imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=800',
  shortDescription: 'Classic fit cotton t-shirt with superior comfort and style.',
  longDescription: `Elevate your wardrobe with our signature Premium Black T-Shirt. Crafted from 100% organic cotton, this versatile piece offers both style and comfort for any occasion.

Features:
• 100% organic combed cotton (180 GSM)
• Reinforced shoulder seams
• Double-stitched hem
• Pre-shrunk fabric
• Classic fit
• Ribbed crew neck

Care Instructions:
Machine wash cold with similar colors. Tumble dry low. Do not bleach.`,
  sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL'],
  sizeGuide: {
    'XS': 'Chest: 34-36"',
    'S': 'Chest: 36-38"',
    'M': 'Chest: 38-40"',
    'L': 'Chest: 40-42"',
    'XL': 'Chest: 42-44"',
    '2XL': 'Chest: 44-46"'
  }
};

export function Shop() {
  const { user, updateDailyTask } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [showSizeGuide, setShowSizeGuide] = useState(false);

  const handleQuantityChange = (action: 'increase' | 'decrease') => {
    if (action === 'increase') {
      setQuantity(prev => prev + 1);
    } else if (action === 'decrease' && quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const handleAddToCart = async () => {
    if (!selectedSize) {
      alert('Please select a size');
      return;
    }
    
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
      size: selectedSize,
      quantity
    });

    // Update daily task only when user is logged in
    if (user) {
      await updateDailyTask('purchase');
    }

    // Reset selection
    setSelectedSize('');
    setQuantity(1);
  };

  const handleBuyNow = async () => {
    if (!selectedSize) {
      alert('Please select a size');
      return;
    }
    
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
      size: selectedSize,
      quantity
    });

    // Update daily task only when user is logged in
    if (user) {
      await updateDailyTask('purchase');
    }

    navigate('/cart');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Image */}
        <div className="relative">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full rounded-lg shadow-lg object-cover aspect-square"
          />
          <button className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-md hover:bg-gray-50">
            <Heart className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Product Details */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
            <p className="mt-2 text-gray-600">{product.shortDescription}</p>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-3xl font-bold text-gray-900">${product.price}</div>
            {user && (
              <div className="text-sm text-gray-600">
                Or {product.pointsRequired} points
                <span className="ml-2 inline-block px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full">
                  Your Points: {user.points}
                </span>
              </div>
            )}
          </div>

          {/* Size Selection */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold text-gray-900">Select Size</h3>
              <button
                onClick={() => setShowSizeGuide(!showSizeGuide)}
                className="text-sm text-indigo-600 hover:text-indigo-500"
              >
                Size Guide
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`py-2 text-center rounded-md border ${
                    selectedSize === size
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-600'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
            {showSizeGuide && (
              <div className="mt-2 p-4 bg-gray-50 rounded-md">
                <h4 className="font-semibold mb-2">Size Guide</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {Object.entries(product.sizeGuide).map(([size, measurement]) => (
                    <div key={size} className="flex justify-between">
                      <span className="font-medium">{size}:</span>
                      <span>{measurement}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quantity Selection */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Quantity</h3>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => handleQuantityChange('decrease')}
                className="p-2 rounded-md border border-gray-300 hover:bg-gray-50"
                disabled={quantity <= 1}
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="text-xl font-medium w-12 text-center">{quantity}</span>
              <button
                onClick={() => handleQuantityChange('increase')}
                className="p-2 rounded-md border border-gray-300 hover:bg-gray-50"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleAddToCart}
              className="w-full btn-primary"
            >
              <ShoppingBag className="w-5 h-5 mr-2" />
              Add to Cart
            </button>
            <button
              onClick={handleBuyNow}
              className="w-full btn-secondary"
            >
              Buy Now
            </button>
          </div>

          {/* Product Description */}
          <div className="pt-6 border-t border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">Product Details</h3>
            <div className="prose prose-sm text-gray-600 whitespace-pre-line">
              {product.longDescription}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}