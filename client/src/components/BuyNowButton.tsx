// import React from 'react';
// import { Zap } from 'lucide-react';
// import { Button } from '@/components/ui/button';
// import { useCart } from '@/contexts/CartContext';

// interface BuyNowButtonProps {
//   product: {
//     id: number;
//     slug: string;
//     name: string;
//     price: number;
//     image: string;
//   };
//   className?: string;
//   variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
//   size?: 'default' | 'sm' | 'lg' | 'icon';
// }

// const BuyNowButton: React.FC<BuyNowButtonProps> = ({
//   product,
//   className = '',
//   variant = 'default',
//   size = 'default',
// }) => {
//   const { addToCart } = useCart();

//   const handleBuyNow = () => {
//     addToCart(product);
//     // Cart drawer will open automatically due to addToCart implementation
//   };

//   return (
//     <Button
//       onClick={handleBuyNow}
//       variant={variant}
//       size={size}
//       className={`${className} ${variant === 'default' ? 'bg-[#1e4323] hover:bg-[#2d5a3a]' : ''}`}
//     >
//       <Zap className="w-4 h-4 mr-2" />
//       Buy Now
//     </Button>
//   );
// };

// export default BuyNowButton;
