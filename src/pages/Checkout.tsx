import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { CreditCard, Wallet, Truck, Phone, Mail, User, MapPin } from 'lucide-react';
import { ShippingAddress } from '../types';

export function Checkout() {
  const { items, totalPrice, clearCart } = useCart();
  const { user, updateUserPoints, addPurchase } = useAuth();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'points'>('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    fullName: '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: ''
  });

  if (!user) {
    navigate('/login');
    return null;
  }

  const availablePoints = user.points;
  const pointsNeeded = Math.ceil(totalPrice); // Round up points needed
  const canPayWithPoints = availablePoints >= pointsNeeded;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setShippingAddress(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    return Object.values(shippingAddress).every(value => value.trim() !== '');
  };

  const handleCheckout = async () => {
    if (!validateForm()) {
      alert('Please fill in all shipping details');
      return;
    }

    setIsProcessing(true);
    
    try {
      if (paymentMethod === 'points') {
        // Deduct points - use rounded value
        await updateUserPoints(-pointsNeeded);
      }

      // Create purchase record
      const purchase = {
        id: Math.random().toString(36).substr(2, 9),
        productId: items[0].id,
        date: new Date().toISOString(),
        status: 'processing',
        quantity: items.reduce((sum, item) => sum + item.quantity, 0),
        total: totalPrice,
        paymentMethod,
        shippingAddress
      };

      await addPurchase(purchase);
      clearCart();
      navigate('/dashboard');
    } catch (error) {
      console.error('Checkout error:', error);
      alert('There was an error processing your payment. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Shipping Information */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Shipping Information</h2>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="fullName"
                    value={shippingAddress.fullName}
                    onChange={handleInputChange}
                    placeholder="Full Name"
                    className="pl-10 w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={shippingAddress.email}
                    onChange={handleInputChange}
                    placeholder="Email Address"
                    className="pl-10 w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    value={shippingAddress.phone}
                    onChange={handleInputChange}
                    placeholder="Phone Number"
                    className="pl-10 w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="address"
                    value={shippingAddress.address}
                    onChange={handleInputChange}
                    placeholder="Street Address"
                    className="pl-10 w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="city"
                    value={shippingAddress.city}
                    onChange={handleInputChange}
                    placeholder="City"
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                  />
                  <input
                    type="text"
                    name="state"
                    value={shippingAddress.state}
                    onChange={handleInputChange}
                    placeholder="State"
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="zipCode"
                    value={shippingAddress.zipCode}
                    onChange={handleInputChange}
                    placeholder="ZIP Code"
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                  />
                  <input
                    type="text"
                    name="country"
                    value={shippingAddress.country}
                    onChange={handleInputChange}
                    placeholder="Country"
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Order Summary and Payment */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Order Summary</h2>
          <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
            {items.map((item) => (
              <div key={`${item.id}-${item.size}`} className="flex items-center space-x-4">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-16 h-16 object-cover rounded-md"
                />
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-gray-900">{item.name}</h3>
                  <p className="text-sm text-gray-500">Size: {item.size}</p>
                  <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                </div>
                <p className="text-sm font-medium text-gray-900">
                  ${(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
            ))}

            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between text-base font-medium text-gray-900">
                <span>Total</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
              {paymentMethod === 'points' && (
                <p className="text-sm text-gray-600 mt-1">
                  Points needed: {pointsNeeded} points
                </p>
              )}
            </div>

            {/* Points Balance */}
            <div className="p-4 bg-indigo-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-indigo-900">Available Points</span>
                <span className="text-lg font-bold text-indigo-900">{availablePoints}</span>
              </div>
              <p className="text-sm text-indigo-700 mt-1">
                {canPayWithPoints 
                  ? `You can use your points to pay for this order (${pointsNeeded} points needed)`
                  : `You need ${Math.ceil(pointsNeeded - availablePoints)} more points to pay with points`}
              </p>
            </div>

            {/* Payment Options */}
            <div className="space-y-4">
              <label className="block">
                <div
                  className={`flex items-center p-4 border rounded-lg cursor-pointer ${
                    paymentMethod === 'card'
                      ? 'border-indigo-600 bg-indigo-50'
                      : 'border-gray-200 hover:border-indigo-200'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="card"
                    checked={paymentMethod === 'card'}
                    onChange={() => setPaymentMethod('card')}
                    className="sr-only"
                  />
                  <CreditCard className="h-6 w-6 text-indigo-600 mr-3" />
                  <div>
                    <span className="font-medium text-gray-900">Credit Card</span>
                    <p className="text-sm text-gray-500">Pay with your credit or debit card</p>
                  </div>
                </div>
              </label>

              <label className="block">
                <div
                  className={`flex items-center p-4 border rounded-lg ${
                    !canPayWithPoints && 'opacity-50 cursor-not-allowed'
                  } ${
                    paymentMethod === 'points'
                      ? 'border-indigo-600 bg-indigo-50'
                      : 'border-gray-200 hover:border-indigo-200'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="points"
                    checked={paymentMethod === 'points'}
                    onChange={() => setPaymentMethod('points')}
                    disabled={!canPayWithPoints}
                    className="sr-only"
                  />
                  <Wallet className="h-6 w-6 text-indigo-600 mr-3" />
                  <div>
                    <span className="font-medium text-gray-900">Pay with Points</span>
                    <p className="text-sm text-gray-500">Use your earned points (1 point = $1)</p>
                  </div>
                </div>
              </label>
            </div>

            <button
              onClick={handleCheckout}
              disabled={isProcessing}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? 'Processing...' : 'Complete Purchase'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}