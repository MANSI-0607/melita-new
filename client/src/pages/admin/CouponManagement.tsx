import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  ToggleLeft, 
  ToggleRight,
  Calendar,
  Percent,
  DollarSign,
  Users,
  Globe
} from 'lucide-react';
import { format } from 'date-fns';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface Coupon {
  _id: string;
  code: string;
  type: 'fixed' | 'percentage';
  value: number;
  userId?: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  userPhone?: string;
  allowedUserIds?: Array<{ _id: string; name?: string; phone?: string }>;
  allowedPhones?: string[];
  isGlobal: boolean;
  isActive: boolean;
  usageLimit: number;
  minOrderAmount: number;
  maxDiscountAmount?: number;
  validFrom: string;
  validUntil?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

interface CouponStats {
  total: number;
  active: number;
  inactive: number;
  expired: number;
  global: number;
  userSpecific: number;
}

const CouponManagement = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [stats, setStats] = useState<CouponStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const { toast } = useToast();
  // Form state
  const [formData, setFormData] = useState({
    code: '',
    type: 'percentage' as 'fixed' | 'percentage',
    value: '',
    usageLimit: '',
    minOrderAmount: '',
    maxDiscountAmount: '',
    validFrom: '',
    validUntil: '',
    description: '',
    isGlobal: false,
    userPhone: '',
    allowedPhonesText: '' // comma or newline separated phones
  });

  useEffect(() => {
    fetchCoupons();
    fetchStats();
  }, [searchTerm, filterType, filterStatus]);

  const fetchCoupons = async () => {
    try {
      const params = new URLSearchParams();
      params.append('page', '1');
      params.append('limit', '10');
      if (searchTerm) params.append('search', searchTerm);
      if (filterType !== 'all') params.append('type', filterType);
      if (filterStatus !== 'all') params.append('isActive', filterStatus);
      
      const response = await api.get(`/admin/coupons?${params.toString()}`);
      const raw = (response as any).data;
      const payload = raw && raw.success ? raw.data : raw;
      const list = payload?.coupons || [];
      setCoupons(Array.isArray(list) ? list : []);
    } catch (error: any) {
      console.error('Fetch coupons error:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || error.message || "Failed to fetch coupons",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/coupons/stats');
      const raw = (response as any).data;
      const stats = raw && raw.success ? raw.data : raw;
      if (stats && typeof stats === 'object' && 'total' in stats) {
        setStats(stats as any);
      } else {
        console.error('Invalid stats response structure:', stats);
      }
    } catch (error: any) {
      console.error('Failed to fetch coupon stats:', error);
      toast({
        title: "Warning",
        description: "Failed to fetch coupon statistics",
        variant: "destructive"
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Parse multiple phones from textarea
      const allowedPhones = (formData.allowedPhonesText || '')
        .split(/[,\n]/)
        .map(s => s.trim())
        .filter(Boolean)
        .map(s => s.replace(/\D/g, ''))
        .filter(s => s.length >= 10);
      const payload = {
        ...formData,
        value: parseFloat(formData.value),
        usageLimit: parseInt(formData.usageLimit),
        minOrderAmount: parseFloat(formData.minOrderAmount),
        maxDiscountAmount: formData.maxDiscountAmount ? parseFloat(formData.maxDiscountAmount) : undefined,
        validFrom: formData.validFrom || undefined,
        validUntil: formData.validUntil || undefined,
        // backend expects arrays, keep backward compatibility for single phone
        allowedPhones: allowedPhones.length ? allowedPhones : undefined
      };

      if (editingCoupon) {
        await api.put(`/admin/coupons/${editingCoupon._id}`, payload);
        toast({
          title: 'Success',
          description: 'Coupon updated successfully'
        });
      } else {
        await api.post('/admin/coupons', payload);
        toast({
          title: 'Success',
          description: 'Coupon created successfully'
        });
      }
      
      setIsDialogOpen(false);
      resetForm();
      fetchCoupons();
      fetchStats();
    } catch (error: any) {
      console.error('Coupon save error:', error);
      
      // Parse and display the specific error message
      let errorMessage = 'Failed to save coupon';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
    }
  };

  const handleEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      type: coupon.type,
      value: coupon.value.toString(),
      isGlobal: coupon.isGlobal,
      usageLimit: coupon.usageLimit.toString(),
      minOrderAmount: coupon.minOrderAmount.toString(),
      maxDiscountAmount: coupon.maxDiscountAmount?.toString() || '',
      validFrom: coupon.validFrom ? format(new Date(coupon.validFrom), 'yyyy-MM-dd') : '',
      validUntil: coupon.validUntil ? format(new Date(coupon.validUntil), 'yyyy-MM-dd') : '',
      description: coupon.description || '',
      userPhone: coupon.userPhone || '',
      allowedPhonesText: (coupon.allowedPhones && coupon.allowedPhones.length)
        ? coupon.allowedPhones.join(',')
        : ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return;

    try {
      await api.delete(`/admin/coupons/${id}`);
      toast({
        title: 'Success',
        description: 'Coupon deleted successfully'
      });
      fetchCoupons();
      fetchStats();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete coupon',
        variant: 'destructive'
      });
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      await api.patch(`/admin/coupons/${id}/toggle-status`);
      toast({
        title: 'Success',
        description: 'Coupon status updated successfully'
      });
      fetchCoupons();
      fetchStats();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update coupon status',
        variant: 'destructive'
      });
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      type: 'percentage',
      value: '',
      usageLimit: '1',
      minOrderAmount: '0',
      maxDiscountAmount: '',
      validFrom: '',
      validUntil: '',
      description: '',
      isGlobal: true,
      userPhone: '',
      allowedPhonesText: ''
    });
    setEditingCoupon(null);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    resetForm();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading coupons...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Coupon Management</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Coupon
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="code">Coupon Code *</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="SAVE20"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="type">Type *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: 'fixed' | 'percentage') => 
                      setFormData({ ...formData, type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage</SelectItem>
                      <SelectItem value="fixed">Fixed Amount</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="value">
                    {formData.type === 'percentage' ? 'Percentage (%)' : 'Amount (₹)'} *
                  </Label>
                  <Input
                    id="value"
                    type="number"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    placeholder={formData.type === 'percentage' ? '20' : '100'}
                    min="0"
                    max={formData.type === 'percentage' ? '100' : undefined}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="usageLimit">Usage Limit</Label>
                  <Input
                    id="usageLimit"
                    type="number"
                    value={formData.usageLimit}
                    onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                    placeholder="1"
                    min="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="minOrderAmount">Minimum Order Amount (₹)</Label>
                  <Input
                    id="minOrderAmount"
                    type="number"
                    value={formData.minOrderAmount}
                    onChange={(e) => setFormData({ ...formData, minOrderAmount: e.target.value })}
                    placeholder="0"
                    min="0"
                  />
                </div>
                <div>
                  <Label htmlFor="maxDiscountAmount">Maximum Discount Amount (₹)</Label>
                  <Input
                    id="maxDiscountAmount"
                    type="number"
                    value={formData.maxDiscountAmount}
                    onChange={(e) => setFormData({ ...formData, maxDiscountAmount: e.target.value })}
                    placeholder="Optional"
                    min="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="validFrom">Valid From</Label>
                  <Input
                    id="validFrom"
                    type="date"
                    value={formData.validFrom}
                    onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="validUntil">Valid Until</Label>
                  <Input
                    id="validUntil"
                    type="date"
                    value={formData.validUntil}
                    onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Optional description for the coupon"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isGlobal"
                  checked={formData.isGlobal}
                  onChange={(e) => setFormData({ ...formData, isGlobal: e.target.checked })}
                />
                <Label htmlFor="isGlobal">Global Coupon (available to all users)</Label>
              </div>

              {!formData.isGlobal && (
                <div>
                  <Label htmlFor="userPhone">User Phone Number (single)</Label>
                  <Input
                    id="userPhone"
                    value={formData.userPhone}
                    onChange={(e) => setFormData({ ...formData, userPhone: e.target.value })}
                    placeholder="Enter phone number for specific user"
                    type="tel"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Optional: Single specific user (use field below for multiple users)
                  </p>
                  <div className="mt-4">
                    <Label htmlFor="allowedPhonesText">Specific Users (multiple phones)</Label>
                    <Textarea
                      id="allowedPhonesText"
                      value={formData.allowedPhonesText}
                      onChange={(e) => setFormData({ ...formData, allowedPhonesText: e.target.value })}
                      placeholder="Enter multiple phone numbers separated by comma or new lines"
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      You can paste a list. Non-digits will be stripped; minimum 10 digits per phone.
                    </p>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={handleDialogClose}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingCoupon ? 'Update' : 'Create'} Coupon
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-4 h-4 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <ToggleRight className="w-4 h-4 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Active</p>
                  <p className="text-2xl font-bold">{stats.active}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <ToggleLeft className="w-4 h-4 text-red-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Inactive</p>
                  <p className="text-2xl font-bold">{stats.inactive}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-orange-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Expired</p>
                  <p className="text-2xl font-bold">{stats.expired}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Globe className="w-4 h-4 text-purple-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Global</p>
                  <p className="text-2xl font-bold">{stats.global}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-indigo-500" />
                <div>
                  <p className="text-sm text-muted-foreground">User Specific</p>
                  <p className="text-2xl font-bold">{stats.userSpecific}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search coupons..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="percentage">Percentage</SelectItem>
                <SelectItem value="fixed">Fixed Amount</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="true">Active</SelectItem>
                <SelectItem value="false">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Coupons Table */}
      <Card>
        <CardHeader>
          <CardTitle>Coupons ({coupons.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Code</th>
                  <th className="text-left p-2">Type</th>
                  <th className="text-left p-2">Value</th>
                  <th className="text-left p-2">Scope</th>
                  <th className="text-left p-2">User</th>
                  <th className="text-left p-2">Status</th>
                  <th className="text-left p-2">Valid Until</th>
                  <th className="text-left p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((coupon) => (
                  <tr key={coupon._id} className="border-b hover:bg-gray-50">
                    <td className="p-2">
                      <div>
                        <div className="font-mono font-bold">{coupon.code}</div>
                        {coupon.description && (
                          <div className="text-sm text-gray-500">{coupon.description}</div>
                        )}
                      </div>
                    </td>
                    <td className="p-2">
                      <Badge variant={coupon.type === 'percentage' ? 'default' : 'secondary'}>
                        {coupon.type === 'percentage' ? (
                          <><Percent className="w-3 h-3 mr-1" /> Percentage</>
                        ) : (
                          <><DollarSign className="w-3 h-3 mr-1" /> Fixed</>
                        )}
                      </Badge>
                    </td>
                    <td className="p-2">
                      <div className="font-semibold">
                        {coupon.type === 'percentage' ? `${coupon.value}%` : `₹${coupon.value}`}
                      </div>
                      {coupon.maxDiscountAmount && (
                        <div className="text-sm text-gray-500">
                          Max: ₹{coupon.maxDiscountAmount}
                        </div>
                      )}
                    </td>
                    <td className="p-2">
                      <Badge variant={coupon.isGlobal ? 'default' : 'outline'}>
                        {coupon.isGlobal ? (
                          <><Globe className="w-3 h-3 mr-1" /> Global</>
                        ) : (
                          <><Users className="w-3 h-3 mr-1" /> User Specific</>
                        )}
                      </Badge>
                    </td>
                    <td className="p-2">
                      {coupon.isGlobal ? (
                        <span className="text-gray-500">-</span>
                      ) : (
                        <div className="text-sm">
                          {coupon.userId ? (
                            <div>
                              <div className="font-medium">{coupon.userId.name}</div>
                              <div className="text-gray-500">{coupon.userId.phone}</div>
                            </div>
                          ) : coupon.userPhone ? (
                            <div className="text-gray-600">{coupon.userPhone}</div>
                          ) : (coupon.allowedPhones && coupon.allowedPhones.length) ? (
                            <div className="text-gray-600">{coupon.allowedPhones.length} users (phones)</div>
                          ) : (
                            <span className="text-gray-500">No user linked</span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="p-2">
                      <Badge variant={coupon.isActive ? 'default' : 'secondary'}>
                        {coupon.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="p-2">
                      {coupon.validUntil ? (
                        <div className="text-sm">
                          {format(new Date(coupon.validUntil), 'MMM dd, yyyy')}
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500">No expiry</div>
                      )}
                    </td>
                    <td className="p-2">
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(coupon)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleToggleStatus(coupon._id)}
                        >
                          {coupon.isActive ? (
                            <ToggleLeft className="w-4 h-4" />
                          ) : (
                            <ToggleRight className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(coupon._id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {coupons.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No coupons found
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CouponManagement;
