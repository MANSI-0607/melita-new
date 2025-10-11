import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Eye, Search, Filter } from 'lucide-react';
import { handleApiResponse, createApiErrorHandler } from '@/utils/errorHandler';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  price: number;
  originalPrice: number;
  discount: number;
  category: string;
  skinType: string[];
  images: {
    primary: string;
    hover?: string;
    gallery?: string[];
    videos?: string[];
  };
  benefits: Array<{
    image: string;
    text: string;
  }>;
  ingredients: Array<{
    name: string;
    description?: string;
    benefits?: string[];
  }>;
  faq: Array<{
    title: string;
    questions: Array<{
      question: string;
      answer: string;
    }>;
  }>;
  specifications: {
    volume?: string;
    weight?: string;
    spf?: string;
    pa?: string;
    skinType?: string[];
    ageGroup?: string[];
  };
  inventory: {
    stock: number;
    lowStockThreshold: number;
    trackInventory: boolean;
  };
  seo: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
  };
  ratings: {
    average: number;
    count: number;
  };
  isActive: boolean;
  isFeatured: boolean;
  tags: string[];
  relatedProducts?: string[];
  createdAt: string;
  updatedAt: string;
}

const categories = ['cleanser', 'essence', 'moisturizer', 'sunscreen', 'combo', 'kit'];
const skinTypes = ['dry', 'oily', 'combination', 'sensitive', 'normal', 'all'];

const AdminProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<Partial<Product>>({});

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('melita_admin_token');
      const response = await fetch(`${API_BASE}/admin/products`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await handleApiResponse(response);
      setProducts((data?.data?.products) || data.products || []);
    } catch (error) {
      const errorHandler = createApiErrorHandler('fetch products', (err) => {
        toast({
          title: 'Error',
          description: err.message,
          variant: 'destructive',
        });
      });
      errorHandler(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('melita_admin_token');
      const response = await fetch(`${API_BASE}/admin/products`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await handleApiResponse(response);

      toast({
        title: 'Success',
        description: data.message || 'Product created successfully',
      });

      setIsCreateDialogOpen(false);
      setFormData({});
      fetchProducts();
    } catch (error) {
      const errorHandler = createApiErrorHandler('create product', (err) => {
        toast({
          title: 'Error',
          description: err.message,
          variant: 'destructive',
        });
      });
      errorHandler(error);
    }
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    try {
      const token = localStorage.getItem('melita_admin_token');
      const response = await fetch(`${API_BASE}/admin/products/${selectedProduct._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await handleApiResponse(response);

      toast({
        title: 'Success',
        description: data.message || 'Product updated successfully',
      });

      setIsEditDialogOpen(false);
      setSelectedProduct(null);
      setFormData({});
      fetchProducts();
    } catch (error) {
      const errorHandler = createApiErrorHandler('update product', (err) => {
        toast({
          title: 'Error',
          description: err.message,
          variant: 'destructive',
        });
      });
      errorHandler(error);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) return;

    try {
      const token = localStorage.getItem('melita_admin_token');
      const response = await fetch(`${API_BASE}/admin/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await handleApiResponse(response);

      toast({
        title: 'Success',
        description: data.message || 'Product deleted successfully',
      });

      fetchProducts();
    } catch (error) {
      const errorHandler = createApiErrorHandler('delete product', (err) => {
        toast({
          title: 'Error',
          description: err.message,
          variant: 'destructive',
        });
      });
      errorHandler(error);
    }
  };

  const handleToggleStatus = async (productId: string, isActive: boolean) => {
    try {
      const token = localStorage.getItem('melita_admin_token');
      const response = await fetch(`${API_BASE}/admin/products/${productId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive }),
      });

      const data = await handleApiResponse(response);

      toast({
        title: 'Success',
        description: data.message || `Product ${isActive ? 'activated' : 'deactivated'} successfully`,
      });

      fetchProducts();
    } catch (error) {
      const errorHandler = createApiErrorHandler('update product status', (err) => {
        toast({
          title: 'Error',
          description: err.message,
          variant: 'destructive',
        });
      });
      errorHandler(error);
    }
  };

  const openEditDialog = (product: Product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      shortDescription: product.shortDescription,
      price: product.price,
      originalPrice: product.originalPrice,
      category: product.category,
      skinType: product.skinType,
      images: product.images,
      inventory: product.inventory,
      specifications: product.specifications,
      seo: product.seo,
      benefits: product.benefits,
      ingredients: product.ingredients,
      faq: product.faq,
      relatedProducts: product.relatedProducts as any,
      isActive: product.isActive,
      isFeatured: product.isFeatured,
      tags: product.tags,
    });
    setIsEditDialogOpen(true);
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Ensure a deterministic order: sort by Mongo ObjectId string (_id)
  const sortedProducts = [...filteredProducts].sort((a, b) => a._id.localeCompare(b._id));

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading products...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <h2 className="text-2xl font-bold">Product Management</h2>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className='mt-2'>
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[95vw] sm:max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Product</DialogTitle>
            </DialogHeader>
            <ProductForm
              formData={formData}
              setFormData={setFormData}
              onSubmit={handleCreateProduct}
              isEditing={false}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Products ({sortedProducts.length})</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedProducts.map((product) => (
                <TableRow key={product._id}>
                  <TableCell>
                    <img
                      src={product.images.primary}
                      alt={product.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{product.name}</div>
                      <div className="text-sm text-muted-foreground">{product.slug}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">₹{product.price}</div>
                      {product.originalPrice > product.price && (
                        <div className="text-sm text-muted-foreground line-through">
                          ₹{product.originalPrice}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={product.inventory.stock > product.inventory.lowStockThreshold ? 'default' : 'destructive'}>
                      {product.inventory.stock} units
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={product.isActive}
                        onCheckedChange={(checked) => handleToggleStatus(product._id, checked)}
                      />
                      <span className="text-sm">
                        {product.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(product)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteProduct(product._id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="w-full sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          <ProductForm
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleUpdateProduct}
            isEditing={true}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Product Form Component
interface ProductFormProps {
  formData: Partial<Product>;
  setFormData: (data: Partial<Product>) => void;
  onSubmit: (e: React.FormEvent) => void;
  isEditing: boolean;
}

const ProductForm: React.FC<ProductFormProps> = ({ formData, setFormData, onSubmit, isEditing }) => {
  const [tagsInput, setTagsInput] = React.useState<string>('');

  const updateFormData = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const updateNestedFormData = (parent: string, field: string, value: any) => {
    setFormData({
      ...formData,
      [parent]: {
        ...(formData[parent as keyof Product] as any),
        [field]: value
      }
    });
  };

  const csvToArray = (value: string) => value.split(',').map(s => s.trim()).filter(Boolean);
  const arrayToCsv = (arr?: string[]) => (arr && arr.length ? arr.join(', ') : '');

  // Keep local tags input in sync with incoming formData.tags
  React.useEffect(() => {
    setTagsInput(arrayToCsv(formData.tags));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Array.isArray(formData.tags) ? formData.tags.join('|') : formData.tags]);

  const handleSubmit = (e: React.FormEvent) => {
    // Sync tags from local input before parent submit
    if (typeof tagsInput === 'string') {
      updateFormData('tags', csvToArray(tagsInput));
    }
    onSubmit(e);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Product Name *</Label>
          <Input
            id="name"
            value={formData.name || ''}
            onChange={(e) => updateFormData('name', e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="category">Category *</Label>
          <Select value={formData.category || ''} onValueChange={(value) => updateFormData('category', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <SelectItem key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          value={formData.description || ''}
          onChange={(e) => updateFormData('description', e.target.value)}
          required
        />
      </div>

      <div>
        <Label htmlFor="shortDescription">Short Description</Label>
        <Textarea
          id="shortDescription"
          value={formData.shortDescription || ''}
          onChange={(e) => updateFormData('shortDescription', e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="price">Price *</Label>
          <Input
            id="price"
            type="number"
            value={formData.price || ''}
            onChange={(e) => updateFormData('price', parseFloat(e.target.value))}
            required
          />
        </div>
        <div>
          <Label htmlFor="originalPrice">Original Price *</Label>
          <Input
            id="originalPrice"
            type="number"
            value={formData.originalPrice || ''}
            onChange={(e) => updateFormData('originalPrice', parseFloat(e.target.value))}
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="primaryImage">Primary Image URL *</Label>
        <Input
          id="primaryImage"
          value={formData.images?.primary || ''}
          onChange={(e) => updateNestedFormData('images', 'primary', e.target.value)}
          required
        />
      </div>

      <div>
        <Label htmlFor="hoverImage">Hover Image URL</Label>
        <Input
          id="hoverImage"
          value={formData.images?.hover || ''}
          onChange={(e) => updateNestedFormData('images', 'hover', e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="gallery">Gallery Image URLs (comma-separated)</Label>
        <Textarea
          id="gallery"
          value={arrayToCsv(formData.images?.gallery)}
          onChange={(e) => updateNestedFormData('images', 'gallery', csvToArray(e.target.value))}
        />
      </div>

      <div>
        <Label htmlFor="videos">Video URLs (comma-separated)</Label>
        <Textarea
          id="videos"
          value={arrayToCsv(formData.images?.videos as any)}
          onChange={(e) => updateNestedFormData('images', 'videos', csvToArray(e.target.value))}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="stock">Stock Quantity</Label>
          <Input
            id="stock"
            type="number"
            value={formData.inventory?.stock || 0}
            onChange={(e) => updateNestedFormData('inventory', 'stock', parseInt(e.target.value))}
          />
        </div>
        <div>
          <Label htmlFor="lowStockThreshold">Low Stock Threshold</Label>
          <Input
            id="lowStockThreshold"
            type="number"
            value={formData.inventory?.lowStockThreshold || 10}
            onChange={(e) => updateNestedFormData('inventory', 'lowStockThreshold', parseInt(e.target.value))}
          />
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="isActive"
            checked={formData.isActive || false}
            onCheckedChange={(checked) => updateFormData('isActive', checked)}
          />
          <Label htmlFor="isActive">Active</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="isFeatured"
            checked={formData.isFeatured || false}
            onCheckedChange={(checked) => updateFormData('isFeatured', checked)}
          />
          <Label htmlFor="isFeatured">Featured</Label>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="tags">Tags (comma-separated)</Label>
          <Input
            id="tags"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            onBlur={() => updateFormData('tags', csvToArray(tagsInput))}
            placeholder="e.g., New, Best Seller, SPF 50+"
          />
        </div>
        <div>
          <Label htmlFor="skinTypeCsv">Skin Types (comma-separated)</Label>
          <Input
            id="skinTypeCsv"
            value={arrayToCsv(formData.skinType as any)}
            onChange={(e) => updateFormData('skinType', csvToArray(e.target.value))}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="volume">Specification: Volume</Label>
          <Input
            id="volume"
            value={formData.specifications?.volume || ''}
            onChange={(e) => updateNestedFormData('specifications', 'volume', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="weight">Specification: Weight</Label>
          <Input
            id="weight"
            value={formData.specifications?.weight || ''}
            onChange={(e) => updateNestedFormData('specifications', 'weight', e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="spf">Specification: SPF</Label>
          <Input
            id="spf"
            value={formData.specifications?.spf || ''}
            onChange={(e) => updateNestedFormData('specifications', 'spf', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="pa">Specification: PA</Label>
          <Input
            id="pa"
            value={formData.specifications?.pa || ''}
            onChange={(e) => updateNestedFormData('specifications', 'pa', e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="specSkinType">Spec Skin Types (comma-separated)</Label>
          <Input
            id="specSkinType"
            value={arrayToCsv(formData.specifications?.skinType)}
            onChange={(e) => updateNestedFormData('specifications', 'skinType', csvToArray(e.target.value))}
          />
        </div>
        <div>
          <Label htmlFor="ageGroup">Age Groups (comma-separated)</Label>
          <Input
            id="ageGroup"
            value={arrayToCsv(formData.specifications?.ageGroup)}
            onChange={(e) => updateNestedFormData('specifications', 'ageGroup', csvToArray(e.target.value))}
          />
        </div>
      </div>

      {/* Benefits Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Label className="text-base font-semibold">Benefits</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              const currentBenefits = (formData as any).benefits || [];
              updateFormData('benefits', [...currentBenefits, { image: '', text: '' }]);
            }}
          >
            + Add Benefit
          </Button>
        </div>
        {((formData as any).benefits || []).map((benefit: any, index: number) => (
          <div key={index} className="grid grid-cols-2 gap-4 p-4 border rounded-lg">
            <div>
              <Label htmlFor={`benefit-image-${index}`}>Image URL</Label>
              <Input
                id={`benefit-image-${index}`}
                value={benefit.image || ''}
                onChange={(e) => {
                  const benefits = [...((formData as any).benefits || [])];
                  benefits[index] = { ...benefits[index], image: e.target.value };
                  updateFormData('benefits', benefits);
                }}
                placeholder="https://example.com/benefit-image.jpg"
              />
            </div>
            <div>
              <Label htmlFor={`benefit-text-${index}`}>Benefit Text</Label>
              <div className="flex gap-2">
                <Input
                  id={`benefit-text-${index}`}
                  value={benefit.text || ''}
                  onChange={(e) => {
                    const benefits = [...((formData as any).benefits || [])];
                    benefits[index] = { ...benefits[index], text: e.target.value };
                    updateFormData('benefits', benefits);
                  }}
                  placeholder="Describe the benefit"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    const benefits = [...((formData as any).benefits || [])];
                    benefits.splice(index, 1);
                    updateFormData('benefits', benefits);
                  }}
                >
                  Remove
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Ingredients Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Label className="text-base font-semibold">Ingredients</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              const currentIngredients = (formData as any).ingredients || [];
              updateFormData('ingredients', [...currentIngredients, { name: '', description: '', benefits: [] }]);
            }}
          >
            + Add Ingredient
          </Button>
        </div>
        {((formData as any).ingredients || []).map((ingredient: any, index: number) => (
          <div key={index} className="p-4 border rounded-lg space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor={`ingredient-name-${index}`}>Ingredient Name</Label>
                <Input
                  id={`ingredient-name-${index}`}
                  value={ingredient.name || ''}
                  onChange={(e) => {
                    const ingredients = [...((formData as any).ingredients || [])];
                    ingredients[index] = { ...ingredients[index], name: e.target.value };
                    updateFormData('ingredients', ingredients);
                  }}
                  placeholder="e.g., Aloe Vera"
                />
              </div>
              <div>
                <Label htmlFor={`ingredient-benefits-${index}`}>Benefits (comma-separated)</Label>
                <Input
                  id={`ingredient-benefits-${index}`}
                  value={Array.isArray(ingredient.benefits) ? ingredient.benefits.join(', ') : ''}
                  onChange={(e) => {
                    const ingredients = [...((formData as any).ingredients || [])];
                    ingredients[index] = { ...ingredients[index], benefits: csvToArray(e.target.value) };
                    updateFormData('ingredients', ingredients);
                  }}
                  placeholder="moisturizing, soothing, anti-inflammatory"
                />
              </div>
            </div>
            <div>
              <Label htmlFor={`ingredient-description-${index}`}>Description</Label>
              <div className="flex gap-2">
                <Textarea
                  id={`ingredient-description-${index}`}
                  value={ingredient.description || ''}
                  onChange={(e) => {
                    const ingredients = [...((formData as any).ingredients || [])];
                    ingredients[index] = { ...ingredients[index], description: e.target.value };
                    updateFormData('ingredients', ingredients);
                  }}
                  placeholder="Describe the ingredient and its properties"
                  rows={2}
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    const ingredients = [...((formData as any).ingredients || [])];
                    ingredients.splice(index, 1);
                    updateFormData('ingredients', ingredients);
                  }}
                >
                  Remove
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* FAQ Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Label className="text-base font-semibold">FAQ</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              const currentFaq = (formData as any).faq || [];
              updateFormData('faq', [...currentFaq, { title: '', questions: [{ question: '', answer: '' }] }]);
            }}
          >
            + Add FAQ Section
          </Button>
        </div>
        {((formData as any).faq || []).map((faqSection: any, sectionIndex: number) => (
          <div key={sectionIndex} className="p-4 border rounded-lg space-y-3">
            <div className="flex gap-2">
              <div className="flex-1">
                <Label htmlFor={`faq-title-${sectionIndex}`}>Section Title</Label>
                <Input
                  id={`faq-title-${sectionIndex}`}
                  value={faqSection.title || ''}
                  onChange={(e) => {
                    const faq = [...((formData as any).faq || [])];
                    faq[sectionIndex] = { ...faq[sectionIndex], title: e.target.value };
                    updateFormData('faq', faq);
                  }}
                  placeholder="e.g., General, Usage, Ingredients"
                />
              </div>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => {
                  const faq = [...((formData as any).faq || [])];
                  faq.splice(sectionIndex, 1);
                  updateFormData('faq', faq);
                }}
              >
                Remove Section
              </Button>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-sm font-medium">Questions</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const faq = [...((formData as any).faq || [])];
                    const questions = [...(faq[sectionIndex].questions || [])];
                    questions.push({ question: '', answer: '' });
                    faq[sectionIndex] = { ...faq[sectionIndex], questions };
                    updateFormData('faq', faq);
                  }}
                >
                  + Add Question
                </Button>
              </div>
              {(faqSection.questions || []).map((qa: any, qaIndex: number) => (
                <div key={qaIndex} className="grid grid-cols-2 gap-4 p-3 bg-gray-50 rounded">
                  <div>
                    <Label htmlFor={`question-${sectionIndex}-${qaIndex}`}>Question</Label>
                    <Input
                      id={`question-${sectionIndex}-${qaIndex}`}
                      value={qa.question || ''}
                      onChange={(e) => {
                        const faq = [...((formData as any).faq || [])];
                        const questions = [...faq[sectionIndex].questions];
                        questions[qaIndex] = { ...questions[qaIndex], question: e.target.value };
                        faq[sectionIndex] = { ...faq[sectionIndex], questions };
                        updateFormData('faq', faq);
                      }}
                      placeholder="What is this product used for?"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`answer-${sectionIndex}-${qaIndex}`}>Answer</Label>
                    <div className="flex gap-2">
                      <Textarea
                        id={`answer-${sectionIndex}-${qaIndex}`}
                        value={qa.answer || ''}
                        onChange={(e) => {
                          const faq = [...((formData as any).faq || [])];
                          const questions = [...faq[sectionIndex].questions];
                          questions[qaIndex] = { ...questions[qaIndex], answer: e.target.value };
                          faq[sectionIndex] = { ...faq[sectionIndex], questions };
                          updateFormData('faq', faq);
                        }}
                        placeholder="This product is designed for..."
                        rows={2}
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          const faq = [...((formData as any).faq || [])];
                          const questions = [...faq[sectionIndex].questions];
                          questions.splice(qaIndex, 1);
                          faq[sectionIndex] = { ...faq[sectionIndex], questions };
                          updateFormData('faq', faq);
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div>
        <Label htmlFor="relatedProducts">Related Product IDs (comma-separated ObjectIds)</Label>
        <Textarea
          id="relatedProducts"
          value={Array.isArray((formData as any).relatedProducts) ? ((formData as any).relatedProducts as any[]).join(', ') : ''}
          onChange={(e) => updateFormData('relatedProducts', csvToArray(e.target.value))}
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="submit">
          {isEditing ? 'Update Product' : 'Create Product'}
        </Button>
      </div>
    </form>
  );
};

export default AdminProducts;
