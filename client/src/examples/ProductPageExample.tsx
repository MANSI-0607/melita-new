// // Example of how to use ProductReview component in a product page
// import React, { useState, useEffect } from 'react';
// import ProductReview from '@/components/ProductReview';
// import apiService from '@/services/api';

// const ProductPageExample = ({ productSlug }) => {
//   const [product, setProduct] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchProduct = async () => {
//       try {
//         const response = await apiService.getProduct(productSlug);
//         setProduct(response.data);
//       } catch (error) {
//         console.error('Failed to fetch product:', error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (productSlug) {
//       fetchProduct();
//     }
//   }, [productSlug]);

//   if (loading) {
//     return <div>Loading product...</div>;
//   }

//   if (!product) {
//     return <div>Product not found</div>;
//   }

//   return (
//     <div className="max-w-7xl mx-auto px-4 py-8">
//       {/* Product Details Section */}
//       <div className="mb-12">
//         <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
//         <p className="text-lg text-gray-600 mb-6">{product.description}</p>
//         <div className="text-2xl font-bold text-green-600">₹{product.price}</div>
//       </div>

//       {/* Product Review Section */}
//       <ProductReview 
//         productId={product._id} 
//         productSlug={product.slug} 
//       />
//     </div>
//   );
// };

// export default ProductPageExample;
