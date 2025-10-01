import Product from '../models/Product.js';
import mongoose from 'mongoose';

// Get all products with filtering and pagination
export const getProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      skinType,
      minPrice,
      maxPrice,
      sort = 'createdAt',
      order = 'desc',
      search,
      featured
    } = req.query;

    // Build filter object
    const filter = { isActive: true };

    if (category) {
      filter.category = category;
    }

    if (skinType) {
      filter.skinType = { $in: [skinType, 'all'] };
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    if (featured === 'true') {
      filter.isFeatured = true;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Sort object
    const sortObj = {};
    sortObj[sort] = order === 'desc' ? -1 : 1;

    // Execute query with pagination
    const products = await Product.find(filter)
      .sort(sortObj)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-__v')
      .lean();

    // Get total count for pagination
    const total = await Product.countDocuments(filter);

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalProducts: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products'
    });
  }
};

// Get single product by ID or slug
export const getProduct = async (req, res) => {
  try {
    const { id } = req.params;
    
    let product;
    
    // Check if ID is ObjectId or slug
    if (mongoose.Types.ObjectId.isValid(id)) {
      product = await Product.findById(id).populate('relatedProducts', 'name slug price images.primary');
    } else {
      product = await Product.findOne({ slug: id }).populate('relatedProducts', 'name slug price images.primary');
    }

    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      data: product
    });

  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product'
    });
  }
};

// Get featured products
export const getFeaturedProducts = async (req, res) => {
  try {
    const { limit = 8 } = req.query;

    const products = await Product.findFeatured()
      .limit(parseInt(limit))
      .select('-__v')
      .lean();

    res.json({
      success: true,
      data: products
    });

  } catch (error) {
    console.error('Get featured products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch featured products'
    });
  }
};

// Get products by category
export const getProductsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { limit = 12 } = req.query;

    const products = await Product.findByCategory(category)
      .limit(parseInt(limit))
      .select('-__v')
      .lean();

    res.json({
      success: true,
      data: products
    });

  } catch (error) {
    console.error('Get products by category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products by category'
    });
  }
};

// Search products
export const searchProducts = async (req, res) => {
  try {
    const { q, limit = 20 } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters'
      });
    }

    const products = await Product.searchProducts(q.trim())
      .limit(parseInt(limit))
      .select('-__v')
      .lean();

    res.json({
      success: true,
      data: products,
      query: q.trim()
    });

  } catch (error) {
    console.error('Search products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search products'
    });
  }
};

// Get product categories
export const getCategories = async (req, res) => {
  try {
    const categories = await Product.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          products: { $push: { name: '$name', slug: '$slug', price: '$price', image: '$images.primary' } }
        }
      },
      {
        $project: {
          category: '$_id',
          count: 1,
          featuredProduct: { $arrayElemAt: ['$products', 0] },
          _id: 0
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      data: categories
    });

  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories'
    });
  }
};

// Get related products
export const getRelatedProducts = async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 4 } = req.query;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Find related products by category and skin type
    const relatedProducts = await Product.find({
      _id: { $ne: product._id },
      isActive: true,
      $or: [
        { category: product.category },
        { skinType: { $in: product.skinType } }
      ]
    })
      .limit(parseInt(limit))
      .select('name slug price images.primary ratings')
      .lean();

    res.json({
      success: true,
      data: relatedProducts
    });

  } catch (error) {
    console.error('Get related products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch related products'
    });
  }
};

// Get product filters (for frontend filter UI)
export const getProductFilters = async (req, res) => {
  try {
    const filters = await Product.aggregate([
      { $match: { isActive: true } },
      {
        $facet: {
          categories: [
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
          ],
          skinTypes: [
            { $unwind: '$skinType' },
            { $group: { _id: '$skinType', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
          ],
          priceRanges: [
            {
              $bucket: {
                groupBy: '$price',
                boundaries: [0, 500, 1000, 2000, 5000, 10000],
                default: '10000+',
                output: { count: { $sum: 1 } }
              }
            }
          ]
        }
      }
    ]);

    res.json({
      success: true,
      data: filters[0]
    });

  } catch (error) {
    console.error('Get product filters error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product filters'
    });
  }
};

// Get only FAQ for a product by slug
export const getProductFaqBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    if (!slug || typeof slug !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Product slug is required'
      });
    }

    const product = await Product.findOne({ slug }).select('faq isActive');

    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    return res.json({
      success: true,
      data: product.faq || []
    });
  } catch (error) {
    console.error('Get product FAQ by slug error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch product FAQ'
    });
  }
};

// Get only product ID for a product by slug
export const getProductIDfromslug = async (req, res) => {
  try {
    const { slug } = req.params;

    if (!slug || typeof slug !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Product slug is required'
      });
    }

    const product = await Product.findOne({ slug }).select('_id isActive');

    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    return res.json({
      success: true,
      data: product._id
    });
  } catch (error) {
    console.error('Get product ID by slug error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch product ID'
    });
  }
};
