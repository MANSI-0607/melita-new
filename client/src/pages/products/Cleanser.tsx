import ProductPage from '@/components/ProductPage';
import Footer from '@/components/Footer';
import SimpleProductReview from '@/components/SimpleProductReview';
import ProductFAQ from '@/components/ProductFAQ';
import { Check, Plus, Feather, ShieldCheck, Sparkles, Scale, Palette } from "lucide-react";
import whyLoveImg from '@/assets/product_img/cleanser/whylove.jpg';
import who from '@/assets/product_img/cleanser/who.jpg';
import whomob from '@/assets/product_img/cleanser/whomob.jpg';
import how from '@/assets/product_img/cleanser/how.jpg';
import howmob from '@/assets/product_img/cleanser/howmob.jpg';
import howtouse from '@/assets/product_img/cleanser/howtouse.jpg';
import howtousemob from '@/assets/product_img/cleanser/howtousemob.jpg';
import { useState } from 'react';

const Cleanser = () => {
  // Move all data and state INSIDE the component
  const ingredientData = {
    "Rice Water": {
      title: "Rice Water",
      description: "Rice Water — The Brightening Boost. Rich in antioxidants, it helps brighten dull skin and revive your natural glow after every wash.",
      benefits: ["Skin Brightening", "Improves Skin Texture"]
    },
    "Aloe Vera": {
      title: "Aloe Vera",
      description: "Aloe Vera — The Soothing Touch Calms and reduces irritation, helping your skin feel refreshed and comfortable post-cleanse.",
      benefits: ["Deep hydration & moisture", "Soothing irritated skin"]
    },
    "Squalane": {
      title: "Squalane", 
      description: "Squalane — The Moisture Replenisher Mimics your skin's natural oils, replenishing moisture lost during cleansing, keeping skin soft and resilient.",
      benefits: ["Hydration and Moisturizing", "Protecting skin from pre-mature ageing"]
    },
    "Glycolic Acid": {
      title: "Glycolic Acid",
      description: "Glycolic Acid — The Texture Refiner Gently exfoliates dead skin cells, refines skin texture, and promotes a brighter, smoother look.",
      benefits: ["Exfoliation", "Collagen stimulation"]
    },
    "Salicylic Acid": {
      title: "Salicylic Acid",
      description: "Salicylic Acid — The Clear Pore Expert Penetrates deep into pores to clear excess oil and help prevent breakouts, keeping skin fresh.",
      benefits: ["Minimizing pores", "Oil/Acne control"]
    },
    "Vitamin E": {
      title: "Vitamin E",
      description: "Vitamin E — The Protective Antioxidant Fights free radicals and helps protect your skin from environmental stressors, keeping it healthy and radiant.",
      benefits: ["Protecting the skin from free radical damage. It's a great antioxidant", "Preventing water loss from skin"]
    },
    "All Ingredients": {
      title: "Complete Ingredient List",
      description: "Aqua, Sodium Lauroyl Sarcosinate, Cocamidopropyl Betaine, Acrylates Copolymer, Propanediol, Decyl Glucoside, Glycerin, Oryza Sativa (Rice) Seed Water, Phenoxyetanol, Aloe Barbadensis Leaf Extract, Azadirachta Indica Leaf Extract, Sodium Benzoate, Perfume, Squalane, Xanthan Gum, Disodium EDTA, Tocopheryl Acetate, Glycolic Acid, Salicylic Acid, Laminaria Digitata Extract, Cetyl-PG Hydroxyethyl Palmitamide, Ceramide EOP, Ceramide NG, Ceramide NP, Ceramide AS, Ceramide AP, 1,2-Hexanediol.",
     benefits: []
    }
  };

  const features = [
    {
      text: "Lightweight Gel Texture",
      icon: Feather, // Represents lightness and gentle texture
    },
    {
      text: "No Harsh Additives",
      icon: ShieldCheck, // Represents protection and safety
    },
    {
      text: "Instant Refreshment",
      icon: Sparkles, // Represents freshness and instant results
    },
    {
      text: "pH Balanced Formula",
      icon: Scale, // Represents balance
    },
    {
      text: "Removes Light Makeup with Ease",
      icon: Palette, // Represents makeup and cosmetics
    },
  ];

  // useState hook INSIDE the component
  const [selectedIngredient, setSelectedIngredient] = useState("Rice Water");
  
  const ingredients = ["Rice Water", "Aloe Vera", "Squalane", "Glycolic Acid", "Salicylic Acid", "Vitamin E", "All Ingredients"];
  const currentIngredient = ingredientData[selectedIngredient];

  return (
    <>
      <ProductPage slug="cleanser" />
      {/* ---------- Custom Cleanser Sections ---------- */}

      {/* Why You'll Love It */}
      <section className="max-w-7xl mx-auto mt-12 px-4">
        <div className="grid md:grid-cols-2 gap-6 items-start">
          {/* Before/After Image */}
          <div className="relative group rounded-2xl overflow-hidden">
            <img
              src={whyLoveImg}
              alt="Before"
              className="w-full h-full object-cover rounded-2xl"
            />
          </div>
   {/* Why You'll Love It */}
   <div className="bg-[#fef4e7] p-6 rounded-2xl shadow-sm w-full h-full">
          <h3 className="text-2xl uppercase font-bold text-[#1e4323] mb-4 flex items-center gap-2">
            Why You'll Love It
          </h3>
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
        <h2 className="text-center uppercase text-xl sm:text-3xl font-semibold font-headingOne text-[#1e4323] mb-8">
          Who is it for?
        </h2>
        <div
          className="relative max-w-7xl mx-auto rounded-2xl min-h-[400px] mt-6 px-4 py-12 overflow-hidden bg-cover bg-center"
          style={{
            backgroundImage: `url(${who})`,
          }}
        />
      </section>

      {/* Who is it for? - Mobile */}
      <section className="md:hidden w-full mt-12 px-4">
        <h2 className="text-center uppercase text-xl sm:text-3xl font-semibold font-headingOne text-[#1e4323] mb-8">
          Who is it for?
        </h2>
        <div
          className="relative w-full min-h-[280px] px-4 py-12 overflow-hidden bg-cover bg-center rounded-2xl"
          style={{
            backgroundImage: `url(${whomob})`,
          }}
        />
      </section>

      {/* How It Feels - Desktop */}
      <section className="hidden md:block w-full mt-12 px-4">
        <h2 className="text-center text-xl sm:text-3xl font-semibold font-headingOne text-[#1e4323] uppercase">
          How It Feels
        </h2>
        <div
          className="relative max-w-7xl mx-auto rounded-2xl h-[400px] mt-6 px-4 py-12 overflow-hidden bg-cover bg-center"
          style={{
            backgroundImage: `url(${how})`,
          }}
        />
      </section>

      {/* How It Feels - Mobile */}
      <section className="md:hidden w-full mt-12 px-4">
        <h2 className="text-center text-xl sm:text-3xl font-semibold font-headingOne text-[#1e4323] mb-8 uppercase">
          How It Feels
        </h2>
        <div
          className="relative w-full min-h-[300px] px-4 py-12 overflow-hidden bg-cover bg-center rounded-2xl"
          style={{
            backgroundImage: `url(${howmob})`,
          }}
        />
      </section>

      {/* What's Inside? */}
      <section className="max-w-7xl mx-auto mt-12 px-4">
        <h2 className="text-center text-3xl font-bold text-green-800 mb-12 uppercase tracking-wide">
          What's Inside?
        </h2>
        
        <div className="bg-orange-100 rounded-3xl p-8 shadow-lg">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            
            {/* Left side - Key Ingredients */}
            <div className="lg:col-span-2 space-y-6">
              <h3 className="text-green-800 font-bold uppercase text-lg mb-6">
                Key Ingredients
              </h3>
              
              <div className="grid grid-cols-2 gap-3">
                {ingredients.map((ingredient, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedIngredient(ingredient)}
                    className={`py-3 px-4 rounded-full text-sm font-medium transition-all duration-200 text-center border-2 ${
                      selectedIngredient === ingredient
                        ? 'bg-amber-800 text-white border-amber-800 shadow-md'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-amber-600 hover:bg-amber-50'
                    }`}
                  >
                    {ingredient}
                  </button>
                ))}
              </div>
            </div>

            {/* Right side - Ingredient Detail */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-2xl p-8 shadow-sm min-h-[320px] transition-all duration-300">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {currentIngredient.title}
                </h3>
                
                <p className="text-gray-700 mb-8 leading-relaxed">
                  {currentIngredient.description}
                </p>

                <div>
                  
                
                  {selectedIngredient === "All Ingredients" ? (
                   <></>
                  ) : (<>
                    <h4 className="text-lg font-bold text-gray-900 mb-4 uppercase tracking-wide">
                    Good For
                  </h4>
                    <div className="space-y-3">
                      {currentIngredient.benefits.map((benefit, idx) => (
                        <div key={idx} className="flex items-start space-x-3">
                          <Check className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700 leading-relaxed">{benefit}</span>
                        </div>
                      ))}
                    </div></>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How To Use - Desktop */}
      <section className="hidden md:block w-full mt-12 px-4">
        <h2 className="text-center text-xl sm:text-3xl font-semibold font-headingOne text-[#1e4323] mb-8 uppercase">
          How To Use
        </h2>
        <div
          className="relative max-w-7xl mx-auto rounded-2xl h-[400px] mt-6 px-4 py-12 overflow-hidden bg-cover bg-center"
          style={{
            backgroundImage: `url(${howtouse})`,
          }}
        />
      </section>

      {/* How To Use - Mobile */}
      <section className="md:hidden w-full mt-12 px-4">
        <h2 className="text-center text-xl sm:text-3xl font-semibold font-headingOne text-[#1e4323] mb-8 uppercase">
          How To Use
        </h2>
        <div
          className="relative w-full min-h-[540px] max-h-[600px] px-4 py-12 overflow-hidden bg-cover bg-center rounded-2xl"
          style={{
            backgroundImage: `url(${howtousemob})`,
          }}
        />
      </section>

      {/* ---------- End Custom Cleanser Sections ---------- */}
      
      <ProductFAQ />
      <SimpleProductReview slug="cleanser" />
      <Footer />
    </>
  );
};

export default Cleanser;