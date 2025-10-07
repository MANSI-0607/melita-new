import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  DollarSign, 
  Package, 
  User,
  Trash2,
  Gift,
  Coins,
  Phone,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { api } from '@/lib/api';

interface Customer {
  _id: string;
  name: string;
  phone: string;
  rewardPoints: number;
  loyaltyTier: string;
}

interface Product {
  _id: string;
  name: string;
  price: number;
  originalPrice: number;
  category: string;
  images: {
    primary: string;
    hover?: string;
    gallery?: string[];
  };
  inventory: {
    stock: number;
  };
}

interface CartItem {
  product: Product;
  quantity: number;
}

interface Coupon {
  _id: string;
  code: string;
  type: 'fixed' | 'percentage';
  value: number;
  minOrderAmount: number;
  maxDiscountAmount?: number;
  description: string;
}

const RecordSale: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [availableCoupons, setAvailableCoupons] = useState<Coupon[]>([]);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [coinsToUse, setCoinsToUse] = useState(0);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [step, setStep] = useState<'setup' | 'otp' | 'success'>('setup');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const { toast } = useToast();

  // Fetch customers created by this seller
  const fetchCustomers = async () => {
    setLoadingCustomers(true);
    try {
      const response = await api.get<{ success: boolean; data: Customer[] }>('/sellers/customers');
      if (response.success) {
        setCustomers(response.data);
      }
    } catch (error: any) {
      console.error('Fetch customers error:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch customers',
        variant: 'destructive'
      });
    } finally {
      setLoadingCustomers(false);
    }
  };

  // Fetch available products
  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      const response = await api.get<{ success: boolean; data: { products: Product[] } }>('/sellers/products?limit=100');
      if (response.success) {
        setProducts(response.data.products);
      }
    } catch (error: any) {
      console.error('Fetch products error:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch products. Please check your login status.',
        variant: 'destructive'
      });
    } finally {
      setLoadingProducts(false);
    }
  };

  // Fetch customer's available coupons
  const fetchCustomerCoupons = async (customerId: string) => {
    try {
      const response = await api.get<{ success: boolean; data: Coupon[] }>(`/sellers/customer-coupons/${customerId}`);
      if (response.success) {
        setAvailableCoupons(response.data);
      }
    } catch (error: any) {
      console.error('Fetch coupons error:', error);
      setAvailableCoupons([]);
    }
  };

  useEffect(() => {
    fetchCustomers();
    fetchProducts();
  }, []);

  useEffect(() => {
    if (selectedCustomer) {
      fetchCustomerCoupons(selectedCustomer._id);
      setCoinsToUse(0);
      setSelectedCoupon(null);
    }
  }, [selectedCustomer]);

  // Auto-deselect coupon if subtotal becomes ineligible
  useEffect(() => {
    if (selectedCoupon && getSubtotal() < selectedCoupon.minOrderAmount) {
      setSelectedCoupon(null);
    }
  }, [cart, selectedCoupon]);

  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.product._id === product._id);
    if (existingItem) {
      updateCartQuantity(product._id, existingItem.quantity + 1);
    } else {
      setCart([...cart, { product, quantity: 1 }]);
    }
  };

  const updateCartQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setCart(cart.map(item => 
      item.product._id === productId 
        ? { ...item, quantity: Math.min(newQuantity, item.product.inventory.stock) }
        : item
    ));
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.product._id !== productId));
  };

  const getSubtotal = () => {
    return cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  const getCouponDiscount = () => {
    if (!selectedCoupon) return 0;
    const subtotal = getSubtotal();
    
    if (subtotal < selectedCoupon.minOrderAmount) return 0;
    
    let discount = 0;
    if (selectedCoupon.type === 'percentage') {
      discount = (subtotal * selectedCoupon.value) / 100;
    } else {
      discount = selectedCoupon.value;
    }
    
    if (selectedCoupon.maxDiscountAmount) {
      discount = Math.min(discount, selectedCoupon.maxDiscountAmount);
    }
    
    return Math.min(discount, subtotal);
  };

  const getCoinsDiscount = () => {
    return Math.min(coinsToUse, selectedCustomer?.rewardPoints || 0, getSubtotal() - getCouponDiscount());
  };

  const getFinalTotal = () => {
    return Math.max(0, getSubtotal() - getCouponDiscount() - getCoinsDiscount());
  };

  const handleConfirmPayment = async () => {
    if (!selectedCustomer) {
      toast({
        title: 'Error',
        description: 'Please select a customer',
        variant: 'destructive'
      });
      return;
    }

    if (cart.length === 0) {
      toast({
        title: 'Error',
        description: 'Please add at least one product',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      // Send OTP for payment confirmation
      const response = await api.post<{ success: boolean; message?: string }>('/sellers/record-sale/send-otp', {
        customerId: selectedCustomer._id,
        items: cart.map(item => ({
          productId: item.product._id,
          quantity: item.quantity,
          price: item.product.price
        })),
        couponId: selectedCoupon?._id,
        coinsUsed: coinsToUse,
        total: getFinalTotal()
      });

      if (response.success) {
        setStep('otp');
        const devOtp = (response as any).devOtp as string | undefined;
        if (devOtp) {
          // Prefill for convenience in dev mode
          setOtp(devOtp);
          toast({
            title: 'OTP Sent (DEV)',
            description: `DEV OTP: ${devOtp}`,
          });
        } else {
          toast({
            title: 'OTP Sent',
            description: 'Verification code sent to customer\'s mobile number'
          });
        }
      } else {
        toast({
          title: 'Error',
          description: response.message || 'Failed to send OTP',
          variant: 'destructive'
        });
      }
    } catch (error: any) {
      console.error('Send OTP error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to send OTP',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp.trim() || otp.length !== 6) {
      toast({
        title: 'Error',
        description: 'Please enter a valid 6-digit OTP',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const response = await api.post<{ success: boolean; message?: string; data?: any }>('/sellers/record-sale/verify-otp', {
        customerId: selectedCustomer?._id,
        otp: otp.trim(),
        items: cart.map(item => ({
          productId: item.product._id,
          quantity: item.quantity,
          price: item.product.price
        })),
        couponId: selectedCoupon?._id,
        coinsUsed: coinsToUse,
        total: getFinalTotal()
      });

      if (response.success) {
        setStep('success');
        // Refresh customer data to show updated points
        fetchCustomers();
        toast({
          title: 'Sale Completed',
          description: `Order ${response.data?.orderNumber || ''} has been successfully recorded`
        });
      } else {
        toast({
          title: 'Error',
          description: response.message || 'Invalid OTP',
          variant: 'destructive'
        });
      }
    } catch (error: any) {
      console.error('Verify OTP error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to verify OTP',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const resetSale = () => {
    setSelectedCustomer(null);
    setCart([]);
    setSelectedCoupon(null);
    setCoinsToUse(0);
    setOtp('');
    setStep('setup');
    setSelectedProductId('');
    // Refresh products to get updated stock
    fetchProducts();
  };

  const filteredCustomers = customers; // dropdown lists all; search removed for compact UI
  const filteredProducts = products;   // dropdown lists all; search removed for compact UI

  if (step === 'otp') {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Phone className="w-5 h-5" />
              <span>Payment Verification</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mx-auto">
                <Phone className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium">Verify Payment</h3>
                <p className="text-sm text-gray-600">
                  OTP sent to {selectedCustomer?.name} ({selectedCustomer?.phone})
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp">Enter OTP</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  maxLength={6}
                  className="text-center text-lg tracking-widest"
                />
              </div>

              <div className="space-y-2">
                <Button
                  onClick={handleVerifyOTP}
                  disabled={loading || otp.length !== 6}
                  className="w-full"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Verify & Complete Sale
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  onClick={() => setStep('setup')}
                  disabled={loading}
                  className="w-full"
                >
                  Back to Sale
                </Button>
              </div>
            </div>

            {/* Order Summary */}
            <div className="border-t pt-4">
              <h4 className="font-medium mb-2">Order Summary</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>₹{getSubtotal().toFixed(2)}</span>
                </div>
                {getCouponDiscount() > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Coupon Discount:</span>
                    <span>-₹{getCouponDiscount().toFixed(2)}</span>
                  </div>
                )}
                {getCoinsDiscount() > 0 && (
                  <div className="flex justify-between text-blue-600">
                    <span>Coins Used:</span>
                    <span>-₹{getCoinsDiscount().toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-purple-600">
                  <span>Points Earned:</span>
                  <span>+{Math.round(getFinalTotal() * 0.10)} points</span>
                </div>
                <div className="flex justify-between font-medium text-lg border-t pt-1">
                  <span>Total:</span>
                  <span>₹{getFinalTotal().toFixed(2)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-8 text-center space-y-6">
            <div className="flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mx-auto">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-green-700 mb-2">Sale Completed Successfully!</h3>
              <p className="text-gray-600">
                Order has been recorded for {selectedCustomer?.name}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span>Final Amount:</span>
                  <span className="font-medium">₹{getFinalTotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Items:</span>
                  <span>{cart.length} products</span>
                </div>
              </div>
            </div>
            <Button onClick={resetSale} className="w-full" size="lg">
              Record Another Sale
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Customer Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="w-5 h-5" />
            <span>Assign To User</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Select a User</Label>
            <Select
              value={selectedCustomer?._id || ''}
              onValueChange={(val) => {
                const c = customers.find(u => u._id === val) || null;
                setSelectedCustomer(c);
              }}
              disabled={loadingCustomers}
            >
              <SelectTrigger>
                <SelectValue placeholder={loadingCustomers ? 'Loading customers...' : '-- Select a User --'} />
              </SelectTrigger>
              <SelectContent>
                {filteredCustomers.map((c) => (
                  <SelectItem key={c._id} value={c._id}>
                    {c.name} ({c.phone})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Product Selection */}
      {selectedCustomer && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Package className="w-5 h-5" />
              <span>Add a Product</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-end gap-2">
              <div className="flex-1 space-y-2">
                <Label>Search for a product</Label>
                <Select
                  value={selectedProductId}
                  onValueChange={setSelectedProductId}
                  disabled={loadingProducts}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={loadingProducts ? 'Loading products...' : '-- Search for a product --'} />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredProducts.map((p) => (
                      <SelectItem key={p._id} value={p._id}>
                        {p.name} — ₹{p.price}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={() => {
                  const p = products.find(x => x._id === selectedProductId);
                  if (p) {
                    addToCart(p);
                    setSelectedProductId('');
                  }
                }}
                disabled={!selectedProductId}
              >
                Add
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Shopping Cart */}
      {cart.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ShoppingCart className="w-5 h-5" />
              <span>Shopping Cart ({cart.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              {cart.map((item) => (
                <div key={item.product._id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">{item.product.name}</p>
                    <p className="text-sm text-gray-600">₹{item.product.price} each</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateCartQuantity(item.product._id, item.quantity - 1)}
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateCartQuantity(item.product._id, item.quantity + 1)}
                        disabled={item.quantity >= item.product.inventory.stock}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                    <span className="w-20 text-right font-medium">
                      ₹{(item.product.price * item.quantity).toFixed(2)}
                    </span>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => removeFromCart(item.product._id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

     {/* Coupons & Coins */}
{selectedCustomer && cart.length > 0 && (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center space-x-2">
        <Gift className="w-5 h-5" />
        <span>Coupons & Coins</span>
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      {/* Available Coupons */}
      <div className="space-y-2">
        <Label>Available Coupons</Label>
        {availableCoupons
          .filter(c => getSubtotal() >= c.minOrderAmount)
          .map((coupon, index, self) =>
            self.indexOf(coupon) === index ? (
              <div
                key={coupon._id}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedCoupon?._id === coupon._id
                    ? 'border-green-500 bg-green-50'
                    : 'hover:border-gray-300'
                }`}
                onClick={() => {
                  setSelectedCoupon(
                    selectedCoupon?._id === coupon._id ? null : coupon
                  );
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{coupon.code}</p>
                    <p className="text-sm text-gray-600">{coupon.description}</p>
                    <p className="text-xs text-gray-500">
                      Min order: ₹{coupon.minOrderAmount}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-green-600">
                      {coupon.type === 'percentage'
                        ? `${coupon.value}% OFF`
                        : `₹${coupon.value} OFF`}
                    </p>
                  </div>
                </div>
              </div>
            ) : null
          )}
      </div>

      {/* Use Reward Coins */}
      <div className="space-y-2">
        <Label>Use Reward Coins</Label>
        <div className="flex items-center space-x-2">
          <Input
            type="number"
            value={coinsToUse || ''}
            onChange={(e) => {
              const value = parseInt(e.target.value) || 0;
              const maxCoins = Math.min(
                selectedCustomer.rewardPoints,
                getSubtotal() - getCouponDiscount()
              );
              setCoinsToUse(Math.min(value, maxCoins));
            }}
            max={Math.min(
              selectedCustomer.rewardPoints,
              getSubtotal() - getCouponDiscount()
            )}
            className="flex-1"
          />
          <div className="text-sm text-gray-600">
            Available: {selectedCustomer.rewardPoints} coins
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
)}

{/* Payment Summary */}
{selectedCustomer && cart.length > 0 && (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center space-x-2">
        <DollarSign className="w-5 h-5" />
        <span>Payment Summary</span>
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="space-y-2">
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span>₹{getSubtotal().toFixed(2)}</span>
        </div>

        {getCouponDiscount() > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Coupon Discount ({selectedCoupon?.code}):</span>
            <span>-₹{getCouponDiscount().toFixed(2)}</span>
          </div>
        )}

        {getCoinsDiscount() > 0 && (
          <div className="flex justify-between text-blue-600">
            <span>Coins Used ({coinsToUse} coins):</span>
            <span>-₹{getCoinsDiscount().toFixed(2)}</span>
          </div>
        )}

        <div className="flex justify-between text-purple-600">
          <span>Points Earned:</span>
          <span>+{Math.round(getFinalTotal() * 0.1)} points</span>
        </div>

        <div className="flex justify-between text-lg font-semibold border-t pt-2">
          <span>Final Total:</span>
          <span>₹{getFinalTotal().toFixed(2)}</span>
        </div>
      </div>

      <Button
        onClick={handleConfirmPayment}
        disabled={loading}
        className="w-full"
        size="lg"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Sending OTP...
          </>
        ) : (
          <>
            <Phone className="w-4 h-4 mr-2" />
            Confirm Payment - Send OTP
          </>
        )}
      </Button>
    </CardContent>
  </Card>
)}

    </div>
  );
};

export default RecordSale;
