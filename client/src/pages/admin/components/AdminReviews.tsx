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
import { Search, Filter, Star, Trash2, Plus } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

interface Review {
  _id: string;
  user?: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  userName?: string; // For admin-created reviews
  product: {
    _id: string;
    name: string;
    slug: string;
  };
  rating: number;
  title: string;
  comment: string;
  reviewText: string;
  isVerified: boolean;
  isApproved: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
  customDate?: string;
  images?: { url: string; alt?: string }[];
}

interface Product {
  _id: string;
  name: string;
  slug: string;
}

const AdminReviews: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [imageDialogItems, setImageDialogItems] = useState<{ url: string; alt?: string }[]>([]);
  const [formData, setFormData] = useState({
    userName: '',
    productId: '',
    rating: 5,
    title: '',
    reviewText: '',
    customDate: '',
    isApproved: true,
    isVerified: false
  });

  const resolveImageUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) return url;
    return `${API_BASE}${url.startsWith('/') ? url : `/${url}`}`;
  };

  useEffect(() => {
    fetchReviews();
    fetchProducts();
  }, []);

  const fetchReviews = async () => {
    try {
      const token = localStorage.getItem('melita_admin_token');
      const response = await fetch(`${API_BASE}/admin/reviews`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to fetch reviews');
      
      const data = await response.json();
      setReviews((data?.data?.reviews) || data.reviews || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch reviews',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('melita_admin_token');
      const response = await fetch(`${API_BASE}/admin/products`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to fetch products');
      
      const data = await response.json();
      setProducts((data?.data?.products) || data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleCreateReview = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('melita_admin_token');
      const response = await fetch(`${API_BASE}/admin/reviews`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create review');
      }

      toast({
        title: 'Success',
        description: 'Review created successfully',
      });

      setIsCreateDialogOpen(false);
      setFormData({
        userName: '',
        productId: '',
        rating: 5,
        title: '',
        reviewText: '',
        customDate: '',
        isApproved: true,
        isVerified: false
      });
      fetchReviews();
    } catch (error) {
      console.error('Error creating review:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create review',
        variant: 'destructive',
      });
    }
  };

  const handleToggleApproval = async (reviewId: string, isApproved: boolean) => {
    try {
      const token = localStorage.getItem('melita_admin_token');
      const response = await fetch(`${API_BASE}/admin/reviews/${reviewId}/approval`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isApproved }),
      });

      if (!response.ok) throw new Error('Failed to update review approval');

      toast({
        title: 'Success',
        description: `Review ${isApproved ? 'approved' : 'unapproved'} successfully`,
      });

      fetchReviews();
    } catch (error) {
      console.error('Error updating review approval:', error);
      toast({
        title: 'Error',
        description: 'Failed to update review approval',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return;

    try {
      const token = localStorage.getItem('melita_admin_token');
      const response = await fetch(`${API_BASE}/admin/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to delete review');

      toast({
        title: 'Success',
        description: 'Review deleted successfully',
      });

      fetchReviews();
    } catch (error) {
      console.error('Error deleting review:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete review',
        variant: 'destructive',
      });
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = (review.user?.name || review.userName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (review.product?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (review.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (review.reviewText || review.comment || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesStatus = true;
    if (statusFilter === 'approved') matchesStatus = review.status === 'approved';
    else if (statusFilter === 'pending') matchesStatus = review.status === 'pending';
    else if (statusFilter === 'verified') matchesStatus = review.isVerified;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading reviews...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <h2 className="text-2xl font-bold">Review Management</h2>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className='mt-2'>
              <Plus className="w-4 h-4 mr-2 " />
              Create Review
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[95vw] sm:max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Review</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateReview} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="userName">User Name *</Label>
                  <Input
                    id="userName"
                    value={formData.userName}
                    onChange={(e) => setFormData(prev => ({ ...prev, userName: e.target.value }))}
                    placeholder="Enter user name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="productId">Product *</Label>
                  <Select value={formData.productId} onValueChange={(value) => setFormData(prev => ({ ...prev, productId: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select product" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map(product => (
                        <SelectItem key={product._id} value={product._id}>
                          {product.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="rating">Rating *</Label>
                  <Select value={formData.rating.toString()} onValueChange={(value) => setFormData(prev => ({ ...prev, rating: parseInt(value) }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 Stars</SelectItem>
                      <SelectItem value="4">4 Stars</SelectItem>
                      <SelectItem value="3">3 Stars</SelectItem>
                      <SelectItem value="2">2 Stars</SelectItem>
                      <SelectItem value="1">1 Star</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="customDate">Review Date</Label>
                  <Input
                    id="customDate"
                    type="date"
                    value={formData.customDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, customDate: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="title">Review Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter review title"
                  required
                />
              </div>

              <div>
                <Label htmlFor="reviewText">Review Text *</Label>
                <Textarea
                  id="reviewText"
                  value={formData.reviewText}
                  onChange={(e) => setFormData(prev => ({ ...prev, reviewText: e.target.value }))}
                  placeholder="Enter review text"
                  rows={4}
                  required
                />
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isApproved"
                    checked={formData.isApproved}
                    onChange={(e) => setFormData(prev => ({ ...prev, isApproved: e.target.checked }))}
                  />
                  <Label htmlFor="isApproved">Approved</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isVerified"
                    checked={formData.isVerified}
                    onChange={(e) => setFormData(prev => ({ ...prev, isVerified: e.target.checked }))}
                  />
                  <Label htmlFor="isVerified">Verified Purchase</Label>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Create Review
                </Button>
              </div>
            </form>
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
                  placeholder="Search reviews..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Reviews</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="pending">Pending Approval</SelectItem>
                <SelectItem value="verified">Verified Purchase</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Reviews Table */}
      <Card>
        <CardHeader>
          <CardTitle>Reviews ({filteredReviews.length})</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Review</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Images</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReviews.map((review) => (
                <TableRow key={review._id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600">
                          {(review.userName || review.user?.name || 'U').charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium">{review.userName || review.user?.name || 'Unknown'}</div>
                        <div className="text-sm text-muted-foreground">
                          {review.user?.phone || (review.user ? '—' : 'Admin Created')}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{review.product?.name || 'Unknown Product'}</div>
                      <div className="text-sm text-muted-foreground">{review.product?.slug || '—'}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                      {[...Array(5 - review.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-gray-300" />
                      ))}
                      <span className="ml-2 text-sm text-muted-foreground">({review.rating})</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{review.title}</div>
                      <div className="text-sm text-muted-foreground line-clamp-2">
                        {review.reviewText || review.comment}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <Badge variant={review.status === 'approved' ? 'default' : 'secondary'}>
                        {review.status === 'approved' ? 'Approved' : 'Pending'}
                      </Badge>
                      {review.isVerified && (
                        <Badge variant="outline" className="text-xs">
                          Verified
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {review.customDate 
                        ? new Date(review.customDate).toLocaleDateString()
                        : new Date(review.createdAt).toLocaleDateString()
                      }
                      {review.customDate && (
                        <div className="text-xs text-muted-foreground">Custom</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {Array.isArray(review.images) && review.images.length > 0 ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setImageDialogItems(review.images || []);
                          setImageDialogOpen(true);
                        }}
                      >
                        View Images ({review.images.length})
                      </Button>
                    ) : (
                      <span className="text-xs text-muted-foreground">No images</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={review.status === 'approved'}
                          onCheckedChange={(checked) => handleToggleApproval(review._id, checked)}
                        />
                        <span className="text-xs">Approve</span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteReview(review._id)}
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

      {/* Images Dialog */}
      <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Attached Images</DialogTitle>
          </DialogHeader>
          {imageDialogItems.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {imageDialogItems.map((img, idx) => (
                <a
                  key={idx}
                  href={resolveImageUrl(img.url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <img
                    src={resolveImageUrl(img.url)}
                    alt={img.alt || `Review image ${idx + 1}`}
                    className="w-full h-36 object-cover rounded"
                    loading="lazy"
                  />
                </a>
              ))}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">No images attached.</div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminReviews;
