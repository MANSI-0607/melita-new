import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { products } from "@/data/products"; // ✅ import centralized product data
import { Link } from "react-router-dom"; // better than <a href> for SPA navigation
import AddToCartButton from '@/components/AddToCartButton';


const ProductShowcase = () => {
  const sliderRef = useRef<HTMLDivElement | null>(null);

  const scrollLeft = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: -280, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: 280, behavior: "smooth" });
    }
  };

  return (
    <section id="products">
      <div className="my-6 md:my-8">
        <h2 className="text-[#1e4323] text-center text-xl sm:text-2xl md:text-3xl font-headingOne font-semibold leading-snug uppercase">
          Take A Step Towards A Healthy Skin
        </h2>
      </div>

      <div className="relative px-4 sm:px-10">
        {/* Left Scroll Button */}
        <button
          onClick={scrollLeft}
          className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10 bg-white/70 backdrop-blur-lg text-fuchsia-900 shadow-xl hover:shadow-2xl rounded-full p-3 transition-all duration-300 group"
        >
          <ChevronLeft className="w-5 h-5 group-hover:scale-110 transition-transform" />
        </button>

        {/* Product Slider */}
        <div
          ref={sliderRef}
          className="overflow-x-auto flex snap-x snap-mandatory gap-4 px-2 py-4 scroll-smooth scrollbar-custom"
        >
          {products.map((product) => (
            <div key={product.id} className="flex-none w-[280px] snap-center">
              <div className="relative group w-[280px] overflow-hidden rounded-lg shadow-lg bg-[#f0e4d4] border border-gray-200">
                <Link
                  to={`/products/${product.slug}`} // ✅ use slug-based routing
                  className="block relative h-84 overflow-hidden"
                >
                  <img
                    src={product.image}
                    loading="lazy"
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  {product.hoverImage && (
                    <img
                      src={product.hoverImage}
                      loading="lazy"
                      alt={`${product.name} hover`}
                      className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-in-out"
                    />
                  )}
                  {/* Hover Add to Bag (Desktop) */}
                  <div className="hidden sm:block absolute top-[90%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 opacity-0 group-hover:opacity-100 transition-all duration-500">
                    <div className="flex gap-2">
                    <AddToCartButton
  product={{
    id: product.id,
    slug: product.slug,
    name: product.name,
    price: parseFloat(product.price.replace(/[₹,]/g, '')),
    image: product.image
  }}
  className="
    bg-[#835339] 
    text-white 
    font-headingTwo font-semibold 
    rounded-sm text-base 
    px-6 py-2 
    transition-all 
    whitespace-nowrap 
    shadow-md 
    hover:bg-[#5c3925]  /* darker brown on hover */
  "
/>


                      
                   
                    </div>
                  </div>
                </Link>

                {/* Product Info */}
                <div className="p-4 space-y-1 text-center bg-[#f0e4d4] h-[120px] flex flex-col justify-center">
                  <h3 className="text-lg font-headingTwo font-bold text-gray-900 line-clamp-2">
                    {product.name}
                  </h3>
                  <div className="pt-2 flex flex-col items-center">
                    <span className="text-lg line-through text-gray-400">
                      {product.originalPrice}
                    </span>
                    <span className="text-[#835339] text-md font-headingTwo font-bold">
                      {product.price}
                    </span>
                  </div>
                </div>

                {/* Add to Bag (Mobile) */}
                <div className="block sm:hidden px-4 mb-6 bg-[#f0e4d4] h-[60px] flex items-center justify-center gap-2">
                <AddToCartButton
  product={{
    id: product.id,
    slug: product.slug,
    name: product.name,
    price: parseFloat(product.price.replace(/[₹,]/g, '')),
    image: product.image
  }}
  className="
    flex-1 
    bg-[#835339] 
    text-white 
    font-headingTwo font-semibold 
    rounded-sm text-base 
    px-4 py-2 
    transition-all 
    shadow-md 
    hover:bg-[#5c3925]  /* darker brown on hover */
  "
/>

                  
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right Scroll Button */}
        <button
          onClick={scrollRight}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 z-10 bg-white/70 backdrop-blur-lg text-fuchsia-900 shadow-xl hover:shadow-2xl rounded-full p-3 transition-all duration-300 group"
        >
          <ChevronRight className="w-5 h-5 group-hover:scale-110 transition-transform" />
        </button>
      </div>
    </section>
  );
};

export default ProductShowcase;
