import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import TopStrip from '@/components/TopStrip';
import { Button } from '@/components/ui/button';
import { products, getProductBySlug } from '@/data/products';
import { Star, X } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import AddToCartButton from '@/components/AddToCartButton';

import derm from '@/assets/featues/der.png';
import vegan from '@/assets/featues/Vegan.png';
import indian from '@/assets/featues/Indian Skin.png';
import active from '@/assets/featues/Active.png';


const ProductPage = ({ slug }) => {
  const navigate = useNavigate();
  const product = useMemo(() => getProductBySlug(slug), [slug]);
  const [activeImage, setActiveImage] = useState(product?.gallery?.[0] ?? product?.image ?? null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [currentVideoSrc, setCurrentVideoSrc] = useState('');

  const marqueeItems = [
    {
      icon: derm,
      text: (
        <>
          Dermatologically
          <br /> Tested
        </>
      ),
    },
    {
      icon: vegan,
      text: (
        <>
          Vegan &
          <br /> Cruelty Free
        </>
      ),
    },
    {
      icon: indian,
      text: (
        <>
          Indian Skin
          <br /> Focused
        </>
      ),
    },
    {
      icon: active,
      text: (
        <>
          Actives at
          <br /> Optimal Percentage
        </>
      ),
    },
  ];

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <TopStrip />
        <Header />
        <main className="container mx-auto px-4 py-16">
          <p className="text-center">Product not found.</p>
          <div className="text-center mt-6">
            <Button onClick={() => navigate('/shop')}>Back to Shop</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const related = products.filter(p => product.relatedproduct?.includes(p.slug));

  const handleVideoClick = (videoSrc) => {
    setCurrentVideoSrc(videoSrc);
    setIsVideoModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <TopStrip />
      <Header />

      <main className="container mx-auto px-4 py-8 md:py-12">
        <div className="mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Gallery */}
          <div className="h-auto lg:sticky lg:top-0 lg:self-start lg:h-fit">
            <div className="p-2 md:p-4 rounded-xl mb-4 relative overflow-hidden">
              <div
                id="carousel"
                className="flex gap-x-2 w-full h-fit md:h-[400px] transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${(product.gallery?.indexOf(activeImage) ?? 0) * 100}%)` }}
              >
                {product.gallery?.map((img, idx) => (
                  <div key={idx} className="w-full shrink-0">
                    <img
                      src={img}
                      alt={`${product.name} - Gallery View`}
                      className="w-full h-[400px] object-contain rounded-lg"
                    />
                  </div>
                ))}
              </div>
            </div>
            {product.gallery && product.gallery.length > 0 && (
              <div className="flex space-x-3 overflow-x-auto pb-2">
                {product.gallery.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(img)}
                    className={`w-20 h-20 rounded-lg border-2 hover:border-pink-400 cursor-pointer object-cover ${
                      activeImage === img ? 'border-pink-400' : 'border-transparent'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Thumbnail of ${product.name} ${idx + 1}`}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="pr-2 lg:overflow-y-auto lg:max-h-screen scrollbar-custom">
            <p className="uppercase tracking-wide font-headingTwo text-sm text-text-secondary mb-2">
              {product.name.includes('Cleanser') ? 'Cleanser' : 'Product'}
            </p>
            <h1 className="text-3xl font-bold font-headingOne text-[#1e4323] mb-1">
              {product.name}
            </h1>
            <div className="flex items-center mb-4">
              <div className="flex text-yellow-400 mr-2 text-xl" title={`${product.rating.toFixed(2)} out of 5 stars`}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={20} fill="currentColor" stroke="currentColor" />
                ))}
              </div>
              <span className="text-gray-700 text-sm mr-1">
                {product.rating.toFixed(2)}/5
              </span>
              <a href="#reviews">
                <span className="text-gray-700 text-sm"> ({product.reviews} reviews) </span>
              </a>
            </div>

            <div className="mb-3">
              <span className="text-[#835339] text-2xl font-headingTwo font-bold mb-2">
                {product.price}
              </span>
              <span className="text-lg line-through text-gray-400 ml-2">
                {product.originalPrice}
              </span>
            </div>
            <p className="text-sm text-gray-700 mb-3">*inclusive of all taxes</p>
            <div className="flex space-x-4 mb-6">
              <AddToCartButton
                product={{
                  id: product.id,
                  slug: product.slug,
                  name: product.name,
                  price: parseFloat(product.price.replace(/[₹,]/g, '')),
                  image: product.image
                }}
                className="font-headingTwo bg-[#835339] hover:bg-white text-white hover:text-[#835339] hover:border border-[#835339] font-bold px-6 py-2 rounded"
              />
             
            </div>

            {/* Buy it with section */}
            {related.length > 0 && (
              <>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">BUY IT WITH</h3>
                <div className="space-y-3">
                  {related.map((r) => (
                    <div key={r.id} className="flex overflow-hidden mb-2 bg-[#f0e4d4]">
                      <div className="w-[100px] bg-[#FEF7F1] flex-shrink-0 p-2">
                        <img
                          src={r.image}
                          alt={r.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 p-4 md:p-6 flex flex-col justify-center">
                        <p className="text-[#1e4323] font-medium">{r.name}</p>
                        <p className="mt-1 text-lg font-semibold text-[#80593a]">{r.price}</p>
                        <div className="mt-2 flex space-x-2">
                          <AddToCartButton
                            product={{
                              id: r.id,
                              slug: r.slug,
                              name: r.name,
                              price: parseFloat(r.price.replace(/[₹,]/g, '')),
                              image: r.image
                            }}
                            size="sm"
                            className="bg-[#80593a] text-white px-4 py-1"
                          />
                          <Link
                            to={`/products/${r.slug}`}
                            className="border border-[#80593a] text-[#80593a] text-sm px-4 py-1 flex items-center justify-center"
                          >
                            Quick View
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Description */}
            <div className="mt-8">
              <h2 className="text-2xl font-headingOne font-semibold text-[#1e4323]">
                {product.name}
              </h2>
              {product.description && (
                <p className="mt-2 leading-relaxed font-para text-text-body text-normal">
                  {product.description}
                </p>
              )}
              <p className="mt-2 font-headingTwo text-[#835339] py-2"></p>
            </div>

            {/* Video Section */}
            {product.videos && product.videos.length > 0 && (
              <section className="mt-8 px-4">
                <div className="grid grid-cols-3 gap-2 sm:flex sm:overflow-x-auto sm:gap-4 sm:p-2 sm:scrollbar-hide">
                  {product.videos.map((vid, index) => (
                    <div
                      key={index}
                      className="rounded-2xl overflow-hidden shadow-md cursor-pointer"
                      onClick={() => handleVideoClick(vid)}
                    >
                      <video
                        autoPlay={false}
                        className="aspect-[9/16] w-full rounded-2xl"
                        muted
                        playsInline
                        loop
                      >
                        <source src={vid} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <Dialog open={isVideoModalOpen} onOpenChange={setIsVideoModalOpen}>
              <DialogContent className="p-0 border-none bg-transparent max-w-sm w-full">
                <button
                  onClick={() => setIsVideoModalOpen(false)}
                  className="absolute -top-2 -right-2 bg-white text-gray-800 rounded-full p-1 shadow-md hover:bg-gray-200 transition-all z-50"
                >
                  <X size={24} />
                </button>
                <video src={currentVideoSrc} controls autoPlay className="w-full rounded-2xl shadow-lg"></video>
              </DialogContent>
            </Dialog>

            {/* Benefits Section */}
            {product.benefits && product.benefits.length > 0 && (
              <section className="max-w-7xl mx-auto px-4 pt-6 md:py-6">
                <h2 className="text-2xl font-semibold text-[#1e4323] mb-8">Benefits</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-12">
                  {product.benefits.map((benefit, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      {product.benefitimg && product.benefitimg[index] ? (
                        <img
                          src={product.benefitimg[index]}
                          alt={benefit}
                          className="h-8 w-8 flex-shrink-0"
                        />
                      ) : (
                        <Star className="h-8 w-8 flex-shrink-0 text-[#835339]" />
                      )}
                      <span className="text-base font-medium text-gray-800">{benefit}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}
            
          </div>
        </div>
      </main>

      {/* Marquee Section Integrated Directly */}
      <section className="p-4 w-full mx-auto">
        <div className="marquee-wrapper overflow-hidden">
          <div className="marquee-track flex animate-marquee">
            {marqueeItems.map((item, index) => (
              <div key={index} className="marquee-item text-center flex-shrink-0 w-1/4">
                <img src={item.icon} className="mx-auto h-14 mb-2 opacity-80" alt="" />
                <p className="font-headingTwo font-semibold text-sm text-[#1e4323]">{item.text}</p>
              </div>
            ))}
            {marqueeItems.map((item, index) => (
              <div key={index + marqueeItems.length} className="marquee-item text-center flex-shrink-0 w-1/4">
                <img src={item.icon} className="mx-auto h-14 mb-2 opacity-80" alt="" />
                <p className="font-headingTwo font-semibold text-sm text-[#1e4323]">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      
    </div>
  );
};

export default ProductPage;