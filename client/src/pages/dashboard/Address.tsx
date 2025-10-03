import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, MapPin, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
interface SavedAddress {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  state: string;
  pincode: string;
}

export default function Address() {
  const { toast } = useToast();
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    state: "",
    pincode: "",
  });

  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

  // Map API address (snake_case) -> UI address (camelCase)
  const mapApiToUi = (a: any): SavedAddress => ({
    id: a._id,
    firstName: a.first_name,
    lastName: a.last_name,
    email: a.email,
    phone: a.phone,
    addressLine1: a.addressline1,
    addressLine2: a.addressline2 || "",
    state: a.state,
    pincode: a.pincode,
  });

  // Map UI form -> API payload (snake_case)
  const mapFormToApi = (f: typeof formData) => ({
    first_name: f.firstName,
    last_name: f.lastName,
    email: f.email,
    phone: f.phone,
    addressline1: f.addressLine1,
    addressline2: f.addressLine2,
    state: f.state,
    pincode: f.pincode,
  });

  useEffect(() => {
    const loadAddresses = async () => {
      try {
        const token = localStorage.getItem('melita_token');
        if (!token) return;
        const res = await fetch(`${API_BASE}/addresses`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok && data.success) {
          const items = (data.data || data.addresses || []).map(mapApiToUi);
          setSavedAddresses(items);
        }
      } catch (e) {
        console.error('Failed to load addresses', e);
      }
    };
    loadAddresses();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('melita_token');
      if (!token) {
        toast({ title: 'Authentication Required', description: 'Please log in to save address', variant: 'destructive' });
        return;
      }
      const payload = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        addressline1: formData.addressLine1,
        addressline2: formData.addressLine2,
        state: formData.state,
        pincode: formData.pincode,
      };
      const res = await fetch(`${API_BASE}/addresses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed to save address');
      const a = data.address || data.data;
      const ui = mapApiToUi(a);
      setSavedAddresses((prev) => [ui, ...prev]);
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        addressLine1: "",
        addressLine2: "",
        state: "",
        pincode: "",
      });
      toast({ title: 'Address saved successfully', description: 'Your new address has been added to your account.' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to save address', variant: 'destructive' });
    }
  };

  const handleDeleteAddress = async (id: string) => {
    try {
      const token = localStorage.getItem('melita_token');
      if (!token) return;
      const res = await fetch(`${API_BASE}/addresses/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed to delete address');
      setSavedAddresses((prev) => prev.filter((a) => a.id !== id));
      toast({ title: 'Address deleted', description: 'The address has been removed from your account.' });
    } catch (e: any) {
      toast({ title: 'Error', description: e.message || 'Failed to delete address', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="space-y-4">
        <Link 
          to="/dashboard" 
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold text-foreground">Manage Addresses</h1>
      </div>

      {/* Add New Address Form */}
      <Card className="border-border bg-card shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <MapPin className="h-5 w-5 text-primary" />
            Add New Address
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveAddress} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                  className="rounded-2xl border-border focus:ring-accent"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                  className="rounded-2xl border-border focus:ring-accent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="rounded-2xl border-border focus:ring-accent"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className="rounded-2xl border-border focus:ring-accent"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="addressLine1">Address Line 1</Label>
              <Input
                id="addressLine1"
                name="addressLine1"
                value={formData.addressLine1}
                onChange={handleInputChange}
                required
                className="rounded-2xl border-border focus:ring-accent"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="addressLine2">Address Line 2</Label>
              <Input
                id="addressLine2"
                name="addressLine2"
                value={formData.addressLine2}
                onChange={handleInputChange}
                className="rounded-2xl border-border focus:ring-accent"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  required
                  className="rounded-2xl border-border focus:ring-accent"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pincode">Pincode</Label>
                <Input
                  id="pincode"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleInputChange}
                  required
                  className="rounded-2xl border-border focus:ring-accent"
                />
              </div>
            </div>

            <Button type="submit" variant="melita" size="lg" className="w-full">
              Save Address
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Saved Addresses */}
      {savedAddresses.length > 0 && (
        <Card className="border-border bg-card shadow-soft">
          <CardHeader>
            <CardTitle className="text-foreground">Saved Addresses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {savedAddresses.map((address) => (
                <div key={address.id} className="p-4 bg-muted rounded-2xl border border-border">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <h4 className="font-semibold text-foreground">
                        {address.firstName} {address.lastName}
                      </h4>
                      <p className="text-sm text-muted-foreground">{address.email}</p>
                      <p className="text-sm text-muted-foreground">{address.phone}</p>
                      <p className="text-sm text-foreground">
                        {address.addressLine1}
                        {address.addressLine2 && `, ${address.addressLine2}`}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {address.state}, {address.pincode}
                      </p>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteAddress(address.id)}
                      className="hover:shadow-soft"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}