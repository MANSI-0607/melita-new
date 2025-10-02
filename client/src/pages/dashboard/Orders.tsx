import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, ArrowLeft, Package, Truck, CheckCircle, XCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "@/lib/api";

interface OrderItem {
  product: string;
  name: string;
  slug: string;
  image: string;
  price: number;
  originalPrice: number;
  quantity: number;
  subtotal: number;
}

interface Order {
  _id: string;
  orderNumber: string;
  items: OrderItem[];
  pricing: {
    subtotal: number;
    discount: number;
    rewardPointsUsed: number;
    shipping: number;
    tax: number;
    total: number;
  };
  payment: {
    method: string;
    status: string;
  };
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface OrdersResponse {
  success: boolean;
  data: {
    orders: Order[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalOrders: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
}

export default function Orders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalOrders: 0,
    hasNext: false,
    hasPrev: false,
  });
  const [statusFilter, setStatusFilter] = useState<string>('');

  useEffect(() => {
    fetchOrders();
  }, [currentPage, statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('melita_token');
      if (!token) {
        navigate('/login');
        return;
      }

      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...(statusFilter && { status: statusFilter }),
      });

      const data = await api.get<OrdersResponse>(`/orders?${queryParams}`);
      
      if (data.success) {
        setOrders(data.data.orders);
        setPagination(data.data.pagination);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      const msg = (err as Error)?.message || 'Failed to load orders';
      setError(msg);
      if (msg.toLowerCase().includes('unauthorized')) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'processing':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'shipped':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'refunded':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
      case 'confirmed':
      case 'processing':
        return <Package className="h-4 w-4" />;
      case 'shipped':
        return <Truck className="h-4 w-4" />;
      case 'delivered':
        return <CheckCircle className="h-4 w-4" />;
      case 'cancelled':
      case 'refunded':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="space-y-4">
          <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
          <div className="h-8 bg-gray-200 rounded w-64 animate-pulse"></div>
        </div>
        {[1, 2, 3].map((i) => (
          <Card key={i} className="border-border bg-card shadow-soft">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="h-6 bg-gray-200 rounded w-40 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Link 
          to="/dashboard" 
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold text-foreground">My Orders</h1>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <p className="text-red-700">{error}</p>
            <Button onClick={fetchOrders} variant="outline" className="mt-4">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="space-y-4">
        <Link 
          to="/dashboard" 
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">My Orders</h1>
          <Badge variant="outline" className="text-sm">
            {pagination.totalOrders} {pagination.totalOrders === 1 ? 'Order' : 'Orders'}
          </Badge>
        </div>
      </div>

      {/* Status Filter */}
      <div className="flex flex-wrap gap-2">
        {['', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
          <Button
            key={status}
            variant={statusFilter === status ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setStatusFilter(status);
              setCurrentPage(1);
            }}
          >
            {status === '' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
          </Button>
        ))}
      </div>

      {orders.length === 0 ? (
        /* Empty State */
        <Card className="border-border bg-card shadow-soft">
          <CardContent className="py-16">
            <div className="text-center max-w-md mx-auto">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full flex items-center justify-center">
                <ShoppingBag className="h-10 w-10 text-primary" />
              </div>
              <h2 className="text-2xl font-semibold text-foreground mb-3">
                {statusFilter ? `No ${statusFilter} orders` : 'No Orders Found'}
              </h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                {statusFilter 
                  ? `You don't have any ${statusFilter} orders at the moment.`
                  : "You haven't placed any orders yet. Start shopping to see your orders here."}
              </p>
              <Button variant="default" size="lg" className="w-full sm:w-auto" onClick={() => navigate("/shop")}>
                Start Shopping
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Orders List */
        <>
          <div className="space-y-6">
            {orders.map((order) => (
              <Card key={order._id} className="border-border bg-card shadow-soft hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between space-y-4 lg:space-y-0">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-foreground">
                          Order #{order.orderNumber}
                        </h3>
                        <Badge className={`${getStatusColor(order.status)} border`}>
                          <div className="flex items-center gap-1.5">
                            {getStatusIcon(order.status)}
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </div>
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Order Date</p>
                          <p className="text-sm font-medium text-foreground">
                            {new Date(order.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Total Amount</p>
                          <p className="text-sm font-semibold text-foreground">
                            ₹{order.pricing.total.toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Payment</p>
                          <p className="text-sm font-medium text-foreground capitalize">
                            {order.payment.method === 'cod' ? 'Cash on Delivery' : order.payment.method}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <p className="text-xs text-muted-foreground">Items ({order.items.length})</p>
                        <div className="flex flex-wrap gap-2">
                          {order.items.slice(0, 3).map((item, index) => (
                            <div key={index} className="flex items-center space-x-2 bg-muted rounded-lg p-2">
                              <img
                                src={item.image?.startsWith('/') ? `${api.baseUrl}${item.image}` : item.image}
                                alt={item.name}
                                className="w-10 h-10 rounded object-cover"
                                loading="lazy"
                                onError={(e) => {
                                  const img = e.currentTarget as HTMLImageElement;
                                  img.onerror = null; // prevent infinite loop
                                  img.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><rect width="100%" height="100%" fill="%23f3f4f6"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23999" font-size="10">No Image</text></svg>';
                                }}
                              />
                              <div className="flex flex-col">
                                <span className="text-xs font-medium text-foreground line-clamp-1">
                                  {item.name}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  Qty: {item.quantity}
                                </span>
                              </div>
                            </div>
                          ))}
                          {order.items.length > 3 && (
                            <div className="flex items-center justify-center bg-muted rounded-lg p-2 px-4">
                              <span className="text-xs font-medium text-muted-foreground">
                                +{order.items.length - 3} more
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col space-y-2 lg:ml-6 lg:min-w-[140px]">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate(`/dashboard/orders/${order._id}`)}
                        className="w-full"
                      >
                        View Details
                      </Button>
                      {/* {(order.status === 'pending' || order.status === 'confirmed') && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={async () => {
                            if (confirm('Are you sure you want to cancel this order?')) {
                              try {
                                await api.patch(`/orders/${order._id}/cancel`, {});
                                fetchOrders();
                              } catch (err) {
                                alert((err as Error)?.message || 'Failed to cancel order');
                              }
                            }
                          }}
                        >
                          Cancel Order
                        </Button>
                      )} */}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between border-t pt-6">
              <div className="text-sm text-muted-foreground">
                Page {pagination.currentPage} of {pagination.totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => p - 1)}
                  disabled={!pagination.hasPrev}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => p + 1)}
                  disabled={!pagination.hasNext}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
