import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { signIn, signUp, resetPassword } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, Heart } from 'lucide-react';

export const AuthForm = () => {
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const [signInData, setSignInData] = useState({
    email: '',
    password: ''
  });

  const [signUpData, setSignUpData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'customer' as 'customer' | 'staff'
  });

  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');

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
        // Navigation will be handled by the auth state change in App.tsx
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
        // For email confirmation flow, redirect after a short delay
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

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await resetPassword(forgotPasswordEmail);
      
      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Reset link sent!",
          description: "Please check your email for password reset instructions.",
        });
        setShowForgotPassword(false);
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

  if (showForgotPassword) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center space-y-2">
            <div className="flex justify-center">
              <Heart className="h-8 w-8 text-rose-500" />
            </div>
            <CardTitle className="text-2xl font-light text-gray-800">Reset Password</CardTitle>
            <CardDescription className="text-gray-600">
              Enter your email to receive reset instructions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={forgotPasswordEmail}
                  onChange={(e) => setForgotPasswordEmail(e.target.value)}
                  required
                  className="border-rose-200 focus:border-rose-400 focus:ring-rose-400/20"
                />
              </div>
              <div className="space-y-2">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-rose-400 to-pink-500 hover:from-rose-500 hover:to-pink-600 text-white border-0 shadow-lg"
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowForgotPassword(false)}
                  className="w-full text-gray-600 hover:text-gray-800"
                >
                  Back to Sign In
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center">
            <Sparkles className="h-8 w-8 text-rose-500" />
          </div>
          <CardTitle className="text-3xl font-light text-gray-800">NailBliss</CardTitle>
          <CardDescription className="text-gray-600">
            Your digital loyalty companion
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2 bg-rose-100">
              <TabsTrigger value="signin" className="data-[state=active]:bg-white data-[state=active]:text-rose-600">Sign In</TabsTrigger>
              <TabsTrigger value="signup" className="data-[state=active]:bg-white data-[state=active]:text-rose-600">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
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
                  onClick={() => setShowForgotPassword(true)}
                  className="w-full text-gray-600 hover:text-gray-800"
                >
                  Forgot password?
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
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
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
