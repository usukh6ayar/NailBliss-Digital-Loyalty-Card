
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles, Gift, Crown } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { generateQRCode, encryptQRData } from "@/lib/qr";

interface LoyaltyCardData {
  points: number;
  total_visits: number;
  last_visit: string | null;
}

export const ProfileCardBack = () => {
  const { user } = useAuth();
  const [loyaltyData, setLoyaltyData] = useState<LoyaltyCardData | null>(null);
  const [qrCode, setQrCode] = useState<string>("");
  const [countdown, setCountdown] = useState(60);
  const [loading, setLoading] = useState(true);
  const [qrLoading, setQrLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchLoyaltyData();
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

  const fetchLoyaltyData = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("loyalty_cards")
        .select("points, total_visits, last_visit")
        .eq("customer_id", user.id)
        .single();

      if (error) {
        console.error("Error fetching loyalty data:", error);
        return;
      }

      setLoyaltyData(data);
    } catch (error) {
      console.error("Error fetching loyalty data:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateNewQRCode = async () => {
    if (!user) return;

    setQrLoading(true);
    try {
      const timestamp = Date.now();
      const encryptedData = encryptQRData(user.id, timestamp);
      const qrCodeUrl = await generateQRCode(encryptedData);
      setQrCode(qrCodeUrl);
      setCountdown(60);
    } catch (error) {
      console.error("Error generating QR code:", error);
    } finally {
      setQrLoading(false);
    }
  };

  const renderProgressBubbles = () => {
    const bubbles = [];
    const currentPoints = loyaltyData?.points || 0;

    for (let i = 0; i < 5; i++) {
      const isFilled = i < currentPoints;
      const isReward = i === 4;

      bubbles.push(
        <motion.div
          key={i}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: i * 0.1 }}
          className={`w-8 h-8 rounded-full flex items-center justify-center shadow-lg ${
            isReward
              ? isFilled
                ? "bg-gradient-to-br from-yellow-400 to-amber-500 shadow-amber-200"
                : "bg-white/20 border-2 border-dashed border-yellow-300"
              : isFilled
              ? "bg-white/90 shadow-white/50"
              : "bg-white/20 border-2 border-dashed border-white/50"
          }`}
        >
          {isReward ? (
            isFilled ? (
              <Crown className="h-4 w-4 text-amber-800" />
            ) : (
              <Gift className="h-4 w-4 text-yellow-300" />
            )
          ) : (
            isFilled && <Sparkles className="h-3 w-3 text-rose-600" />
          )}
        </motion.div>
      );
    }

    return bubbles;
  };

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  const currentPoints = loyaltyData?.points || 0;
  const isRewardReady = currentPoints >= 5;

  return (
    <div className="w-full h-full p-6 flex flex-col text-white">
      {/* Header */}
      <div className="text-center mb-4">
        <motion.h3
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-white text-lg font-medium mb-4 leading-relaxed"
        >
          {isRewardReady ? "🎉 Reward Ready!" : "Collect 5 stamps for a reward"}
        </motion.h3>
        
        {/* Progress Bubbles */}
        <div className="flex justify-center space-x-2 mb-4">
          {renderProgressBubbles()}
        </div>
        
        {isRewardReady && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-white/90 text-sm leading-relaxed"
          >
            Show your QR code to claim 50% off!
          </motion.p>
        )}
      </div>

      {/* Visit Stats */}
      <div className="flex justify-between text-white/80 text-sm mb-4">
        <span>Visits: {loyaltyData?.total_visits || 0}</span>
        {loyaltyData?.last_visit && (
          <span>Last: {new Date(loyaltyData.last_visit).toLocaleDateString()}</span>
        )}
      </div>

      {/* QR Code Section */}
      <div className="flex-1 flex flex-col items-center justify-center">
        {qrLoading ? (
          <div className="flex flex-col items-center space-y-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            <p className="text-white/70 text-sm">Generating QR...</p>
          </div>
        ) : qrCode ? (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="space-y-3 text-center"
          >
            <div className="bg-white/95 rounded-lg p-3 shadow-lg">
              <img 
                src={qrCode} 
                alt="QR Code" 
                className="w-32 h-32 mx-auto" 
              />
            </div>
            <div className="space-y-1">
              <p className="text-white/90 text-sm font-medium">
                Show to staff to earn points
              </p>
              <p className="text-white/70 text-xs">
                New QR in {countdown}s
              </p>
              <div className="w-32 bg-white/20 rounded-full h-1 mx-auto">
                <div 
                  className="bg-white h-1 rounded-full transition-all duration-1000"
                  style={{ width: `${(countdown / 60) * 100}%` }}
                ></div>
              </div>
            </div>
          </motion.div>
        ) : (
          <p className="text-white/70 text-sm">QR code unavailable</p>
        )}
      </div>
    </div>
  );
};
