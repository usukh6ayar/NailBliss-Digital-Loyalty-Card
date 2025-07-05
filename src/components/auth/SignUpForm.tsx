
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { signUp } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

export const SignUpForm = () => {
  const [loading, setLoading] = useState(false);
  const [signUpData, setSignUpData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'customer' as 'customer' | 'staff'
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await signUp(
        signUpData.email, 
        signUpData.password, 
        signUpData.firstName, 
        signUpData.lastName,
        signUpData.role
      );
      
      if (error) {
        toast({
          title: "Sign up failed",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Welcome to NailBliss!",
          description: "Please check your email to verify your account.",
        });
        setTimeout(() => {
          navigate('/');
        }, 2000);
      }
    } catch (error) {
      toast({
        title: "An error occurred",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSignUp} className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-2">
          <Label htmlFor="firstName" className="text-gray-700">First Name</Label>
          <Input
            id="firstName"
            value={signUpData.firstName}
            onChange={(e) => setSignUpData({...signUpData, firstName: e.target.value})}
            required
            className="border-rose-200 focus:border-rose-400 focus:ring-rose-400/20"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName" className="text-gray-700">Last Name</Label>
          <Input
            id="lastName"
            value={signUpData.lastName}
            onChange={(e) => setSignUpData({...signUpData, lastName: e.target.value})}
            required
            className="border-rose-200 focus:border-rose-400 focus:ring-rose-400/20"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="signup-email" className="text-gray-700">Email</Label>
        <Input
          id="signup-email"
          type="email"
          value={signUpData.email}
          onChange={(e) => setSignUpData({...signUpData, email: e.target.value})}
          required
          className="border-rose-200 focus:border-rose-400 focus:ring-rose-400/20"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="signup-password" className="text-gray-700">Password</Label>
        <Input
          id="signup-password"
          type="password"
          value={signUpData.password}
          onChange={(e) => setSignUpData({...signUpData, password: e.target.value})}
          required
          className="border-rose-200 focus:border-rose-400 focus:ring-rose-400/20"
        />
      </div>
      <div className="space-y-2">
        <Label className="text-gray-700">I am a:</Label>
        <div className="flex gap-4">
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              value="customer"
              checked={signUpData.role === 'customer'}
              onChange={(e) => setSignUpData({...signUpData, role: e.target.value as 'customer' | 'staff'})}
              className="text-rose-500"
            />
            <span className="text-gray-700">Customer</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              value="staff"
              checked={signUpData.role === 'staff'}
              onChange={(e) => setSignUpData({...signUpData, role: e.target.value as 'customer' | 'staff'})}
              className="text-rose-500"
            />
            <span className="text-gray-700">Staff</span>
          </label>
        </div>
      </div>
      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-rose-400 to-pink-500 hover:from-rose-500 hover:to-pink-600 text-white border-0 shadow-lg"
      >
        {loading ? 'Creating account...' : 'Create Account'}
      </Button>
    </form>
  );
};
