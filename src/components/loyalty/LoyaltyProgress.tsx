
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Gift, Crown } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { generateQRCode, encryptQRData } from "@/lib/qr";

interface LoyaltyCardData {
  points: number;
  total_visits: number;
  last_visit: string | null;
}

export const LoyaltyProgress = () => {
  const { user, profile } = useAuth();
  const [loyaltyData, setLoyaltyData] = useState<LoyaltyCardData | null>(null);
  const [qrCode, setQrCode] = useState<string>("");
  const [countdown, setCountdown] = useState(60);
  const [loading, setLoading] = useState(true);

  const selectedTemplate = profile?.card_template || "pink";

  const getCardStyles = (template: string) => {
    const templates = {
      pink: "bg-gradient-to-br from-rose-400 via-pink-500 to-purple-600",
      gold: "bg-gradient-to-br from-amber-400 via-yellow-500 to-orange-600",
      floral: "bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600",
      minimalist: "bg-gradient-to-br from-gray-600 via-slate-700 to-gray-800",
    };
    return templates[template as keyof typeof templates] || templates.pink;
  };

  useEffect(() => {
    if (user && profile?.role === "customer") {
      fetchLoyaltyData();
      generateNewQRCode();

      // Refresh QR code every 60 seconds with countdown
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
  }, [user, profile]);

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

    const timestamp = Date.now();
    const encryptedData = encryptQRData(user.id, timestamp);
    const qrCodeUrl = await generateQRCode(encryptedData);
    setQrCode(qrCodeUrl);
    setCountdown(60);
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
          className={`relative w-12 h-12 rounded-full flex items-center justify-center shadow-lg ${
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
              <Crown className="h-6 w-6 text-amber-800" />
            ) : (
              <Gift className="h-6 w-6 text-yellow-300" />
            )
          ) : (
            isFilled && <Sparkles className="h-5 w-5 text-rose-600" />
          )}
        </motion.div>
      );
    }

    return bubbles;
  };

  if (loading) {
    return (
      <Card className={`h-full ${getCardStyles(selectedTemplate)}`}>
        <CardContent className="p-6 h-full flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </CardContent>
      </Card>
    );
  }

  const currentPoints = loyaltyData?.points || 0;
  const isRewardReady = currentPoints >= 5;

  return (
    <Card className={`overflow-hidden shadow-xl border-0 h-full ${getCardStyles(selectedTemplate)}`}>
      <CardContent className="p-6 h-full flex flex-col justify-between">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <h3 className="text-white text-lg font-light mb-4">
              {isRewardReady
                ? "🎉 Reward Ready!"
                : "Collect 5 stamps for a reward"}
            </h3>
            <div className="flex justify-center space-x-2 mb-4">
              {renderProgressBubbles()}
            </div>
            {isRewardReady && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-white/90 text-sm"
              >
                Show this card to claim your 50% off reward!
              </motion.p>
            )}
          </motion.div>

          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 mb-6">
            <div className="flex justify-between text-white/90 text-sm">
              <span>Total Visits: {loyaltyData?.total_visits || 0}</span>
              {loyaltyData?.last_visit && (
                <span>Last: {new Date(loyaltyData.last_visit).toLocaleDateString()}</span>
              )}
            </div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center"
        >
          <div className="bg-white rounded-lg p-4 shadow-inner">
            {qrCode && (
              <img src={qrCode} alt="QR Code" className="w-32 h-32 mx-auto mb-2" />
            )}
            <p className="text-gray-600 text-xs mb-1">Show to staff to earn points</p>
            <p className="text-gray-500 text-xs">
              New QR in {countdown}s
            </p>
          </div>
        </motion.div>

        <div className="text-center mt-4">
          <p className="text-white/70 text-xs">
            Tap to view profile
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
