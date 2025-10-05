import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { 
  ShoppingBag, 
  Search, 
  RefreshCw, 
  User,
  Calendar,
  Package,
  DollarSign,
  Phone,
  Gift,
  Coins
} from 'lucide-react';
import { api } from '@/lib/api';

interface OrderItem {
  product: {
    _id: string;
    name: string;
    images: string[];
  };
  name: string;
  price: number;
  quantity: number;
  total: number;
}

interface Order {
  _id: string;
  orderNumber: string;
  user: {
    _id: string;
    name: string;
    phone: string;
  };
  items: OrderItem[];
  pricing: {
    subtotal: number;
    discount: number;
    total: number;
  };
  status: string;
  createdAt: string;
  metadata: {
    sellerId: string;
    sellerName: string;
    couponUsed?: string;
    coinsUsed: number;
  };
}

const SellerOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { toast } = useToast();

  const fetchOrders = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10'
      });

      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      const response = await api.get<{
        success: boolean;
        data: {
          orders: Order[];
          pagination: {
            current: number;
            pages: number;
            total: number;
          };
        };
      }>(`/sellers/orders?${params}`);

      if (response.success) {
        setOrders(response.data.orders);
        setCurrentPage(response.data.pagination.current);
        setTotalPages(response.data.pagination.pages);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to fetch orders',
          variant: 'destructive'
        });
      }
    } catch (error: any) {
      console.error('Fetch orders error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch orders',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(1);
  }, [statusFilter]);

  const handlePageChange = (page: number) => {
    fetchOrders(page);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sellerOrder': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'sellerOrder': return 'Seller Order';
      case 'completed': return 'Completed';
      case 'pending': return 'Pending';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredOrders = orders.filter(order =>
    order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.user.phone.includes(searchTerm)
  );

  if (loading && orders.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading orders...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShoppingBag className="w-5 h-5" />
              <CardTitle>My Orders</CardTitle>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchOrders(currentPage)}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
          <p className="text-sm text-gray-600">
            Orders created through your seller dashboard
          </p>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="mb-6 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by order number, customer name, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">All Status</option>
                <option value="sellerOrder">Seller Orders</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Orders List */}
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {orders.length === 0 ? 'No orders yet' : 'No orders found'}
              </h3>
              <p className="text-gray-600">
                {orders.length === 0 
                  ? 'Start recording sales to see orders here'
                  : 'Try adjusting your search terms or filters'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <Card key={order._id} className="border border-gray-200">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {/* Order Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <ShoppingBag className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {order.orderNumber}
                            </h4>
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <Calendar className="w-3 h-3" />
                              <span>{formatDate(order.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Badge className={getStatusColor(order.status)}>
                            {getStatusLabel(order.status)}
                          </Badge>
                          <div className="text-right">
                            <p className="font-semibold text-lg">
                              ₹{order.pricing.total.toFixed(2)}
                            </p>
                            {order.pricing.discount > 0 && (
                              <p className="text-xs text-green-600">
                                Saved ₹{order.pricing.discount.toFixed(2)}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Customer Info */}
                      <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                        <User className="w-4 h-4 text-gray-500" />
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{order.user.name}</p>
                          <div className="flex items-center space-x-1 text-sm text-gray-600">
                            <Phone className="w-3 h-3" />
                            <span>{order.user.phone}</span>
                          </div>
                        </div>
                        {order.metadata.couponUsed && (
                          <div className="flex items-center space-x-1 text-sm text-green-600">
                            <Gift className="w-3 h-3" />
                            <span>{order.metadata.couponUsed}</span>
                          </div>
                        )}
                        {order.metadata.coinsUsed > 0 && (
                          <div className="flex items-center space-x-1 text-sm text-blue-600">
                            <Coins className="w-3 h-3" />
                            <span>{order.metadata.coinsUsed} coins</span>
                          </div>
                        )}
                      </div>

                      {/* Order Items */}
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                          <Package className="w-4 h-4" />
                          <span>Items ({order.items.length})</span>
                        </div>
                        <div className="space-y-2">
                          {order.items.map((item, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                              <div className="flex-1">
                                <p className="font-medium text-sm">{item.name}</p>
                                <p className="text-xs text-gray-600">
                                  ₹{item.price} × {item.quantity}
                                </p>
                              </div>
                              <p className="font-medium text-sm">
                                ₹{item.total.toFixed(2)}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Order Summary */}
                      <div className="border-t pt-3">
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span>Subtotal:</span>
                            <span>₹{order.pricing.subtotal.toFixed(2)}</span>
                          </div>
                          {order.pricing.discount > 0 && (
                            <div className="flex justify-between text-green-600">
                              <span>Discount:</span>
                              <span>-₹{order.pricing.discount.toFixed(2)}</span>
                            </div>
                          )}
                          <div className="flex justify-between font-semibold text-base border-t pt-1">
                            <span>Total:</span>
                            <span>₹{order.pricing.total.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1 || loading}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages || loading}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Stats */}
      {orders.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{orders.length}</div>
              <div className="text-sm text-gray-600">Total Orders</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                ₹{orders.reduce((sum, order) => sum + order.pricing.total, 0).toFixed(2)}
              </div>
              <div className="text-sm text-gray-600">Total Revenue</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">
                ₹{orders.length > 0 ? (orders.reduce((sum, order) => sum + order.pricing.total, 0) / orders.length).toFixed(2) : '0.00'}
              </div>
              <div className="text-sm text-gray-600">Avg. Order Value</div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default SellerOrders;
