import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';

interface AddToCartButtonProps {
  product: {
    id: number;
    slug: string;
    name: string;
    price: number;
    image: string;
  };
  className?: string;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const AddToCartButton: React.FC<AddToCartButtonProps> = ({
  product,
  className = '',
  variant = 'default',
  size = 'default',
}) => {
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    addToCart(product);
  };

  return (
    <Button
      onClick={handleAddToCart}
      variant={variant}
      size={size}
      className={`${className} ${variant === 'default' ? 'bg-[#835339] hover:bg-[#6e442a]' : ''}`}
    >
      <ShoppingCart className="w-4 h-4 mr-2" />
      Add to Cart
    </Button>
  );
};

export default AddToCartButton;
