// src/pages/Checkout.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  Plus,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import AuthModal from '@/components/AuthModal';

interface Address {
  _id: string;
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

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { state: cartState, clearCart, closeCart } = useCart();
  const { toast } = useToast();

  // API base for production readiness (fallback to local backend in dev)
  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
  const api = (path: string) => {
    if (!path.startsWith('/')) path = `/${path}`;
    return API_BASE ? `${API_BASE}${path}` : path;
  };

  // Quick-apply a coupon from the available list
  const applyCouponFromList = async (code: string) => {
    if (appliedCoupon || isLoading) return;
    setCouponCode(code);
    await applyCoupon();
  };

  // State
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'success' | 'failed'>('pending');
  const [orderNumber, setOrderNumber] = useState<string>(''); // Display order number (e.g., MLT...)
  const [orderIdForVerification, setOrderIdForVerification] = useState<string>(''); // MongoDB _id for Razorpay verification
  const [paymentErrorMessage, setPaymentErrorMessage] = useState<string>('');
  const [orderSnapshot, setOrderSnapshot] = useState<
    | {
        items: any[];
        subtotal: number;
        shippingCost: number;
        couponDiscount: number;
        coinsDiscount: number;
        grandTotal: number;
        cashbackEarned: number;
        paymentMethod: 'razorpay' | 'cod';
      }
    | null
  >(null);

  // Address
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [showAddressForm, setShowAddressForm] = useState<boolean>(false);
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

  // Shipping
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>({
    id: 'free-standard',
    label: 'Free Shipping',
    delivery_est: '5-7 business days',
    charge: 0,
  });

  // Payment
  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'cod'>('razorpay');

  // Coupons
  const [couponCode, setCouponCode] = useState<string>('');
  const [couponMessage, setCouponMessage] = useState<string>('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [showCoupons, setShowCoupons] = useState<boolean>(true);
  const [availableCoupons, setAvailableCoupons] = useState<Coupon[]>([]);

  // Coins
  const [coinsToApply, setCoinsToApply] = useState<string>('');
  const [appliedCoins, setAppliedCoins] = useState<number>(0);
  const [userCoins, setUserCoins] = useState<number>(0);
  // Auth modal
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);

  // Redirect if cart empty (but not if payment succeeded)
  useEffect(() => {
    if (paymentStatus === 'pending' && (!cartState?.items || cartState.items.length === 0)) {
      navigate('/cart');
    }
  }, [cartState?.items, navigate, paymentStatus]);

  // Load user stuff or trigger auth modal if not logged in
  useEffect(() => {
    const token = localStorage.getItem('melita_token');
    if (!token) {
      setAuthModalOpen(true);
      closeCart();
      return;
    }
    loadUserData();
    loadAddresses();
    loadCoupons();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  // Handle closing of Auth modal
  const handleAuthClose = () => {
    setAuthModalOpen(false);
    const token = localStorage.getItem('melita_token');
    if (token) {
      // After successful login, reload user-dependent data and stay on checkout
      loadUserData();
      loadAddresses();
      loadCoupons();
    } else {
      // If user dismissed without logging in, send back to cart
      navigate('/cart');
    }
  };

  const testToken = async () => {
    try {
      const token = localStorage.getItem('melita_token');
      if (!token) return;

      await fetch(api('/test-token'), {
        headers: { Authorization: `Bearer ${token}` },
      });
      // logging kept out to avoid noisy console in prod
    } catch (error) {
      // ignore
    }
  };

  // Ensure Razorpay SDK is available before use
  const ensureRazorpayLoaded = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      // If already present, resolve
      if (typeof (window as any).Razorpay !== 'undefined') {
        resolve();
        return;
      }

      // Check for existing script tag (from index.html or previous load)
      const existing = document.querySelector('script[src*="checkout.razorpay.com"]') as HTMLScriptElement | null;
      if (existing) {
        // Wait for it to load; guard against UMD CommonJS detection
        const prevModule = (window as any).module;
        const prevExports = (window as any).exports;
        try {
          (window as any).module = undefined;
          (window as any).exports = undefined;
        } catch {}
        const finish = (ok: boolean) => {
          (window as any).module = prevModule;
          (window as any).exports = prevExports;
          if (!ok) reject(new Error('Failed to load Razorpay SDK'));
        };
        const checkLoaded = () => {
          if (typeof (window as any).Razorpay !== 'undefined') {
            finish(true);
            resolve();
          } else {
            setTimeout(checkLoaded, 100);
          }
        };
        existing.addEventListener('load', () => checkLoaded());
        existing.addEventListener('error', () => finish(false));
        // Start checking immediately in case it's already loaded
        checkLoaded();
        return;
      }

      // No existing script, create new one
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      // Prevent UMD path from thinking CommonJS is available in browser
      const prevModule = (window as any).module;
      const prevExports = (window as any).exports;
      try {
        // @ts-ignore
        (window as any).module = undefined;
        // @ts-ignore
        (window as any).exports = undefined;
      } catch {}
      script.onload = () => {
        // Double check it's actually available
        const checkLoaded = () => {
          if (typeof (window as any).Razorpay !== 'undefined') {
            // Restore any previous globals
            (window as any).module = prevModule;
            (window as any).exports = prevExports;
            resolve();
          } else {
            setTimeout(checkLoaded, 100);
          }
        };
        checkLoaded();
      };
      script.onerror = () => {
        (window as any).module = prevModule;
        (window as any).exports = prevExports;
        reject(new Error('Failed to load Razorpay SDK'));
      };
      document.head.appendChild(script);
    });
  };

  const loadUserData = async () => {
    try {
      const token = localStorage.getItem('melita_token');
      if (!token) return;

      await testToken(); // optional check

      const response = await fetch(api('/auth/profile'), {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const userData = await response.json();
        setUserCoins(userData.user?.rewardPoints || 0);
      } else {
        // profile failed; don't break checkout; user may need to re-login
        console.error('Profile request failed:', response.status);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const loadAddresses = async () => {
    try {
      const token = localStorage.getItem('melita_token');
      if (!token) return;

      const response = await fetch(api('/addresses'), {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        const list: Address[] = data.data || [];
        setAddresses(list);
        if (list.length > 0) {
          setSelectedAddressId(list[0]._id);
          setShowAddressForm(false);
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
      const token = localStorage.getItem('melita_token');
      if (!token) return;

      const response = await fetch(api('/checkout/coupons'), {
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
        setAuthModalOpen(true);
        closeCart();
        return;
      }

      const response = await fetch(api('/addresses'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newAddress),
      });

      if (!response.ok) {
        const errorData = await response.json(); // parse JSON
        
      
        toast({
          title: 'Error',
          description: errorData?.message || 'Something went wrong',
          variant: 'destructive',
        });
        return;
      }
      
      const data = await response.json();
      if (data?.data) {
        setAddresses((prev) => [data.data, ...prev]);
        setSelectedAddressId(data.data._id);
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
      }
    } catch (error) {
      console.error('Save address error:', error);
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
      setCouponMessage('Please click on Apply button');
      return;
    }

    setIsLoading(true);
    setCouponMessage('');

    try {
      const token = localStorage.getItem('melita_token');
      if (!token) {
        setCouponMessage('Please log in to apply coupons');
        return;
      }

      const response = await fetch(api('/checkout/coupons/apply'), {
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
        setCouponMessage('Failed to apply coupon');
      }
    } catch (error) {
      console.error('Apply coupon error:', error);
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
  const subtotal = cartState.items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);
  const couponDiscount = appliedCoupon
    ? appliedCoupon.type === 'percentage'
      ? (subtotal * appliedCoupon.value) / 100
      : appliedCoupon.value
    : 0;
  const coinsDiscount = appliedCoins;
  const shippingCost = shippingMethod.charge;
  const totalDiscount = couponDiscount + coinsDiscount;
  const grandTotal = Math.max(0, subtotal + shippingCost - totalDiscount);
  // Rewards: 10% of order price (rounded to match backend logic)
  const cashbackEarned = Math.round(grandTotal * 0.10);

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
      const selectedAddress = addresses.find((addr) => addr._id === selectedAddressId);
      if (!selectedAddress) {
        throw new Error('Selected address not found');
      }

      const orderData = {
        items: cartState.items,
        customer: selectedAddress, // retained for Razorpay prefill
        shippingMethod,
        shippingAddressId: selectedAddressId, // required by backend
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
    } catch (error: any) {
      console.error('Order placement error:', error);
      setPaymentErrorMessage(error?.message || 'Failed to place order');
      setPaymentStatus('failed');
    } finally {
      setIsLoading(false);
    }
  };

  const placeCodOrder = async (orderData: any) => {
    try {
      const response = await fetch(api('/checkout/orders'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('melita_token')}`,
        },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setOrderNumber(data.orderId || data.order?.orderNumber || '');
          // snapshot items and totals before clearing cart
          setOrderSnapshot({
            items: [...cartState.items],
            subtotal,
            shippingCost,
            couponDiscount,
            coinsDiscount,
            grandTotal,
            cashbackEarned,
            paymentMethod,
          });
          clearCart();
          setPaymentStatus('success');
          toast({
            title: 'Order Placed Successfully',
            description: `Order #${data.orderId || data.orderNumber} has been placed`,
          });
        } else {
          throw new Error(data.message || 'Failed to place order');
        }
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Failed to place order' }));
        throw new Error(errorData.message || `Server error (${response.status})`);
      }
    } catch (error: any) {
      console.error('COD order error:', error);
      throw error;
    }
  };

  const placeRazorpayOrder = async (orderData: any) => {
    try {
      // Create Razorpay order on backend
      const response = await fetch(api('/checkout/orders/razorpay'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('melita_token')}`,
        },
        body: JSON.stringify(orderData),
      });
      console.log(response);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to create order' }));
        throw new Error(errorData.message || `Server error (${response.status})`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to create Razorpay order');
      }

      // Make sure SDK is present even if index.html failed to load it in time
      await ensureRazorpayLoaded();

      // Capture MongoDB _id for immediate verification (avoid stale state race)
      const mongoOrderId = data.orderId;
      // Store MongoDB _id for verification and orderNumber for display
      setOrderIdForVerification(mongoOrderId);
      setOrderNumber(data.orderNumber);

      const options = {
        key: data.key,
        amount: Math.round(((typeof data.amount === 'number' ? data.amount : grandTotal)) * 100),
        currency: 'INR',
        name: 'Melita',
        description: 'Order Payment',
        order_id: data.razorpayOrderId,
        handler: async (razorpayResponse: any) => {
          try {
            // Verify payment on backend
            const verifyResponse = await fetch(api('/checkout/orders/verify-payment'), {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('melita_token')}`,
              },
              body: JSON.stringify({
                razorpay_payment_id: razorpayResponse.razorpay_payment_id,
                razorpay_order_id: razorpayResponse.razorpay_order_id,
                razorpay_signature: razorpayResponse.razorpay_signature,
                orderId: mongoOrderId, // Use fresh MongoDB _id captured above
              }),
            });

            if (verifyResponse.ok) {
              const verifyData = await verifyResponse.json();
              if (verifyData.success) {
                setOrderNumber(verifyData.orderId || verifyData.order?.orderNumber || '');
                // snapshot items and totals before clearing cart
                setOrderSnapshot({
                  items: [...cartState.items],
                  subtotal,
                  shippingCost,
                  couponDiscount,
                  coinsDiscount,
                  grandTotal,
                  cashbackEarned,
                  paymentMethod,
                });
                clearCart();
                setPaymentStatus('success');
                toast({
                  title: 'Payment Successful',
                  description: `Order #${verifyData.orderId || verifyData.orderNumber} has been placed successfully`,
                });
              } else {
                throw new Error(verifyData.message || 'Payment verification failed');
              }
            } else {
              const errorData = await verifyResponse.json().catch(() => ({ message: 'Verification failed' }));
              throw new Error(errorData.message || 'Payment verification failed');
            }
          } catch (err) {
            console.error('Payment verification error:', err);
            setPaymentErrorMessage('Payment verification failed');
            setPaymentStatus('failed');
          }
        },
        prefill: {
          name: `${orderData.customer?.first_name ?? ''} ${orderData.customer?.last_name ?? ''}`.trim(),
          email: orderData.customer?.email ?? '',
          contact: orderData.customer?.phone ?? '',
        },
        theme: { color: '#835339' },
      };

      // @ts-ignore window type augmentation for Razorpay
      const Razorpay = (window as any).Razorpay;
      if (!Razorpay) {
        throw new Error('Razorpay SDK not found - ensure script is loaded');
      }

      const rzp = new Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error('Razorpay order error:', error);
      throw error;
    }
  };

  const retryPayment = () => {
    setPaymentStatus('pending');
    setPaymentErrorMessage('');
    setCurrentStep(3);
  };

  const selectedAddress = addresses.find((addr) => addr._id === selectedAddressId) ?? null;

  if (paymentStatus === 'success') {
    // Prefer snapshot values captured at order placement time
    const successItems = orderSnapshot?.items ?? cartState.items;
    const successSubtotal = orderSnapshot?.subtotal ?? subtotal;
    const successShipping = orderSnapshot?.shippingCost ?? shippingCost;
    const successCoupon = orderSnapshot?.couponDiscount ?? couponDiscount;
    const successCoins = orderSnapshot?.coinsDiscount ?? coinsDiscount;
    const successGrand = orderSnapshot?.grandTotal ?? grandTotal;
    const successCashback = orderSnapshot?.cashbackEarned ?? cashbackEarned;
    const successPaymentMethod = orderSnapshot?.paymentMethod ?? paymentMethod;
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center py-16 px-4">
        <div className="mx-auto h-20 w-20 text-green-500 mb-4">
          <Check className="h-full w-full stroke-1" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Thank You!</h1>
        <p className="text-base sm:text-lg text-gray-600 mb-6 text-center">
          Your order #{orderNumber} has been placed successfully.
        </p>
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 mb-8">
          <Button onClick={() => navigate('/dashboard/orders')} variant="outline">
            View My Orders
          </Button>
          <Button onClick={() => navigate('/shop')} className="bg-[#835339] hover:bg-[#6b3d2a]">
            Continue Shopping
          </Button>
        </div>

        {/* Bill / Order Summary */}
        <div className="w-full max-w-3xl bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h3>

          {/* Payment method */}
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              <span className="font-medium text-gray-800">Payment Method:</span>{' '}
              {successPaymentMethod === 'cod' ? 'Cash on Delivery' : 'Razorpay'}
            </p>
          </div>

          {/* Items Table */}
          <div className="overflow-x-auto border rounded-lg mb-4">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="text-left text-gray-600">
                  <th className="px-4 py-3 font-medium">Product</th>
                  <th className="px-4 py-3 font-medium">Qty</th>
                  <th className="px-4 py-3 font-medium">Price</th>
                  <th className="px-4 py-3 font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {successItems.map((item: any) => (
                  <tr key={item.id} className="border-t">
                    <td className="px-4 py-3 text-gray-900">{item.name}</td>
                    <td className="px-4 py-3 text-gray-700">{item.quantity}</td>
                    <td className="px-4 py-3 text-gray-700">₹{Number(item.price).toFixed(2)}</td>
                    <td className="px-4 py-3 text-gray-900 font-medium">₹{(item.price * item.quantity).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-700">
              <span>Subtotal</span>
              <span>₹{successSubtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-700">
              <span>Shipping</span>
              <span>{successShipping > 0 ? `₹${successShipping.toFixed(2)}` : 'Free'}</span>
            </div>
            {successCoupon > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Coupon Discount</span>
                <span>-₹{successCoupon.toFixed(2)}</span>
              </div>
            )}
            {successCoins > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Coins Discount</span>
                <span>-₹{successCoins.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold text-gray-900 border-t pt-3 mt-2">
              <span>Grand Total</span>
              <span>₹{successGrand.toFixed(2)}</span>
            </div>
          </div>

          {/* Coins information */}
          <div className="mt-4 text-sm">
            {successCashback > 0 && (
              <p className="text-gray-700">
                <span className="font-medium">Melita Coins Earned:</span> +{successCashback} Coins
              </p>
            )}
            <p className="text-gray-700">
              <span className="font-medium">Your Available Melita Coins:</span> {userCoins}
            </p>
          </div>
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
      <AuthModal open={authModalOpen} onClose={handleAuthClose} />
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
                    currentStep >= step ? 'bg-[#835339] text-white' : 'bg-gray-200 text-gray-500'
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
                  <RadioGroup value={selectedAddressId || ''} onValueChange={(value: string) => setSelectedAddressId(value || null)}>
                    {addresses.map((address) => (
                      <label
                        key={address._id}
                        className={`block p-6 border rounded-xl cursor-pointer transition-colors ${
                          selectedAddressId === address._id
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
                            {address.addressline2 && <p className="text-sm text-gray-600">{address.addressline2}</p>}
                            <p className="text-sm text-gray-600">
                              {address.state} - {address.pincode}
                            </p>
                            <p className="text-sm text-gray-600">Phone: {address.phone}</p>
                          </div>
                          <RadioGroupItem value={address._id} className="mt-1" />
                        </div>
                      </label>
                    ))}
                  </RadioGroup>
                </div>
              )}

              {/* Add New Address Toggle */}
              <div className="mt-6">
                <Button
                  onClick={() => setShowAddressForm((s) => !s)}
                  variant="outline"
                  className="w-full text-[#835339] border-[#835339] hover:bg-[#fdfaf8]"
                >
                  {showAddressForm ? 'Cancel New Address' : 'Add New Address'}
                </Button>
              </div>

              {/* New Address Form */}
              {showAddressForm && (
                <div className="mt-6 p-6 border rounded-xl bg-gray-50">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">New Address Details</h3>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      saveNewAddress();
                    }}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="first_name">First Name</Label>
                        <Input
                          id="first_name"
                          name="first_name"
                          value={newAddress.first_name}
                          onChange={(e) => setNewAddress((prev) => ({ ...prev, first_name: e.target.value }))}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="last_name">Last Name</Label>
                        <Input
                          id="last_name"
                          name="last_name"
                          value={newAddress.last_name}
                          onChange={(e) => setNewAddress((prev) => ({ ...prev, last_name: e.target.value }))}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={newAddress.email}
                          onChange={(e) => setNewAddress((prev) => ({ ...prev, email: e.target.value }))}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          value={newAddress.phone}
                          onChange={(e) => setNewAddress((prev) => ({ ...prev, phone: e.target.value }))}
                          required
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label htmlFor="addressline1">Address Line 1</Label>
                        <Input
                          id="addressline1"
                          name="addressline1"
                          value={newAddress.addressline1}
                          onChange={(e) => setNewAddress((prev) => ({ ...prev, addressline1: e.target.value }))}
                          required
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label htmlFor="addressline2">Address Line 2 (Optional)</Label>
                        <Input
                          id="addressline2"
                          name="addressline2"
                          value={newAddress.addressline2}
                          onChange={(e) => setNewAddress((prev) => ({ ...prev, addressline2: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="state">State</Label>
                        <Input
                          id="state"
                          name="state"
                          value={newAddress.state}
                          onChange={(e) => setNewAddress((prev) => ({ ...prev, state: e.target.value }))}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="pincode">Pincode</Label>
                        <Input
                          id="pincode"
                          name="pincode"
                          value={newAddress.pincode}
                          onChange={(e) => setNewAddress((prev) => ({ ...prev, pincode: e.target.value }))}
                          required
                        />
                      </div>
                    </div>

                    <div className="flex justify-end mt-4">
                      <Button type="submit" disabled={isLoading} className="bg-[#835339] hover:bg-[#6b3d2a]">
                        {isLoading ? 'Saving...' : 'Save Address'}
                      </Button>
                    </div>
                  </form>
                </div>
              )}

              {/* Continue button (always available - disabled until address selected) */}
              <div className="flex justify-end mt-8">
                <Button onClick={() => setCurrentStep(2)} disabled={!selectedAddressId} className="bg-[#835339] hover:bg-[#6b3d2a]">
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
                onValueChange={(value: string) => {
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
                    // {
                    //   id: 'express',
                    //   label: 'Express Shipping',
                    //   delivery_est: '2-3 business days',
                    //   charge: 99,
                    // },
                  ].map((method) => (
                    <label
                      key={method.id}
                      className={`block p-6 border rounded-xl cursor-pointer transition-colors ${
                        shippingMethod.id === method.id ? 'border-[#835339] bg-[#fdfaf8]' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center">
                        <RadioGroupItem value={method.id} className="mr-4" />
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{method.label}</p>
                          <p className="text-sm text-gray-600">{method.delivery_est}</p>
                        </div>
                        <p className="text-sm font-semibold text-gray-900">{method.charge > 0 ? `₹${method.charge.toFixed(2)}` : 'Free'}</p>
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

              <RadioGroup value={paymentMethod} onValueChange={(value: string) => setPaymentMethod(value as 'razorpay' | 'cod')}>
                <div className="space-y-4">
                  <label
                    className={`block p-6 border rounded-xl cursor-pointer transition-colors ${
                      paymentMethod === 'razorpay' ? 'border-[#835339] bg-[#fdfaf8]' : 'border-gray-200 hover:border-gray-300'
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
                      paymentMethod === 'cod' ? 'border-[#835339] bg-[#fdfaf8]' : 'border-gray-200 hover:border-gray-300'
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
                  <Button onClick={() => setCurrentStep(1)} variant="ghost" size="sm" className="text-[#835339] hover:underline">
                    Change
                  </Button>
                </div>
                {selectedAddress ? (
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
                ) : (
                  <p className="text-sm text-gray-600">No shipping address selected.</p>
                )}

                <div className="flex justify-between items-center pt-2 border-t">
                  <h3 className="text-sm font-medium text-gray-500">Shipping Method</h3>
                  <Button onClick={() => setCurrentStep(2)} variant="ghost" size="sm" className="text-[#835339] hover:underline">
                    Change
                  </Button>
                </div>
                <div className="text-sm text-gray-700">
                  <p className="font-medium">{shippingMethod.label}</p>
                  <p>{shippingMethod.delivery_est}</p>
                </div>
              </div>

              <div className="flex justify-end mt-8">
                <Button onClick={placeOrder} disabled={isLoading} className="w-full sm:w-auto bg-[#835339] hover:bg-[#6b3d2a] px-8 py-3 text-lg">
                  {isLoading 
                    ? 'Processing...' 
                    : paymentMethod === 'cod' 
                      ? `Confirm Order (₹${grandTotal.toFixed(2)})`
                      : `Pay Now (₹${grandTotal.toFixed(2)})`
                  }
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
                {cartState.items.map((item: any) => (
                  <div key={item.id} className="flex items-center space-x-4">
                    <img src={item.image} alt={item.name} className="w-16 h-16 rounded-lg object-cover" />
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-gray-900">{item.name}</h3>
                      <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-medium text-gray-900">₹{(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>

              <div className="border-t pt-6 space-y-6">
                {/* Coupon Section */}
                <div>
                  <button
                    onClick={() => setShowCoupons((s) => !s)}
                    className="w-full flex justify-between items-center text-left text-sm font-semibold text-[#835339] mb-2"
                  >
                    <span>Have a coupon code?</span>
                    {showCoupons ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
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
                        {appliedCoupon ? (
                          <Button onClick={removeCoupon} disabled={isLoading} variant="outline" size="sm" className="text-red-600">
                            Remove
                          </Button>
                        ) : (
                          <Button onClick={applyCoupon} disabled={!couponCode || isLoading} variant="outline" size="sm">
                            Apply
                          </Button>
                        )}
                      </div>
                      {couponMessage && <p className={`text-xs ${appliedCoupon ? 'text-green-600' : 'text-red-600'}`}>{couponMessage}</p>}
                      {/* Available coupons from backend */}
                      {availableCoupons?.length > 0 && (
                        <div className="mt-2 border-t pt-3 space-y-2">
                          <p className="text-xs text-gray-500">Available coupons</p>
                          <div className="space-y-2 max-h-40 overflow-auto pr-1">
                            {availableCoupons.map((c: any) => {
                              const meetsMin = (subtotal || 0) >= (c.minOrderAmount || 0);
                              const disabled = !!appliedCoupon || isLoading || !meetsMin;
                              return (
                                <div key={c._id || c.code} className="flex items-start justify-between gap-3 p-2 rounded-md border">
                                  <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900">{c.code}</p>
                                    {c.description && (
                                      <p className="text-xs text-gray-600">{c.description}</p>
                                    )}
                                    <p className="text-[11px] text-gray-500">
                                      {c.type === 'percentage' ? `${c.value}% off` : `₹${c.value} off`}
                                      {c.minOrderAmount ? ` • Min order ₹${c.minOrderAmount}` : ''}
                                    </p>
                                  </div>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={disabled}
                                    onClick={() => applyCouponFromList(c.code)}
                                  >
                                    {meetsMin ? 'Apply' : 'Not Eligible'}
                                  </Button>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                      {/* Removed separate below-the-input Remove control; action toggles on main button */}
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
                      {appliedCoins > 0 ? <Check className="w-4 h-4 text-green-600" /> : <Plus className="w-4 h-4" />}
                    </button>

                    {appliedCoins > 0 ? (
                      <div className="flex items-center justify-between text-sm text-green-600">
                        <span>Coins Used: {appliedCoins}</span>
                        <Button onClick={removeCoins} variant="ghost" size="sm" className="text-red-500 hover:text-red-700">
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Input value={coinsToApply} onChange={(e) => setCoinsToApply(e.target.value)} placeholder="Enter coins" />
                        <Button onClick={applyCoins} size="sm">
                          Apply
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
