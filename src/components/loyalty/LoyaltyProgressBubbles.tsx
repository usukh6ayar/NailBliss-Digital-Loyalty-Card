
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles, Gift, Crown } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface LoyaltyCardData {
  points: number;
  total_visits: number;
  last_visit: string | null;
}

export const LoyaltyProgressBubbles = () => {
  const { user, profile } = useAuth();
  const [loyaltyData, setLoyaltyData] = useState<LoyaltyCardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && profile?.role === "customer") {
      fetchLoyaltyData();
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
          className={`relative w-10 h-10 rounded-full flex items-center justify-center shadow-lg ${
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
              <Crown className="h-5 w-5 text-amber-800" />
            ) : (
              <Gift className="h-5 w-5 text-yellow-300" />
            )
          ) : (
            isFilled && <Sparkles className="h-4 w-4 text-rose-600" />
          )}
        </motion.div>
      );
    }

    return bubbles;
  };

  if (loading) {
    return <div className="animate-pulse h-16 bg-white/20 rounded-lg"></div>;
  }

  const currentPoints = loyaltyData?.points || 0;
  const isRewardReady = currentPoints >= 5;

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 space-y-4">
      <div className="text-center">
        <motion.h3
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-white text-base font-medium mb-4 leading-relaxed"
        >
          {isRewardReady
            ? "🎉 Reward Ready!"
            : "Collect 5 stamps for a reward"}
        </motion.h3>
        
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

      <div className="flex justify-between text-white/80 text-sm">
        <span>Visits: {loyaltyData?.total_visits || 0}</span>
        {loyaltyData?.last_visit && (
          <span>Last: {new Date(loyaltyData.last_visit).toLocaleDateString()}</span>
        )}
      </div>
    </div>
  );
};
