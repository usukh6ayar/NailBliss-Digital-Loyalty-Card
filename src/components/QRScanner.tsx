
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Camera, X, CheckCircle, AlertCircle } from 'lucide-react';
import { decryptQRData } from '@/lib/qr';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export const QRScanner = () => {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { user, profile } = useAuth();
  const { toast } = useToast();

  const startScanning = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setScanning(true);
        
        // Simple QR detection simulation
        setTimeout(() => {
          scanForQR();
        }, 2000);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast({
        title: "Camera Error",
        description: "Unable to access camera. Please check permissions.",
        variant: "destructive"
      });
    }
  };

  const stopScanning = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
    }
    setScanning(false);
    setResult(null);
    setSuccess(false);
  };

  const scanForQR = async () => {
    // In a real implementation, this would use a QR code library
    // For demo purposes, we'll simulate a successful scan
    const mockQRData = "eyJ1c2VySWQiOiIxMjM0NSIsInRpbWVzdGFtcCI6MTcwMDAwMDAwMH0tbmFpbGJsaXNzLTIwMjQ=";
    await processQRCode(mockQRData);
  };

  const processQRCode = async (qrData: string) => {
    if (!user || profile?.role !== 'staff') {
      toast({
        title: "Unauthorized",
        description: "Only staff members can scan QR codes.",
        variant: "destructive"
      });
      return;
    }

    const decryptedData = decryptQRData(qrData);
    
    if (!decryptedData) {
      toast({
        title: "Invalid QR Code",
        description: "QR code is invalid or expired.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Add loyalty point
      const { error } = await supabase.rpc('add_loyalty_point', {
        p_customer_id: decryptedData.userId,
        p_staff_id: user.id
      });

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      setSuccess(true);
      setResult(`Point added successfully for customer ${decryptedData.userId.slice(0, 8)}...`);
      
      toast({
        title: "Success!",
        description: "Loyalty point added successfully.",
      });

      // Auto-close scanner after success
      setTimeout(() => {
        stopScanning();
      }, 3000);

    } catch (error) {
      console.error('Error processing QR code:', error);
      toast({
        title: "Error",
        description: "Failed to process QR code.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, []);

  if (profile?.role !== 'staff') {
    return (
      <Card className="shadow-lg border-0">
        <CardContent className="p-6 text-center">
          <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Staff Only</h3>
          <p className="text-gray-600">
            QR code scanning is only available for staff members.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-800">
            <Camera className="h-5 w-5 text-rose-500" />
            QR Code Scanner
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!scanning ? (
            <div className="text-center space-y-4">
              <p className="text-gray-600">
                Scan customer QR codes to add loyalty points
              </p>
              <Button 
                onClick={startScanning}
                className="bg-gradient-to-r from-rose-400 to-pink-500 hover:from-rose-500 hover:to-pink-600 text-white"
              >
                <Camera className="h-4 w-4 mr-2" />
                Start Scanning
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative">
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  className="w-full h-64 bg-black rounded-lg object-cover"
                />
                <canvas
                  ref={canvasRef}
                  className="hidden"
                />
                <div className="absolute inset-0 border-2 border-white rounded-lg">
                  <div className="absolute inset-4 border-2 border-rose-400 rounded-lg border-dashed animate-pulse" />
                </div>
              </div>
              
              {result && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-lg flex items-center gap-2 ${
                    success 
                      ? 'bg-green-50 text-green-800 border border-green-200'
                      : 'bg-red-50 text-red-800 border border-red-200'
                  }`}
                >
                  {success ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  )}
                  <p className="text-sm">{result}</p>
                </motion.div>
              )}
              
              <Button 
                onClick={stopScanning}
                variant="outline"
                className="w-full"
              >
                <X className="h-4 w-4 mr-2" />
                Stop Scanning
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
