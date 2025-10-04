import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import { Search, Filter, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

interface Transaction {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  order?: {
    _id: string;
    orderNumber: string;
  };
  type: string;
  category: string;
  amount: number;
  points: {
    earned: number;
    redeemed: number;
    balance: number;
  };
  description: string;
  reference?: string;
  status: string;
  metadata: {
    source: string;
  };
  createdAt: string;
}

const transactionTypes = ['earn', 'redeem', 'expire', 'refund', 'bonus', 'penalty', 'purchase'];
const transactionCategories = ['purchase', 'referral', 'review', 'signup', 'birthday', 'promotion', 'cashback', 'points', 'penalty'];

const AdminTransactions: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const token = localStorage.getItem('melita_admin_token');
      const response = await fetch(`${API_BASE}/admin/transactions`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to fetch transactions');
      
      const data = await response.json();
      setTransactions((data?.data?.transactions) || data.transactions || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch transactions',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'earn':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'redeem':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      case 'purchase':
        return <DollarSign className="w-4 h-4 text-blue-500" />;
      default:
        return <DollarSign className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTypeBadgeVariant = (type: string) => {
    switch (type) {
      case 'earn': return 'default';
      case 'redeem': return 'secondary';
      case 'purchase': return 'default';
      case 'refund': return 'destructive';
      default: return 'outline';
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'pending': return 'secondary';
      case 'failed': return 'destructive';
      case 'cancelled': return 'destructive';
      default: return 'outline';
    }
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (transaction.order?.orderNumber || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || transaction.type === typeFilter;
    const matchesCategory = categoryFilter === 'all' || transaction.category === categoryFilter;
    return matchesSearch && matchesType && matchesCategory;
  });

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading transactions...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Transaction Management</h2>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {transactionTypes.map(type => (
                  <SelectItem key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {transactionCategories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Transactions ({filteredTransactions.length})</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Points</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.map((transaction) => (
                <TableRow key={transaction._id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{transaction.user.name}</div>
                      <div className="text-sm text-muted-foreground">{transaction.user.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getTypeIcon(transaction.type)}
                      <Badge variant={getTypeBadgeVariant(transaction.type)}>
                        {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {transaction.category.charAt(0).toUpperCase() + transaction.category.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">
                      {transaction.type === 'earn' ? '+' : transaction.type === 'redeem' ? '-' : ''}₹{transaction.amount}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {transaction.points.earned > 0 && (
                        <div className="text-green-600">+{transaction.points.earned} earned</div>
                      )}
                      {transaction.points.redeemed > 0 && (
                        <div className="text-red-600">-{transaction.points.redeemed} redeemed</div>
                      )}
                      <div className="text-muted-foreground">Balance: {transaction.points.balance}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs">
                      <div className="text-sm">{transaction.description}</div>
                      {transaction.order && (
                        <div className="text-xs text-muted-foreground mt-1">
                          Order: {transaction.order.orderNumber}
                        </div>
                      )}
                      {transaction.reference && (
                        <div className="text-xs text-muted-foreground">
                          Ref: {transaction.reference}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(transaction.status)}>
                      {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {new Date(transaction.createdAt).toLocaleDateString()}
                      <div className="text-xs text-muted-foreground">
                        {new Date(transaction.createdAt).toLocaleTimeString()}
                      </div>
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

export default AdminTransactions;
