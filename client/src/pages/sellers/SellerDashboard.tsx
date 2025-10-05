import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { 
  LayoutDashboard, 
  UserPlus, 
  Users, 
  ShoppingCart, 
  Gift, 
  BarChart3, 
  LogOut,
  DollarSign,
  TrendingUp,
  Package
} from 'lucide-react';
import { api } from '@/lib/api';
import AddCustomer from './AddCustomer';
import Customers from './Customers';
import RecordSale from './RecordSale';
import RedeemService from './RedeemService';
import SalesReport from './SalesReport';
import SellerOrders from './SellerOrders';

interface SellerStats {
  salesToday: number;
  salesThisMonth: number;
  ordersToday: number;
}

interface Seller {
  _id: string;
  name: string;
  contact: string;
  status: string;
}

const SellerDashboard: React.FC = () => {
  const [stats, setStats] = useState<SellerStats>({ salesToday: 0, salesThisMonth: 0, ordersToday: 0 });
  const [seller, setSeller] = useState<Seller | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const { toast } = useToast();
  const navigate = useNavigate();

  // Check authentication
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('sellerToken');
      const sellerInfo = localStorage.getItem('sellerInfo');

      if (!token || !sellerInfo) {
        navigate('/seller');
        return;
      }

      try {
        const sellerData = JSON.parse(sellerInfo);
        setSeller(sellerData);
      } catch (error) {
        console.error('Error parsing seller info:', error);
        localStorage.removeItem('sellerToken');
        localStorage.removeItem('sellerInfo');
        navigate('/seller');
      }
    };

    // Small delay to ensure login process completes
    const timer = setTimeout(checkAuth, 100);

    return () => clearTimeout(timer);
  }, [navigate]);

  const fetchStats = async () => {
    try {
      const response = await api.get('/sellers/dashboard-stats');
      const data = (response as any).data;
      if (data.success) {
        setStats(data.data);
      }
    } catch (error: any) {
      console.error('Failed to fetch stats:', error);
      if (error.response?.status === 401) {
        // Token expired or invalid
        localStorage.removeItem('sellerToken');
        localStorage.removeItem('sellerInfo');
        navigate('/seller');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (seller) {
      fetchStats();
    }
  }, [seller]);

  const handleLogout = () => {
    localStorage.removeItem('sellerToken');
    localStorage.removeItem('sellerInfo');
    toast({
      description: 'Logged out successfully'
    });
    navigate('/seller/login');
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'add-customer', label: 'Add Customer', icon: UserPlus },
    { id: 'customers', label: 'Created Customers', icon: Users },
    { id: 'record-sale', label: 'Record Sale', icon: ShoppingCart },
    { id: 'orders', label: 'My Orders', icon: Package },
    { id: 'redeem-service', label: 'Redeem Against Service', icon: Gift },
    { id: 'sales-report', label: 'Sales Report', icon: BarChart3 },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <DollarSign className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Sales (Today)</p>
                      <p className="text-2xl font-bold text-green-600">₹{stats.salesToday.toFixed(2)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <TrendingUp className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Sales (This Month)</p>
                      <p className="text-2xl font-bold text-blue-600">₹{stats.salesThisMonth.toFixed(2)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Package className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Orders (Today)</p>
                      <p className="text-2xl font-bold text-purple-600">{stats.ordersToday}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Welcome, {seller?.name}!</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Welcome to your seller dashboard. Use the sidebar to navigate between different sections.
                </p>
                <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                  {menuItems.slice(1).map((item) => {
                    const Icon = item.icon;
                    return (
                      <Button
                        key={item.id}
                        variant="outline"
                        className="h-20 flex-col space-y-2"
                        onClick={() => setActiveTab(item.id)}
                      >
                        <Icon className="w-6 h-6" />
                        <span className="text-sm">{item.label}</span>
                      </Button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'add-customer':
        return <AddCustomer onCustomerAdded={fetchStats} />;

      case 'customers':
        return <Customers />;

      case 'record-sale':
        return <RecordSale />;

      case 'orders':
        return <SellerOrders />;

      case 'redeem-service':
        return <RedeemService />;

      case 'sales-report':
        return <SalesReport />;

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">Seller Portal</h2>
          <p className="text-sm text-gray-600">{seller?.name}</p>
        </div>
        
        <nav className="mt-6">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3 px-6 py-3 text-left hover:bg-gray-100 transition-colors ${
                  activeTab === item.id ? 'bg-blue-50 border-r-2 border-blue-600 text-blue-600' : 'text-gray-700'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-0 w-64 p-6 border-t">
          <Button
            variant="outline"
            className="w-full"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 capitalize">
              {activeTab.replace('-', ' ')}
            </h1>
          </div>
          
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;
