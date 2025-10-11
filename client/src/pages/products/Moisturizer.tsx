import ProductPage from '@/components/ProductPage';
import Footer from '@/components/Footer';
import ProductReview from '@/components/ProductReview';
import ProductFAQ from '@/components/ProductFAQ';
import { Check, Feather,Droplets, Heart, Sun } from "lucide-react";
// Reuse cleanser assets for now to keep build runnable
import whyLoveImg from '@/assets/product_img/moisturizer/whylove.jpg';
import who from '@/assets/product_img/moisturizer/who.jpg';
import whomob from '@/assets/product_img/moisturizer/whomob.jpg';
import how from '@/assets/product_img/moisturizer/how.jpg';
import howmob from '@/assets/product_img/moisturizer/howmob.jpg';
import howtouse from '@/assets/product_img/moisturizer/howtouse.jpg';
import howtousemob from '@/assets/product_img/moisturizer/howtousemob.jpg';
import { useEffect, useState } from 'react';
import useProductIngredients from '@/hooks/useProductIngredients';

const Moisturizer = () => {
  const productSlug = 'moisturizer';
  const { ingredients: productIngredients } = useProductIngredients(productSlug);

  // Fallback static data
  const fallbackIngredients = {
    "Ceramides": {
      title: "Ceramides",
      description: "Ceramides — Barrier Strengtheners. Help restore the skin barrier and lock in moisture.",
      benefits: ["Barrier Repair", "Moisture Retention"]
    },
    "Squalane": {
      title: "Squalane",
      description: "Squalane — Lightweight hydration that mimics skin's natural oils.",
      benefits: ["Hydration", "Soft, Supple Skin"]
    }
  } as const;

  const features = [
    {text:"Deep Hydration, Zero Heaviness",icon: Droplets},
    {text:"Like a Daily Multivitamin for Your Skin",icon: Heart},
    {text:"Skin Healing That Goes Beyond the Surface",icon: Heart},
    {text:"Your Skin, But Softer",icon: Feather},
    {text:"Made for Soft Mornings, Soothed Nights",icon: Sun},
  ];

  const [selectedIngredient, setSelectedIngredient] = useState<string>("Ceramides");
  const ingredientNames = (productIngredients && productIngredients.length > 0)
    ? productIngredients.map((i: any) => i.name)
    : Object.keys(fallbackIngredients);

  useEffect(() => {
    if (productIngredients && productIngredients.length > 0) {
      setSelectedIngredient(productIngredients[0].name);
    }
  }, [productIngredients]);

  const currentIngredient = (productIngredients && productIngredients.length > 0)
    ? (productIngredients.find((i: any) => i.name === selectedIngredient) || { title: selectedIngredient, description: '', benefits: [] })
    : (fallbackIngredients as any)[selectedIngredient];

  return (
    <>
      <ProductPage slug="moisturizer" />

      {/* Why You'll Love It */}
      <section className="max-w-7xl mx-auto mt-12 px-4">
        <div className="grid md:grid-cols-2 gap-6 items-start">
          <div className="relative group rounded-2xl overflow-hidden">
            <img src={whyLoveImg} alt="Moisturizer Visual" className="w-full h-full object-cover rounded-2xl" />
          </div>

          <div className="bg-[#fef4e7] p-6 rounded-2xl shadow-sm w-full h-full">
            <h3 className="text-2xl uppercase font-bold text-[#1e4323] mb-4 flex items-center gap-2">Why You'll Love It</h3>
            <ul className="divide-y divide-gray-300">
              {features.map((feature, idx) => {
                const IconComponent = feature.icon;
                return (
                  <li key={idx} className="flex items-center gap-4 py-3">
                    <div className="bg-[#f8ddbf] text-gray-800 rounded-full w-10 h-10 flex items-center justify-center">
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <p className="text-gray-800 font-medium">{feature.text}</p>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </section>

      {/* Who is it for? - Desktop */}
      <section className="hidden md:block w-full mt-12 px-4">
        <h2 className="text-center uppercase text-xl sm:text-3xl font-semibold font-headingOne text-[#1e4323] mb-8">Who is it for?</h2>
        <div className="relative max-w-7xl mx-auto rounded-2xl min-h-[400px] mt-6 px-4 py-12 overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${who})` }} />
      </section>

      {/* Who is it for? - Mobile */}
      <section className="md:hidden w-full mt-12 px-4">
        <h2 className="text-center uppercase text-xl sm:text-3xl font-semibold font-headingOne text-[#1e4323] mb-8">Who is it for?</h2>
        <div className="relative w-full min-h[280px] px-4 py-12 overflow-hidden bg-cover bg-center rounded-2xl" style={{ backgroundImage: `url(${whomob})` }} />
      </section>

      {/* How It Feels - Desktop */}
      <section className="hidden md:block w-full mt-12 px-4">
        <h2 className="text-center text-xl sm:text-3xl font-semibold font-headingOne text-[#1e4323] uppercase">How It Feels</h2>
        <div className="relative max-w-7xl mx-auto rounded-2xl h-[400px] mt-6 px-4 py-12 overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${how})` }} />
      </section>

      {/* How It Feels - Mobile */}
      <section className="md:hidden w-full mt-12 px-4">
        <h2 className="text-center text-xl sm:text-3xl font-semibold font-headingOne text-[#1e4323] mb-8 uppercase">How It Feels</h2>
        <div className="relative w-full min-h-[300px] px-4 py-12 overflow-hidden bg-cover bg-center rounded-2xl" style={{ backgroundImage: `url(${howmob})` }} />
      </section>
   {/* What's Inside */}
   <section className="max-w-7xl mx-auto mt-12 px-4">
  <h2 className="text-center text-xl sm:text-3xl font-semibold uppercase text-[#1e4323] mb-8">
    What's Inside?
  </h2>

  <div className="relative max-w-7xl mx-auto rounded-2xl py-16 px-8 bg-[#F8DFC1]">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">

      {/* LEFT: Key Ingredients */}
      <div className="space-y-6">
        <h3 className="text-[#1e4323] font-semibold uppercase text-lg mb-6">Key Ingredients</h3>
        <div className="grid grid-cols-2 gap-4">
          {ingredientNames.map((ingredientName) => {
            const title = productIngredients?.find(i => i.name === ingredientName)?.title || fallbackIngredients[ingredientName]?.title || ingredientName;
            return (
              <button
                key={ingredientName}
                onClick={() => setSelectedIngredient(ingredientName)}
                className={`py-3 px-4 rounded-full font-headingTwo font-medium text-center transition-all duration-200 text-sm border-2 ${
                  selectedIngredient === ingredientName
                    ? 'bg-[#835339] text-gray-50 border-[#f0e4d4] shadow-md'
                    : 'bg-gray-100 text-gray-900 border-white/60 hover:bg-white/10'
                }`}
              >
                {title}
              </button>
            );
          })}
        </div>
      </div>

      {/* RIGHT: Details Card */}
      <div className="bg-gray-100 rounded-2xl p-6 md:p-10 shadow-lg min-h-[250px]">
        <h3 className="text-xl md:text-3xl font-medium text-gray-900 mb-4">
          {currentIngredient?.title || selectedIngredient}
        </h3>
        <p className="text-gray-700 mb-6 leading-relaxed">
          {currentIngredient?.description}
        </p>

        {currentIngredient?.benefits && currentIngredient.benefits.length > 0 && (
          <div>
            <h4 className="text-md md:text-lg font-medium font-headingTwo text-gray-900 mb-3">GOOD FOR</h4>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {currentIngredient.benefits.map((benefit, idx) => (
                <li key={idx} className="flex items-center space-x-2">
                  <Check className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                  <span className="text-gray-700">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

    </div>
  </div>
</section>


      {/* How To Use - Desktop */}
      <section className="hidden md:block w-full mt-12 px-4">
        <h2 className="text-center text-xl sm:text-3xl font-semibold font-headingOne text-[#1e4323] mb-8 uppercase">How To Use</h2>
        <div className="relative max-w-7xl mx-auto rounded-2xl h-[400px] mt-6 px-4 py-12 overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${howtouse})` }} />
      </section>

      {/* How To Use - Mobile */}
      <section className="md:hidden w-full mt-12 px-4">
        <h2 className="text-center text-xl sm:text-3xl font-semibold font-headingOne text-[#1e4323] mb-8 uppercase">How To Use</h2>
        <div className="relative w-full min-h-[540px] max-h-[600px] px-4 py-12 overflow-hidden bg-cover bg-center rounded-2xl" style={{ backgroundImage: `url(${howtousemob})` }} />
      </section>

      <ProductFAQ slug="moisturizer" />
      <ProductReview slug="moisturizer" />
      <Footer />
    </>
  );
};

export default Moisturizer;
