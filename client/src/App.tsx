import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/contexts/CartContext";
import Index from "./pages/Index";
import About from "./pages/About";
import Shop from "./pages/Shop";
import Blog from "./pages/Blog";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Wishlist from "./pages/Wishlist";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NotFound from "./pages/NotFound";
import ScrollToTop from "./components/ScrollToTop";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsAndConditions from "./pages/TermsAndConditions";
import RefundAndReturns from "./pages/RefundAndReturns";
import Cleanser from "./pages/products/Cleanser";
import Essence from "./pages/products/Essence";
import Moisturizer from "./pages/products/Moisturizer";
import Sunscreen from "./pages/products/Sunscreen";
import BarrierBoostCombo from "./pages/products/BarrierBoostCombo";
import DrySkinDailyEssentials from "./pages/products/DrySkinDailyEssentials";
import OilySkinDailyEssentials from "./pages/products/OilySkinDailyEssentials";
import BarrierCareStarterDuo from "./pages/products/BarrierCareStarterDuo";
import Dashboard from "./pages/dashboard/Dashboard";
import DashboardLayout from "./components/DashboardLayout";
import Profile from "./pages/dashboard/Profile";
import Address from "./pages/dashboard/Address";
import Orders from "./pages/dashboard/Orders";
import OrderDetails from "./pages/dashboard/OrderDetails";
import Rewards from "./pages/dashboard/Rewards";
import Transactions from "./pages/dashboard/Transactions";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import SellerLogin from "./pages/sellers/SellerLogin";
import SellerDashboard from "./pages/sellers/SellerDashboard";

const queryClient = new QueryClient();
//adding comment
const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <CartProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
        <ScrollToTop />
        <Routes>
          {/* public pages */}
          <Route path="/" element={<Index />} />
          <Route path="/about" element={<About />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/blog" element={<Blog />} />

          {/* product pages */}
          <Route path="/products/cleanser" element={<Cleanser />} />
          <Route path="/products/essence" element={<Essence />} />
          <Route path="/products/moisturizer" element={<Moisturizer />} />
          <Route path="/products/sunscreen" element={<Sunscreen />} />
          <Route path="/products/barrier-boost-combo" element={<BarrierBoostCombo />} />
          <Route path="/products/dry-skin-daily-essentials" element={<DrySkinDailyEssentials />} />
          <Route path="/products/oily-skin-daily-essentials" element={<OilySkinDailyEssentials />} />
          <Route path="/products/barrier-care-starter-duo" element={<BarrierCareStarterDuo />} />

          {/* other routes */}
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-conditions" element={<TermsAndConditions />} />
          <Route path="/refund-returns" element={<RefundAndReturns />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/checkout" element={<Checkout />} />

          {/* admin routes */}
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />

          {/* seller routes */}
          <Route path="/seller" element={<SellerLogin/>} />
          <Route path="/seller/dashboard" element={<SellerDashboard/>} />

        {/* dashboard with nested routes */}
  <Route path="/dashboard" element={<DashboardLayout />}>
    <Route index element={<Dashboard />} />
    <Route path="profile" element={<Profile />} />
    <Route path="address" element={<Address />} />
    <Route path="orders" element={<Orders />} />
    <Route path="orders/:orderId" element={<OrderDetails />} />
    <Route path="rewards" element={<Rewards />} />
    <Route path="transactions" element={<Transactions/>} />
  </Route>

          {/* fallback */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      </CartProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
