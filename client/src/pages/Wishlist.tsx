import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Heart, ShoppingBag } from 'lucide-react';
import { useState } from 'react';

const Wishlist = () => {
  const [wishlistItems, setWishlistItems] = useState([
    {
      id: 1,
      name: "Melita Ultra Hydrating Essence",
      price: 1199,
      originalPrice: 1499,
      image: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=300&h=300&fit=crop",
      inStock: true
    },
    {
      id: 2,
      name: "Melita Ultra Protecting Sunscreen",
      price: 1299,
      originalPrice: 1450,
      image: "https://images.unsplash.com/photo-1556228578-dd1d6e0e45e3?w=300&h=300&fit=crop",
      inStock: true
    },
    {
      id: 3,
      name: "Melita Barrier Boost Combo",
      price: 2299,
      originalPrice: 2799,
      image: "https://images.unsplash.com/photo-1556228578-f9f3ffe8e1d0?w=300&h=300&fit=crop",
      inStock: false
    }
  ]);

  const removeFromWishlist = (id: number) => {
    setWishlistItems(items => items.filter(item => item.id !== id));
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-16">
        <div className="container mx-auto px-4">
          <h1 className="font-playfair text-3xl lg:text-4xl font-bold text-melita-deep-coffee mb-8 text-center">
            My Wishlist
          </h1>

          {wishlistItems.length === 0 ? (
            <div className="text-center py-16">
              <Heart className="h-16 w-16 text-melita-medium mx-auto mb-4" />
              <p className="font-roboto text-melita-medium text-lg mb-8">Your wishlist is empty</p>
              <Button variant="melita" size="lg">
                Continue Shopping
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {wishlistItems.map((item) => (
                <div key={item.id} className="group relative">
                  <div className="bg-white rounded-lg shadow-soft overflow-hidden hover:shadow-luxury transition-all duration-300 group-hover:scale-105">
                    {/* Wishlist Heart Button */}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFromWishlist(item.id)}
                      className="absolute top-4 right-4 z-10 bg-white/90 hover:bg-white text-red-500 hover:text-red-700"
                    >
                      <Heart className="h-5 w-5 fill-current" />
                    </Button>

                    {/* Product Image */}
                    <div className="aspect-square overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                    
                    {/* Product Info */}
                    <div className="p-4 space-y-3">
                      <h3 className="font-roboto font-medium text-sm text-melita-deep-coffee leading-tight">
                        {item.name}
                      </h3>
                      
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-roboto text-xs text-melita-medium line-through">
                            ₹{item.originalPrice}
                          </span>
                          <span className="font-roboto font-semibold text-melita-deep-coffee">
                            ₹{item.price}
                          </span>
                        </div>
                      </div>

                      {/* Stock Status */}
                      <p className={`font-roboto text-xs ${item.inStock ? 'text-green-600' : 'text-red-600'}`}>
                        {item.inStock ? 'In Stock' : 'Out of Stock'}
                      </p>
                      
                      {/* Add to Cart Button */}
                      <Button 
                        variant={item.inStock ? "melita" : "secondary"}
                        disabled={!item.inStock}
                        className="w-full font-roboto text-xs py-2 rounded-md transition-colors"
                      >
                        <ShoppingBag className="h-4 w-4 mr-2" />
                        {item.inStock ? 'ADD TO BAG' : 'OUT OF STOCK'}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {wishlistItems.length > 0 && (
            <div className="text-center mt-12">
              <Button variant="melita-outline" size="lg">
                Continue Shopping
              </Button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Wishlist;