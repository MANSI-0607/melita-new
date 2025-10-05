import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Package, 
  Calendar,
  Download,
  RefreshCw
} from 'lucide-react';

interface SaleRecord {
  id: string;
  date: string;
  customerName: string;
  customerPhone: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  status: 'completed' | 'pending' | 'cancelled';
}

interface SalesStats {
  totalSales: number;
  totalOrders: number;
  averageOrderValue: number;
  topSellingItems: Array<{
    name: string;
    quantity: number;
    revenue: number;
  }>;
}

const mockSalesData: SaleRecord[] = [
  {
    id: '1',
    date: '2024-01-15',
    customerName: 'Priya Sharma',
    customerPhone: '9876543210',
    items: [
      { name: 'Facial Cleanser', quantity: 2, price: 299 },
      { name: 'Moisturizer', quantity: 1, price: 599 }
    ],
    total: 1197,
    status: 'completed'
  },
  {
    id: '2',
    date: '2024-01-14',
    customerName: 'Rahul Kumar',
    customerPhone: '9876543211',
    items: [
      { name: 'Hair Serum', quantity: 1, price: 799 }
    ],
    total: 799,
    status: 'completed'
  },
  {
    id: '3',
    date: '2024-01-13',
    customerName: 'Anita Patel',
    customerPhone: '9876543212',
    items: [
      { name: 'Face Mask', quantity: 3, price: 199 },
      { name: 'Toner', quantity: 1, price: 399 }
    ],
    total: 996,
    status: 'pending'
  }
];

const SalesReport: React.FC = () => {
  const [salesData, setSalesData] = useState<SaleRecord[]>([]);
  const [stats, setStats] = useState<SalesStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('7'); // days
  const { toast } = useToast();

  const fetchSalesData = async () => {
    setLoading(true);
    try {
      // TODO: Implement API call to fetch sales data
      await new Promise(resolve => setTimeout(resolve, 1000)); // Mock delay
      
      setSalesData(mockSalesData);
      
      // Calculate stats
      const totalSales = mockSalesData.reduce((sum, sale) => sum + sale.total, 0);
      const totalOrders = mockSalesData.length;
      const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;
      
      // Calculate top selling items
      const itemMap = new Map();
      mockSalesData.forEach(sale => {
        sale.items.forEach(item => {
          const existing = itemMap.get(item.name) || { quantity: 0, revenue: 0 };
          itemMap.set(item.name, {
            name: item.name,
            quantity: existing.quantity + item.quantity,
            revenue: existing.revenue + (item.price * item.quantity)
          });
        });
      });
      
      const topSellingItems = Array.from(itemMap.values())
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5);

      setStats({
        totalSales,
        totalOrders,
        averageOrderValue,
        topSellingItems
      });

    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to fetch sales data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalesData();
  }, [dateRange]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const exportReport = () => {
    toast({
      title: 'Export Started',
      description: 'Sales report is being prepared for download'
    });
    // TODO: Implement export functionality
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading sales report...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Sales Report</h2>
          <p className="text-gray-600">Track your sales performance and analytics</p>
        </div>
        <div className="flex space-x-2">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
          <Button variant="outline" onClick={exportReport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" onClick={fetchSalesData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Sales</p>
                  <p className="text-2xl font-bold text-green-600">₹{stats.totalSales.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Package className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Orders</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.totalOrders}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Avg. Order Value</p>
                  <p className="text-2xl font-bold text-purple-600">₹{stats.averageOrderValue.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Sales */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5" />
              <span>Recent Sales</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {salesData.length === 0 ? (
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">No sales recorded yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {salesData.map((sale) => (
                  <div key={sale.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="font-medium">{sale.customerName}</h4>
                        <p className="text-sm text-gray-600">{sale.customerPhone}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">₹{sale.total.toFixed(2)}</p>
                        <Badge className={getStatusColor(sale.status)}>
                          {sale.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      <div className="flex items-center space-x-2 mb-1">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(sale.date)}</span>
                      </div>
                      <div>
                        Items: {sale.items.map(item => `${item.name} (${item.quantity})`).join(', ')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Selling Items */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5" />
              <span>Top Selling Items</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.topSellingItems.length === 0 ? (
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">No items sold yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {stats?.topSellingItems.map((item, index) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600">{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-gray-600">{item.quantity} units sold</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">₹{item.revenue.toFixed(2)}</p>
                      <p className="text-sm text-gray-600">revenue</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SalesReport;
