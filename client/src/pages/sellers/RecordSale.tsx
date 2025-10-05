import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { ShoppingCart, Plus, Minus, DollarSign, Package } from 'lucide-react';

interface SaleItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

const RecordSale: React.FC = () => {
  const [customerPhone, setCustomerPhone] = useState('');
  const [items, setItems] = useState<SaleItem[]>([]);
  const [newItem, setNewItem] = useState({ name: '', price: '' });
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const addItem = () => {
    if (!newItem.name.trim() || !newItem.price) {
      toast({
        title: 'Error',
        description: 'Please enter item name and price',
        variant: 'destructive'
      });
      return;
    }

    const item: SaleItem = {
      id: Date.now().toString(),
      name: newItem.name.trim(),
      quantity: 1,
      price: parseFloat(newItem.price)
    };

    setItems([...items, item]);
    setNewItem({ name: '', price: '' });
  };

  const updateQuantity = (id: string, change: number) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const newQuantity = Math.max(1, item.quantity + change);
        return { ...item, quantity: newQuantity };
      }
      return item;
    }));
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const getTotalAmount = () => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleRecordSale = async () => {
    if (!customerPhone.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter customer phone number',
        variant: 'destructive'
      });
      return;
    }

    if (items.length === 0) {
      toast({
        title: 'Error',
        description: 'Please add at least one item',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      // TODO: Implement API call to record sale
      await new Promise(resolve => setTimeout(resolve, 1000)); // Mock delay
      
      toast({
        title: 'Sale Recorded',
        description: `Sale of ₹${getTotalAmount().toFixed(2)} recorded successfully`
      });

      // Reset form
      setCustomerPhone('');
      setItems([]);
      setNotes('');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to record sale',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ShoppingCart className="w-5 h-5" />
            <span>Record Sale</span>
          </CardTitle>
          <p className="text-sm text-gray-600">Record a new sale transaction</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Customer Info */}
          <div className="space-y-2">
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

          {/* Add Items */}
          <div className="space-y-4">
            <h3 className="font-medium">Sale Items</h3>
            
            <div className="flex space-x-2">
              <Input
                placeholder="Item name"
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                className="flex-1"
              />
              <Input
                type="number"
                placeholder="Price"
                value={newItem.price}
                onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                className="w-24"
                min="0"
                step="0.01"
              />
              <Button onClick={addItem} size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {/* Items List */}
            {items.length > 0 && (
              <div className="space-y-2">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Package className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">{item.name}</span>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateQuantity(item.id, -1)}
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateQuantity(item.id, 1)}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                      
                      <span className="w-20 text-right">₹{(item.price * item.quantity).toFixed(2)}</span>
                      
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => removeItem(item.id)}
                      >
                        ×
                      </Button>
                    </div>
                  </div>
                ))}
                
                {/* Total */}
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg font-medium">
                  <span>Total Amount:</span>
                  <span className="text-lg">₹{getTotalAmount().toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any additional notes about this sale..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          {/* Record Sale Button */}
          <Button
            onClick={handleRecordSale}
            disabled={loading || items.length === 0}
            className="w-full"
            size="lg"
          >
            {loading ? (
              'Recording Sale...'
            ) : (
              <>
                <DollarSign className="w-4 h-4 mr-2" />
                Record Sale - ₹{getTotalAmount().toFixed(2)}
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default RecordSale;
