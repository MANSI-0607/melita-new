import React from 'react';
import { ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';

interface CartButtonProps {
  className?: string;
}

const CartButton: React.FC<CartButtonProps> = ({ className = '' }) => {
  const { state, toggleCart } = useCart();

  // Debug logging
  console.log('CartButton - state:', state);

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleCart}
      className={`relative ${className}`}
    >
      <ShoppingBag className="w-5 h-5" />
      {state.totalItems > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
          {state.totalItems > 99 ? '99+' : state.totalItems}
        </span>
      )}
    </Button>
  );
};

export default CartButton;
