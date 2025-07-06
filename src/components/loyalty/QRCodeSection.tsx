
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QrCode, ChevronDown, ChevronUp } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { generateQRCode, encryptQRData } from "@/lib/qr";

export const QRCodeSection = () => {
  const { user } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const [qrCode, setQrCode] = useState<string>("");
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    if (user) {
      generateNewQRCode();

      // Refresh QR code every 60 seconds
      const interval = setInterval(() => {
        generateNewQRCode();
        setCountdown(60);
      }, 60000);

      // Countdown timer
      const countdownInterval = setInterval(() => {
        setCountdown((prev) => (prev > 0 ? prev - 1 : 60));
      }, 1000);

      return () => {
        clearInterval(interval);
        clearInterval(countdownInterval);
      };
    }
  }, [user]);

  const generateNewQRCode = async () => {
    if (!user) return;

    const timestamp = Date.now();
    const encryptedData = encryptQRData(user.id, timestamp);
    const qrCodeUrl = await generateQRCode(encryptedData);
    setQrCode(qrCodeUrl);
    setCountdown(60);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
    >
      <Button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 transition-all duration-200"
        variant="ghost"
      >
        <QrCode className="h-5 w-5 mr-2" />
        {isExpanded ? "Hide QR Code" : "Show QR Code"}
        {isExpanded ? (
          <ChevronUp className="h-4 w-4 ml-2" />
        ) : (
          <ChevronDown className="h-4 w-4 ml-2" />
        )}
      </Button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-3"
          >
            <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-6 text-center">
                {qrCode && (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="space-y-4"
                  >
                    <img 
                      src={qrCode} 
                      alt="QR Code" 
                      className="w-40 h-40 mx-auto rounded-lg shadow-md" 
                    />
                    <div className="space-y-2">
                      <p className="text-gray-700 font-medium">
                        Show to staff to earn points
                      </p>
                      <p className="text-gray-500 text-sm">
                        New QR in {countdown}s
                      </p>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div 
                          className="bg-gradient-to-r from-rose-500 to-pink-600 h-1.5 rounded-full transition-all duration-1000"
                          style={{ width: `${(countdown / 60) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
