import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import { Search, Filter, Eye, Package } from 'lucide-react';
import Barcode from 'react-barcode';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
//random comment
interface Order {
  _id: string;
  orderNumber: string;
  user?: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  items: Array<{
    product: string;
    name: string;
    price: number;
    quantity: number;
    subtotal: number;
  }>;
  pricing: {
    subtotal: number;
    discount: number;
    shipping: number;
    tax: number;
    total: number;
    rewardPointsUsed?: number;
  };
  status: string;
  payment: {
    method: string;
    status: string;
    transactionId?: string;
  };
  shippingAddress: {
    firstName: string;
    lastName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    state: string;
    pincode: string;
  };
  coupon?: {
    id: string;
    code: string;
    type: string;
    value: number;
  };
  createdAt: string;
  updatedAt: string;
}

const orderStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];

const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all'); // all | cod | razorpay
  const [labelOpen, setLabelOpen] = useState(false);
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('melita_admin_token');
      const response = await fetch(`${API_BASE}/admin/orders`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to fetch orders');
      
      const data = await response.json();
      setOrders((data?.data?.orders) || data.orders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch orders',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem('melita_admin_token');
      const response = await fetch(`${API_BASE}/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error('Failed to update order status');

      toast({
        title: 'Success',
        description: 'Order status updated successfully',
      });

      fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update order status',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'pending': return 'secondary';
      case 'confirmed': return 'default';
      case 'processing': return 'default';
      case 'shipped': return 'default';
      case 'delivered': return 'default';
      case 'cancelled': return 'destructive';
      case 'refunded': return 'destructive';
      default: return 'secondary';
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = (order.orderNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (order.user?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (order.user?.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const paymentMethod = (order.payment?.method || '').toLowerCase();
    const matchesPayment = paymentFilter === 'all' || paymentMethod === paymentFilter;
    return matchesSearch && matchesStatus && matchesPayment;
  });

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading orders...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Order Management</h2>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search orders..."
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
                <SelectItem value="all">All Statuses</SelectItem>
                {orderStatuses.map(status => (
                  <SelectItem key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={paymentFilter} onValueChange={setPaymentFilter}>
              <SelectTrigger className="w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payments</SelectItem>
                <SelectItem value="cod">COD</SelectItem>
                <SelectItem value="razorpay">Razorpay</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Orders ({filteredOrders.length})</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order._id}>
                  <TableCell>
                    <div className="font-medium">{order.orderNumber}</div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{order.user?.name || 'N/A'}</div>
                      <div className="text-sm text-muted-foreground">{order.user?.email || '—'}</div>
                      <div className="text-sm text-muted-foreground">{order.user?.phone || '—'}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {(order.items?.length || 0)} item{(order.items?.length || 0) > 1 ? 's' : ''}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">₹{order.pricing?.total ?? 0}</div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <Badge variant="outline">
                        {(order.payment?.method || 'N/A').toString().toUpperCase()}
                      </Badge>
                      <div className="text-sm text-muted-foreground mt-1">
                        {order.payment?.status || '—'}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(order.status)}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Select
                        value={order.status}
                        onValueChange={(value) => handleStatusUpdate(order._id, value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {orderStatuses.map(status => (
                            <SelectItem key={status} value={status}>
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => { setSelectedOrder(order); setLabelOpen(true); }}
                      >
                        📋 Label
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => { setSelectedOrder(order); setInvoiceOpen(true); }}
                      >
                        📄 Bill
                      </Button>
                    </div>
                  </TableCell>
              </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

   
{/* Shipping Label Modal */}
<Dialog open={labelOpen} onOpenChange={setLabelOpen}>
  <DialogContent className="w-[95vw] sm:max-w-3xl">
    <DialogHeader>
      <DialogTitle>Print Shipping Label</DialogTitle>
    </DialogHeader>
    {selectedOrder && (
      <div className="bg-white p-6">
        <div
          className="border-2 border-dashed border-gray-400 rounded-lg p-8 bg-white print:border-black mx-auto"
          style={{ width: "4in", height: "6in" }} // ✅ Fixed label size
        >
          {/* Top section */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <div className="text-sm font-bold text-gray-700 mb-2">FROM:</div>
              <div className="text-sm leading-relaxed">
                <div className="font-medium">E&L Beauty Solutions Private Limited</div>
                <div>152/20, 3/F Royal Space 5th Main 7th Sector,</div>
                <div>Madina Nagar, HSR Layout</div>
                <div>Bangalore, Karnataka, India-560102.</div>
                <div>India</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-800 mb-1">Melita</div>
              <div className="text-sm text-gray-600">
                Order Date: {new Date(selectedOrder.createdAt).toLocaleDateString()}
              </div>
              <div className="text-sm font-medium bg-yellow-100 px-2 py-1 rounded mt-1">
                Standard Express / PRIORITY
              </div>
            </div>
          </div>

          <hr className="border-gray-300 my-4" />

          {/* Address + payment info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-bold text-gray-700 mb-2">TO:</div>
              <div className="text-sm leading-relaxed">
                <div className="font-medium">
                  Name: {selectedOrder.shippingAddress?.firstName || ""}{" "}
                  {selectedOrder.shippingAddress?.lastName || ""}
                </div>
                <div>
                  Phone:{" "}
                  {selectedOrder.shippingAddress?.phone || selectedOrder.user?.phone || "N/A"}
                </div>
                <div className="mt-1">
                  Address: {selectedOrder.shippingAddress?.addressLine1 || "N/A"}
                  {selectedOrder.shippingAddress?.addressLine2
                    ? `, ${selectedOrder.shippingAddress.addressLine2}`
                    : ""}
                </div>
                <div>State: {selectedOrder.shippingAddress?.state || "N/A"}</div>
                <div>Pin Code: {selectedOrder.shippingAddress?.pincode || "N/A"}</div>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="font-semibold text-gray-700">DELIVERY:</span>
                <span className="font-bold">
                  ₹{selectedOrder.pricing?.shipping?.toFixed(2) || "0.00"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-gray-700">PAYMENT:</span>
                <span className="font-bold uppercase">
                  {selectedOrder.payment?.method || "COD"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-gray-700">TOTAL:</span>
                <span className="font-bold text-lg">
                  ₹{selectedOrder.pricing?.total?.toFixed(2) || "0.00"}
                </span>
              </div>
            </div>
          </div>

          <hr className="border-gray-300 my-4" />

          {/* Barcode */}
          <div className="text-center">
            <div className="text-sm font-medium mb-2">
              Ref: #{selectedOrder.orderNumber}
            </div>
            <div className="flex justify-center">
              <Barcode
                value={String(selectedOrder.orderNumber || selectedOrder._id)}
                format="CODE128"
                displayValue={false}
                height={50}
                width={1.4}
                margin={0}
                background="#ffffff"
                lineColor="#111827"
              />
            </div>
            <div className="text-xs text-gray-500 mt-2">#{selectedOrder.orderNumber}</div>
          </div>
        </div>

        {/* Print button */}
        <div className="mt-4 flex justify-end print:hidden">
          <Button onClick={() => window.print()}>Print Label</Button>
        </div>
      </div>
    )}
  </DialogContent>
</Dialog>

      {/* Invoice/Bill Modal */}
      <Dialog open={invoiceOpen} onOpenChange={setInvoiceOpen}>
        <DialogContent className="w-[95vw] sm:max-w-xl max-h-[calc(100vh-8rem)] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Invoice</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="bg-white p-6 print:p-4 text-sm">
              {/* Header */}
              <div className="flex justify-between items-start mb-8">
                <div>
                  <div className="text-2xl font-bold text-gray-800">Melita</div>
                  <div className="text-sm text-gray-600 mt-1">E&L Beauty Solutions Private Limited</div>
                  <div className="text-sm text-gray-600">Bangalore, Karnataka, India</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-800">INVOICE</div>
                  <div className="text-sm text-gray-600 mt-1">Order #{selectedOrder.orderNumber}</div>
                  <div className="text-sm text-gray-600">{new Date(selectedOrder.createdAt).toLocaleDateString()}</div>
                  <div className="text-sm text-gray-600">{new Date(selectedOrder.createdAt).toLocaleTimeString()}</div>
                </div>
              </div>

              {/* Bill To & Ship To */}
              <div className="grid grid-cols-2 gap-8 mb-8">
                <div>
                  <div className="font-semibold text-gray-700 mb-2">Bill To:</div>
                  <div className="text-sm">
                    <div className="font-medium">{selectedOrder.user?.name || `${selectedOrder.shippingAddress?.firstName || ''} ${selectedOrder.shippingAddress?.lastName || ''}`}</div>
                    <div>{selectedOrder.user?.email || '—'}</div>
                    <div>{selectedOrder.user?.phone || selectedOrder.shippingAddress?.phone || '—'}</div>
                  </div>
                </div>
                <div>
                  <div className="font-semibold text-gray-700 mb-2">Ship To:</div>
                  <div className="text-sm">
                    <div className="font-medium">{selectedOrder.shippingAddress?.firstName || ''} {selectedOrder.shippingAddress?.lastName || ''}</div>
                    <div>{selectedOrder.shippingAddress?.phone || '—'}</div>
                    <div>{selectedOrder.shippingAddress?.addressLine1 || '—'}</div>
                    {selectedOrder.shippingAddress?.addressLine2 && <div>{selectedOrder.shippingAddress.addressLine2}</div>}
                    <div>{selectedOrder.shippingAddress?.state || '—'} - {selectedOrder.shippingAddress?.pincode || '—'}</div>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="mb-6">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b-2 border-gray-300">
                      <th className="text-left py-2 font-semibold">Item</th>
                      <th className="text-right py-2 font-semibold">Price</th>
                      <th className="text-right py-2 font-semibold">Qty</th>
                      <th className="text-right py-2 font-semibold">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(selectedOrder.items || []).map((item, idx) => (
                      <tr key={idx} className="border-b border-gray-200">
                        <td className="py-2">
                          <div className="font-medium">{item.name || 'Unknown Item'}</div>
                        </td>
                        <td className="py-2 text-right">₹{(item.price ?? 0).toFixed(2)}</td>
                        <td className="py-2 text-right">{item.quantity ?? 1}</td>
                        <td className="py-2 text-right font-medium">₹{(item.subtotal ?? ((item.price ?? 0) * (item.quantity ?? 1))).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="flex justify-end mb-6">
                <div className="w-64">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between py-1">
                      <span>Subtotal:</span>
                      <span>₹{selectedOrder.pricing?.subtotal?.toFixed(2) || '0.00'}</span>
                    </div>
                    {selectedOrder.pricing?.discount && selectedOrder.pricing.discount > 0 && (
                      <div className="flex justify-between py-1 text-green-600">
                        <span>Discount:</span>
                        <span>-₹{selectedOrder.pricing.discount.toFixed(2)}</span>
                      </div>
                    )}
                    {selectedOrder.coupon && (
                      <div className="flex justify-between py-1 text-blue-600">
                        <span>Coupon ({selectedOrder.coupon.code}):</span>
                        <span>-₹{selectedOrder.coupon.value.toFixed(2)}</span>
                      </div>
                    )}
                    {selectedOrder.pricing?.rewardPointsUsed && selectedOrder.pricing.rewardPointsUsed > 0 && (
                      <div className="flex justify-between py-1 text-purple-600">
                        <span>Reward Points Used:</span>
                        <span>-₹{selectedOrder.pricing.rewardPointsUsed.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between py-1">
                      <span>Shipping:</span>
                      <span>₹{selectedOrder.pricing?.shipping?.toFixed(2) || '0.00'}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span>Tax:</span>
                      <span>₹{selectedOrder.pricing?.tax?.toFixed(2) || '0.00'}</span>
                    </div>
                    <div className="flex justify-between py-3 text-lg font-bold border-t-2 border-gray-300 mt-2">
                      <span>Total:</span>
                      <span>₹{selectedOrder.pricing?.total?.toFixed(2) || '0.00'}</span>
                    </div>
                  </div>
                  
                  {/* Payment Info */}
                  <div className="mt-3 p-3 bg-gray-50 rounded text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium">Payment Method:</span>
                      <span className="uppercase">{selectedOrder.payment?.method || 'COD'}</span>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="font-medium">Payment Status:</span>
                      <span className={`capitalize ${
                        selectedOrder.payment?.status === 'completed' ? 'text-green-600' : 
                        selectedOrder.payment?.status === 'pending' ? 'text-yellow-600' : 'text-red-600'
                      }`}>{selectedOrder.payment?.status || 'pending'}</span>
                    </div>
                    {selectedOrder.payment?.transactionId && (
                      <div className="flex justify-between mt-1">
                        <span className="font-medium">Transaction ID:</span>
                        <span className="text-xs">{selectedOrder.payment.transactionId}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="text-center text-xs text-gray-500 border-t pt-4">
                <p>Thank you for your business!</p>
                <p className="mt-1">For any queries, contact us at support@melita.com</p>
              </div>

              <div className="mt-4 flex justify-end print:hidden">
                <Button size="sm" onClick={() => window.print()}>🖨️ Print Invoice</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
</div>
  );
};

export default AdminOrders;