import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';
import { Save, Settings, Bell, Shield, Database } from 'lucide-react';

const AdminSettings: React.FC = () => {
  const [settings, setSettings] = useState({
    siteName: 'Melita Luxury Skincare',
    siteDescription: 'Premium skincare products for Indian skin',
    contactEmail: 'admin@melita.in',
    supportPhone: '+91-9876543210',
    maintenanceMode: false,
    allowRegistrations: true,
    emailNotifications: true,
    smsNotifications: true,
    orderNotifications: true,
    lowStockAlerts: true,
    autoApproveReviews: false,
    minOrderAmount: 500,
    freeShippingThreshold: 1000,
    rewardPointsRate: 10, // 10% cashback
    maxRewardPointsUsage: 50, // 50% of order value
  });

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('melita_admin_token');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/admin/settings`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (!response.ok) throw new Error('Failed to save settings');

      toast({
        title: 'Success',
        description: 'Settings saved successfully',
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to save settings',
        variant: 'destructive',
      });
    }
  };

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Admin Settings</h2>
        <Button onClick={handleSave}>
          <Save className="w-4 h-4 mr-2" />
          Save Settings
        </Button>
      </div>

      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="w-5 h-5" />
            <span>General Settings</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="siteName">Site Name</Label>
              <Input
                id="siteName"
                value={settings.siteName}
                onChange={(e) => updateSetting('siteName', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="contactEmail">Contact Email</Label>
              <Input
                id="contactEmail"
                type="email"
                value={settings.contactEmail}
                onChange={(e) => updateSetting('contactEmail', e.target.value)}
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="siteDescription">Site Description</Label>
            <Textarea
              id="siteDescription"
              value={settings.siteDescription}
              onChange={(e) => updateSetting('siteDescription', e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="supportPhone">Support Phone</Label>
            <Input
              id="supportPhone"
              value={settings.supportPhone}
              onChange={(e) => updateSetting('supportPhone', e.target.value)}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="maintenanceMode"
              checked={settings.maintenanceMode}
              onCheckedChange={(checked) => updateSetting('maintenanceMode', checked)}
            />
            <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="allowRegistrations"
              checked={settings.allowRegistrations}
              onCheckedChange={(checked) => updateSetting('allowRegistrations', checked)}
            />
            <Label htmlFor="allowRegistrations">Allow New Registrations</Label>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="w-5 h-5" />
            <span>Notification Settings</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="emailNotifications"
              checked={settings.emailNotifications}
              onCheckedChange={(checked) => updateSetting('emailNotifications', checked)}
            />
            <Label htmlFor="emailNotifications">Email Notifications</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="smsNotifications"
              checked={settings.smsNotifications}
              onCheckedChange={(checked) => updateSetting('smsNotifications', checked)}
            />
            <Label htmlFor="smsNotifications">SMS Notifications</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="orderNotifications"
              checked={settings.orderNotifications}
              onCheckedChange={(checked) => updateSetting('orderNotifications', checked)}
            />
            <Label htmlFor="orderNotifications">Order Notifications</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="lowStockAlerts"
              checked={settings.lowStockAlerts}
              onCheckedChange={(checked) => updateSetting('lowStockAlerts', checked)}
            />
            <Label htmlFor="lowStockAlerts">Low Stock Alerts</Label>
          </div>
        </CardContent>
      </Card>

      {/* Business Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="w-5 h-5" />
            <span>Business Settings</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="minOrderAmount">Minimum Order Amount (₹)</Label>
              <Input
                id="minOrderAmount"
                type="number"
                value={settings.minOrderAmount}
                onChange={(e) => updateSetting('minOrderAmount', parseInt(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="freeShippingThreshold">Free Shipping Threshold (₹)</Label>
              <Input
                id="freeShippingThreshold"
                type="number"
                value={settings.freeShippingThreshold}
                onChange={(e) => updateSetting('freeShippingThreshold', parseInt(e.target.value))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="rewardPointsRate">Reward Points Rate (%)</Label>
              <Input
                id="rewardPointsRate"
                type="number"
                value={settings.rewardPointsRate}
                onChange={(e) => updateSetting('rewardPointsRate', parseInt(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="maxRewardPointsUsage">Max Reward Points Usage (%)</Label>
              <Input
                id="maxRewardPointsUsage"
                type="number"
                value={settings.maxRewardPointsUsage}
                onChange={(e) => updateSetting('maxRewardPointsUsage', parseInt(e.target.value))}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="autoApproveReviews"
              checked={settings.autoApproveReviews}
              onCheckedChange={(checked) => updateSetting('autoApproveReviews', checked)}
            />
            <Label htmlFor="autoApproveReviews">Auto-approve Reviews</Label>
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="w-5 h-5" />
            <span>Security Settings</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Security settings are managed through environment variables and server configuration.
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
              <span>Two-Factor Authentication</span>
              <Badge variant="outline">Enabled</Badge>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
              <span>SSL Certificate</span>
              <Badge variant="default">Active</Badge>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
              <span>API Rate Limiting</span>
              <Badge variant="default">Active</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSettings;
