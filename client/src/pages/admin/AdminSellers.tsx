import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, ToggleLeft, ToggleRight, Eye, EyeOff, Users, UserCheck, UserX, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { api } from '@/lib/api';

interface Seller {
  _id: string;
  name: string;
  contact: string;
  status: 'active' | 'inactive' | 'banned';
  joinedAt: string;
  lastLogin?: string;
  totalSales: number;
  totalCustomers: number;
  createdAt: string;
}

interface SellerStats {
  total: number;
  active: number;
  banned: number;
  inactive: number;
}

const AdminSellers: React.FC = () => {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [stats, setStats] = useState<SellerStats>({ total: 0, active: 0, banned: 0, inactive: 0 });
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [editingSeller, setEditingSeller] = useState<Seller | null>(null);
  const [passwordSeller, setPasswordSeller] = useState<Seller | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    password: '',
    status: 'active'
  });

  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  const { toast } = useToast();

  const fetchSellers = async () => {
    try {
      const params = new URLSearchParams();
      params.append('page', '1');
      params.append('limit', '50');
      if (searchTerm) params.append('search', searchTerm);
      if (filterStatus !== 'all') params.append('status', filterStatus);
      
      const response = await api.get(`/admin/sellers?${params.toString()}`);
      const raw = (response as any).data;
      const payload = raw && raw.success ? raw.data : raw;
      const list = payload?.sellers || [];
      setSellers(Array.isArray(list) ? list : []);
    } catch (error: any) {
      console.error('Fetch sellers error:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || error.message || "Failed to fetch sellers",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/sellers/stats');
      const raw = (response as any).data;
      const stats = raw && raw.success ? raw.data : raw;
      if (stats && typeof stats === 'object' && 'total' in stats) {
        setStats(stats as SellerStats);
      }
    } catch (error: any) {
      console.error('Failed to fetch seller stats:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const payload = {
        ...formData,
      };

      if (editingSeller) {
        await api.put(`/admin/sellers/${editingSeller._id}`, payload);
        toast({
          title: 'Success',
          description: 'Seller updated successfully'
        });
      } else {
        await api.post('/admin/sellers', payload);
        toast({
          title: 'Success',
          description: 'Seller created successfully'
        });
      }
      
      setIsDialogOpen(false);
      resetForm();
      fetchSellers();
      fetchStats();
    } catch (error: any) {
      console.error('Seller save error:', error);
      
      let errorMessage = 'Failed to save seller';
      
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

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: 'Error',
        description: 'Passwords do not match',
        variant: 'destructive'
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        title: 'Error',
        description: 'Password must be at least 6 characters long',
        variant: 'destructive'
      });
      return;
    }

    try {
      await api.patch(`/admin/sellers/${passwordSeller?._id}/password`, {
        newPassword: passwordData.newPassword
      });
      
      toast({
        title: 'Success',
        description: 'Password updated successfully'
      });
      
      setIsPasswordDialogOpen(false);
      setPasswordSeller(null);
      setPasswordData({ newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update password',
        variant: 'destructive'
      });
    }
  };

  const handleEdit = (seller: Seller) => {
    setEditingSeller(seller);
    setFormData({
      name: seller.name,
      contact: seller.contact,
      password: '',
      status: seller.status
    });
    setIsDialogOpen(true);
  };

  const handlePasswordEdit = (seller: Seller) => {
    setPasswordSeller(seller);
    setPasswordData({ newPassword: '', confirmPassword: '' });
    setIsPasswordDialogOpen(true);
  };

  const handleToggleStatus = async (sellerId: string) => {
    try {
      await api.patch(`/admin/sellers/${sellerId}/toggle-status`);
      toast({
        title: 'Success',
        description: 'Seller status updated successfully'
      });
      fetchSellers();
      fetchStats();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update seller status',
        variant: 'destructive'
      });
    }
  };

  const handleDelete = async (sellerId: string) => {
    if (!confirm('Are you sure you want to delete this seller? This action cannot be undone.')) {
      return;
    }

    try {
      await api.delete(`/admin/sellers/${sellerId}`);
      toast({
        title: 'Success',
        description: 'Seller deleted successfully'
      });
      fetchSellers();
      fetchStats();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete seller',
        variant: 'destructive'
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      contact: '',
      password: '',
      status: 'active'
    });
    setEditingSeller(null);
  };

  useEffect(() => {
    fetchSellers();
    fetchStats();
  }, [searchTerm, filterStatus]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-500"><UserCheck className="w-3 h-3 mr-1" />Active</Badge>;
      case 'banned':
        return <Badge variant="destructive"><UserX className="w-3 h-3 mr-1" />Banned</Badge>;
      case 'inactive':
        return <Badge variant="secondary"><Users className="w-3 h-3 mr-1" />Inactive</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading sellers...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <h2 className="text-2xl font-bold mt-4">Seller Management</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Total Sellers</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <UserCheck className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <UserX className="w-5 h-5 text-red-500" />
              <div>
                <p className="text-sm text-gray-600">Banned</p>
                <p className="text-2xl font-bold text-red-600">{stats.banned}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">Inactive</p>
                <p className="text-2xl font-bold text-gray-600">{stats.inactive}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Create Button */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
            <CardTitle>Seller Management</CardTitle>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => resetForm()}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Seller
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingSeller ? 'Edit Seller' : 'Create New Seller'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="contact">Contact Number</Label>
                    <Input
                      id="contact"
                      value={formData.contact}
                      onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                      placeholder="10-digit mobile number"
                      required
                    />
                  </div>
                  
                  {!editingSeller && (
                    <div>
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="Minimum 6 characters"
                        required
                      />
                    </div>
                  )}
                  
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="banned">Banned</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingSeller ? 'Update' : 'Create'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 mb-4">
            <Input
              placeholder="Search sellers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="sm:max-w-xs"
            />
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="sm:max-w-xs">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="banned">Banned</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Sellers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Sellers ({sellers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Name</th>
                  <th className="text-left p-2">Contact</th>
                  <th className="text-left p-2">Status</th>
                  <th className="text-left p-2">Joined On</th>
                  <th className="text-left p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sellers.map((seller) => (
                  <tr key={seller._id} className="border-b hover:bg-gray-50">
                    <td className="p-2">
                      <div className="font-medium">{seller.name}</div>
                    </td>
                    <td className="p-2">
                      <div className="font-mono">{seller.contact}</div>
                    </td>
                    <td className="p-2">
                      {getStatusBadge(seller.status)}
                    </td>
                    <td className="p-2">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-1" />
                        {format(new Date(seller.joinedAt), 'MMM dd, yyyy')}
                      </div>
                    </td>
                    <td className="p-2">
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(seller)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handlePasswordEdit(seller)}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleToggleStatus(seller._id)}
                        >
                          {seller.status === 'active' ? (
                            <ToggleLeft className="w-4 h-4" />
                          ) : (
                            <ToggleRight className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(seller._id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {sellers.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No sellers found
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Password Update Dialog */}
      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Password for {passwordSeller?.name}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handlePasswordUpdate} className="space-y-4">
            <div>
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                placeholder="Minimum 6 characters"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                placeholder="Confirm new password"
                required
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setIsPasswordDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                Update Password
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminSellers;
