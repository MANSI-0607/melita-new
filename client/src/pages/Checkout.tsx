import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Check,
  X,
  MapPin,
  Truck,
  CreditCard,
  Banknote,
  ChevronDown,
  ChevronUp,
  Plus
} from 'lucide-react';
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
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'success' | 'failed'>(
    'pending'
  );
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
    pincode: '',
  });

  // Shipping state
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>({
    id: 'free-standard',
    label: 'Free Shipping',
    delivery_est: '5-7 business days',
    charge: 0,
  });

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'cod'>('razorpay');

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [couponMessage, setCouponMessage] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [showCoupons, setShowCoupons] = useState(false);
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
        headers: { Authorization: `Bearer ${token}` },
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
        headers: { Authorization: `Bearer ${token}` },
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
        headers: { Authorization: `Bearer ${token}` },
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
      const token = localStorage.getItem('melita_token');
      if (!token) {
        toast({
          title: 'Authentication Required',
          description: 'Please log in to save address',
          variant: 'destructive',
        });
        return;
      }

      const response = await fetch('http://localhost:5000/checkout/addresses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newAddress),
      });

      if (response.ok) {
        const data = await response.json();
        setAddresses((prev) => [data.address, ...prev]);
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
          pincode: '',
        });
        toast({
          title: 'Address Saved',
          description: 'Address has been saved successfully',
        });
      } else {
        throw new Error('Failed to save address');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save address',
        variant: 'destructive',
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
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ couponCode }),
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
        title: 'Invalid Amount',
        description: 'Please enter a valid number of coins',
        variant: 'destructive',
      });
      return;
    }
    if (amount > userCoins) {
      toast({
        title: 'Insufficient Coins',
        description: "You don't have enough coins",
        variant: 'destructive',
      });
      return;
    }
    setAppliedCoins(amount);
    toast({
      title: 'Coins Applied',
      description: `${amount} coins applied successfully`,
    });
  };

  const removeCoins = () => {
    setAppliedCoins(0);
    setCoinsToApply('');
  };

  // Calculations
  const subtotal = cartState.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const couponDiscount = appliedCoupon
    ? appliedCoupon.type === 'percentage'
      ? (subtotal * appliedCoupon.value) / 100
      : appliedCoupon.value
    : 0;
  const coinsDiscount = appliedCoins;
  const shippingCost = shippingMethod.charge;
  const totalDiscount = couponDiscount + coinsDiscount;
  const grandTotal = Math.max(0, subtotal + shippingCost - totalDiscount);
  const cashbackEarned = Math.floor(Math.max(0, subtotal - couponDiscount) * 0.2);

  const placeOrder = async () => {
    if (!selectedAddressId) {
      toast({
        title: 'Address Required',
        description: 'Please select or add a shipping address',
        variant: 'destructive',
      });
      setCurrentStep(1);
      return;
    }

    setIsLoading(true);

    try {
      const selectedAddress = addresses.find((addr) => addr.id === selectedAddressId);
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
          cashbackEarned,
        },
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
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        const data = await response.json();
        setOrderId(data.orderId);
        clearCart();
        setPaymentStatus('success');
        toast({
          title: 'Order Placed',
          description: 'Your order has been placed successfully',
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
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify(orderData),
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
                Authorization: `Bearer ${localStorage.getItem('authToken')}`,
              },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                orderId: data.orderId,
              }),
            });

            if (verifyResponse.ok) {
              const verifyData = await verifyResponse.json();
              setOrderId(verifyData.orderId);
              clearCart();
              setPaymentStatus('success');
              toast({
                title: 'Payment Successful',
                description: 'Your order has been placed successfully',
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
          contact: selectedAddress?.phone,
        },
        theme: { color: '#835339' },
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

  const selectedAddress = addresses.find((addr) => addr.id === selectedAddressId);

  if (paymentStatus === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center py-24 px-4">
        <div className="mx-auto h-24 w-24 text-green-500 mb-6">
          <Check className="h-full w-full stroke-1" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Thank You!</h1>
        <p className="text-lg text-gray-600 mb-8">
          Your order #{orderId} has been placed successfully.
        </p>
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
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
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center py-24 px-4">
        <div className="mx-auto h-24 w-24 text-red-500 mb-6">
          <X className="h-full w-full stroke-1" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Payment Failed</h1>
        <p className="text-lg text-gray-600 mb-4">
          Your order could not be placed. No amount has been charged.
        </p>
        {paymentErrorMessage && <p className="text-sm text-gray-500 mb-8">{paymentErrorMessage}</p>}
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
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
    <div className="min-h-screen bg-gray-50 font-sans">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center h-16">
            <h1 className="text-2xl font-bold text-[#835339]">Checkout</h1>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-center space-x-12">
            {[
              { step: 1, title: 'Address', icon: MapPin },
              { step: 2, title: 'Shipping', icon: Truck },
              { step: 3, title: 'Payment', icon: CreditCard },
            ].map(({ step, title, icon: Icon }) => (
              <div key={step} className="flex flex-col items-center">
                <div
                  className={`flex items-center justify-center w-12 h-12 rounded-full transition-colors duration-300 ${
                    currentStep >= step
                      ? 'bg-[#835339] text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {currentStep > step ? <Check className="w-6 h-6" /> : <Icon className="w-6 h-6" />}
                </div>
                <span
                  className={`mt-2 text-sm font-medium ${
                    currentStep >= step ? 'text-gray-900' : 'text-gray-500'
                  }`}
                >
                  {title}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">
            {/* Step 1: Address */}
            <section
              className={`bg-white rounded-xl shadow-lg p-8 transition-all duration-300 ${
                currentStep === 1 ? 'block' : 'hidden'
              }`}
            >
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">1. Shipping Address</h2>

              {/* Saved Addresses */}
              {addresses.length > 0 && (
                <div className="space-y-4 mb-6">
                  <RadioGroup
                    value={selectedAddressId?.toString() || ''}
                    onValueChange={(value) => setSelectedAddressId(Number(value))}
                  >
                    {addresses.map((address) => (
                      <label
                        key={address.id}
                        className={`block p-6 border rounded-xl cursor-pointer transition-colors ${
                          selectedAddressId === address.id
                            ? 'border-[#835339] bg-[#fdfaf8]'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">
                              {address.first_name} {address.last_name}
                            </p>
                            <p className="text-sm text-gray-600">{address.addressline1}</p>
                            {address.addressline2 && (
                              <p className="text-sm text-gray-600">{address.addressline2}</p>
                            )}
                            <p className="text-sm text-gray-600">
                              {address.state} - {address.pincode}
                            </p>
                            <p className="text-sm text-gray-600">Phone: {address.phone}</p>
                          </div>
                          <RadioGroupItem value={address.id.toString()} className="mt-1" />
                        </div>
                      </label>
                    ))}
                  </RadioGroup>
                </div>
              )}

              {/* Add New Address */}
              <div className="mt-6">
                <Button
                  onClick={() => setShowAddressForm(!showAddressForm)}
                  variant="outline"
                  className="w-full text-[#835339] border-[#835339] hover:bg-[#fdfaf8]"
                >
                  {showAddressForm ? 'Cancel New Address' : 'Add New Address'}
                </Button>

                {showAddressForm && (
                  <div className="mt-6 p-6 border rounded-xl bg-gray-50">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">New Address Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="first_name">First Name</Label>
                        <Input
                          id="first_name"
                          value={newAddress.first_name}
                          onChange={(e) =>
                            setNewAddress((prev) => ({ ...prev, first_name: e.target.value }))
                          }
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="last_name">Last Name</Label>
                        <Input
                          id="last_name"
                          value={newAddress.last_name}
                          onChange={(e) =>
                            setNewAddress((prev) => ({ ...prev, last_name: e.target.value }))
                          }
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={newAddress.email}
                          onChange={(e) =>
                            setNewAddress((prev) => ({ ...prev, email: e.target.value }))
                          }
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={newAddress.phone}
                          onChange={(e) =>
                            setNewAddress((prev) => ({ ...prev, phone: e.target.value }))
                          }
                          required
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label htmlFor="addressline1">Address Line 1</Label>
                        <Input
                          id="addressline1"
                          value={newAddress.addressline1}
                          onChange={(e) =>
                            setNewAddress((prev) => ({ ...prev, addressline1: e.target.value }))
                          }
                          required
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label htmlFor="addressline2">Address Line 2 (Optional)</Label>
                        <Input
                          id="addressline2"
                          value={newAddress.addressline2}
                          onChange={(e) =>
                            setNewAddress((prev) => ({ ...prev, addressline2: e.target.value }))
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="state">State</Label>
                        <Input
                          id="state"
                          value={newAddress.state}
                          onChange={(e) =>
                            setNewAddress((prev) => ({ ...prev, state: e.target.value }))
                          }
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="pincode">Pincode</Label>
                        <Input
                          id="pincode"
                          value={newAddress.pincode}
                          onChange={(e) =>
                            setNewAddress((prev) => ({ ...prev, pincode: e.target.value }))
                          }
                          required
                        />
                      </div>
                    </div>
                    <div className="flex justify-end mt-4">
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
            </section>

            {/* Step 2: Shipping */}
            <section
              className={`bg-white rounded-xl shadow-lg p-8 transition-all duration-300 ${
                currentStep === 2 ? 'block' : 'hidden'
              }`}
            >
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">2. Shipping Method</h2>

              <RadioGroup
                value={shippingMethod.id}
                onValueChange={(value) => {
                  const method = [
                    {
                      id: 'free-standard',
                      label: 'Free Shipping',
                      delivery_est: '5-7 business days',
                      charge: 0,
                    },
                    {
                      id: 'express',
                      label: 'Express Shipping',
                      delivery_est: '2-3 business days',
                      charge: 99,
                    },
                  ].find((m) => m.id === value);
                  if (method) setShippingMethod(method);
                }}
              >
                <div className="space-y-4">
                  {[
                    {
                      id: 'free-standard',
                      label: 'Free Shipping',
                      delivery_est: '5-7 business days',
                      charge: 0,
                    },
                    {
                      id: 'express',
                      label: 'Express Shipping',
                      delivery_est: '2-3 business days',
                      charge: 99,
                    },
                  ].map((method) => (
                    <label
                      key={method.id}
                      className={`block p-6 border rounded-xl cursor-pointer transition-colors ${
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
                        <p className="text-sm font-semibold text-gray-900">
                          {method.charge > 0 ? `₹${method.charge.toFixed(2)}` : 'Free'}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </RadioGroup>

              <div className="flex justify-between mt-8">
                <Button onClick={() => setCurrentStep(1)} variant="outline">
                  Back
                </Button>
                <Button onClick={() => setCurrentStep(3)} className="bg-[#835339] hover:bg-[#6b3d2a]">
                  Continue to Payment
                </Button>
              </div>
            </section>

            {/* Step 3: Payment */}
            <section
              className={`bg-white rounded-xl shadow-lg p-8 transition-all duration-300 ${
                currentStep === 3 ? 'block' : 'hidden'
              }`}
            >
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">3. Payment Method</h2>

              <RadioGroup
                value={paymentMethod}
                onValueChange={(value: 'razorpay' | 'cod') => setPaymentMethod(value)}
              >
                <div className="space-y-4">
                  <label
                    className={`block p-6 border rounded-xl cursor-pointer transition-colors ${
                      paymentMethod === 'razorpay'
                        ? 'border-[#835339] bg-[#fdfaf8]'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center">
                      <RadioGroupItem value="razorpay" className="mr-4" />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">Pay with Razorpay</p>
                        <p className="text-sm text-gray-600">Cards, UPI, Netbanking & Wallets</p>
                      </div>
                      <CreditCard className="w-6 h-6 text-gray-400" />
                    </div>
                  </label>

                  <label
                    className={`block p-6 border rounded-xl cursor-pointer transition-colors ${
                      paymentMethod === 'cod'
                        ? 'border-[#835339] bg-[#fdfaf8]'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center">
                      <RadioGroupItem value="cod" className="mr-4" />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">Cash on Delivery (COD)</p>
                        <p className="text-sm text-gray-600">Pay with cash upon delivery</p>
                      </div>
                      <Banknote className="w-6 h-6 text-gray-400" />
                    </div>
                  </label>
                </div>
              </RadioGroup>

              {/* Address and Shipping Summary */}
              <div className="mt-8 p-6 bg-gray-100 rounded-xl space-y-4">
                <div className="flex justify-between items-center pb-2 border-b">
                  <h3 className="text-sm font-medium text-gray-500">Shipping To</h3>
                  <Button
                    onClick={() => setCurrentStep(1)}
                    variant="ghost"
                    size="sm"
                    className="text-[#835339] hover:underline"
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
                    <p>
                      {selectedAddress.state} - {selectedAddress.pincode}
                    </p>
                    <p>Phone: {selectedAddress.phone}</p>
                  </div>
                )}
                <div className="flex justify-between items-center pt-2 border-t">
                  <h3 className="text-sm font-medium text-gray-500">Shipping Method</h3>
                  <Button
                    onClick={() => setCurrentStep(2)}
                    variant="ghost"
                    size="sm"
                    className="text-[#835339] hover:underline"
                  >
                    Change
                  </Button>
                </div>
                <div className="text-sm text-gray-700">
                  <p className="font-medium">{shippingMethod.label}</p>
                  <p>{shippingMethod.delivery_est}</p>
                </div>
              </div>

              <div className="flex justify-end mt-8">
                <Button
                  onClick={placeOrder}
                  disabled={isLoading}
                  className="w-full sm:w-auto bg-[#835339] hover:bg-[#6b3d2a] px-8 py-3 text-lg"
                >
                  {isLoading ? 'Processing...' : `Pay Now (₹${grandTotal.toFixed(2)})`}
                </Button>
              </div>
            </section>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 lg:sticky lg:top-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Order Summary</h2>

              {/* Cart Items */}
              <div className="space-y-4 mb-6">
                {cartState.items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
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

              <div className="border-t pt-6 space-y-6">
                {/* Coupon Section */}
                <div>
                  <button
                    onClick={() => setShowCoupons(!showCoupons)}
                    className="w-full flex justify-between items-center text-left text-sm font-semibold text-[#835339] mb-2"
                  >
                    <span>Have a coupon code?</span>
                    {showCoupons ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                  {showCoupons && (
                    <div className="space-y-2 transition-all duration-300">
                      <div className="flex space-x-2">
                        <Input
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                          placeholder="Enter code"
                          disabled={!!appliedCoupon || isLoading}
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
                        <p
                          className={`text-xs ${
                            appliedCoupon ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {couponMessage}
                        </p>
                      )}
                      {appliedCoupon && (
                        <div className="flex items-center justify-between text-sm text-green-600">
                          <span>
                            Discount ({appliedCoupon.code}): -₹{couponDiscount.toFixed(2)}
                          </span>
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
                  )}
                </div>

                {/* Super Coins Section */}
                {userCoins > 0 && (
                  <div>
                    <button
                      onClick={() => setCoinsToApply(appliedCoins > 0 ? '' : userCoins.toString())}
                      className="w-full flex justify-between items-center text-left text-sm font-semibold text-[#835339] mb-2"
                    >
                      <span>Use your Super Coins ({userCoins} available)</span>
                      {appliedCoins > 0 ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Plus className="w-4 h-4" />
                      )}
                    </button>
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
              </div>

              {/* Totals */}
              <div className="border-t pt-6 mt-6 space-y-3">
                <div className="flex justify-between text-sm text-gray-700">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-700">
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
                <div className="flex justify-between text-lg font-bold text-gray-900 border-t pt-3 mt-3">
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
        </div>
      </div>
    </div>
  );
};

export default Checkout;