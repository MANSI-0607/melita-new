import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingBag, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
export default function Orders() {
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
        <h1 className="text-3xl font-bold text-foreground">My Order History</h1>
      </div>

      {/* Empty State */}
      <Card className="border-border bg-card shadow-soft">
        <CardContent className="py-16">
          <div className="text-center max-w-md mx-auto">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-primary/10 to-luxury-bronze/10 rounded-full flex items-center justify-center">
              <ShoppingBag className="h-10 w-10 text-primary" />
            </div>
            <h2 className="text-2xl font-semibold text-foreground mb-3">
              No Orders Found
            </h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              You haven't placed any orders yet. All your future orders will appear here.
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