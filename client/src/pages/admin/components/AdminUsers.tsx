import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';
import { Search, User, Mail, Phone, Plus,Edit } from 'lucide-react';

const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000').replace(/\/$/, '');

interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  rewardPoints: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
  orderCount?: number;
  totalSpent?: number;
  addedBy?: { name?: string } | null;
}

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAddedBy, setFilterAddedBy] = useState<'all'|'admin'|'seller'|'self'>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  // Inline reward points editing state (must be declared before any early returns)
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editPointsValue, setEditPointsValue] = useState<number>(0);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    rewardPoints: 0,
    isActive: true
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('melita_admin_token');
      const response = await fetch(`${API_BASE}/admin/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to fetch users');
      
      const data = await response.json();
      // The enhanced endpoint returns users in data.users
      setUsers(data?.data?.users || data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch users',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleUserStatus = async (userId: string, isActive: boolean) => {
    try {
      const token = localStorage.getItem('melita_admin_token');
      const response = await fetch(`${API_BASE}/admin/users/${userId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive }),
      });

      if (!response.ok) throw new Error('Failed to update user status');

      toast({
        title: 'Success',
        description: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      });

      fetchUsers();
    } catch (error) {
      console.error('Error updating user status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update user status',
        variant: 'destructive',
      });
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('melita_admin_token');
      const response = await fetch(`${API_BASE}/admin/users`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create user');
      }

      toast({
        title: 'Success',
        description: 'User created successfully',
      });

      setIsCreateDialogOpen(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        rewardPoints: 0,
        isActive: true
      });
      fetchUsers();
    } catch (error) {
      console.error('Error creating user:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create user',
        variant: 'destructive',
      });
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.phone || '').toLowerCase().includes(searchTerm.toLowerCase());

    // Derive addedBy label - more robust checking
    const addedByName = user.addedBy?.name;
    let addedByLabel: 'admin'|'seller'|'self' = 'self'; // default to self
    
    if (addedByName) {
      const label = addedByName.toLowerCase().trim();
      if (label === 'admin') {
        addedByLabel = 'admin';
      } else if (label === 'seller') {
        addedByLabel = 'seller';
      }
    }

    const matchesAddedBy = filterAddedBy === 'all' ? true : addedByLabel === filterAddedBy;

    return matchesSearch && matchesAddedBy;
  });

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading users...</div>;
  }

  const startEditPoints = (user: User) => {
    setEditingUserId(user._id);
    setEditPointsValue(user.rewardPoints || 0);
  };

  const cancelEditPoints = () => {
    setEditingUserId(null);
    setEditPointsValue(0);
  };

  const saveEditPoints = async (userId: string) => {
    try {
      const user = users.find(u => u._id === userId);
      if (!user) throw new Error('User not found');
      const current = user.rewardPoints || 0;
      const next = editPointsValue || 0;

      if (next < 0) {
        return toast({ title: 'Error', description: 'Reward points cannot be negative', variant: 'destructive' });
      }

      if (current === next) {
        setEditingUserId(null);
        return toast({ title: 'No change', description: 'Reward points unchanged' });
      }

      const token = localStorage.getItem('melita_admin_token');
      const response = await fetch(`${API_BASE}/admin/users/${userId}/reward-points`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rewardPoints: next }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to update reward points');
      }

      toast({ title: 'Success', description: 'Reward points updated successfully' });
      setEditingUserId(null);
      fetchUsers();
    } catch (e) {
      toast({ title: 'Error', description: e instanceof Error ? e.message : 'Failed to update reward points', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <h2 className="text-2xl font-bold">User Management</h2>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="mt-2">
              <Plus className="w-4 h-4 mr-2" />
              Create User
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[95vw] sm:max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter full name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email (optional)</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter email address (optional)"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Enter phone number"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="rewardPoints">Initial Reward Points</Label>
                  <Input
                    id="rewardPoints"
                    type="number"
                    value={formData.rewardPoints}
                    onChange={(e) => setFormData(prev => ({ ...prev, rewardPoints: parseInt(e.target.value) || 0 }))}
                    placeholder="0"
                    min="0"
                  />
                </div>
                <div className="flex items-center space-x-2 pt-6">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  />
                  <Label htmlFor="isActive">Active User</Label>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Create User
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
            <div className="relative sm:col-span-2">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-sm">Added By</Label>
              <select
                className="border rounded px-2 py-2 text-sm"
                value={filterAddedBy}
                onChange={(e) => setFilterAddedBy(e.target.value as any)}
              >
                <option value="all">All</option>
                <option value="admin">Admin</option>
                <option value="seller">Seller</option>
                <option value="self">Self Joined</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Reward Points</TableHead>
                <TableHead>Added By</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead>Total Spent</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user._id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-muted-foreground">ID: {user._id.slice(-8)}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <Mail className="w-3 h-3 text-muted-foreground" />
                        <span className="text-sm">{user.email}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="w-3 h-3 text-muted-foreground" />
                        <span className="text-sm">{user.phone}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {editingUserId === user._id ? (
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          className="w-24 h-8"
                          value={editPointsValue}
                          onChange={(e) => setEditPointsValue(Math.max(0, parseInt(e.target.value) || 0))}
                          min={0}
                          step={1}
                        />
                        <Button size="sm" onClick={() => saveEditPoints(user._id)}>Save</Button>
                        <Button size="sm" variant="outline" onClick={cancelEditPoints}>Cancel</Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{user.rewardPoints} points</Badge>
                        <Button size="sm" variant="outline" onClick={() => startEditPoints(user)}><Edit></Edit></Button>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {(() => {
                      const addedByName = user.addedBy?.name;
                      if (addedByName) {
                        const label = addedByName.toLowerCase().trim();
                        if (label === 'admin') return <Badge variant="secondary">Admin</Badge>;
                        if (label === 'seller') return <Badge variant="outline">Seller</Badge>;
                      }
                      return <Badge variant="default">Self Joined</Badge>;
                    })()}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {user.orderCount || 0} orders
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">
                      ₹{user.totalSpent || 0}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={user.isActive}
                        onCheckedChange={(checked) => handleToggleUserStatus(user._id, checked)}
                      />
                      <span className="text-sm">
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminUsers;
