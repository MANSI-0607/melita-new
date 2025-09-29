import { useState } from "react";
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    const newAddress: SavedAddress = {
      id: Date.now().toString(),
      ...formData,
    };
    setSavedAddresses([...savedAddresses, newAddress]);
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
    toast({
      title: "Address saved successfully",
      description: "Your new address has been added to your account.",
    });
  };

  const handleDeleteAddress = (id: string) => {
    setSavedAddresses(savedAddresses.filter(addr => addr.id !== id));
    toast({
      title: "Address deleted",
      description: "The address has been removed from your account.",
    });
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