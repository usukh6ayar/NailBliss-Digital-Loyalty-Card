
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Heart } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  description: string;
  showSparkles?: boolean;
}

export const AuthLayout = ({ children, title, description, showSparkles = true }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center">
            {showSparkles ? (
              <Sparkles className="h-8 w-8 text-rose-500" />
            ) : (
              <Heart className="h-8 w-8 text-rose-500" />
            )}
          </div>
          <CardTitle className="text-3xl font-light text-gray-800">{title}</CardTitle>
          <CardDescription className="text-gray-600">{description}</CardDescription>
        </CardHeader>
        <CardContent>
          {children}
        </CardContent>
      </Card>
    </div>
  );
};
