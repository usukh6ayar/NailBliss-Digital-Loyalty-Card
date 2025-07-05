
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { SignInForm } from '@/components/auth/SignInForm';
import { SignUpForm } from '@/components/auth/SignUpForm';
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';

export const AuthForm = () => {
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  if (showForgotPassword) {
    return (
      <AuthLayout 
        title="Reset Password" 
        description="Enter your email to receive reset instructions"
        showSparkles={false}
      >
        <ForgotPasswordForm onBack={() => setShowForgotPassword(false)} />
      </AuthLayout>
    );
  }

  return (
    <AuthLayout 
      title="NailBliss" 
      description="Your digital loyalty companion"
    >
      <Tabs defaultValue="signin" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 bg-rose-100">
          <TabsTrigger value="signin" className="data-[state=active]:bg-white data-[state=active]:text-rose-600">Sign In</TabsTrigger>
          <TabsTrigger value="signup" className="data-[state=active]:bg-white data-[state=active]:text-rose-600">Sign Up</TabsTrigger>
        </TabsList>
        
        <TabsContent value="signin">
          <SignInForm onForgotPassword={() => setShowForgotPassword(true)} />
        </TabsContent>
        
        <TabsContent value="signup">
          <SignUpForm />
        </TabsContent>
      </Tabs>
    </AuthLayout>
  );
};
