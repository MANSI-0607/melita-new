import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Package, Truck, CheckCircle, XCircle } from "lucide-react";
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
    transactionId?: string;
  };
  shipping?: {
    method?: string;
  };
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface OrderResponse {
  success: boolean;
  data: Order;
}

const getStatusIcon = (status: string) => {
  switch ((status || '').toLowerCase()) {
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

const getStatusColor = (status: string) => {
  switch ((status || '').toLowerCase()) {
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

export default function OrderDetails() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('melita_token');
        if (!token) {
          navigate('/login');
          return;
        }
        const res = await api.get<OrderResponse>(`/orders/${orderId}`);
        if (!res?.success) throw new Error('Failed to fetch order');
        setOrder(res.data);
      } catch (e) {
        const msg = (e as Error)?.message || 'Failed to load order';
        setError(msg);
        if (msg.toLowerCase().includes('unauthorized')) navigate('/login');
      } finally {
        setLoading(false);
      }
    };
    if (orderId) fetchOrder();
  }, [orderId, navigate]);

  if (loading) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="space-y-4">
          <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
          <div className="h-8 bg-gray-200 rounded w-64 animate-pulse"></div>
        </div>
        <Card className="border-border bg-card shadow-soft">
          <CardContent className="p-6">
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Link to="/dashboard/orders" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to Orders
        </Link>
        <h1 className="text-3xl font-bold text-foreground">Order Details</h1>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <p className="text-red-700">{error}</p>
            <Button onClick={() => navigate(0)} variant="outline" className="mt-4">Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="space-y-4">
        <Link to="/dashboard/orders" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to Orders
        </Link>
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">Order #{order.orderNumber}</h1>
          <Badge className={`${getStatusColor(order.status)} border`}>
            <div className="flex items-center gap-1.5">
              {getStatusIcon(order.status)}
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </div>
          </Badge>
        </div>
      </div>

      {/* Summary */}
      <Card className="border-border bg-card shadow-soft">
        <CardHeader>
          <CardTitle className="text-foreground">Order Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Placed On</p>
              <p className="text-sm font-medium text-foreground">{new Date(order.createdAt).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Payment</p>
              <p className="text-sm font-medium text-foreground capitalize">{order.payment.method === 'cod' ? 'Cash on Delivery' : order.payment.method}</p>
              <p className="text-xs text-muted-foreground">Status: {order.payment.status}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Totals</p>
              <p className="text-sm text-foreground">Subtotal: ₹{order.pricing.subtotal.toFixed(2)}</p>
              <p className="text-sm text-foreground">Discount: -₹{order.pricing.discount.toFixed(2)}</p>
              <p className="text-sm text-foreground">Points Used: -{order.pricing.rewardPointsUsed} pts</p>
              <p className="text-sm font-semibold text-foreground mt-1">Grand Total: ₹{order.pricing.total.toFixed(2)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Items */}
      <Card className="border-border bg-card shadow-soft">
        <CardHeader>
          <CardTitle className="text-foreground">Items ({order.items.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-md border">
                <div className="flex items-center gap-3">
                  <img
                    src={item.image?.startsWith('/') ? `${api.baseUrl}${item.image}` : item.image}
                    alt={item.name}
                    className="w-12 h-12 rounded object-cover"
                    loading="lazy"
                    onError={(e) => {
                      const img = e.currentTarget as HTMLImageElement;
                      img.onerror = null;
                      img.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48"><rect width="100%" height="100%" fill="%23f3f4f6"/></svg>';
                    }}
                  />
                  <div>
                    <div className="text-sm font-medium text-foreground">{item.name}</div>
                    <div className="text-xs text-muted-foreground">Qty: {item.quantity}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-foreground">₹{item.price.toFixed(2)}</div>
                  <div className="text-xs text-muted-foreground">Subtotal: ₹{item.subtotal.toFixed(2)}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
