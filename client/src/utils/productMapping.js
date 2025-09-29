// Product ID mapping between frontend and backend
// This maps the frontend product IDs to the backend MongoDB ObjectIds

export const PRODUCT_ID_MAPPING = {
  1: '65c7b1d0e1c2d3a4b5f6e7c8', // cleanser
  2: '65c7b1d0e1c2d3a4b5f6e7c9', // essence  
  3: '65c7b1d0e1c2d3a4b5f6e7ca', // moisturizer
  4: '65c7b1d0e1c2d3a4b5f6e7cb', // sunscreen
  5: '65c7b1d0e1c2d3a4b5f6e7cc', // dry skin combo
  6: '65c7b1d0e1c2d3a4b5f6e7cd', // oily skin combo
  7: '65c7b1d0e1c2d3a4b5f6e7ce', // barrier boost combo
  8: '65c7b1d0e1c2d3a4b5f6e7cf', // barrier care starter duo
};

// Get backend product ID from frontend product ID
export const getBackendProductId = (frontendId) => {
  return PRODUCT_ID_MAPPING[frontendId];
};

// Get frontend product ID from slug
export const getFrontendProductId = (slug) => {
  const slugToId = {
    'cleanser': 1,
    'essence': 2,
    'moisturizer': 3,
    'sunscreen': 4,
    'dry-skin-daily-essentials': 5,
    'oily-skin-daily-essentials': 6,
    'barrier-boost-combo': 7,
    'barrier-care-starter-duo': 8,
  };
  return slugToId[slug];
};

// Get backend product ID from slug
export const getBackendProductIdFromSlug = (slug) => {
  const frontendId = getFrontendProductId(slug);
  return getBackendProductId(frontendId);
};
