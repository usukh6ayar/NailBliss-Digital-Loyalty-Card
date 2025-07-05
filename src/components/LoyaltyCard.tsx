import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sparkles, Gift, Crown } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { generateQRCode, encryptQRData } from "@/lib/qr";

interface LoyaltyCardData {
  points: number;
  total_visits: number;
  last_visit: string | null;
}

export const LoyaltyCard = () => {
  const { user, profile } = useAuth();
  const [loyaltyData, setLoyaltyData] = useState<LoyaltyCardData | null>(null);
  const [qrCode, setQrCode] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && profile?.role === "customer") {
      fetchLoyaltyData();
      generateNewQRCode();

      // Refresh QR code every 60 seconds
      const interval = setInterval(generateNewQRCode, 60000);
      return () => clearInterval(interval);
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
                : "bg-gray-100 border-2 border-dashed border-amber-300"
              : isFilled
              ? "bg-gradient-to-br from-rose-400 to-pink-500 shadow-rose-200"
              : "bg-gray-100 border-2 border-dashed border-gray-300"
          }`}
        >
          {isReward ? (
            isFilled ? (
              <Crown className="h-6 w-6 text-white" />
            ) : (
              <Gift className="h-6 w-6 text-amber-400" />
            )
          ) : (
            isFilled && <Sparkles className="h-5 w-5 text-white" />
          )}
        </motion.div>
      );
    }

    return bubbles;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
      </div>
    );
  }

  const currentPoints = loyaltyData?.points || 0;
  const isRewardReady = currentPoints >= 5;

  return (
    <div className="space-y-6">
      {/* Loyalty Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative"
      >
        <Card className="overflow-hidden shadow-xl border-0 bg-gradient-to-br from-rose-400 via-pink-500 to-purple-600">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <Avatar className="h-12 w-12 border-2 border-white/50">
                  <AvatarImage src={profile?.avatar_url || ""} />
                  <AvatarFallback className="bg-white/20 text-white font-semibold">
                    {profile?.first_name?.[0]}
                    {profile?.last_name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-white font-semibold text-lg">
                    {profile?.first_name} {profile?.last_name}
                  </h3>
                  <p className="text-white/80 text-sm">Loyal Customer</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white/80 text-sm">Total Visits</p>
                <p className="text-white font-bold text-xl">
                  {loyaltyData?.total_visits || 0}
                </p>
              </div>
            </div>

            <div className="text-center mb-6">
              <h4 className="text-white text-lg font-light mb-2">
                {isRewardReady
                  ? "🎉 Reward Ready!"
                  : "Collect 5 stamps for a reward"}
              </h4>
              <div className="flex justify-center space-x-2">
                {renderProgressBubbles()}
              </div>
              {isRewardReady && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-white/90 text-sm mt-2"
                >
                  Show this card to claim your 50% off reward!
                </motion.p>
              )}
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <p className="text-white/80 text-xs text-center">
                NailBliss Digital Loyalty Card
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* QR Code */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="shadow-lg border-0 bg-white">
          <CardContent className="p-6 text-center">
            <h4 className="text-gray-800 font-semibold mb-4">Your QR Code</h4>
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-white rounded-lg shadow-inner border-2 border-gray-100">
                {qrCode && (
                  <img src={qrCode} alt="QR Code" className="w-48 h-48" />
                )}
              </div>
            </div>
            <p className="text-gray-600 text-sm">
              Show this QR code to staff to earn points
            </p>
            <p className="text-gray-500 text-xs mt-1">
              Refreshes automatically every 60 seconds
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};
