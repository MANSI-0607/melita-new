import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, Gift, MapPin, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";

interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  rewardPoints?: number;
  loyaltyTier?: string;
}

interface DashboardStats {
  orders: {
    totalOrders: number;
    totalSpent: number;
    lastOrder: string | null;
  };
  addresses: number;
  rewards: {
    totalEarned: number;
    totalRedeemed: number;
    totalPointsEarned: number;
    totalPointsRedeemed: number;
  };
  loyaltyTier: string;
  rewardPoints: number;
  profileCompletion: number;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('melita_token');
        if (!token) {
          navigate('/login');
          return;
        }

        // Fetch user profile (server route: /profile)
        const profileRes = await api.get<{ success: boolean; data: User }>("/profile");
        if (!profileRes?.success) throw new Error('Failed to fetch profile');
        setUser(profileRes.data);

        // Fetch dashboard stats (server route: /profile/dashboard)
        const statsRes = await api.get<{ success: boolean; data: any }>("/profile/dashboard");
        if (!statsRes?.success) throw new Error('Failed to fetch dashboard data');
        const { user: _u, ...rest } = statsRes.data || {};
        setStats(rest as DashboardStats);

        // Fetch recent orders (limit 3)
        const ordersRes = await api.get<any>(`/orders?${new URLSearchParams({ page: '1', limit: '3' })}`);
        const orders = ordersRes?.data?.orders || ordersRes?.orders || [];
        setRecentOrders(Array.isArray(orders) ? orders : []);

        // Fetch recent reward transactions (limit 3)
        const txRes = await api.get<any>(`/rewards/transactions?${new URLSearchParams({ page: '1', limit: '3' })}`);
        const txns = txRes?.data?.transactions || txRes?.transactions || [];
        setRecentTransactions(Array.isArray(txns) ? txns : []);
      } catch (error) {
        console.error('Error fetching user data:', error);
        const msg = (error as Error)?.message || 'Failed to load dashboard';
        setError(msg);
        if (msg.toLowerCase().includes('unauthorized')) {
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  if (loading) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="space-y-2">
          <div className="h-8 bg-gray-200 rounded w-64 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-48 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border-border bg-card shadow-soft">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-16 animate-pulse mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-20 animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="p-4 border rounded-md bg-red-50 text-red-700">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Section */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">
          Welcome, {user?.name || 'Guest'} 🌸
        </h1>
        <p className="text-muted-foreground">
          Your luxury skincare journey continues here
        </p>
        {/* Profile completion bar removed as requested */}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-border bg-card shadow-soft hover:shadow-luxury transition-all duration-300 transform hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Your Orders
            </CardTitle>
            <ShoppingBag className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {stats?.orders?.totalOrders || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Total: ₹{stats?.orders?.totalSpent?.toFixed(2) || '0.00'}
            </p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-soft hover:shadow-luxury transition-all duration-300 transform hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Reward Points
            </CardTitle>
            <Gift className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {stats?.rewardPoints || user?.rewardPoints || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.loyaltyTier ? `${stats.loyaltyTier.charAt(0).toUpperCase() + stats.loyaltyTier.slice(1)} Tier` : '1 Point = ₹1'}
            </p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-soft hover:shadow-luxury transition-all duration-300 transform hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Saved Addresses
            </CardTitle>
            <MapPin className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {stats?.addresses || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.addresses > 0 ? 'Addresses saved' : 'Add your address'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card className="border-border bg-card shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <TrendingUp className="h-5 w-5 text-primary" />
            Recent Orders
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentOrders.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                <ShoppingBag className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">No recent orders</h3>
              <p className="text-muted-foreground mb-4">Your recent orders will appear here once you make your first purchase</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((o) => (
                <div key={o._id} className="flex items-center justify-between p-3 rounded-md border bg-gray-100">
                  <div>
                    <div className="text-sm font-semibold text-foreground">#{o.orderNumber}</div>
                    <div className="text-xs text-muted-foreground">{new Date(o.createdAt).toLocaleDateString()}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-foreground">₹{(o.pricing?.total ?? 0).toFixed(2)}</div>
                    <div className="text-xs text-muted-foreground capitalize">{o.status}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card className="border-border bg-card shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Gift className="h-5 w-5 text-accent" />
            Recent Transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentTransactions.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                <Gift className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">No recent transactions</h3>
              <p className="text-muted-foreground mb-4">Your reward transactions will appear here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentTransactions.map((t) => (
                <div key={t._id} className="flex items-center justify-between p-3 rounded-md border bg-gray-100">
                  <div>
                    <div className="text-sm font-semibold text-foreground capitalize">{t.type}</div>
                    <div className="text-xs text-muted-foreground">{new Date(t.createdAt).toLocaleDateString()}</div>
                  </div>
                  <div className={`text-sm font-semibold ${t.type === 'earn' ? 'text-green-600' : t.type === 'redeem' ? 'text-red-600' : 'text-foreground'}`}>
                    {t.type === 'earn' ? '+' : t.type === 'redeem' ? '-' : ''}₹{(t.amount ?? 0).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}