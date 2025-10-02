import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Gift, ArrowLeft, Coins } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "@/lib/api";

export default function Rewards() {
  const navigate = useNavigate();

  // --- State ---
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [balance, setBalance] = useState<{
    rewardPoints: number;
    loyaltyTier: string;
    totalSpent: number;
    pointsValue: number;
    nextTierThreshold: number | null;
  } | null>(null);

  const [summary, setSummary] = useState<{
    totalEarned: number;
    totalRedeemed: number;
    totalPointsEarned: number;
    totalPointsRedeemed: number;
    transactionCount: number;
    lastTransaction: string | null;
  } | null>(null);

  const [opportunities, setOpportunities] = useState<
    Array<{ id: string; title: string; description: string; points: string | number; icon: string; completed: boolean }>
  >([]);

  // --- Fetch data on mount ---
  useEffect(() => {
    (async () => {
      try {
        const [balRes, sumRes, oppRes] = await Promise.all([
          api.get<any>("/rewards/balance"),
          api.get<any>("/rewards/summary"),
          api.get<any>("/rewards/opportunities"),
        ]);

        if (balRes.success) setBalance(balRes.data);
        if (sumRes.success) setSummary(sumRes.data);
        if (oppRes.success) setOpportunities(oppRes.data);
      } catch (e: any) {
        setError(e?.message || "Failed to load rewards");
        if ((e?.message || "").toLowerCase().includes("unauthorized")) navigate("/login");
      } finally {
        setLoading(false);
      }
    })();
  }, [navigate]);

  if (loading) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="space-y-4">
          <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
          <div className="h-8 bg-gray-200 rounded w-64 animate-pulse"></div>
        </div>
        <Card className="border-border bg-card shadow-soft">
          <CardContent className="py-16">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="h-6 bg-gray-200 rounded w-48 mx-auto mb-3 animate-pulse"></div>
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
        <h1 className="text-3xl font-bold text-foreground">My Rewards</h1>
      </div>

      {/* Coins Balance */}
      <Card className="border-border bg-gradient-to-br from-muted/50 to-secondary/20 shadow-luxury">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Coins className="h-5 w-5 text-primary" />
            Total Melita Coins Balance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-bold text-foreground">{balance?.rewardPoints ?? 0}</span>
            <Badge variant="secondary" className="px-3 py-1">
              1 Point = ₹1 discount
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Reward Summary */}
      <Card className="border-border bg-card shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Gift className="h-5 w-5 text-accent" />
            Reward Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          {summary ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 gap-6">
              <div className="flex flex-col items-center">
                <span className="text-2xl font-bold">{summary.totalPointsEarned}</span>
                <span className="text-sm text-muted-foreground">Points Earned</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-2xl font-bold">{summary.totalPointsRedeemed}</span>
                <span className="text-sm text-muted-foreground">Points Redeemed</span>
              </div>
             
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-12">No summary available.</p>
          )}
        </CardContent>
      </Card>

      {/* Earning Opportunities */}
      {/* <Card className="border-border bg-card shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Gift className="h-5 w-5 text-accent" />
            Earning Opportunities
          </CardTitle>
        </CardHeader>
        <CardContent>
          {opportunities.length > 0 ? (
            <ul className="space-y-4">
              {opportunities.map((opp) => (
                <li
                  key={opp.id}
                  className="flex items-center justify-between border border-gray-200 p-4 rounded-lg"
                >
                  <div>
                    <h3 className="font-medium text-foreground">{opp.title}</h3>
                    <p className="text-sm text-muted-foreground">{opp.description}</p>
                  </div>
                  <Badge
                    className={`px-3 py-1 ${opp.completed ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}
                  >
                    {opp.points} pts
                  </Badge>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-muted-foreground py-12">No earning opportunities available.</p>
          )}
        </CardContent>
      </Card> */}

      {error && <p className="text-red-600 text-center">{error}</p>}
    </div>
  );
}
