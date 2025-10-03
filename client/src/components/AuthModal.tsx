import { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type AuthModalProps = {
  open: boolean;
  onClose: () => void;
};

type View = 'login' | 'signup';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export default function AuthModal({ open, onClose }: AuthModalProps) {
  const [view, setView] = useState<View>('login');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'enter' | 'verify'>('enter');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // Normalize phone number (remove spaces and non-digits)
  const normalizePhone = (num: string) => num.replace(/[\s\-\(\)]/g, '').replace(/\D/g, '');

  // Handle phone input change - clean and format
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const cleaned = normalizePhone(value);
    // Only allow digits, limit to 10 characters
    if (cleaned.length <= 10) {
      setPhone(cleaned);
    }
  };

  useEffect(() => {
    if (!open) {
      setPhone('');
      setName('');
      setOtp('');
      setStep('enter');
      setError(null);
      setMessage(null);
      setView('login');
    }
  }, [open]);

  const isSignup = useMemo(() => view === 'signup', [view]);

  const sendOtp = async () => {
    setLoading(true);
    setError(null);
    setMessage(null);

    const normalizedPhone = normalizePhone(phone);
    if (normalizedPhone.length !== 10) {
      setError('Please enter a valid 10-digit phone number');
      setLoading(false);
      return;
    }

    if (isSignup && !name.trim()) {
      setError('Please enter your name');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: normalizedPhone, name: isSignup ? name.trim() : undefined, type: isSignup ? 'signup' : 'login' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Failed to send OTP');
      setMessage('OTP sent. Please check your phone.');
      setStep('verify');
    } catch (e: any) {
      setError(e.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    setLoading(true);
    setError(null);
    setMessage(null);

    const normalizedPhone = normalizePhone(phone);
    if (normalizedPhone.length !== 10) {
      setError('Please enter a valid 10-digit phone number');
      setLoading(false);
      return;
    }

    if (otp.length !== 6) {
      setError('OTP must be 6 digits');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: normalizedPhone, otp, name: isSignup ? name : undefined, type: isSignup ? 'signup' : 'login' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Failed to verify OTP');
      // store token and basic user info
      if (data?.token) {
        localStorage.setItem('melita_token', data.token);
      }
      if (data?.user) {
        localStorage.setItem('melita_user', JSON.stringify(data.user));
      }
      setMessage('Logged in successfully!');
      onClose();
    } catch (e: any) {
      setError(e.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const canSend = normalizePhone(phone).length === 10 && (!isSignup || name.trim().length >= 2);
  const canVerify = normalizePhone(phone).length === 10 && otp.trim().length === 6;

  return (
    <Dialog open={open} onOpenChange={(o) => (!o ? onClose() : null)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-headingOne text-[#1e4323]">
            {view === 'login' ? 'Log in' : 'Sign up'}
          </DialogTitle>
        </DialogHeader>

        <div className="flex items-center justify-center gap-4 mb-4">
          <button
            className={`text-sm font-medium pb-1 border-b-2 ${view === 'login' ? 'border-[#1e4323] text-[#1e4323]' : 'border-transparent text-gray-500'}`}
            onClick={() => setView('login')}
          >
            Log in
          </button>
          <button
            className={`text-sm font-medium pb-1 border-b-2 ${view === 'signup' ? 'border-[#1e4323] text-[#1e4323]' : 'border-transparent text-gray-500'}`}
            onClick={() => setView('signup')}
          >
            Sign up
          </button>
        </div>

        {error && (
          <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-md p-2 mb-2">{error}</div>
        )}
        {message && (
          <div className="text-green-700 text-sm bg-green-50 border border-green-200 rounded-md p-2 mb-2">{message}</div>
        )}

        <div className="space-y-4">
          {isSignup && (
            <div className="space-y-1">
              <Label htmlFor="name">Name</Label>
              <Input id="name" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
          )}

          <div className="space-y-1">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              placeholder="Enter phone number"
              value={phone}
              onChange={handlePhoneChange}
              maxLength={10}
            />
          </div>

          {step === 'verify' && (
            <div className="space-y-1">
              <Label htmlFor="otp">OTP</Label>
              <Input id="otp" placeholder="Enter OTP" value={otp} onChange={(e) => setOtp(e.target.value)} />
            </div>
          )}

          {step === 'enter' ? (
            <Button className="w-full" disabled={!canSend || loading} onClick={sendOtp}>
              {loading ? 'Sending...' : 'Send OTP'}
            </Button>
          ) : (
            <Button className="w-full" disabled={!canVerify || loading} onClick={verifyOtp}>
              {loading ? 'Verifying...' : 'Verify OTP'}
            </Button>
          )}

          <div className="text-center text-sm text-gray-600">
            {view === 'login' ? (
              <span>
                New here?{' '}
                <button className="text-[#1e4323] font-medium" onClick={() => { setView('signup'); setStep('enter'); }}>
                  Create an account
                </button>
              </span>
            ) : (
              <span>
                Already have an account?{' '}
                <button className="text-[#1e4323] font-medium" onClick={() => { setView('login'); setStep('enter'); }}>
                  Log in
                </button>
              </span>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
