import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle, AlertCircle, Phone, User } from 'lucide-react';
import { api } from '@/lib/api';

interface AddCustomerProps {
  onCustomerAdded?: () => void;
}

const AddCustomer: React.FC<AddCustomerProps> = ({ onCustomerAdded }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: ''
  });
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'form' | 'otp' | 'success'>('form');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Customer name is required');
      return false;
    }
    if (!formData.phone.trim()) {
      setError('Mobile number is required');
      return false;
    }
    if (!/^[6-9]\d{9}$/.test(formData.phone.trim())) {
      setError('Please enter a valid 10-digit mobile number');
      return false;
    }
    return true;
  };

  const handleSendOtp = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      const response = await api.post<{ success: boolean; message?: string }>('/sellers/add-customer/send-otp', {
        name: formData.name.trim(),
        phone: formData.phone.trim()
      });

      if (response.success) {
        setStep('otp');
        toast({
          title: 'OTP Sent',
          description: 'Verification code has been sent to the customer\'s mobile number'
        });
      } else {
        setError(response.message || 'Failed to send OTP');
      }
    } catch (err: any) {
      console.error('Send OTP error:', err);
      setError(err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim()) {
      setError('Please enter the OTP');
      return;
    }
    if (!/^\d{6}$/.test(otp.trim())) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await api.post<{ success: boolean; message?: string }>('/sellers/add-customer/verify-otp', {
        phone: formData.phone.trim(),
        otp: otp.trim(),
        name: formData.name.trim()
      });

      if (response.success) {
        setStep('success');
        toast({
          title: 'Customer Added Successfully',
          description: `${formData.name} has been added as a customer`
        });
        onCustomerAdded?.();
      } else {
        setError(response.message || 'Invalid OTP');
      }
    } catch (err: any) {
      console.error('Verify OTP error:', err);
      setError(err.message || 'Failed to verify OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({ name: '', phone: '' });
    setOtp('');
    setStep('form');
    setError('');
  };

  const handleResendOtp = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await api.post<{ success: boolean; message?: string }>('/sellers/add-customer/send-otp', {
        name: formData.name.trim(),
        phone: formData.phone.trim()
      });

      if (response.success) {
        toast({
          title: 'OTP Resent',
          description: 'A new verification code has been sent'
        });
      } else {
        setError(response.message || 'Failed to resend OTP');
      }
    } catch (err: any) {
      console.error('Resend OTP error:', err);
      setError(err.message || 'Failed to resend OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="w-5 h-5" />
            <span>Customer Verification</span>
          </CardTitle>
          <p className="text-sm text-gray-600">Add a new customer with mobile verification</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {step === 'form' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Customer Name *</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Enter customer's full name"
                  value={formData.name}
                  onChange={handleInputChange}
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Mobile Number *</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="Enter 10-digit mobile number"
                  value={formData.phone}
                  onChange={handleInputChange}
                  disabled={loading}
                  maxLength={10}
                />
              </div>

              {error && (
                <div className="flex items-center space-x-2 text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>{error}</span>
                </div>
              )}

              <Button
                onClick={handleSendOtp}
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending OTP...
                  </>
                ) : (
                  <>
                    <Phone className="w-4 h-4 mr-2" />
                    Send OTP
                  </>
                )}
              </Button>
            </div>
          )}

          {step === 'otp' && (
            <div className="space-y-4">
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mx-auto">
                  <Phone className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-medium">Verify Mobile Number</h3>
                <p className="text-sm text-gray-600">
                  We've sent a 6-digit OTP to <strong>{formData.phone}</strong>
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="otp">Enter OTP</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => {
                    setOtp(e.target.value.replace(/\D/g, ''));
                    setError('');
                  }}
                  disabled={loading}
                  maxLength={6}
                  className="text-center text-lg tracking-widest"
                />
              </div>

              {error && (
                <div className="flex items-center space-x-2 text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-2">
                <Button
                  onClick={handleVerifyOtp}
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    'Verify OTP'
                  )}
                </Button>

                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={handleResendOtp}
                    disabled={loading}
                    className="flex-1"
                  >
                    Resend OTP
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleReset}
                    disabled={loading}
                    className="flex-1"
                  >
                    Back
                  </Button>
                </div>
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mx-auto">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <div className="space-y-2">
                <h3 className="font-medium text-green-700">Customer Added Successfully!</h3>
                <p className="text-sm text-gray-600">
                  <strong>{formData.name}</strong> has been verified and added to your customer list.
                </p>
              </div>
              <Button onClick={handleReset} className="w-full">
                Add Another Customer
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* How it works section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">How it works</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3 text-sm text-gray-700">
            <li className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-medium text-blue-600">1</span>
              </div>
              <span>Enter customer's name and mobile number</span>
            </li>
            <li className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-medium text-blue-600">2</span>
              </div>
              <span>We'll send a 6-digit OTP to verify the number</span>
            </li>
            <li className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-medium text-blue-600">3</span>
              </div>
              <span>Once verified, customer will receive a temporary password</span>
            </li>
            <li className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-medium text-blue-600">4</span>
              </div>
              <span>Share the password with the customer for their first login</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddCustomer;
