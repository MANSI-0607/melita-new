import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Gift, Search, Award, CheckCircle, AlertCircle } from 'lucide-react';

interface Service {
  id: string;
  name: string;
  pointsRequired: number;
  description: string;
  category: string;
}

const mockServices: Service[] = [
  {
    id: '1',
    name: 'Free Facial Treatment',
    pointsRequired: 500,
    description: 'Basic facial treatment with cleansing and moisturizing',
    category: 'Skincare'
  },
  {
    id: '2',
    name: 'Hair Styling Session',
    pointsRequired: 300,
    description: 'Professional hair styling and blow-dry service',
    category: 'Hair Care'
  },
  {
    id: '3',
    name: 'Manicure Service',
    pointsRequired: 250,
    description: 'Complete manicure with nail polish application',
    category: 'Nail Care'
  },
  {
    id: '4',
    name: 'Beauty Consultation',
    pointsRequired: 150,
    description: 'One-on-one beauty consultation with expert advice',
    category: 'Consultation'
  },
  {
    id: '5',
    name: 'Premium Spa Package',
    pointsRequired: 1000,
    description: 'Full spa experience with multiple treatments',
    category: 'Spa'
  }
];

const RedeemService: React.FC = () => {
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerInfo, setCustomerInfo] = useState<any>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const { toast } = useToast();

  const searchCustomer = async () => {
    if (!customerPhone.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter customer phone number',
        variant: 'destructive'
      });
      return;
    }

    setSearchLoading(true);
    try {
      // TODO: Implement API call to search customer
      await new Promise(resolve => setTimeout(resolve, 1000)); // Mock delay
      
      // Mock customer data
      setCustomerInfo({
        name: 'John Doe',
        phone: customerPhone,
        rewardPoints: 750,
        loyaltyTier: 'gold'
      });

      toast({
        title: 'Customer Found',
        description: 'Customer information loaded successfully'
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Customer not found',
        variant: 'destructive'
      });
      setCustomerInfo(null);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleRedeem = async () => {
    if (!customerInfo || !selectedService) return;

    if (customerInfo.rewardPoints < selectedService.pointsRequired) {
      toast({
        title: 'Insufficient Points',
        description: `Customer needs ${selectedService.pointsRequired} points but only has ${customerInfo.rewardPoints}`,
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      // TODO: Implement API call to redeem service
      await new Promise(resolve => setTimeout(resolve, 1000)); // Mock delay
      
      toast({
        title: 'Service Redeemed',
        description: `${selectedService.name} has been redeemed successfully`
      });

      // Update customer points
      setCustomerInfo({
        ...customerInfo,
        rewardPoints: customerInfo.rewardPoints - selectedService.pointsRequired
      });
      setSelectedService(null);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to redeem service',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const canRedeem = (service: Service) => {
    return customerInfo && customerInfo.rewardPoints >= service.pointsRequired;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Gift className="w-5 h-5" />
            <span>Redeem Against Service</span>
          </CardTitle>
          <p className="text-sm text-gray-600">Help customers redeem their reward points for services</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Customer Search */}
          <div className="space-y-4">
            <div className="flex space-x-2">
              <div className="flex-1">
                <Label htmlFor="customerPhone">Customer Phone Number</Label>
                <Input
                  id="customerPhone"
                  type="tel"
                  placeholder="Enter customer's phone number"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  maxLength={10}
                />
              </div>
              <div className="flex items-end">
                <Button
                  onClick={searchCustomer}
                  disabled={searchLoading}
                >
                  {searchLoading ? (
                    'Searching...'
                  ) : (
                    <>
                      <Search className="w-4 h-4 mr-2" />
                      Search
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Customer Info */}
            {customerInfo && (
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-blue-900">{customerInfo.name}</h3>
                      <p className="text-sm text-blue-700">{customerInfo.phone}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-2">
                        <Award className="w-4 h-4 text-blue-600" />
                        <span className="font-medium text-blue-900">{customerInfo.rewardPoints} points</span>
                      </div>
                      <Badge className="mt-1 bg-blue-100 text-blue-800">
                        {customerInfo.loyaltyTier}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Available Services */}
          {customerInfo && (
            <div className="space-y-4">
              <h3 className="font-medium">Available Services</h3>
              <div className="grid gap-4">
                {mockServices.map((service) => (
                  <Card
                    key={service.id}
                    className={`cursor-pointer transition-colors ${
                      selectedService?.id === service.id
                        ? 'border-blue-500 bg-blue-50'
                        : canRedeem(service)
                        ? 'hover:border-gray-300'
                        : 'opacity-60'
                    }`}
                    onClick={() => canRedeem(service) && setSelectedService(service)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-medium">{service.name}</h4>
                            <Badge variant="outline">{service.category}</Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{service.description}</p>
                          <div className="flex items-center space-x-2">
                            <Award className="w-4 h-4 text-orange-500" />
                            <span className="text-sm font-medium">{service.pointsRequired} points</span>
                          </div>
                        </div>
                        <div className="ml-4">
                          {canRedeem(service) ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : (
                            <AlertCircle className="w-5 h-5 text-red-500" />
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Redeem Button */}
          {selectedService && (
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-medium text-green-900">Selected Service</h4>
                    <p className="text-sm text-green-700">{selectedService.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-green-700">Points Required</p>
                    <p className="font-medium text-green-900">{selectedService.pointsRequired}</p>
                  </div>
                </div>
                <Button
                  onClick={handleRedeem}
                  disabled={loading}
                  className="w-full"
                  size="lg"
                >
                  {loading ? (
                    'Processing Redemption...'
                  ) : (
                    <>
                      <Gift className="w-4 h-4 mr-2" />
                      Redeem Service
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RedeemService;
