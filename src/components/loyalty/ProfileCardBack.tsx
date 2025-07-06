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
    <div className="relative w-[340px] h-[215px] p-4 rounded-xl shadow-2xl bg-gradient-to-br from-rose-500 to-pink-600 text-white flex flex-col justify-between overflow-hidden">
      <div>
        <h3 className="text-base font-semibold text-center mb-3">
          {isRewardReady ? "🎉 Reward Ready!" : "Collect 5 stamps for a reward"}
        </h3>
        <div className="flex justify-center gap-2">
          {renderProgressBubbles()}
        </div>
      </div>

      <div className="flex items-end justify-between text-xs text-white/80">
        <div>
          <p>Visits: {loyaltyData?.total_visits || 0}</p>
          {loyaltyData?.last_visit && (
            <p>Last: {new Date(loyaltyData.last_visit).toLocaleDateString()}</p>
          )}
        </div>
      </div>
    </div>
  );
};
