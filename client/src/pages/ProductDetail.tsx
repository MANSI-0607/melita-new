// import { useMemo, useState } from 'react';
// import { useParams, Link, useNavigate } from 'react-router-dom';
// import Header from '@/components/Header';
// import Footer from '@/components/Footer';
// import TopStrip from '@/components/TopStrip';
// import { Button } from '@/components/ui/button';
// import { products, getProductById } from '@/data/products';
// import { Star } from 'lucide-react';

// const ProductDetail = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const productId = Number(id);
//   const product = useMemo(() => getProductById(productId), [productId]);

//   const [activeImage, setActiveImage] = useState<string | null>(product?.gallery?.[0] ?? product?.image ?? null);

//   if (!product) {
//     return (
//       <div className="min-h-screen bg-background">
//         <TopStrip />
//         <Header />
//         <main className="container mx-auto px-4 py-16">
//           <p className="text-center">Product not found.</p>
//           <div className="text-center mt-6">
//             <Button onClick={() => navigate('/shop')}>Back to Shop</Button>
//           </div>
//         </main>
//         <Footer />
//       </div>
//     );
//   }

//   const related = products.filter(p => p.id !== product.id).slice(0, 2);

//   return (
//     <div className="min-h-screen bg-background">
//       <TopStrip />
//       <Header />

//       <main className="container mx-auto px-4 py-8 md:py-12">
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
//           {/* Gallery */}
//           <div>
//             {activeImage && (
//               <img
//                 src={activeImage}
//                 alt={product.name}
//                 className="w-full aspect-square object-contain border rounded-md"
//               />
//             )}
//             {product.gallery && product.gallery.length > 0 && (
//               <div className="mt-4 grid grid-cols-5 gap-2">
//                 {product.gallery.map((img, idx) => (
//                   <button
//                     key={idx}
//                     onClick={() => setActiveImage(img)}
//                     className={`border rounded-md overflow-hidden ${activeImage === img ? 'ring-2 ring-[#835339]' : ''}`}
//                   >
//                     <img src={img} alt={`${product.name} ${idx + 1}`} className="w-full h-20 object-cover" />
//                   </button>
//                 ))}
//               </div>
//             )}
//           </div>

//           {/* Details */}
//           <div>
//             <h1 className="font-playfair text-2xl md:text-3xl lg:text-4xl font-bold text-melita-deep-coffee">
//               {product.name}
//             </h1>

//             <div className="flex items-center gap-2 mt-2">
//               <div className="flex text-yellow-400">
//                 {Array.from({ length: 5 }).map((_, i) => (
//                   <Star key={i} size={18} fill="currentColor" stroke="currentColor" />
//                 ))}
//               </div>
//               <span className="text-sm text-gray-700">{product.rating.toFixed(2)}/5 ({product.reviews} reviews)</span>
//             </div>

//             <div className="flex items-baseline gap-3 mt-3">
//               <span className="text-melita-deep-coffee font-bold text-2xl">{product.price}</span>
//               <span className="text-melita-medium line-through">{product.originalPrice}</span>
//             </div>

//             {product.description && (
//               <p className="mt-4 text-gray-700 leading-relaxed">{product.description}</p>
//             )}

//             <div className="mt-6 flex gap-3">
//               <Button className="bg-[#835339] hover:bg-white hover:text-[#835339] hover:border hover:border-[#835339]">
//                 Add to Bag
//               </Button>
//               <Button variant="outline" onClick={() => navigate('/shop')}>Continue Shopping</Button>
//             </div>

//             {/* Buy it with */}
//             {related.length > 0 && (
//               <div className="mt-10">
//                 <h2 className="text-lg font-semibold text-melita-deep-coffee mb-4">BUY IT WITH</h2>
//                 <div className="space-y-3">
//                   {related.map(r => (
//                     <div key={r.id} className="flex items-center justify-between p-3 border rounded-md bg-white">
//                       <div className="flex items-center gap-3">
//                         <img src={r.image} alt={r.name} className="w-16 h-16 object-cover rounded" />
//                         <div>
//                           <Link to={`/products/${r.id}`} className="font-medium hover:underline text-melita-deep-coffee">
//                             {r.name}
//                           </Link>
//                           <div className="text-sm text-gray-700">{r.price}</div>
//                         </div>
//                       </div>
//                       <div className="flex gap-2">
//                         <Button size="sm">Add to Bag</Button>
//                         <Button size="sm" variant="outline" onClick={() => navigate(`/products/${r.id}`)}>Quick View</Button>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       </main>

//       <Footer />
//     </div>
//   );
// };

// export default ProductDetail;
