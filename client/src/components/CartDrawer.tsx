import React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const { state, updateQuantity, removeFromCart, clearCart } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();
  const handleQuantityChange = (id: number, newQuantity: number) => {
    if (newQuantity < 1) {
      removeFromCart(id);
      toast({
        title: "Item removed",
        description: "Item has been removed from your cart",
      });
    } else {
      updateQuantity(id, newQuantity);
    }
  };

  const handleRemoveItem = (id: number, name: string) => {
    removeFromCart(id);
    toast({
      title: "Item removed",
      description: `${name} has been removed from your cart`,
    });
  };

  const handleClearCart = () => {
    clearCart();
    toast({
      title: "Cart cleared",
      description: "All items have been removed from your cart",
    });
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(price);

  // ---- Pricing logic ----
  const subtotal = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = state.items.length > 0 ? 0 : 0;
  const discount = subtotal > 2000 ? 0 : 0;
  const total = subtotal + shipping - discount;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-[9998] pointer-events-none"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed right-0 top-0 h-screen w-full md:w-1/3 bg-white shadow-xl z-[9999] flex flex-col border-l border-gray-200"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
              <div className="flex items-center gap-2 text-gray-800 font-semibold">
                <ShoppingBag className="w-5 h-5" />
                <h2 className="text-lg">Your Cart</h2>
                {state.totalItems > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                    {state.totalItems}
                  </span>
                )}
              </div>
              <Button variant="ghost" size="sm" onClick={onClose} className="p-2">
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-4">
              {state.items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <ShoppingBag className="w-16 h-16 text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
                  <p className="text-gray-500 mb-4">Add some products to get started!</p>
                  <Button onClick={onClose} className="bg-[#1e4323] hover:bg-[#2d5a3a]">
                    Continue Shopping
                  </Button>
                </div>
              ) : (
                state.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    {/* Product Image */}
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover rounded-lg"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder.svg';
                        }}
                      />
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium semibold text-medium text-gray-900 truncate">
                        {item.name}
                      </h3>
                      <p className="text-medium text-gray-500">{formatPrice(item.price)}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          className="w-8 h-8 p-0 border-[#6b3d2a] text-[#6b3d2a] hover:bg-[#f0e4d4]"
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="text-medium font-medium w-8 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          className="w-8 h-8 p-0 border-[#6b3d2a] text-[#6b3d2a] hover:bg-[#f0e4d4]"
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>

                    {/* Remove Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveItem(item.id, item.name)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {state.items.length > 0 && (
              <div className="border-t border-gray-200 p-6 space-y-4 sticky bottom-0 bg-white z-10">
                {/* Subtotal */}
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                {/* Shipping */}
                {/* <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>{formatPrice(shipping)}</span>
                </div> */}
                {/* Discount */}
                {/* {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )} */}
                {/* Total */}
                <div className="flex justify-between font-bold text-lg pt-2 mt-2 border-t border-gray-200 text-gray-800">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  {/* <Button
                    onClick={handleClearCart}
                    variant="outline"
                    className="w-full text-red-600 border-red-200 hover:bg-red-50"
                  >
                    Clear Cart
                  </Button> */}
                  <Button
                    onClick={() =>
                     navigate('/checkout')
                    }
                    className="w-full bg-[#6b3d2a] hover:bg-[#835339] transition-colors"
                  >
                    Proceed to Checkout
                  </Button>
                  <button
                    className="w-full mt-2 text-center text-[#6b3d2a] font-semibold hover:underline"
                    onClick={onClose}
                  >
                    Continue Shopping
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default CartDrawer;
