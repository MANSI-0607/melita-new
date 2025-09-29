import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Check, X, MapPin, Truck, CreditCard, Banknote } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Address {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  addressline1: string;
  addressline2?: string;
  state: string;
  pincode: string;
}

interface ShippingMethod {
  id: string;
  label: string;
  delivery_est: string;
  charge: number;
}

interface Coupon {
  id: number;
  code: string;
  type: 'fixed' | 'percentage';
  value: number;
  source: 'user' | 'global';
  usage_limit_per_user: number;
  already_used: number;
}

const Checkout = () => {
  const navigate = useNavigate();
  const { state: cartState, clearCart } = useCart();
  const { toast } = useToast();

  // State
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'success' | 'failed'>('pending');
  const [orderId, setOrderId] = useState<string>('');
  const [paymentErrorMessage, setPaymentErrorMessage] = useState('');

  // Address state
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    addressline1: '',
    addressline2: '',
    state: '',
    pincode: ''
  });

  // Shipping state
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>({
    id: 'free-standard',
    label: 'Free Shipping',
    delivery_est: '5-7 business days',
    charge: 0
  });

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'cod'>('razorpay');

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [couponMessage, setCouponMessage] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [availableCoupons, setAvailableCoupons] = useState<Coupon[]>([]);

  // Super coins state
  const [coinsToApply, setCoinsToApply] = useState('');
  const [appliedCoins, setAppliedCoins] = useState(0);
  const [userCoins, setUserCoins] = useState(0);

  // Redirect if cart is empty
  useEffect(() => {
    if (cartState.items.length === 0) {
      navigate('/cart');
    }
  }, [cartState.items.length, navigate]);

  // Load user data and addresses
  useEffect(() => {
    loadUserData();
    loadAddresses();
    loadCoupons();
  }, []);

  const loadUserData = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const response = await fetch('http://localhost:5000/auth/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        const userData = await response.json();
        setUserCoins(userData.rewardPoints || 0);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const loadAddresses = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const response = await fetch('http://localhost:5000/checkout/addresses', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAddresses(data.addresses || []);
        if (data.addresses && data.addresses.length > 0) {
          setSelectedAddressId(data.addresses[0].id);
        } else {
          setShowAddressForm(true);
        }
      }
    } catch (error) {
      console.error('Error loading addresses:', error);
    }
  };

  const loadCoupons = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const response = await fetch('http://localhost:5000/checkout/coupons', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAvailableCoupons(data.coupons || []);
      }
    } catch (error) {
      console.error('Error loading coupons:', error);
    }
  };

  const saveNewAddress = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        toast({
          title: "Authentication Required",
          description: "Please log in to save address",
          variant: "destructive"
        });
        return;
      }

      const response = await fetch('http://localhost:5000/checkout/addresses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newAddress)
      });

      if (response.ok) {
        const data = await response.json();
        setAddresses(prev => [data.address, ...prev]);
        setSelectedAddressId(data.address.id);
        setShowAddressForm(false);
        setNewAddress({
          first_name: '',
          last_name: '',
          email: '',
          phone: '',
          addressline1: '',
          addressline2: '',
          state: '',
          pincode: ''
        });
        toast({
          title: "Address Saved",
          description: "Address has been saved successfully"
        });
      } else {
        throw new Error('Failed to save address');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save address",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponMessage('Please enter a coupon code');
      return;
    }

    setIsLoading(true);
    setCouponMessage('');

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setCouponMessage('Please log in to apply coupons');
        return;
      }

      const response = await fetch('http://localhost:5000/checkout/coupons/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ couponCode })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setAppliedCoupon(data.coupon);
          setCouponMessage('Coupon applied successfully!');
        } else {
          setCouponMessage(data.message || 'Invalid coupon');
        }
      } else {
        throw new Error('Failed to apply coupon');
      }
    } catch (error) {
      setCouponMessage('Failed to apply coupon');
    } finally {
      setIsLoading(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponMessage('');
  };

  const applyCoins = () => {
    const amount = parseFloat(coinsToApply);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid number of coins",
        variant: "destructive"
      });
      return;
    }
    if (amount > userCoins) {
      toast({
        title: "Insufficient Coins",
        description: "You don't have enough coins",
        variant: "destructive"
      });
      return;
    }
    setAppliedCoins(amount);
    toast({
      title: "Coins Applied",
      description: `${amount} coins applied successfully`
    });
  };

  const removeCoins = () => {
    setAppliedCoins(0);
    setCoinsToApply('');
  };

  // Calculations
  const subtotal = cartState.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const couponDiscount = appliedCoupon ? 
    (appliedCoupon.type === 'percentage' ? 
      (subtotal * appliedCoupon.value / 100) : 
      appliedCoupon.value) : 0;
  const coinsDiscount = appliedCoins;
  const shippingCost = shippingMethod.charge;
  const totalDiscount = couponDiscount + coinsDiscount;
  const grandTotal = Math.max(0, subtotal + shippingCost - totalDiscount);
  const cashbackEarned = Math.floor(Math.max(0, subtotal - couponDiscount) * 0.20);

  const placeOrder = async () => {
    if (!selectedAddressId) {
      toast({
        title: "Address Required",
        description: "Please select or add a shipping address",
        variant: "destructive"
      });
      setCurrentStep(1);
      return;
    }

    setIsLoading(true);

    try {
      const selectedAddress = addresses.find(addr => addr.id === selectedAddressId);
      if (!selectedAddress) {
        throw new Error('Selected address not found');
      }

      const orderData = {
        items: cartState.items,
        customer: selectedAddress,
        shippingMethod,
        paymentMethod,
        coupon: appliedCoupon,
        coinsUsed: appliedCoins,
        totals: {
          subtotal,
          shippingCost,
          totalDiscount,
          grandTotal,
          cashbackEarned
        }
      };

      if (paymentMethod === 'cod') {
        await placeCodOrder(orderData);
      } else {
        await placeRazorpayOrder(orderData);
      }
    } catch (error) {
      console.error('Order placement error:', error);
      setPaymentErrorMessage(error.message || 'Failed to place order');
      setPaymentStatus('failed');
    } finally {
      setIsLoading(false);
    }
  };

  const placeCodOrder = async (orderData: any) => {
    try {
      const response = await fetch('http://localhost:5000/checkout/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(orderData)
      });

      if (response.ok) {
        const data = await response.json();
        setOrderId(data.orderId);
        clearCart();
        setPaymentStatus('success');
        toast({
          title: "Order Placed",
          description: "Your order has been placed successfully"
        });
      } else {
        throw new Error('Failed to place COD order');
      }
    } catch (error) {
      throw error;
    }
  };

  const placeRazorpayOrder = async (orderData: any) => {
    try {
      // Create Razorpay order
      const response = await fetch('http://localhost:5000/checkout/orders/razorpay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) {
        throw new Error('Failed to create Razorpay order');
      }

      const data = await response.json();
      
      // Initialize Razorpay
      const options = {
        key: data.key,
        amount: grandTotal * 100,
        currency: 'INR',
        name: 'Melita',
        description: 'Order Payment',
        order_id: data.razorpayOrderId,
        handler: async (response: any) => {
          try {
            // Verify payment
            const verifyResponse = await fetch('http://localhost:5000/checkout/orders/verify-payment', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('authToken')}`
              },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                orderId: data.orderId
              })
            });

            if (verifyResponse.ok) {
              const verifyData = await verifyResponse.json();
              setOrderId(verifyData.orderId);
              clearCart();
              setPaymentStatus('success');
              toast({
                title: "Payment Successful",
                description: "Your order has been placed successfully"
              });
            } else {
              throw new Error('Payment verification failed');
            }
          } catch (error) {
            setPaymentErrorMessage('Payment verification failed');
            setPaymentStatus('failed');
          }
        },
        prefill: {
          name: `${selectedAddress?.first_name} ${selectedAddress?.last_name}`,
          email: selectedAddress?.email,
          contact: selectedAddress?.phone
        },
        theme: { color: '#835339' }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error) {
      throw error;
    }
  };

  const retryPayment = () => {
    setPaymentStatus('pending');
    setPaymentErrorMessage('');
    setCurrentStep(3);
  };

  const selectedAddress = addresses.find(addr => addr.id === selectedAddressId);

  if (paymentStatus === 'success') {
    return (
      <div className="max-w-2xl mx-auto text-center py-24 px-4">
        <div className="mx-auto h-16 w-16 text-green-500 mb-4">
          <Check className="h-16 w-16" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Thank You!</h1>
        <p className="text-gray-600 mb-8">Your order #{orderId} has been placed successfully.</p>
        <div className="space-x-4">
          <Button onClick={() => navigate('/dashboard/orders')} variant="outline">
            View My Orders
          </Button>
          <Button onClick={() => navigate('/shop')} className="bg-[#835339] hover:bg-[#6b3d2a]">
            Continue Shopping
          </Button>
        </div>
      </div>
    );
  }

  if (paymentStatus === 'failed') {
    return (
      <div className="max-w-2xl mx-auto text-center py-24 px-4">
        <div className="mx-auto h-16 w-16 text-red-500 mb-4">
          <X className="h-16 w-16" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Payment Failed</h1>
        <p className="text-gray-600 mb-4">Your order could not be placed. Your money has not been charged.</p>
        {paymentErrorMessage && (
          <p className="text-sm text-gray-500 mb-8">{paymentErrorMessage}</p>
        )}
        <div className="space-x-4">
          <Button onClick={retryPayment} className="bg-[#835339] hover:bg-[#6b3d2a]">
            Try Again
          </Button>
          <Button onClick={() => navigate('/')} variant="outline">
            Go to Homepage
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center h-16">
            <h1 className="text-2xl font-bold text-[#835339]">Checkout</h1>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-8">
            {[
              { step: 1, title: 'Address', icon: MapPin },
              { step: 2, title: 'Shipping', icon: Truck },
              { step: 3, title: 'Payment', icon: CreditCard }
            ].map(({ step, title, icon: Icon }) => (
              <div key={step} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  currentStep >= step 
                    ? 'bg-[#835339] border-[#835339] text-white' 
                    : 'border-gray-300 text-gray-300'
                }`}>
                  {currentStep > step ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                </div>
                <span className={`ml-2 text-sm font-medium ${
                  currentStep >= step ? 'text-[#835339]' : 'text-gray-500'
                }`}>
                  {title}
                </span>
                {step < 3 && (
                  <div className={`w-8 h-0.5 ml-4 ${
                    currentStep > step ? 'bg-[#835339]' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
              
              {/* Cart Items */}
              <div className="space-y-4 mb-6">
                {cartState.items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4">
                    <img src={item.image} alt={item.name} className="w-16 h-16 rounded-md object-cover" />
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-gray-900">{item.name}</h3>
                      <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-medium text-gray-900">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Coupon Section */}
              <div className="border-t pt-4 mb-4">
                <div className="flex space-x-2 mb-2">
                  <Input
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Discount code"
                    disabled={!!appliedCoupon}
                    className="flex-1"
                  />
                  <Button
                    onClick={applyCoupon}
                    disabled={!couponCode || !!appliedCoupon || isLoading}
                    variant="outline"
                    size="sm"
                  >
                    Apply
                  </Button>
                </div>
                {couponMessage && (
                  <p className={`text-xs ${
                    appliedCoupon ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {couponMessage}
                  </p>
                )}
                {appliedCoupon && (
                  <div className="flex items-center justify-between text-sm text-green-600">
                    <span>Discount: {appliedCoupon.code}</span>
                    <Button
                      onClick={removeCoupon}
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700"
                    >
                      Remove
                    </Button>
                  </div>
                )}
              </div>

              {/* Super Coins Section */}
              {userCoins > 0 && (
                <div className="border-t pt-4 mb-4">
                  <div className="text-sm mb-2">
                    <p>Available Coins: <span className="font-semibold text-[#835339]">{userCoins}</span></p>
                  </div>
                  <div className="flex space-x-2 mb-2">
                    <Input
                      type="number"
                      value={coinsToApply}
                      onChange={(e) => setCoinsToApply(e.target.value)}
                      placeholder="Coins to use"
                      disabled={appliedCoins > 0}
                      className="flex-1"
                    />
                    <Button
                      onClick={applyCoins}
                      disabled={!coinsToApply || appliedCoins > 0}
                      variant="outline"
                      size="sm"
                    >
                      Apply
                    </Button>
                  </div>
                  {appliedCoins > 0 && (
                    <div className="flex items-center justify-between text-sm text-green-600">
                      <span>Coins Used: {appliedCoins}</span>
                      <Button
                        onClick={removeCoins}
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700"
                      >
                        Remove
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* Totals */}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Shipping</span>
                  <span>{shippingCost > 0 ? `₹${shippingCost.toFixed(2)}` : 'Free'}</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Coupon Discount</span>
                    <span>-₹{couponDiscount.toFixed(2)}</span>
                  </div>
                )}
                {coinsDiscount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Coins Discount</span>
                    <span>-₹{coinsDiscount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-semibold border-t pt-2">
                  <span>Total</span>
                  <span>₹{grandTotal.toFixed(2)}</span>
                </div>
                {cashbackEarned > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>You will earn</span>
                    <span>{cashbackEarned} coins</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              {/* Step 1: Address */}
              {currentStep === 1 && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Select Shipping Address</h2>
                  
                  {/* Saved Addresses */}
                  <div className="space-y-4 mb-6">
                    {addresses.map((address) => (
                      <label
                        key={address.id}
                        className={`block p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedAddressId === address.id
                            ? 'border-[#835339] bg-[#fdfaf8]'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="address"
                          value={address.id}
                          checked={selectedAddressId === address.id}
                          onChange={() => setSelectedAddressId(address.id)}
                          className="sr-only"
                        />
                        <div className="flex items-start">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">
                              {address.first_name} {address.last_name}
                            </p>
                            <p className="text-sm text-gray-600">{address.addressline1}</p>
                            {address.addressline2 && (
                              <p className="text-sm text-gray-600">{address.addressline2}</p>
                            )}
                            <p className="text-sm text-gray-600">
                              {address.state}, {address.pincode}
                            </p>
                            <p className="text-sm text-gray-600">Phone: {address.phone}</p>
                          </div>
                          {selectedAddressId === address.id && (
                            <Check className="w-5 h-5 text-[#835339]" />
                          )}
                        </div>
                      </label>
                    ))}
                  </div>

                  {/* Add New Address */}
                  <div className="border-t pt-6">
                    <Button
                      onClick={() => setShowAddressForm(!showAddressForm)}
                      variant="outline"
                      className="w-full"
                    >
                      {showAddressForm ? 'Cancel' : 'Add New Address'}
                    </Button>

                    {showAddressForm && (
                      <div className="mt-6 space-y-4">
                        <h3 className="text-lg font-medium text-gray-900">New Address</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="first_name">First Name</Label>
                            <Input
                              id="first_name"
                              value={newAddress.first_name}
                              onChange={(e) => setNewAddress(prev => ({ ...prev, first_name: e.target.value }))}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="last_name">Last Name</Label>
                            <Input
                              id="last_name"
                              value={newAddress.last_name}
                              onChange={(e) => setNewAddress(prev => ({ ...prev, last_name: e.target.value }))}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="email">Email</Label>
                            <Input
                              id="email"
                              type="email"
                              value={newAddress.email}
                              onChange={(e) => setNewAddress(prev => ({ ...prev, email: e.target.value }))}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="phone">Phone</Label>
                            <Input
                              id="phone"
                              value={newAddress.phone}
                              onChange={(e) => setNewAddress(prev => ({ ...prev, phone: e.target.value }))}
                              required
                            />
                          </div>
                          <div className="md:col-span-2">
                            <Label htmlFor="addressline1">Address Line 1</Label>
                            <Input
                              id="addressline1"
                              value={newAddress.addressline1}
                              onChange={(e) => setNewAddress(prev => ({ ...prev, addressline1: e.target.value }))}
                              required
                            />
                          </div>
                          <div className="md:col-span-2">
                            <Label htmlFor="addressline2">Address Line 2</Label>
                            <Input
                              id="addressline2"
                              value={newAddress.addressline2}
                              onChange={(e) => setNewAddress(prev => ({ ...prev, addressline2: e.target.value }))}
                            />
                          </div>
                          <div>
                            <Label htmlFor="state">State</Label>
                            <Input
                              id="state"
                              value={newAddress.state}
                              onChange={(e) => setNewAddress(prev => ({ ...prev, state: e.target.value }))}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="pincode">Pincode</Label>
                            <Input
                              id="pincode"
                              value={newAddress.pincode}
                              onChange={(e) => setNewAddress(prev => ({ ...prev, pincode: e.target.value }))}
                              required
                            />
                          </div>
                        </div>
                        <div className="flex justify-end">
                          <Button
                            onClick={saveNewAddress}
                            disabled={isLoading}
                            className="bg-[#835339] hover:bg-[#6b3d2a]"
                          >
                            {isLoading ? 'Saving...' : 'Save Address'}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end mt-8">
                    <Button
                      onClick={() => setCurrentStep(2)}
                      disabled={!selectedAddressId}
                      className="bg-[#835339] hover:bg-[#6b3d2a]"
                    >
                      Continue to Shipping
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 2: Shipping */}
              {currentStep === 2 && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Choose Shipping Method</h2>
                  
                  <RadioGroup value={shippingMethod.id} onValueChange={(value) => {
                    const method = [
                      { id: 'free-standard', label: 'Free Shipping', delivery_est: '5-7 business days', charge: 0 },
                      { id: 'express', label: 'Express Shipping', delivery_est: '2-3 business days', charge: 99 }
                    ].find(m => m.id === value);
                    if (method) setShippingMethod(method);
                  }}>
                    <div className="space-y-4">
                      {[
                        { id: 'free-standard', label: 'Free Shipping', delivery_est: '5-7 business days', charge: 0 },
                        { id: 'express', label: 'Express Shipping', delivery_est: '2-3 business days', charge: 99 }
                      ].map((method) => (
                        <label
                          key={method.id}
                          className={`block p-4 border rounded-lg cursor-pointer transition-colors ${
                            shippingMethod.id === method.id
                              ? 'border-[#835339] bg-[#fdfaf8]'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center">
                            <RadioGroupItem value={method.id} className="mr-4" />
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{method.label}</p>
                              <p className="text-sm text-gray-600">{method.delivery_est}</p>
                            </div>
                            <p className="text-sm font-medium text-gray-900">
                              {method.charge > 0 ? `₹${method.charge}` : 'Free'}
                            </p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </RadioGroup>

                  <div className="flex justify-between mt-8">
                    <Button
                      onClick={() => setCurrentStep(1)}
                      variant="outline"
                    >
                      Back
                    </Button>
                    <Button
                      onClick={() => setCurrentStep(3)}
                      className="bg-[#835339] hover:bg-[#6b3d2a]"
                    >
                      Continue to Payment
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: Payment */}
              {currentStep === 3 && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Choose Payment Method</h2>
                  
                  <RadioGroup value={paymentMethod} onValueChange={(value: 'razorpay' | 'cod') => setPaymentMethod(value)}>
                    <div className="space-y-4">
                      <label className={`block p-4 border rounded-lg cursor-pointer transition-colors ${
                        paymentMethod === 'razorpay'
                          ? 'border-[#835339] bg-[#fdfaf8]'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}>
                        <div className="flex items-center">
                          <RadioGroupItem value="razorpay" className="mr-4" />
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">Pay with Razorpay</p>
                            <p className="text-sm text-gray-600">Cards, UPI, Netbanking & Wallets</p>
                          </div>
                          <CreditCard className="w-5 h-5 text-gray-400" />
                        </div>
                      </label>
                      
                      <label className={`block p-4 border rounded-lg cursor-pointer transition-colors ${
                        paymentMethod === 'cod'
                          ? 'border-[#835339] bg-[#fdfaf8]'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}>
                        <div className="flex items-center">
                          <RadioGroupItem value="cod" className="mr-4" />
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">Cash on Delivery (COD)</p>
                            <p className="text-sm text-gray-600">Pay with cash upon delivery</p>
                          </div>
                          <Banknote className="w-5 h-5 text-gray-400" />
                        </div>
                      </label>
                    </div>
                  </RadioGroup>

                  {/* Address Summary */}
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-sm font-medium text-gray-500">Ship to</h3>
                      <Button
                        onClick={() => setCurrentStep(1)}
                        variant="ghost"
                        size="sm"
                        className="text-[#835339] hover:text-[#6b3d2a]"
                      >
                        Change
                      </Button>
                    </div>
                    {selectedAddress && (
                      <div className="text-sm text-gray-700">
                        <p className="font-medium">
                          {selectedAddress.first_name} {selectedAddress.last_name}
                        </p>
                        <p>{selectedAddress.addressline1}</p>
                        {selectedAddress.addressline2 && <p>{selectedAddress.addressline2}</p>}
                        <p>{selectedAddress.state}, {selectedAddress.pincode}</p>
                        <p>Email: {selectedAddress.email}</p>
                        <p>Phone: {selectedAddress.phone}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end mt-8">
                    <Button
                      onClick={placeOrder}
                      disabled={isLoading}
                      className="bg-[#835339] hover:bg-[#6b3d2a] px-8 py-3 text-lg"
                    >
                      {isLoading ? 'Processing...' : `Place Order (₹${grandTotal.toFixed(2)})`}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
