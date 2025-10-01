// Simple in-memory cache for slug -> backend _id
const productIdCache = {};

// Resolve backend product _id from slug using backend route GET /products/slug/:slug
export const getBackendProductIdFromSlug = async (slug) => {
  if (!slug) return null;
  if (productIdCache[slug]) return productIdCache[slug];

  try {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const res = await fetch(`${baseUrl}/products/slug/${encodeURIComponent(slug)}`);

    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      throw new Error('Backend did not return JSON');
    }

    const json = await res.json();
    // Expected: { success: true, data: "<mongoId>" }
    if (!json?.success || !json?.data) {
      throw new Error(json?.message || 'Failed to fetch product ID');
    }

    const id = json.data;
    productIdCache[slug] = id;
    return id;
  } catch (err) {
    console.error('Error fetching backend product ID:', err);
    return null;
  }
};


