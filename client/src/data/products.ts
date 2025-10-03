// Centralized product catalog
// NOTE: For now we import static assets. Later this can be replaced by an API.

import cleanser1 from '@/assets/product_img/cleanser/cleanser1.jpg';
import cleanser2 from '@/assets/product_img/cleanser/cleanser2.jpg';
import cleanser3 from '@/assets/product_img/cleanser/cleanser3.jpg';
import cleanser4 from '@/assets/product_img/cleanser/cleanser4.jpg';
import cleanser5 from '@/assets/product_img/cleanser/cleanser5.jpg';

import essence1 from '@/assets/product_img/essence/essence1.jpg';
import essence2 from '@/assets/product_img/essence/essence2.jpg';
import essence3 from '@/assets/product_img/essence/essence3.jpg';
import essence4 from '@/assets/product_img/essence/essence4.jpg';
import essence5 from '@/assets/product_img/essence/essence5.jpg';
import essence6 from '@/assets/product_img/essence/essence6.jpg';
import essence7 from '@/assets/product_img/essence/essence7.jpg';
import essence8 from '@/assets/product_img/essence/essence8.jpg';
import essencevid1 from '@/assets/product_img/essence/vid1.mp4';
import moisturizer1 from '@/assets/product_img/moisturizer/moisturizer1.jpg';
import moisturizer2 from '@/assets/product_img/moisturizer/moisturizer2.jpg';
import moisturizer3 from '@/assets/product_img/moisturizer/moisturizer3.jpg';
import moisturizer4 from '@/assets/product_img/moisturizer/moisturizer4.jpg';
import moisturizer5 from '@/assets/product_img/moisturizer/moisturizer5.jpg';
import moisturizer6 from '@/assets/product_img/moisturizer/moisturizer6.jpg';
import moisturizer7 from '@/assets/product_img/moisturizer/moisturizer7.jpg';
import sunscreen1 from '@/assets/product_img/sunscreen/sunscreen1.jpg';
import sunscreen2 from '@/assets/product_img/sunscreen/sunscreen2.jpg';
import sunscreen3 from '@/assets/product_img/sunscreen/sunscreen3.jpg';
import sunscreen4 from '@/assets/product_img/sunscreen/sunscreen4.jpg';
import sunscreen5 from '@/assets/product_img/sunscreen/sunscreen5.jpg';
import sunscreen6 from '@/assets/product_img/sunscreen/sunscreen6.jpg';
import combo1 from '@/assets/product_img/combo.jpg';
import combo2 from '@/assets/product_img/combo2.jpg';
import combo3 from '@/assets/product_img/combo3.jpg';
import combo4 from '@/assets/product_img/combo4.jpg';
import drySkin1 from '@/assets/product_img/dryskin.jpg';
import drySkin2 from '@/assets/product_img/dryskin2.jpg';
import drySkin3 from '@/assets/product_img/dryskin3.jpg';
import drySkin4 from '@/assets/product_img/dryskin4.jpg';

import oilySkin1 from '@/assets/product_img/oilyskin.jpg';
import oilySkin2 from '@/assets/product_img/oilyskin2.jpg';
import oilySkin3 from '@/assets/product_img/oilyskin3.jpg';
import oilySkin4 from '@/assets/product_img/oilyskin4.jpg';
import duo1 from '@/assets/product_img/duo.jpg';
import duo2 from '@/assets/product_img/duo2.jpg';
import duo3 from '@/assets/product_img/duo3.jpg';
import duo4 from '@/assets/product_img/duo4.jpg';


export type Product = {
  id: number;
  slug: string;
  name: string;
  price: string;
  originalPrice: string;
  rating: number;
  reviews: number;
  image: string;
  hoverImage: string;
  gallery?: string[];
  description?: string;
  benefits?: string[];
  benefitimg?: string[];
  videos?: string[];
  relatedproduct?: string[];
};

export const products: Product[] = [
  {
    id: 1,
    slug: 'cleanser',
    name: 'Melita Renewing Gel Cleanser',
    price: '₹335.00',
    originalPrice: '₹375.00',
    rating: 5.0,
    reviews: 5,
    image: cleanser1,
    hoverImage: cleanser2,
    gallery: [cleanser1, cleanser2, cleanser3, cleanser4, cleanser5],
    description:
      'A gentle yet effective cleanser that removes impurities while maintaining the skin barrier.',
    benefits: [
      "Deeply cleanses without stripping natural oils",
      "Refreshes skin with natural extracts",
      "Dermatologically tested for sensitive skin",
    ],
   // benefitimg: [benefit1, benefit2],
   relatedproduct:['moisturizer','essence']
  },
  {
    id: 2,
    slug: 'essence',
    name: 'Melita Ultra Hydrating Essence',
    price: '₹1,199.00',
    originalPrice: '₹1,499.00',
    rating: 4.88,
    reviews: 56,
    image: essence1,
    hoverImage: essence2,
    gallery: [essence1, essence2,essence3,essence4,essence5,essence6,essence7,essence8],
    description: 'Lightweight hydrating essence that penetrates deep into skin layers.',
    benefits: [
      "Deeply cleanses without stripping natural oils",
      "Refreshes skin with natural extracts",
      "Dermatologically tested for sensitive skin",
    ],
    videos: [
      essencevid1,
      // essencevid2,
      // essencevid3,
    ]
  },
  {
    id: 3,
    slug: 'moisturizer',
    name: 'Melita Balancing Moisturizer',
    price: '₹1,099.00',
    originalPrice: '₹1,299.00',
    rating: 4.95,
    reviews: 19,
    image: moisturizer1,
    hoverImage: moisturizer2,
    gallery: [moisturizer1, moisturizer2,moisturizer3,moisturizer4,moisturizer5,moisturizer6,moisturizer7],
    description: 'Provides intense moisturization while balancing oil production.',
    },
  {
    id: 4,
    slug: 'sunscreen',
    name: 'Melita Ultra Protecting Sunscreen',
    price: '₹1,299.00',
    originalPrice: '₹1,450.00',
    rating: 5.0,
    reviews: 4,
    image: sunscreen1,
    hoverImage: sunscreen2,
    gallery: [sunscreen1, sunscreen2,sunscreen3,sunscreen4,sunscreen5,sunscreen6],
    description: 'SPF 50+ PA++++ broad spectrum protection designed for Indian skin.',
  },
  {
    id: 5,
    slug: 'barrier-boost-combo',
    name: 'Melita Barrier Boost Combo',
    price: '₹2,299.00',
    originalPrice: '₹2,798.00',
    rating: 4.93,
    reviews: 14,
    image: combo1,
    hoverImage: combo2,
    gallery: [combo1, combo2,combo3,combo4],
    description: 'Complete skincare routine to strengthen and protect your skin barrier.',
  },
  {
    id: 6,
    slug: 'dry-skin-daily-essentials',
    name: 'Melita Dry Skin Daily Essentials',
    price: '₹3,606.00',
    originalPrice: '₹4,623.00',
    rating: 4.75,
    reviews: 4,
    image: drySkin1,
    hoverImage: drySkin2,
    gallery: [drySkin1, drySkin2,drySkin3,drySkin4],
  },
  {
    id: 7,
    slug: 'oily-skin-daily-essentials',
    name: 'Melita Oily Skin Daily Essentials',
    price: '₹2,593.00',
    originalPrice: '₹3,324.00',
    rating: 4.71,
    reviews: 7,
    image: oilySkin1,
    hoverImage: oilySkin2,
    gallery: [oilySkin1, oilySkin2,oilySkin3,oilySkin4],
  },
  {
    id: 8,
    slug: 'barrier-care-starter-duo',
    name: 'Melita Barrier Care Starter Duo',
    price: '₹1,499.00',
    originalPrice: '₹1,874.00',
    rating: 4.5,
    reviews: 2,
    image: duo1,
    hoverImage: duo2,
    gallery: [duo1, duo2,duo3,duo4],
  },
];

export const getProductById = (id: number) => products.find(p => p.id === id);
export const getProductBySlug = (slug: string) => products.find(p => p.slug === slug);

// ---------------- Live-field helpers (merge only selected fields from backend) ----------------

type ServerProduct = {
  _id: string;
  slug: string;
  name: string;
  price: number | string;
  originalPrice: number | string;
  description?: string;
  ratings?: { average?: number; count?: number };
  benefits?: Array<string | { image?: string; text?: string }>;
};

const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000';

function formatCurrency(val: number | string | undefined): string {
  if (val === undefined || val === null) return '' as unknown as string;
  if (typeof val === 'number') return `₹${val.toFixed(2)}`;
  // if already string, return as-is
  return String(val);
}

function mergeSelectedFields(staticProduct: Product, server: ServerProduct): Product {
  const rating = server.ratings?.average ?? staticProduct.rating ?? 0;
  const reviews = server.ratings?.count ?? staticProduct.reviews ?? 0;
  const benefits = Array.isArray(server.benefits)
    ? server.benefits
        .map((b: any) => (typeof b === 'string' ? b : b?.text))
        .filter(Boolean)
    : staticProduct.benefits;

  return {
    ...staticProduct,
    price: formatCurrency(server.price) || staticProduct.price,
    originalPrice: formatCurrency(server.originalPrice) || staticProduct.originalPrice,
    rating: typeof rating === 'number' ? rating : staticProduct.rating,
    reviews: typeof reviews === 'number' ? reviews : staticProduct.reviews,
    description: server.description ?? staticProduct.description,
    benefits: benefits ?? staticProduct.benefits,
  };
}

export async function getProductBySlugLive(slug: string): Promise<Product | undefined> {
  const base = getProductBySlug(slug);
  if (!base) return undefined;
  try {
    const res = await fetch(`${API_BASE}/products/${slug}`);
    if (!res.ok) return base;
    const json = await res.json();
    const serverProduct: ServerProduct | undefined = json?.data;
    if (!serverProduct) return base;
    return mergeSelectedFields(base, serverProduct);
  } catch {
    return base;
  }
}

export async function getProductsLive(): Promise<Product[]> {
  // Merge per item by slug to ensure we only override needed fields
  const merged: Product[] = await Promise.all(
    products.map(async (p) => {
      try {
        const res = await fetch(`${API_BASE}/products/${p.slug}`);
        if (!res.ok) return p;
        const json = await res.json();
        const serverProduct: ServerProduct | undefined = json?.data;
        if (!serverProduct) return p;
        return mergeSelectedFields(p, serverProduct);
      } catch {
        return p;
      }
    })
  );
  return merged;
}

