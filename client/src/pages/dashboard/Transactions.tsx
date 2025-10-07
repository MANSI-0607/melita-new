import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CreditCard,
  ArrowLeft,
  Plus,
  Minus,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "@/lib/api";

interface Transaction {
  _id: string;
  type: string; // "earn" | "redeem" | "expire"
  amount: number;
  points: {
    earned: number;
    redeemed: number;
    balance: number;
  };
  description: string;
  orderId?: string;
  createdAt: string;
}

export default function Transactions() {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const params = new URLSearchParams({ page: page.toString(), limit: "10" });
        const json = await api.get<{
          success: boolean;
          data: { transactions: Transaction[]; pagination: { totalPages: number } };
        }>(`/rewards/transactions?${params}`);

        if (!json?.success) throw new Error("Failed to fetch transactions");

        setTransactions(json.data.transactions || []);
        setTotalPages(json.data.pagination?.totalPages || 1);
      } catch (error: any) {
        console.error("Error fetching transactions:", error);
        if (error?.response?.status === 401) {
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [page, navigate]);

  const getTransactionIcon = (type: string) => {
    if (type === "earn") return <Plus className="h-4 w-4 text-green-600" />;
    if (type === "redeem") return <Minus className="h-4 w-4 text-red-600" />;
    if (type === "expire") return <AlertTriangle className="h-4 w-4 text-amber-600" />;
    return <CreditCard className="h-4 w-4 text-gray-600" />;
  };

  const getTransactionColor = (type: string) => {
    if (type === "earn") return "text-green-600";
    if (type === "redeem" || type === "expire") return "text-red-600";
    return "text-gray-600";
  };

  const getTransactionBadge = (type: string) => {
    if (type === "earn") return "bg-green-100 text-green-800";
    if (type === "redeem") return "bg-red-100 text-red-800";
    if (type === "expire") return "bg-amber-100 text-amber-800";
    return "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="space-y-4">
          <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
          <div className="h-8 bg-gray-200 rounded w-64 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-96 animate-pulse"></div>
        </div>
        <Card className="border-border bg-card shadow-soft">
          <CardContent className="py-16">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="h-6 bg-gray-200 rounded w-48 mx-auto mb-3 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-64 mx-auto animate-pulse"></div>
            </div>
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
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Transactions</h1>
          <p className="text-muted-foreground mt-2">
            A history of all your reward earnings and redemptions.
          </p>
        </div>
      </div>

      {transactions.length === 0 ? (
        /* Empty State */
        <Card className="border-border bg-card shadow-soft">
          <CardContent className="py-16">
            <div className="text-center max-w-md mx-auto">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-accent/10 to-primary/10 rounded-full flex items-center justify-center">
                <CreditCard className="h-10 w-10 text-accent" />
              </div>
              <h2 className="text-2xl font-semibold text-foreground mb-3">
                No Transactions Found
              </h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Your rewards history is empty. Earn cashback on your next purchase!
              </p>
              <Button
                variant="melita"
                size="lg"
                className="w-full sm:w-auto"
                onClick={() => navigate("/shop")}
              >
                Shop Now
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Transactions List */
        <div className="space-y-4">
          {transactions.map((transaction) => (
            <Card key={transaction._id} className="border-border bg-card shadow-soft">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-full bg-muted`}>
                      {getTransactionIcon(transaction.type)}
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-foreground">
                        {transaction.description}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {new Date(transaction.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Badge className={getTransactionBadge(transaction.type)}>
                      {transaction.type.toUpperCase()}
                    </Badge>
                    <div className={`text-right ${getTransactionColor(transaction.type)}`}>
                      <p className="text-sm font-semibold">
                        {transaction.type === "earn" 
                          ? `+${transaction.points?.earned || 0} points`
                          : transaction.type === "redeem" 
                          ? `-${transaction.points?.redeemed || 0} points`
                          : transaction.type === "expire"
                          ? `-${transaction.points?.redeemed || 0} points`
                          : `₹${transaction.amount.toFixed(2)}`
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Pagination */}
          <div className="flex justify-center gap-4 pt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Prev
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
