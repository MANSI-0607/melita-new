import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, 
  Search, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  Phone, 
  User,
  Calendar,
  Award
} from 'lucide-react';
import { api } from '@/lib/api';

interface Customer {
  _id: string;
  name: string;
  phone: string;
  isVerified: boolean;
  createdAt: string;
  rewardPoints: number;
  loyaltyTier: string;
}

const Customers: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const response = await api.get<{ success: boolean; data: Customer[] }>('/sellers/customers');
      if (response.success) {
        setCustomers(response.data);
        setFilteredCustomers(response.data);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to fetch customers',
          variant: 'destructive'
        });
      }
    } catch (error: any) {
      console.error('Fetch customers error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch customers',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    const filtered = customers.filter(customer =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm)
    );
    setFilteredCustomers(filtered);
  }, [searchTerm, customers]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'platinum': return 'bg-purple-100 text-purple-800';
      case 'gold': return 'bg-yellow-100 text-yellow-800';
      case 'silver': return 'bg-gray-100 text-gray-800';
      default: return 'bg-orange-100 text-orange-800';
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'platinum': return '💎';
      case 'gold': return '🥇';
      case 'silver': return '🥈';
      default: return '🥉';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading customers...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
       {/* Summary Stats */}
       {customers.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{customers.length}</div>
              <div className="text-sm text-gray-600">Total Customers</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {customers.filter(c => c.isVerified).length}
              </div>
              <div className="text-sm text-gray-600">Verified</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {customers.reduce((sum, c) => sum + c.rewardPoints, 0)}
              </div>
              <div className="text-sm text-gray-600">Total Points</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {customers.filter(c => c.loyaltyTier === 'gold' || c.loyaltyTier === 'platinum').length}
              </div>
              <div className="text-sm text-gray-600">Premium Tiers</div>
            </CardContent>
          </Card>
        </div>
      )}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <CardTitle>Created Customers</CardTitle>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchCustomers}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
          <p className="text-sm text-gray-600">
            Customers you've added and verified ({customers.length} total)
          </p>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by name or phone number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Customer List */}
          {filteredCustomers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {customers.length === 0 ? 'No customers yet' : 'No customers found'}
              </h3>
              <p className="text-gray-600">
                {customers.length === 0 
                  ? 'Start adding customers to see them here'
                  : 'Try adjusting your search terms'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredCustomers.map((customer) => (
                <Card key={customer._id} className="border border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{customer.name}</h4>
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Phone className="w-3 h-3" />
                            <span>{customer.phone}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        {/* Verification Status */}
                        <div className="flex items-center space-x-1">
                          {customer.isVerified ? (
                            <>
                              <CheckCircle className="w-4 h-4 text-green-600" />
                              <span className="text-sm text-green-600">Verified</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-4 h-4 text-red-600" />
                              <span className="text-sm text-red-600">Unverified</span>
                            </>
                          )}
                        </div>

                        {/* Loyalty Tier */}
                       {/* <Badge className={getTierColor(customer.loyaltyTier)}>
                          <span className="mr-1">{getTierIcon(customer.loyaltyTier)}</span>
                          {customer.loyaltyTier}
                        </Badge> */}

                        {/* Reward Points */}
                        <div className="flex items-center space-x-1 text-sm text-gray-600">
                          <Award className="w-4 h-4" />
                          <span>{customer.rewardPoints} pts</span>
                        </div>

                        {/* Join Date */}
                        <div className="flex items-center space-x-1 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(customer.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

     
    </div>
  );
};

export default Customers;
