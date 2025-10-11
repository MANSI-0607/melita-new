import Header from '@/components/Header';
import Footer from '@/components/Footer';
import TopStrip from '@/components/TopStrip';
import { ShoppingBag, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { getProductsLive, Product } from '@/data/products';
import AddToCartButton from '@/components/AddToCartButton';
import { useEffect, useState } from 'react';


const Shop = () => {
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    getProductsLive()
      .then(p => { if (mounted) setItems(p); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <TopStrip />
      <Header />

      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="font-headingOne text-4xl lg:text-5xl font-bold text-melita-deep-coffee mb-4">
            Shop Melita
          </h1>
          <p className="font-headingTwo text-lg text-melita-medium">
            Discover our complete range of luxury skincare products
          </p>
        </div>

        {/* Product Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
          {(loading ? [] : items).map((product) => (
            <div
              key={product.id}
              className="flex flex-col bg-white rounded-lg shadow-sm overflow-hidden group transition-shadow duration-300 hover:shadow-lg"
            >
              {/* Image with hover effect */}
              <Link to={`/products/${product.slug}`} className="relative w-full aspect-square overflow-hidden block">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <img
                  src={product.hoverImage}
                  alt={`${product.name} hover`}
                  className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-in-out"
                />
                {/* Product Tags - Top Left */}
                {product.tags && product.tags.length > 0 && (
                  <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
                    {product.tags.slice(0, 2).map((tag, index) => (
                      <span
                        key={index}
                        className="bg-gradient-to-r from-[#835339] to-[#5c3925] text-white text-xs font-semibold px-2 py-1 rounded-sm shadow-lg backdrop-blur-sm border border-white/20"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </Link>

              {/* Content */}
              <div className="p-4 flex flex-col flex-grow">
                <Link to={`/products/${product.slug}`} className="text-md font-headingTwo font-bold text-gray-800 mt-1 truncate">
                  {product.name}
                </Link>

                <div className="flex items-baseline gap-2 pt-2">
                  <span className="text-headingTwo line-through text-sm">{product.originalPrice}</span>
                  <span className="text-melita-deep-coffee font-bold text-lg">{product.price}</span>
                </div>

                {/* Rating */}
                <div className="flex items-center mt-2 text-sm">
                  <div className="flex text-yellow-400 mr-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={16} fill="currentColor" stroke="currentColor" />
                    ))}
                  </div>
                  <span className="text-headingTwo text-xs mr-1">{product.rating}/5</span>
                  <Link to={`/products/${product.slug}#reviews`} className="text-headingTwo text-xs hover:underline">
                    ({product.reviews} reviews)
                  </Link>
                </div>
                <div className="mt-4 space-y-2">
                  <AddToCartButton
                    product={{
                      id: product.id,
                      slug: product.slug,
                      name: product.name,
                      price: parseFloat(product.price.replace(/[₹,]/g, '')),
                      image: product.image
                    }}
                    className="w-full bg-melita-golden-taupe hover:bg-melita-deep-coffee text-white flex items-center justify-center gap-2"
                  />
                 
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
};
export default Shop;
