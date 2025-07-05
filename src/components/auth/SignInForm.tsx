
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { signIn } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface SignInFormProps {
  onForgotPassword: () => void;
}

export const SignInForm = ({ onForgotPassword }: SignInFormProps) => {
  const [loading, setLoading] = useState(false);
  const [signInData, setSignInData] = useState({
    email: '',
    password: ''
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await signIn(signInData.email, signInData.password);
      
      if (error) {
        toast({
          title: "Sign in failed",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Welcome back!",
          description: "You've successfully signed in.",
        });
        navigate('/');
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
    <form onSubmit={handleSignIn} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="signin-email" className="text-gray-700">Email</Label>
        <Input
          id="signin-email"
          type="email"
          value={signInData.email}
          onChange={(e) => setSignInData({...signInData, email: e.target.value})}
          required
          className="border-rose-200 focus:border-rose-400 focus:ring-rose-400/20"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="signin-password" className="text-gray-700">Password</Label>
        <Input
          id="signin-password"
          type="password"
          value={signInData.password}
          onChange={(e) => setSignInData({...signInData, password: e.target.value})}
          required
          className="border-rose-200 focus:border-rose-400 focus:ring-rose-400/20"
        />
      </div>
      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-rose-400 to-pink-500 hover:from-rose-500 hover:to-pink-600 text-white border-0 shadow-lg"
      >
        {loading ? 'Signing in...' : 'Sign In'}
      </Button>
      <Button
        type="button"
        variant="ghost"
        onClick={onForgotPassword}
        className="w-full text-gray-600 hover:text-gray-800"
      >
        Forgot password?
      </Button>
    </form>
  );
};
