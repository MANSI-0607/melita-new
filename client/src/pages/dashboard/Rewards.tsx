import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Gift, ArrowLeft, Coins } from "lucide-react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
export default function Rewards() {
  const navigate = useNavigate();
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="space-y-4">
        <Link 
          to="/" 
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
            <span className="text-4xl font-bold text-foreground">0</span>
            <Badge variant="secondary" className="px-3 py-1">
              1 Point = ₹1 discount
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Cashback History */}
      <Card className="border-border bg-card shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Gift className="h-5 w-5 text-accent" />
            Cashback History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-accent/10 to-secondary/10 rounded-full flex items-center justify-center">
              <Gift className="h-10 w-10 text-accent" />
            </div>
            <h2 className="text-2xl font-semibold text-foreground mb-3">
              No Cashback Earned Yet
            </h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              You'll earn 25% cashback in points on eligible orders!
            </p>
            <Button variant="melita" size="lg" className="w-full sm:w-auto" onClick={() => navigate("/shop")}>
              Start Shopping
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}