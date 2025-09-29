import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CreditCard, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function Transactions() {
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
            A history of all your coupons, coins, and cashback rewards.
          </p>
        </div>
      </div>

      {/* Empty State */}
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
            <Button variant="melita" size="lg" className="w-full sm:w-auto">
              Shop Now
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}