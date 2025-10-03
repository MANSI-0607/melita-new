import ProductPage from '@/components/ProductPage';
import Footer from '@/components/Footer';
import ProductReview from '@/components/ProductReview';
import ProductFAQ from '@/components/ProductFAQ';
import { Feather, ShieldCheck, Droplets, Timer, Sun } from "lucide-react";
// Reuse cleanser assets for now to keep build runnable
import whyLoveImg from '@/assets/product_img/oilyskinwhylove.jpg';
import who from '@/assets/product_img/oilyskinwho.jpg';
import whomob from '@/assets/product_img/oilyskinwhomob.jpg';

import howtouse from '@/assets/product_img/oilyskinhow.jpg';
import howtousemob from '@/assets/product_img/oilyskinhowmob.jpg';
import { useState } from 'react';

const OilySkinDailyEssentials = () => {
  const ingredientData = {
    "Niacinamide": {
      title: "Niacinamide",
      description: "Helps regulate oil, reduce the appearance of pores and brighten skin.",
      benefits: ["Oil Control", "Brightening"]
    },
    "Salicylic Acid": {
      title: "Salicylic Acid",
      description: "BHA that helps clear pores and reduce blackheads and acne.",
      benefits: ["Decongesting", "Clarifying"]
    },
    "All Ingredients": {
      title: "Complete Ingredient List",
      description: "List your kit ingredients here...",
      benefits: []
    }
  } as const;

  const features = [
    { text: "Lifts oil and impurities without disrupting your barrier", icon: Feather },
    { text: "Hydrates without clogging pores", icon: Droplets },
    { text: "Zero white cast, even on deeper skin tones", icon: Sun },
    { text: "Soothes and calms breakout-prone skin", icon: ShieldCheck },
    { text: "3 products, 2 minutes, all-day balance", icon: Timer },
  ];

  const [selectedIngredient, setSelectedIngredient] = useState<keyof typeof ingredientData>("Niacinamide");
  const ingredients = Object.keys(ingredientData) as Array<keyof typeof ingredientData>;
  const currentIngredient = ingredientData[selectedIngredient];

  return (
    <>
      <ProductPage slug="oily-skin-daily-essentials" />

      {/* Why You'll Love It */}
      <section className="max-w-7xl mx-auto mt-12 px-4">
        <div className="grid md:grid-cols-2 gap-6 items-start">
          <div className="relative group rounded-2xl overflow-hidden">
            <img src={whyLoveImg} alt="Oily Skin Essentials Visual" className="w-full h-full object-cover rounded-2xl" />
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

      <ProductFAQ slug="oily-skin-daily-essentials" />  
      <ProductReview slug="oily-skin-daily-essentials" />
      <Footer />
    </>
  );
};

export default OilySkinDailyEssentials;
