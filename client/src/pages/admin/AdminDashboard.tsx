import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  ShoppingBag, 
  TrendingUp, 
  Package, 
  Star, 
  Settings,
  LogOut,
  BarChart3,
  Calendar,
  DollarSign
} from "lucide-react";
import { api } from "@/lib/api";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Import admin components
import AdminProducts from './components/AdminProducts';
import AdminOrders from './components/AdminOrders';
import AdminUsers from './components/AdminUsers';
import AdminTransactions from './components/AdminTransactions';
import AdminReviews from './components/AdminReviews';
import AdminSettings from './components/AdminSettings';


interface AdminStats {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  ordersToday: number;
  recentOrders: any[];
  ordersPerDay: Array<{ date: string; orders: number }>;
}

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  count?: number;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState("dashboard");

  const sidebarItems: SidebarItem[] = [
    { id: "dashboard", label: "Dashboard", icon: <BarChart3 className="h-4 w-4" /> },
    { id: "products", label: "Manage Products", icon: <Package className="h-4 w-4" />, count: stats?.totalProducts },
    { id: "orders", label: "Manage Orders", icon: <ShoppingBag className="h-4 w-4" />, count: stats?.totalOrders },
    { id: "users", label: "Manage Users", icon: <Users className="h-4 w-4" />, count: stats?.totalUsers },
    { id: "transactions", label: "Manage Transactions", icon: <DollarSign className="h-4 w-4" /> },
    { id: "reviews", label: "Manage Reviews", icon: <Star className="h-4 w-4" /> },
    { id: "settings", label: "Settings", icon: <Settings className="h-4 w-4" /> },
  ];

  useEffect(() => {
    const token = localStorage.getItem("melita_admin_token");
    if (!token) {
      navigate("/admin/login");
      return;
    }
    fetchStats();
  }, [navigate]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get<{ success: boolean; data: AdminStats }>("/admin/stats");
      if (response.success) {
        setStats(response.data);
      }
    } catch (err) {
      const msg = (err as Error)?.message || "Failed to load stats";
      setError(msg);
      if (msg.toLowerCase().includes("unauthorized")) {
        localStorage.removeItem("melita_admin_token");
        navigate("/admin/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("melita_admin_token");
    navigate("/admin/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchStats} variant="outline">Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-sm border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">Melita Admin</h1>
          <p className="text-sm text-gray-600">Management Dashboard</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors ${
                activeSection === item.id
                  ? "bg-primary text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <div className="flex items-center gap-3">
                {item.icon}
                <span className="text-sm font-medium">{item.label}</span>
              </div>
              {item.count !== undefined && (
                <Badge variant="secondary" className="text-xs">
                  {item.count}
                </Badge>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4 mr-3" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {activeSection === "dashboard" && (
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Dashboard Overview</h2>
                <p className="text-gray-600 mt-2">Welcome to the Melita admin dashboard</p>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="border-border bg-card shadow-soft">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                        <p className="text-3xl font-bold text-foreground">{stats?.totalUsers || 0}</p>
                      </div>
                      <div className="p-3 bg-blue-100 rounded-full">
                        <Users className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border bg-card shadow-soft">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                        <p className="text-3xl font-bold text-foreground">{stats?.totalOrders || 0}</p>
                      </div>
                      <div className="p-3 bg-green-100 rounded-full">
                        <ShoppingBag className="h-6 w-6 text-green-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border bg-card shadow-soft">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Revenue</p>
                        <p className="text-3xl font-bold text-foreground">₹{stats?.totalRevenue?.toFixed(2) || '0.00'}</p>
                      </div>
                      <div className="p-3 bg-yellow-100 rounded-full">
                        <DollarSign className="h-6 w-6 text-yellow-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border bg-card shadow-soft">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Orders Today</p>
                        <p className="text-3xl font-bold text-foreground">{stats?.ordersToday || 0}</p>
                      </div>
                      <div className="p-3 bg-purple-100 rounded-full">
                        <Calendar className="h-6 w-6 text-purple-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Orders Per Day Chart */}
              <Card className="border-border bg-card shadow-soft">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Orders Per Day (Last 7 Days)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={stats?.ordersPerDay || []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Line 
                          type="monotone" 
                          dataKey="orders" 
                          stroke="#8884d8" 
                          strokeWidth={2}
                          dot={{ fill: '#8884d8' }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Orders */}
              <Card className="border-border bg-card shadow-soft">
                <CardHeader>
                  <CardTitle>Recent Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats?.recentOrders?.slice(0, 5).map((order) => (
                      <div key={order._id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-medium">#{order.orderNumber}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">₹{order.pricing?.total?.toFixed(2) || '0.00'}</p>
                          <Badge variant="outline" className="text-xs">
                            {order.status}
                          </Badge>
                        </div>
                      </div>
                    )) || (
                      <p className="text-center text-muted-foreground py-8">No recent orders</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeSection === "products" && <AdminProducts />}

          {activeSection === "orders" && <AdminOrders />}

          {activeSection === "users" && <AdminUsers />}

          {activeSection === "reviews" && <AdminReviews />}

          {activeSection === "transactions" && <AdminTransactions />}

          {activeSection === "settings" && <AdminSettings />}
        </div>
      </div>
    </div>
  );
}