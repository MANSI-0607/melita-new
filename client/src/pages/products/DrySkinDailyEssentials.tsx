import ProductPage from '@/components/ProductPage';
import Footer from '@/components/Footer';
import ProductReview from '@/components/ProductReview';
import ProductFAQ from '@/components/ProductFAQ';
import { Check, Feather, ShieldCheck, Sparkles, Scale, Palette, Droplets, Heart, Sun } from "lucide-react";
// Reuse cleanser assets for now to keep build runnable
import whyLoveImg from '@/assets/product_img/dryskinwhylove.jpg';
import who from '@/assets/product_img/dryskinwho.jpg';
import whomob from '@/assets/product_img/dryskinwhomob.jpg';
import howtouse from '@/assets/product_img/dryskinhow.jpg';
import howtousemob from '@/assets/product_img/dryskinhow.jpg';
import { useState } from 'react';

const DrySkinDailyEssentials = () => {
  const ingredientData = {
    "Hyaluronic Acid": {
      title: "Hyaluronic Acid",
      description: "Deep hydration to plump and smooth dry, tight skin.",
      benefits: ["Long-lasting Hydration", "Plumping"]
    },
    "Squalane": {
      title: "Squalane",
      description: "Skin-identical emollient to soften and prevent moisture loss.",
      benefits: ["Softening", "Moisture Lock"]
    },
    "All Ingredients": {
      title: "Complete Ingredient List",
      benefits: []
    }
  } as const;

  const features = [
    { text: "Instantly relieves tightness and dryness", icon: Droplets },
    { text: "Skin feels soft, calm, and comforted all day", icon: Heart },
    { text: "Lightweight layers that absorb easily", icon: Feather },
    { text: "No greasiness, no irritation - even in dry climates", icon: Check },
    { text: "Leaves your skin visibly smoother and more even", icon: Sun },
  ];

  const [selectedIngredient, setSelectedIngredient] = useState<keyof typeof ingredientData>("Hyaluronic Acid");
  const ingredients = Object.keys(ingredientData) as Array<keyof typeof ingredientData>;
  const currentIngredient = ingredientData[selectedIngredient];

  return (
    <>
      <ProductPage slug="dry-skin-daily-essentials" />

      {/* Why You'll Love It */}
      <section className="max-w-7xl mx-auto mt-12 px-4">
        <div className="grid md:grid-cols-2 gap-6 items-start">
          <div className="relative group rounded-2xl overflow-hidden">
            <img src={whyLoveImg} alt="Dry Skin Essentials Visual" className="w-full h-full object-cover rounded-2xl" />
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
        <div className="relative w-full min-h-[280px] px-4 py-12 overflow-hidden bg-cover bg-center rounded-2xl" style={{ backgroundImage: `url(${whomob})` }} />
      </section>

      {/* How It Feels - Desktop */}
      {/* <section className="hidden md:block w-full mt-12 px-4">
        <h2 className="text-center text-xl sm:text-3xl font-semibold font-headingOne text-[#1e4323] uppercase">How It Feels</h2>
        <div className="relative max-w-7xl mx-auto rounded-2xl h-[400px] mt-6 px-4 py-12 overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${how})` }} />
      </section> */}

      {/* How It Feels - Mobile */}
      {/* <section className="md:hidden w-full mt-12 px-4">
        <h2 className="text-center text-xl sm:text-3xl font-semibold font-headingOne text-[#1e4323] mb-8 uppercase">How It Feels</h2>
        <div className="relative w-full min-h-[300px] px-4 py-12 overflow-hidden bg-cover bg-center rounded-2xl" style={{ backgroundImage: `url(${howmob})` }} />
      </section> */}

   

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

      <ProductFAQ slug="dry-skin-daily-essentials" />
      <ProductReview slug="dry-skin-daily-essentials" />
      <Footer />
    </>
  );
};

export default DrySkinDailyEssentials;
