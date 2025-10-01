import mongoose from "mongoose";
import Product from "./models/Product.js"; // adjust path to your Product model

// All product updates
const updates = [
  {
    slug: "melita-renewing-gel-cleanser",
    data: {
      benefits: [
        { image: "/uploads/benefits/cleanser1.png", text: "Clears Impurities" },
        { image: "/uploads/benefits/cleanser2.png", text: "Brightens & Soothes" },
        { image: "/uploads/benefits/cleanser3.png", text: "Refines Texture" },
        { image: "/uploads/benefits/cleanser4.png", text: "Prepares Skin" },
        { image: "/uploads/benefits/cleanser5.png", text: "Keeps Skin Energized" }
      ],
      ingredients: [
        {
          name: "Rice Water",
          description: "Rich in antioxidants, helps brighten dull skin.",
          benefits: ["Brightening", "Improves skin texture"]
        },
        {
          name: "Aloe Vera",
          description: "Calms irritation, refreshes and hydrates skin.",
          benefits: ["Hydration", "Soothing"]
        },
        {
          name: "Squalane",
          description: "Mimics natural oils, replenishes lost moisture, keeps skin resilient.",
          benefits: ["Hydration", "Anti-aging"]
        },
        {
          name: "Glycolic Acid",
          description: "Gently exfoliates, refines skin texture, promotes collagen.",
          benefits: ["Exfoliation", "Collagen stimulation"]
        },
        {
          name: "Salicylic Acid",
          description: "Penetrates pores, clears oil, prevents breakouts.",
          benefits: ["Acne control", "Minimizes pores"]
        },
        {
          name: "Vitamin E",
          description: "Protective antioxidant, shields against free radical damage.",
          benefits: ["Antioxidant", "Moisture retention"]
        }
      ],
      faq: [
        {
          title: "Ingredients & Claims",
          questions: [
            {
              question: "How does it help with breakouts?",
              answer: "Glycolic and Salicylic acids exfoliate and clear pores, helping prevent acne."
            },
            {
              question: "Is it hydrating or drying?",
              answer: "It’s hydrating thanks to Rice Water and Aloe Vera, leaving your skin refreshed, not dry."
            }
          ]
        },
        {
          title: "Usage & Application",
          questions: [
            {
              question: "Does this cleanser remove makeup?",
              answer: "Yes, it removes everyday makeup easily, but heavy makeup may need a remover."
            },
            {
              question: "How often should I use the cleanser?",
              answer: "For best results, use twice daily — morning and night."
            }
          ]
        }
      ]
    }
  },
  {
    slug: "melita-brightening-essence",
    data: {
      benefits: [
        { image: "/uploads/benefits/essence1.png", text: "Boosts Radiance" },
        { image: "/uploads/benefits/essence2.png", text: "Deep Hydration" },
        { image: "/uploads/benefits/essence3.png", text: "Strengthens Barrier" }
      ],
      ingredients: [
        {
          name: "Niacinamide",
          description: "Helps brighten skin and fade dark spots.",
          benefits: ["Brightening", "Evens skin tone"]
        },
        {
          name: "Hyaluronic Acid",
          description: "Provides deep hydration and plumps skin.",
          benefits: ["Hydration", "Plumping"]
        },
        {
          name: "Licorice Extract",
          description: "Soothes and reduces pigmentation.",
          benefits: ["Soothing", "Pigmentation reduction"]
        }
      ],
      faq: [
        {
          title: "Skin Benefits",
          questions: [
            {
              question: "Can I use it with Vitamin C?",
              answer: "Yes, Niacinamide works well with Vitamin C for brighter skin."
            }
          ]
        },
        {
          title: "Application",
          questions: [
            {
              question: "When should I use this essence?",
              answer: "Apply after cleansing and before moisturizer."
            }
          ]
        }
      ]
    }
  },
  {
    slug: "melita-hydrating-moisturizer",
    data: {
      benefits: [
        { image: "/uploads/benefits/moist1.png", text: "24H Hydration" },
        { image: "/uploads/benefits/moist2.png", text: "Soothes Irritation" },
        { image: "/uploads/benefits/moist3.png", text: "Restores Barrier" }
      ],
      ingredients: [
        {
          name: "Ceramides",
          description: "Essential lipids that strengthen skin barrier.",
          benefits: ["Barrier repair", "Moisture retention"]
        },
        {
          name: "Shea Butter",
          description: "Nourishes dry skin deeply.",
          benefits: ["Moisturizing", "Softening"]
        },
        {
          name: "Panthenol",
          description: "Calms skin and reduces redness.",
          benefits: ["Soothing", "Healing"]
        }
      ],
      faq: [
        {
          title: "Skin Suitability",
          questions: [
            {
              question: "Is this safe for sensitive skin?",
              answer: "Yes, it is formulated for even sensitive skin."
            }
          ]
        },
        {
          title: "Daily Use",
          questions: [
            {
              question: "Can I use it under makeup?",
              answer: "Yes, it absorbs quickly and works as a good base."
            }
          ]
        }
      ]
    }
  },
  {
    slug: "melita-sunscreen-spf50",
    data: {
      benefits: [
        { image: "/uploads/benefits/sun1.png", text: "Broad Spectrum Protection" },
        { image: "/uploads/benefits/sun2.png", text: "Lightweight Texture" },
        { image: "/uploads/benefits/sun3.png", text: "Non-Greasy Finish" }
      ],
      ingredients: [
        {
          name: "Zinc Oxide",
          description: "Physical UV filter that reflects harmful rays.",
          benefits: ["UV protection", "Safe for sensitive skin"]
        },
        {
          name: "Titanium Dioxide",
          description: "Provides additional sun protection.",
          benefits: ["UV defense", "Gentle on skin"]
        },
        {
          name: "Green Tea Extract",
          description: "Antioxidant that fights free radicals.",
          benefits: ["Antioxidant", "Anti-aging"]
        }
      ],
      faq: [
        {
          title: "Usage",
          questions: [
            {
              question: "How much sunscreen should I apply?",
              answer: "Use two fingers length of product for face and neck."
            }
          ]
        },
        {
          title: "Reapplication",
          questions: [
            {
              question: "How often should I reapply?",
              answer: "Reapply every 2-3 hours when outdoors."
            }
          ]
        }
      ]
    }
  },
  {
    slug: "melita-skincare-combo",
    data: {
      benefits: [
        { image: "/uploads/benefits/combo1.png", text: "Complete Routine" },
        { image: "/uploads/benefits/combo2.png", text: "Better Value" }
      ],
      ingredients: [],
      faq: [
        {
          title: "Combo Use",
          questions: [
            {
              question: "Can I use all products together?",
              answer: "Yes, they are designed to complement each other."
            }
          ]
        }
      ]
    }
  },
  {
    slug: "melita-travel-kit",
    data: {
      benefits: [
        { image: "/uploads/benefits/kit1.png", text: "Travel Friendly" },
        { image: "/uploads/benefits/kit2.png", text: "All-in-One Care" }
      ],
      ingredients: [],
      faq: [
        {
          title: "Kit Details",
          questions: [
            {
              question: "Does the kit include full-sized products?",
              answer: "No, these are mini sizes perfect for travel."
            }
          ]
        }
      ]
    }
  }
];

async function runUpdate() {
  try {
    await mongoose.connect("mongodb://localhost:27017/yourdbname");

    for (const item of updates) {
      await Product.updateOne({ slug: item.slug }, { $set: item.data });
      console.log(`✅ Updated product: ${item.slug}`);
    }

    console.log("🎉 All updates applied!");
    mongoose.connection.close();
  } catch (err) {
    console.error("❌ Update failed:", err);
    mongoose.connection.close();
  }
}

runUpdate();
