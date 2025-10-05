import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Phone, Lock, LogIn } from 'lucide-react';
import { api } from '@/lib/api';

const SellerLogin: React.FC = () => {
  const [formData, setFormData] = useState({
    contact: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post<any>('/sellers/login', formData);
      const raw = response as any;

      if (raw?.success) {
        // Store token and seller info
        localStorage.setItem('sellerToken', raw.data.token);
        localStorage.setItem('sellerInfo', JSON.stringify(raw.data.seller));

        toast({
          title: 'Success',
          description: 'Login successful! Redirecting to dashboard...'
        });

        // Small delay to ensure localStorage is set before navigation
        setTimeout(() => {
          navigate('/seller/dashboard');
        }, 100);
      } else {
        throw new Error(raw?.message || 'Login failed');
      }
    } catch (error: any) {
      console.error('Seller login error:', error);
      
      let errorMessage = 'Login failed. Please try again.';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Seller Login
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to your seller account
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-center flex items-center justify-center space-x-2">
              <LogIn className="w-5 h-5" />
              <span>Login to Dashboard</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="contact" className="flex items-center space-x-2">
                  <Phone className="w-4 h-4" />
                  <span>Contact Number</span>
                </Label>
                <Input
                  id="contact"
                  type="text"
                  value={formData.contact}
                  onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                  placeholder="Enter your 10-digit mobile number"
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="password" className="flex items-center space-x-2">
                  <Lock className="w-4 h-4" />
                  <span>Password</span>
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Enter your password"
                  required
                  className="mt-1"
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Signing in...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <LogIn className="w-4 h-4" />
                    <span>Sign In</span>
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Don't have an account? Contact your administrator to get seller access.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SellerLogin;