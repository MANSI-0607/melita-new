// Sample data seeder for Melita E-commerce
// Run with: node seedData.js

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/Product.js';
import User from './models/User.js';
import Review from './models/Review.js';

dotenv.config();

const sampleProducts = [
  {
    name: 'Melita Renewing Gel Cleanser',
    slug: 'cleanser',
    description:
      'Your skin faces pollution, sweat, and daily grime - and it deserves a gentle, effective clean. Melita Rice Water & Squalane Gel Cleanser lifts away dirt and impurities while leaving your skin soft, smooth, and radiant. Infused with nourishing Rice Water, Aloe Vera, and Squalane, it calms and brightens. With gentle exfoliants like Glycolic and Salicylic acids, it refines texture and helps prevent breakouts — all without stripping or drying.',
    shortDescription: 'Hit Reset on Your Skin with Every Wash',
    price: 335,
    originalPrice: 375,
    category: 'cleanser',
    skinType: ['dry', 'oily', 'combination', 'sensitive', 'normal', 'all'],
    images: {
      primary: '/images/products/cleanser1.jpg',
      hover: '/images/products/cleanser2.jpg',
      gallery: [
        '/images/products/cleanser1.jpg',
        '/images/products/cleanser2.jpg',
        '/images/products/cleanser3.jpg',
        '/images/products/cleanser4.jpg',
        '/images/products/cleanser5.jpg'
      ]
    },
    benefits: [
      {
        image: '/images/benefits/cleanser-clears.jpg',
        text: 'Clears Impurities'
      },
      {
        image: '/images/benefits/cleanser-brightens.jpg',
        text: 'Brightens & Soothes'
      },
      {
        image: '/images/benefits/cleanser-refines.jpg',
        text: 'Refines Texture'
      },
      {
        image: '/images/benefits/cleanser-prepares.jpg',
        text: 'Prepares Skin'
      },
      {
        image: '/images/benefits/cleanser-energizes.jpg',
        text: 'Keeps Skin Energized'
      }
    ],
    ingredients: [
      {
        name: 'Rice Water',
        description: 'The Brightening Boost Rich in antioxidants, it helps brighten dull skin and revive your natural glow after every wash.',
        benefits: ['Skin Brightening', 'Improves Skin Texture']
      },
      {
        name: 'Aloe Vera',
        description: 'The Soothing Touch Calms and reduces irritation, helping your skin feel refreshed and comfortable post-cleanse.',
        benefits: ['Deep hydration & moisture', 'Soothing irritated skin']
      },
      {
        name: 'Squalane',
        description: 'The Moisture Replenisher Mimics your skin\'s natural oils, replenishing moisture lost during cleansing, keeping skin soft and resilient.',
        benefits: ['Hydration and Moisturizing', 'Protecting skin from pre-mature ageing']
      },
      {
        name: 'Glycolic Acid',
        description: 'The Texture Refiner Gently exfoliates dead skin cells, refines skin texture, and promotes a brighter, smoother look.',
        benefits: ['Exfoliation', 'Collagen stimulation']
      },
      {
        name: 'Salicylic Acid',
        description: 'The Clear Pore Expert Penetrates deep into pores to clear excess oil and help prevent breakouts, keeping skin fresh.',
        benefits: ['Minimizing pores', 'Oil/Acne control']
      },
      {
        name: 'Vitamin E',
        description: 'The Protective Antioxidant Fights free radicals and helps protect your skin from environmental stressors, keeping it healthy and radiant.',
        benefits: ['Protecting the skin from free radical damage. It\'s a great antioxidant', 'Preventing water loss from skin']
      }
    ],
    faq: [
      {
        title: 'Ingredients & Claims',
        questions: [
          {
            question: 'How does it help with breakouts?',
            answer: 'Glycolic and Salicylic acids gently exfoliate and clear pores, helping prevent acne and congestion.'
          },
          {
            question: 'Is it hydrating or drying?',
            answer: 'It\'s hydrating, thanks to ingredients like Rice Water and Aloe Vera, leaving your skin refreshed, not dry.'
          }
        ]
      },
      {
        title: 'Packaging & Storage',
        questions: [
          {
            question: 'How long does one tube last?',
            answer: 'When used twice daily, it typically lasts about 4-6 weeks.'
          },
          {
            question: 'How should I store the cleanser?',
            answer: 'Keep it in a cool, dry place, away from direct sunlight.'
          }
        ]
      },
      {
        title: 'Results & Experience',
        questions: [
          {
            question: 'Does this cleanser remove makeup?',
            answer: 'It removes everyday makeup easily, but heavy or waterproof makeup might need a dedicated remover first.'
          },
          {
            question: 'When will I see results?',
            answer: 'Skin feels instantly clean and refreshed. Dullness and congestion improve within a few weeks.'
          },
          {
            question: 'Will it help reduce pores or brighten my skin?',
            answer: 'Yes! Regular use can refine skin texture, brighten dull skin, and keep pores clear.'
          }
        ]
      },
      {
        title: 'Skin Compatibility',
        questions: [
          {
            question: 'Can I use this if I have dry or oily skin?',
            answer: 'Yes! It balances moisture for dry skin and helps control oil for oily skin, making it suitable for all skin types.'
          },
          {
            question: 'Is this cleanser suitable for sensitive skin?',
            answer: 'Absolutely. It\'s gentle, soap-free, sulphate-free, and dermatologically tested.'
          },
          {
            question: 'Will it dry out my skin?',
            answer: 'Not at all. It\'s pH balanced and formulated to clean without stripping your skin\'s natural moisture.'
          }
        ]
      },
      {
        title: 'Usage & Application',
        questions: [
          {
            question: 'Can I use it with other active ingredients like retinol or Vitamin C?',
            answer: 'Yes! It\'s designed to be gentle and layer seamlessly with your existing skincare routine.'
          },
          {
            question: 'How do I know I\'m using the right amount?',
            answer: 'Just a small, pea-sized amount is enough — gently massage and rinse off.'
          },
          {
            question: 'How often should I use the cleanser?',
            answer: 'For best results, use twice daily — morning and night.'
          }
        ]
      }
    ],
   
    specifications: {
      volume: '100ml',
      weight: '100g',
      skinType: ['all'],
      ageGroup: ['18-25', '26-35', '36-45', '46-55', '55+']
    },
    inventory: {
      stock: 100,
      lowStockThreshold: 10,
      trackInventory: true
    },
    ratings: {
      average: 5.0,
      count: 5
    },
    isActive: true,
    isFeatured: true,
    tags: ['cleanser', 'gentle', 'sensitive-skin', 'daily-use', 'rice-water', 'squalane'],
    seo: {
      metaTitle: 'Melita Renewing Gel Cleanser - Gentle Daily Face Wash',
      metaDescription:
        'Gentle gel cleanser for all skin types. Removes impurities while maintaining skin barrier. Dermatologically tested.',
      keywords: ['face cleanser', 'gentle cleanser', 'skin care', 'daily cleanser', 'rice water cleanser']
    }
  },
  {
    name: 'Melita Ultra Hydrating Essence',
    slug: 'essence',
    description:
      'A featherlight essence powered by Squalane, Hyaluronic Acid, and Peptides to deeply hydrate, strengthen your skin barrier, and prep your skin for actives. Clinically shown to boost hydration by up to 400%. Healthy skin starts with a strong, resilient barrier.',
    shortDescription: 'Intense hydration essence for glowing skin',
    price: 1199,
    originalPrice: 1499,
    category: 'essence',
    skinType: ['dry', 'combination', 'normal'],
    images: {
      primary: '/images/products/essence1.jpg',
      hover: '/images/products/essence2.jpg',
      gallery: [
        '/images/products/essence1.jpg',
        '/images/products/essence2.jpg',
        '/images/products/essence3.jpg',
        '/images/products/essence4.jpg',
        '/images/products/essence5.jpg',
        '/images/products/essence6.jpg',
        '/images/products/essence7.jpg',
        '/images/products/essence8.jpg'
      ],
      videos: ['/videos/products/essence1.mp4']
    },
    benefits: [
      {
        image: '/images/benefits/essence-hydration.jpg',
        text: 'Intense Hydration'
      },
      {
        image: '/images/benefits/essence-barrier.jpg',
        text: 'Barrier Reinforcement'
      },
      {
        image: '/images/benefits/essence-antioxidant.jpg',
        text: 'Antioxidant Defence'
      },
      {
        image: '/images/benefits/essence-exfoliation.jpg',
        text: 'Gentle Exfoliation'
      },
      {
        image: '/images/benefits/essence-soothing.jpg',
        text: 'Soothing & Calming'
      }
    ],
    ingredients: [
      {
        name: 'Squalane',
        description: 'The Barrier Strengthener Mimics your skin\'s natural moisture, reinforcing the barrier, preventing water loss, and making skin resilient against external stressors.',
        benefits: ['Deep hydration & moisture', 'Protecting skin from pre-mature ageing']
      },
      {
        name: 'Hyaluronic Acid',
        description: 'The Ultimate Water Magnet A moisture-binding powerhouse that draws in water and locks it deep within the skin for all-day hydration.',
        benefits: ['Hydration', 'Wrinkle Reduction']
      },
      {
        name: 'Peptides',
        description: 'The Skin Trainer Supports collagen production, improves elasticity, and helps skin recover from daily stress faster.',
        benefits: ['Boosting collagen', 'Strengthening skin barrier']
      },
      {
        name: 'Allantoin',
        description: 'The Soothing Healer Calms irritation, promotes skin repair, and keeps sensitive skin happy and healthy.',
        benefits: ['Soothing irritated skin', 'Moisturizing']
      },
      {
        name: 'Glycolic Acid',
        description: 'The Glow Booster Gently exfoliates, smooths texture, and enhances skin radiance without stripping moisture.',
        benefits: ['Exfoliation', 'Collagen stimulation']
      },
      {
        name: 'Glycerine',
        description: 'A humectant that continuously attracts & retains moisture, keeping skin soft and supple all day.',
        benefits: ['Strengthening skin barrier', 'Locking moisture in the skin']
      }
    ],
    faq: [
      {
        title: 'Ingredients & Claims',
        questions: [
          {
            question: 'Can I use this with active ingredients like Vitamin C, Retinol, or AHAs/BHAs?',
            answer: 'Yes! It\'s formulated to layer seamlessly with actives and helps reduce irritation from potent ingredients.'
          },
          {
            question: 'Does it contain any harsh chemicals?',
            answer: 'No. It\'s free from soap, sulphates, parabens, and other irritants.'
          },
          {
            question: 'Does this essence contain fragrance?',
            answer: 'Yes, but it\'s very mild and doesn\'t overpower the product\'s performance.'
          },
          {
            question: 'What makes Melita Ultra Hydrating Essence different from other essences?',
            answer: 'Unlike other essences, this is clinically tested to boost hydration by 400% while also strengthening the skin barrier & soothing sensitivity—all in a weightless, non-greasy formula.'
          }
        ]
      },
      {
        title: 'Packaging & Storage',
        questions: [
          {
            question: 'What type of packaging does this come in?',
            answer: 'It\'s housed in an airless bottle, which protects the formula and ensures long-lasting freshness.'
          }
        ]
      },
      {
        title: 'Skin Compatibility',
        questions: [
          {
            question: 'Can this replace my moisturizer?',
            answer: 'While it deeply hydrates, it\'s best used with a moisturizer to lock in hydration—especially for dry skin.'
          },
          {
            question: 'Is this suitable for acne-prone skin?',
            answer: 'Yes! It\'s non-comedogenic, lightweight, and helps reduce post-acne redness.'
          },
          {
            question: 'Will this make my skin oily?',
            answer: 'Not at all! It has a fast-absorbing, water-like texture that leaves zero greasiness.'
          }
        ]
      },
      {
        title: 'Usage & Application',
        questions: [
          {
            question: 'Can I use this essence in both morning and night routines?',
            answer: 'Yes! It is designed to be used twice daily for continuous hydration and barrier support.'
          },
          {
            question: 'Can I use this under makeup?',
            answer: 'Absolutely! Its non-sticky, lightweight texture makes it the perfect hydrating base for smooth makeup application.'
          },
          {
            question: 'How long will it take to see results?',
            answer: 'You\'ll notice instant hydration & plumper skin. With regular use, barrier repair, redness reduction, and glow will be visible in 2-4 weeks.'
          }
        ]
      }
    ],
   
    specifications: {
      volume: '30ml',
      weight: '30g',
      skinType: ['dry', 'combination', 'normal'],
      ageGroup: ['26-35', '36-45', '46-55', '55+']
    },
    inventory: {
      stock: 75,
      lowStockThreshold: 10,
      trackInventory: true
    },
    ratings: {
      average: 4.88,
      count: 56
    },
    isActive: true,
    isFeatured: true,
    tags: ['essence', 'hydration', 'anti-aging', 'premium', 'barrier-repair', 'peptides'],
    seo: {
      metaTitle: 'Melita Ultra Hydrating Essence - Premium Anti-Aging Skincare',
      metaDescription:
        'Premium hydrating essence with hyaluronic acid and peptides. Improves skin texture and reduces fine lines. Clinically proven 400% hydration boost.',
      keywords: [
        'hydrating essence',
        'anti-aging',
        'hyaluronic acid',
        'premium skincare',
        'barrier repair'
      ]
    }
  },
  {
    name: 'Melita Balancing Moisturizer',
    slug: 'moisturizer',
    description:
      'Meet your skin\'s daily defence against dryness and dullness. Melita Balancing Moisturizer is more than just hydration — it\'s healing in a jar. Formulated especially for normal to dry skin, this barrier-repairing, deeply nourishing cream is powered by ceramides, peptides, hyaluronic acid, and plant-based squalane. Together, they work to restore your skin\'s protective barrier, lock in long-lasting moisture, and visibly reduce early signs of aging — all while keeping your skin balanced and calm.',
    shortDescription: 'Rebuild. Replenish. Renew.',
    price: 1099,
    originalPrice: 1299,
    category: 'moisturizer',
    skinType: ['normal', 'dry', 'combination'],
    images: {
      primary: '/images/products/moisturizer1.jpg',
      hover: '/images/products/moisturizer2.jpg',
      gallery: ['/images/products/moisturizer1.jpg', '/images/products/moisturizer2.jpg']
    },
    benefits: [
      {
        image: '/images/benefits/moisturizer-hydration.jpg',
        text: 'Deep, Long-Lasting Hydration'
      },
      {
        image: '/images/benefits/moisturizer-antioxidant.jpg',
        text: 'Antioxidant Protection'
      },
      {
        image: '/images/benefits/moisturizer-collagen.jpg',
        text: 'Supports Collagen & Skin Elasticity'
      },
      {
        image: '/images/benefits/moisturizer-barrier.jpg',
        text: 'Barrier Repair & Strengthening'
      },
      {
        image: '/images/benefits/moisturizer-smoothing.jpg',
        text: 'Visible Smoothing & Softening'
      },
      {
        image: '/images/benefits/moisturizer-soothing.jpg',
        text: 'Comforting & Soothing Relief'
      }
    ],
    ingredients: [
      {
        name: 'Hyaluronic Acid',
        description: 'The Ultimate Moisture Magnet Draws water into the skin and locks it in, keeping your skin plump, hydrated, and bouncy all day.',
        benefits: ['Deep hydration', 'Reducing the appearance of fine lines and wrinkles']
      },
      {
        name: 'Ceramides',
        description: 'Your Skin\'s Natural Building Blocks Replenishes and strengthens your skin barrier, helping it hold onto moisture while keeping irritants out.',
        benefits: ['Strengthening skin barrier', 'Deep hydration & moisture']
      },
      {
        name: 'Squalane',
        description: 'The Barrier Guardian Mimics your skin\'s natural oils to restore balance, prevent water loss, and keep your barrier strong.',
        benefits: ['Deep hydration & moisture', 'Protecting skin from pre-mature ageing']
      },
      {
        name: 'Glycolic Acid',
        description: 'Gentle Exfoliation, Radiant Glow Encourages cell turnover to smooth texture, fade dullness, and reveal fresh, healthier-looking skin.',
        benefits: ['Exfoliation', 'Collagen stimulation']
      },
      {
        name: 'Allantoin',
        description: 'The Skin Soother Calms irritation, reduces redness, and provides relief to stressed or sensitive skin.',
        benefits: ['Soothing irritated skin', 'Moisturizing']
      }
    ],
    faq: [
      {
        title: 'Ingredients & Claims',
        questions: [
          {
            question: 'Does it help with fine lines or aging?',
            answer: 'Yes. Peptides in the formula help support collagen, reduce fine lines, and improve elasticity.'
          },
          {
            question: 'Does this contain exfoliating acids?',
            answer: 'Yes, it contains Glycolic Acid in a balanced concentration for gentle daily exfoliation.'
          }
        ]
      },
      {
        title: 'Packaging & Storage',
        questions: [
          {
            question: 'How long does one jar typically last?',
            answer: 'With twice-daily use, one jar typically lasts 6–8 weeks.'
          },
          {
            question: 'What type of packaging does it come in?',
            answer: 'It comes in a recyclable glass jar with a secure screw-on lid.'
          }
        ]
      },
      {
        title: 'Results & Experience',
        questions: [
          {
            question: 'When will I start seeing results?',
            answer: 'You\'ll feel instant hydration and smoothness. Visible improvements to barrier strength, texture, and plumpness typically show within 2–3 weeks of consistent use.'
          },
          {
            question: 'Will it help with fine lines?',
            answer: 'Yes — thanks to peptides and collagen-boosting ingredients, it supports firmer skin and helps soften the appearance of fine lines over time.'
          }
        ]
      },
      {
        title: 'Skin Compatibility',
        questions: [
          {
            question: 'Can I use this if I have sensitive skin?',
            answer: 'Yes. It\'s formulated to soothe and calm sensitive, reactive, or compromised skin.'
          },
          {
            question: 'What skin type is this best for?',
            answer: 'It\'s especially ideal for normal to dry skin but works well for anyone needing barrier repair and nourishment.'
          }
        ]
      },
      {
        title: 'Usage & Application',
        questions: [
          {
            question: 'Can I use it with active ingredients like retinol or Vitamin C?',
            answer: 'Yes! It\'s formulated to layer well with actives and helps minimize irritation from stronger treatments.'
          },
          {
            question: 'How often should I use Melita Balancing Moisturizer?',
            answer: 'Twice a day – once in the morning and once at night – for best results.'
          },
          {
            question: 'Is it suitable for use under makeup?',
            answer: 'Absolutely. Its smooth, non-greasy finish makes it a great base for makeup.'
          }
        ]
      }
    ],

    specifications: {
      volume: '50ml',
      weight: '50g',
      skinType: ['normal', 'dry', 'combination'],
      ageGroup: ['18-25', '26-35', '36-45']
    },
    inventory: {
      stock: 60,
      lowStockThreshold: 10,
      trackInventory: true
    },
    ratings: {
      average: 4.95,
      count: 19
    },
    isActive: true,
    isFeatured: true,
    tags: ['moisturizer', 'barrier-repair', 'ceramides', 'dry-skin', 'peptides'],
    seo: {
      metaTitle: 'Melita Balancing Moisturizer - Barrier Repair & Deep Hydration',
      metaDescription:
        'Barrier-repairing moisturizer with ceramides, peptides, and hyaluronic acid. Perfect for normal to dry skin seeking deep nourishment.',
      keywords: [
        'moisturizer dry skin',
        'barrier repair',
        'ceramides moisturizer',
        'peptide moisturizer'
      ]
    }
  },
  {
    name: 'Melita Ultra Protecting Sunscreen',
    slug: 'sunscreen',
    description:
      'Meet your new favourite sun shield. This SPF 50+ PA++++ sunscreen blends into your skin within seconds, leaving no white cast and a beautiful, glass-like glow. Its gel-cream texture is refreshing and cooling, making application feel like a treat - not a chore. Infused with powerful antioxidants, it helps protect your skin from UV rays, pollution, and everyday environmental stressors - so you stay radiant and resilient, wherever life takes you.',
    shortDescription: 'Your daily skin shield',
    price: 1299,
    originalPrice: 1450,
    category: 'sunscreen',
    skinType: ['dry', 'oily', 'combination', 'sensitive', 'normal', 'all'],
    images: {
      primary: '/images/products/sunscreen1.jpg',
      hover: '/images/products/sunscreen2.jpg',
      gallery: ['/images/products/sunscreen1.jpg', '/images/products/sunscreen2.jpg']
    },
    benefits: [
      {
        image: '/images/benefits/sunscreen-protection.jpg',
        text: 'Stable, Broad Sun Protection'
      },
      {
        image: '/images/benefits/sunscreen-invisible.jpg',
        text: 'Invisibly Seamless'
      },
      {
        image: '/images/benefits/sunscreen-pollution.jpg',
        text: 'Fights Pollution & Free Radicals'
      },
      {
        image: '/images/benefits/sunscreen-pigmentation.jpg',
        text: 'Prevents Pigmentation'
      },
      {
        image: '/images/benefits/sunscreen-gentle.jpg',
        text: 'Gentle & Soothing'
      }
    ],
    ingredients: [
      {
        name: 'Advanced UV Filters',
        description: 'Form a reliable, broad-spectrum shield against UVA and UVB rays, ensuring your skin is protected all day.',
        benefits: ['Sun protection', 'Deep hydration & moisture']
      },
      {
        name: 'Niacinamide',
        description: 'The Skin Restorer Helps brighten, improve uneven skin tone, and calm redness for a clear, healthy glow.',
        benefits: ['Reducing dark spots and pigmentation', 'Reducing inflammation']
      },
      {
        name: 'Hyaluronic Acid',
        description: 'The Deep Moisture Magnet Draws in and locks moisture, leaving your skin soft, plump, and hydrated all day.',
        benefits: ['Deep hydration', 'Reducing the appearance of fine lines and wrinkles']
      },
      {
        name: 'Blue Light & Pollution Defense',
        description: 'Environmental Shield Protects against blue light, pollution, and environmental aggressors that cause premature aging.',
        benefits: ['Protection from blue light', 'Anti-pollution shield']
      },
      {
        name: 'Ceramides',
        description: 'The Resilience Builders Replenish and reinforce your skin\'s natural barrier, helping your skin stay strong and moisture-rich.',
        benefits: ['Strengthening skin barrier', 'Deep hydration & moisture']
      }
    ],
    faq: [
      {
        title: 'Ingredients and Claims',
        questions: [
          {
            question: 'Are the UV filters used in this sunscreen safe?',
            answer: 'Yes, it contains approved, advanced UV filters that are safe and effective for daily use, providing reliable broad-spectrum protection.'
          },
          {
            question: 'What are the key active ingredients?',
            answer: 'It includes nourishing ceramides, niacinamide, hydrating hyaluronic acid, and squalane to support skin barrier and hydration.'
          },
          {
            question: 'Is this sunscreen suitable for sensitive skin?',
            answer: 'Absolutely. It is dermatologically tested, fragrance-free, and formulated to be gentle for sensitive and reactive skin.'
          },
          {
            question: 'Will it cause breakouts or clog pores?',
            answer: 'No, it\'s oil-free, non-comedogenic, and suitable for oily or acne-prone skin.'
          },
          {
            question: 'Can I wear it on my body?',
            answer: 'Yes, it\'s suitable for all exposed areas—arms, shoulders, back—enabling full-body sun protection.'
          }
        ]
      },
      {
        title: 'Usage and Application',
        questions: [
          {
            question: 'How does SPF 50+ PA++++ protect my skin?',
            answer: 'It provides high-level broad-spectrum protection against UVA and UVB rays, preventing sunburn, skin aging, and long-term damage.'
          },
          {
            question: 'How often should I reapply sunscreen?',
            answer: 'Reapply every 2-3 hours when outdoors, after swimming, sweating, or towel-drying.'
          },
          {
            question: 'Can I wear sunscreen under makeup?',
            answer: 'Yes! Its lightweight, absorbs quickly and creates a smooth base for makeup.'
          },
          {
            question: 'How much sunscreen should I use?',
            answer: 'About a coin-sized amount for your face and neck, enough to cover all exposed areas thoroughly.'
          },
          {
            question: 'Do I need to apply sunscreen if I\'m at home?',
            answer: 'Yes—UV rays and pollution penetrate windows too. Daily application helps protect your skin from indoor and outdoor environmental stress.'
          },
          {
            question: 'Can I use this sunscreen every day?',
            answer: 'Yes! It\'s designed for daily protection—perfect for face, neck, and exposed skin.'
          },
          {
            question: 'Does it work with other skincare products?',
            answer: 'Yes! It layers well over serums and moisturizers and works beneath makeup smoothly.'
          }
        ]
      }
    ],
  
    specifications: {
      volume: '75ml',
      weight: '75g',
      spf: '50+',
      pa: '++++',
      skinType: ['all'],
      ageGroup: ['all']
    },
    inventory: {
      stock: 80,
      lowStockThreshold: 10,
      trackInventory: true
    },
    ratings: {
      average: 5.0,
      count: 4
    },
    isActive: true,
    isFeatured: true,
    tags: ['sunscreen', 'spf50', 'sun-protection', 'no-white-cast', 'blue-light-protection'],
    seo: {
      metaTitle: 'Melita Ultra Protecting Sunscreen SPF 50+ PA++++',
      metaDescription:
        'High protection sunscreen SPF 50+ PA++++ with no white cast. Gel-cream texture with ceramides and niacinamide. Blue light and pollution defense.',
      keywords: ['sunscreen spf 50', 'sun protection', 'pa++++', 'no white cast sunscreen', 'blue light protection']
    }
  },

    {
      name: 'Melita Barrier Boost Combo',
      slug: 'barrier-boost-combo',
      description:
        'Support your skin barrier with two high-performance hydrators that work better together. The Ultra Hydrating Essence delivers a 400% boost in moisture, prepping your skin with a water-light layer of hydration powered by Squalane, Hyaluronic Acid, and Peptides. Follow it up with the Balancing Moisturizer, a silky gel-cream rich in Ceramides, Glycolic Acid, and Squalane to nourish deeply and reinforce your barrier from within.',
      shortDescription: 'Deep hydration. Stronger skin. Everyday balance.',
      price: 2299,
      originalPrice: 2798,
      category: 'combo',
      skinType: ['dry', 'sensitive', 'normal'],
      images: {
        primary: '/images/products/combo1.jpg',
        hover: '/images/products/combo2.jpg',
        gallery: ['/images/products/combo1.jpg', '/images/products/combo2.jpg']
      },
      benefits: [
        {
          image: '/images/benefits/hydration.jpg',
          text: 'Delivers Deep, Lasting Hydration'
        },
        {
          image: '/images/benefits/barrier.jpg',
          text: 'Strengthens the Skin Barrier'
        },
        {
          image: '/images/benefits/calm.jpg',
          text: 'Calms Sensitivity and Redness'
        },
        {
          image: '/images/benefits/texture.jpg',
          text: 'Improves Skin Texture Over Time'
        }
      ],
      ingredients: [
        {
          name: 'Squalane',
          description: 'A lightweight, plant-derived oil that mimics skin\'s natural oils',
          benefits: ['Deep hydration', 'Barrier protection', 'Non-comedogenic']
        },
        {
          name: 'Hyaluronic Acid',
          description: 'A powerful humectant that can hold up to 1000x its weight in water',
          benefits: ['Intense moisture retention', 'Plumps skin', 'Reduces fine lines']
        },
        {
          name: 'Ceramides',
          description: 'Essential lipids that form the skin barrier',
          benefits: ['Repairs barrier', 'Locks in moisture', 'Prevents water loss']
        },
        {
          name: 'Peptides',
          description: 'Amino acid chains that support skin structure',
          benefits: ['Boosts collagen', 'Firms skin', 'Anti-aging benefits']
        },
        {
          name: 'Glycolic Acid',
          description: 'A gentle alpha-hydroxy acid that exfoliates',
          benefits: ['Smooths texture', 'Brightens skin', 'Improves absorption']
        }
      ],
      faq: [
        {
          title: 'Ingredients & Claims',
          questions: [
            {
              question: 'Does the essence feel sticky or leave residue?',
              answer: 'Not at all. It has a water-light texture that absorbs quickly without any stickiness.'
            },
            {
              question: 'Will the moisturizer feel too heavy in humid weather?',
              answer: "No, it's a gel-cream formula designed to hydrate deeply without clogging pores or feeling greasy."
            }
          ]
        },
        {
          title: 'Skin Compatibility',
          questions: [
            {
              question: 'Can oily skin types use this combo?',
              answer: 'The essence is suitable for all skin types, including oily skin, thanks to its water-light texture. However, the Balancing Moisturizer is more nourishing and best suited for normal to dry skin. As a duo, this combo may not be ideal for oily or acne-prone skin.'
            },
            {
              question: 'Is this combo good for dry or sensitive skin?',
              answer: "Absolutely. It's formulated with skin-repairing and hydrating ingredients like Squalane, Ceramides, and Hyaluronic Acid—perfect for dry, reactive, or compromised skin."
            }
          ]
        },
        {
          title: 'Usage & Application',
          questions: [
            {
              question: 'Can I use this combo day and night?',
              answer: 'Yes! Both the essence and moisturizer are suitable for AM and PM use.'
            },
            {
              question: 'In what order should I apply them?',
              answer: 'Always apply the essence first, followed by the moisturizer.'
            }
          ]
        }
      ],
    
      specifications: {
        volume: 'Combo Pack',
        weight: '200g',
        skinType: ['dry', 'sensitive', 'normal'],
        ageGroup: ['all']
      },
      inventory: {
        stock: 25,
        lowStockThreshold: 5,
        trackInventory: true
      },
      ratings: {
        average: 4.93,
        count: 14
      },
      isActive: true,
      isFeatured: true,
      tags: ['combo', 'barrier-care', 'sensitive-skin', 'hydration', '400% moisture boost'],
      seo: {
        metaTitle: 'Melita Barrier Boost Combo - Deep Hydration & Barrier Support',
        metaDescription:
          'Support your skin barrier with Ultra Hydrating Essence (400% moisture boost) and Balancing Moisturizer. Deep hydration, stronger skin, everyday balance.',
        keywords: ['barrier boost', 'hydrating essence', 'skin barrier', 'ceramides', 'squalane']
      }
    },
    {
      name: 'Melita Dry Skin Daily Essentials',
      slug: 'dry-skin-daily-essentials',
      description:
        'This complete routine is made for dry, dull, or compromised skin that needs barrier repair, deep hydration, and daily protection. Start with the Renewing Cleanser to gently remove buildup without stripping your skin. Follow with the Ultra Hydrating Essence, clinically shown to boost hydration by up to 400%. Seal it all in with the Balancing Moisturizer, packed with Ceramides, Squalane, and Glycolic Acid. Top it off with the Ultra Protecting Sunscreen, a gel-cream SPF 50+ that defends your skin from UV and blue light without greasiness.',
      shortDescription: '4 steps. All-day comfort. Skin that feels cared for.',
      price: 3606,
      originalPrice: 4623,
      category: 'kit',
      skinType: ['dry', 'sensitive', 'normal'],
      images: {
        primary: '/images/products/dryskin1.jpg',
        hover: '/images/products/dryskin2.jpg',
        gallery: ['/images/products/dryskin1.jpg', '/images/products/dryskin2.jpg']
      },
      benefits: [
        {
          image: '/images/benefits/hydration-deep.jpg',
          text: 'Deeply hydrates at every step'
        },
        {
          image: '/images/benefits/repair.jpg',
          text: 'Repairs and strengthens the skin barrier'
        },
        {
          image: '/images/benefits/comfort.jpg',
          text: 'Reduces flakiness, tightness, and discomfort'
        },
        {
          image: '/images/benefits/protection.jpg',
          text: 'Shields skin from UV, blue light, and pollution'
        },
        {
          image: '/images/benefits/smooth.jpg',
          text: 'Smooths texture and restores glow'
        },
        {
          image: '/images/benefits/balance.jpg',
          text: 'Delivers all-day comfort and balance'
        }
      ],
      ingredients: [
        {
          name: 'Ceramides',
          description: 'Essential lipids that strengthen the skin barrier',
          benefits: ['Barrier repair', 'Moisture retention', 'Reduces tightness']
        },
        {
          name: 'Hyaluronic Acid',
          description: 'Powerful hydrator that plumps and moisturizes',
          benefits: ['400% hydration boost', 'Reduces flakiness', 'Plumps skin']
        },
        {
          name: 'Squalane',
          description: 'Lightweight oil that locks in moisture',
          benefits: ['Deep nourishment', 'Non-greasy hydration', 'Softens skin']
        },
        {
          name: 'Glycolic Acid',
          description: 'Gentle exfoliant that smooths texture',
          benefits: ['Removes dead skin', 'Improves glow', 'Enhances absorption']
        }
      ],
      faq: [
        {
          title: 'Skin Compatibility',
          questions: [
            {
              question: 'Is this combo suitable for very dry or sensitive skin?',
              answer: "Yes. It's formulated with barrier-repairing ingredients like Ceramides, Squalane, and Hyaluronic Acid to comfort and protect dry, reactive skin."
            },
            {
              question: 'Will it help with flakiness or tightness?',
              answer: 'Definitely. The essence and moisturizer work together to hydrate deeply and relieve that tight, uncomfortable feeling.'
            }
          ]
        },
        {
          title: 'Usage & Application',
          questions: [
            {
              question: 'Can I apply actives with this routine?',
              answer: 'Absolutely. This routine helps support your skin barrier, making it safe to layer with ingredients like Vitamin C or Retinol.'
            },
            {
              question: 'Can I use this routine both morning and night?',
              answer: 'Yes. Use all four products in the morning (with sunscreen) and skip sunscreen at night.'
            }
          ]
        }
      ],
   
      specifications: {
        volume: 'Bundle Pack (4 products)',
        weight: '300g',
        spf: 'SPF 50+',
        skinType: ['dry', 'sensitive', 'normal'],
        ageGroup: ['all']
      },
      inventory: {
        stock: 20,
        lowStockThreshold: 5,
        trackInventory: true
      },
      ratings: {
        average: 4.75,
        count: 4
      },
      isActive: true,
      isFeatured: true,
      tags: ['dry-skin', 'complete-routine', 'barrier-repair', 'SPF', '4-step'],
      seo: {
        metaTitle: 'Melita Dry Skin Daily Essentials - Complete 4-Step Routine',
        metaDescription:
          'Complete routine for dry skin with cleanser, essence, moisturizer & SPF 50+ sunscreen. Repairs barrier, delivers deep hydration, all-day comfort.',
        keywords: ['dry skin routine', 'barrier repair', 'hydration kit', 'SPF 50', 'complete skincare']
      }
    },
    {
      name: 'Melita Oily Skin Daily Essentials',
      slug: 'oily-skin-daily-essentials',
      description:
        'This 3-step routine is designed to gently cleanse, deeply hydrate, and invisibly protect oily or acne-prone skin—all without heaviness, stickiness, or residue. Start with the Renewing Cleanser, a soap-free gel that foams just enough to lift away excess oil and buildup without disrupting your skin barrier. Follow with the Ultra Hydrating Essence, a featherlight formula that boosts hydration by up to 400%, helping to balance oil production. Finish with the Ultra Protecting Sunscreen, a fragrance-free gel-cream with SPF 50+ that absorbs quickly and leaves no white cast.',
      shortDescription: 'Light on skin. Strong on results.',
      price: 2593,
      originalPrice: 3324,
      category: 'kit',
      skinType: ['oily', 'combination'],
      images: {
        primary: '/images/products/oilyskin1.jpg',
        hover: '/images/products/oilyskin2.jpg',
        gallery: ['/images/products/oilyskin1.jpg', '/images/products/oilyskin2.jpg']
      },
      benefits: [
        {
          image: '/images/benefits/cleanse.jpg',
          text: 'Removes excess oil without stripping'
        },
        {
          image: '/images/benefits/hydrate-light.jpg',
          text: 'Hydrates without clogging pores'
        },
        {
          image: '/images/benefits/soothe.jpg',
          text: 'Soothes and calms active breakouts'
        },
        {
          image: '/images/benefits/protect-sun.jpg',
          text: 'Protects from sun, screen & pollution'
        },
        {
          image: '/images/benefits/layering.jpg',
          text: 'Perfect for layering with actives'
        }
      ],
      ingredients: [
        {
          name: 'Squalane',
          description: 'Lightweight oil that hydrates without clogging pores',
          benefits: ['Non-comedogenic', 'Balances oil', 'Lightweight hydration']
        },
        {
          name: 'Hyaluronic Acid',
          description: 'Water-based hydrator for oil-free moisture',
          benefits: ['400% hydration boost', 'No heaviness', 'Plumps skin']
        },
        {
          name: 'Peptides',
          description: 'Support skin barrier without adding oil',
          benefits: ['Strengthens barrier', 'Reduces breakouts', 'Lightweight']
        }
      ],
      faq: [
        {
          title: 'Usage & Application',
          questions: [
            {
              question: 'Can I use this routine both morning and night?',
              answer: 'Yes. Use the cleanser and essence both AM and PM. Sunscreen is for morning use only.'
            },
            {
              question: 'Do I need to apply moisturizer separately?',
              answer: 'If your skin feels sufficiently hydrated, this combo may be enough. If not, you can add a lightweight, non-comedogenic moisturizer.'
            }
          ]
        }
      ],
    
      specifications: {
        volume: 'Bundle Pack (3 products)',
        weight: '280g',
        spf: 'SPF 50+',
        skinType: ['oily', 'combination'],
        ageGroup: ['all']
      },
      inventory: {
        stock: 30,
        lowStockThreshold: 5,
        trackInventory: true
      },
      ratings: {
        average: 4.71,
        count: 7
      },
      isActive: true,
      isFeatured: true,
      tags: ['oily-skin', 'oil-control', 'non-comedogenic', 'lightweight', '3-step'],
      seo: {
        metaTitle: 'Melita Oily Skin Daily Essentials - Oil Control 3-Step Routine',
        metaDescription:
          'Complete routine for oily & acne-prone skin. Cleanser, essence & SPF 50+ sunscreen. Hydrates without clogging, no white cast, balances oil.',
        keywords: ['oily skin routine', 'oil control', 'non-comedogenic', 'acne-prone', 'lightweight SPF']
      }
    },
    {
      name: 'Melita Barrier Care Starter Duo',
      slug: 'barrier-care-starter-duo',
      description:
        'Start strong with two foundational steps designed to reset your skin and support long-term health. The Renewing Cleanser is a soap-free gel that gently foams to remove dirt, oil, and light makeup without drying or stripping your skin barrier. Follow up with the Ultra Hydrating Essence, a water-light formula powered by Squalane, Hyaluronic Acid, and Peptides. Clinically shown to boost hydration by up to 400%, it absorbs instantly and preps your skin to get more from every step that follows.',
      shortDescription: 'A Simple Start to Healthy Skin',
      price: 1499,
      originalPrice: 1874,
      category: 'combo',
      skinType: ['sensitive', 'dry', 'normal', 'all'],
      images: {
        primary: '/images/products/duo1.jpg',
        hover: '/images/products/duo2.jpg',
        gallery: ['/images/products/duo1.jpg', '/images/products/duo2.jpg']
      },
      benefits: [
        {
          image: '/images/benefits/gentle-cleanse.jpg',
          text: 'Deeply cleanses without stripping'
        },
        {
          image: '/images/benefits/hydration-boost.jpg',
          text: 'Boosts hydration by up to 400%'
        },
        {
          image: '/images/benefits/barrier-support.jpg',
          text: 'Strengthens and supports the skin barrier'
        },
        {
          image: '/images/benefits/calm-irritation.jpg',
          text: 'Soothes and calms irritated skin'
        },
        {
          image: '/images/benefits/minimal.jpg',
          text: 'Minimal routine, maximum impact'
        }
      ],
      ingredients: [
        {
          name: 'Squalane',
          description: 'Mimics skin\'s natural oils for gentle hydration',
          benefits: ['Barrier-safe', 'Non-stripping', 'Locks in moisture']
        },
        {
          name: 'Hyaluronic Acid',
          description: 'Instant hydration that penetrates deeply',
          benefits: ['400% moisture boost', 'Fast absorption', 'No residue']
        },
        {
          name: 'Peptides',
          description: 'Support healthy skin structure',
          benefits: ['Strengthens barrier', 'Preps skin', 'Enhances absorption']
        }
      ],
      faq: [
        {
          title: 'Ingredients & Claims',
          questions: [
            {
              question: 'Does the cleanser foam?',
              answer: 'It gently foams without soap or sulphates, effectively cleansing without stripping.'
            },
            {
              question: 'Does the essence leave a sticky finish?',
              answer: 'Not at all. It has a water-light texture that absorbs quickly with no residue.'
            }
          ]
        },
        {
          title: 'Skin Compatibility',
          questions: [
            {
              question: 'Can I use it if I have oily skin?',
              answer: "Yes—this combo is hydrating without being heavy, and won't clog pores."
            },
            {
              question: 'Is this combo suitable for sensitive or acne-prone skin?',
              answer: 'Absolutely. Both formulas are lightweight, non-comedogenic, and designed to support sensitive, reactive skin.'
            }
          ]
        },
        {
          title: 'Usage & Application',
          questions: [
            {
              question: 'Can I use this duo both morning and night?',
              answer: 'Yes, both the cleanser and essence are gentle enough for daily AM and PM use.'
            },
            {
              question: 'What should I follow up with after using the essence?',
              answer: 'You can apply a moisturizer or any treatment serums you normally use. The essence helps prep your skin to absorb them better.'
            }
          ]
        }
      ],
     
      specifications: {
        volume: 'Duo Pack (2 products)',
        weight: '180g',
        skinType: ['sensitive', 'dry', 'normal', 'all'],
        ageGroup: ['all']
      },
      inventory: {
        stock: 15,
        lowStockThreshold: 3,
        trackInventory: true
      },
      ratings: {
        average: 4.5,
        count: 2
      },
      isActive: true,
      isFeatured: true,
      tags: ['starter-kit', 'barrier-care', 'beginner-friendly', '2-step', 'gentle'],
      seo: {
        metaTitle: 'Melita Barrier Care Starter Duo - Simple Start to Healthy Skin',
        metaDescription:
          'Perfect starter duo with Renewing Cleanser & Ultra Hydrating Essence. 400% hydration boost, barrier-safe, ideal for beginners. Minimal routine, maximum impact.',
        keywords: ['starter kit', 'beginner skincare', 'barrier care', 'gentle cleanser', 'hydrating essence']
      }
    }
  ];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/melita');
    console.log('Connected to MongoDB');

    // Clear existing products
    await Product.deleteMany({});
    console.log('Cleared existing products');

    // Insert sample products
    const products = await Product.insertMany(sampleProducts);
    console.log(`Inserted ${products.length} products`);

    // Create sample users for testing
    const sampleUsers = [];
    const userData = [
      {
        name: 'Test User',
        phone: '+1234567890',
        email: 'test@melita.com',
        rewardPoints: 500,
        loyaltyTier: 'silver'
      },
      {
        name: 'Pooja Chugwani',
        phone: '+1234567891',
        email: 'pooja@example.com',
        rewardPoints: 250,
        loyaltyTier: 'bronze'
      },
      {
        name: 'Aman Singh',
        phone: '+1234567892',
        email: 'aman@example.com',
        rewardPoints: 100,
        loyaltyTier: 'bronze'
      }
    ];

    for (const userInfo of userData) {
      let user = await User.findOne({ phone: userInfo.phone });
      if (!user) {
        user = new User(userInfo);
        await user.save();
        sampleUsers.push(user);
      } else {
        sampleUsers.push(user);
      }
    }

    console.log(`Created/found ${sampleUsers.length} sample users`);

    // Create sample reviews
    await Review.deleteMany({});
    
    const sampleReviews = [
      {
        user: sampleUsers[1]._id, // Pooja Chugwani
        product: products[0]._id, // Cleanser
        rating: 5,
        title: 'Best face wash ever',
        reviewText: 'I love using this face wash. I am already on my second tube. It gently cleans my skin and leaves it fresh, hydrating and clean. I would definitely recommend everyone to go for it.',
        verified: true,
        status: 'approved'
      },
      {
        user: sampleUsers[2]._id, // Aman Singh
        product: products[0]._id, // Cleanser
        rating: 5,
        title: 'Amazing Product!',
        reviewText: 'This product is fantastic. My skin has never felt better. Highly recommend!',
        verified: true,
        status: 'approved'
      },
      {
        user: sampleUsers[0]._id, // Test User
        product: products[0]._id, // Cleanser
        rating: 4,
        title: 'Good but could be better',
        reviewText: 'It works well, but I wish it was a bit more moisturizing. Still a great product overall.',
        verified: false,
        status: 'approved'
      },
      {
        user: sampleUsers[1]._id, // Pooja Chugwani
        product: products[1]._id, // Essence
        rating: 5,
        title: 'Perfect hydration',
        reviewText: 'This essence is amazing! My skin feels so hydrated and plump. The texture is lightweight and absorbs quickly.',
        verified: true,
        status: 'approved'
      },
      {
        user: sampleUsers[2]._id, // Aman Singh
        product: products[1]._id, // Essence
        rating: 4,
        title: 'Great product',
        reviewText: 'Really good essence. Skin feels smooth and hydrated. Would definitely buy again.',
        verified: true,
        status: 'approved'
      }
    ];

    const createdReviews = await Review.insertMany(sampleReviews);
    console.log(`Created ${createdReviews.length} sample reviews`);

    console.log('Database seeded successfully!');
    console.log('\nSample products created:');
    products.forEach(product => {
      console.log(`- ${product.name} (${product.category}) - ₹${product.price}`);
    });

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the seeder
seedDatabase();
