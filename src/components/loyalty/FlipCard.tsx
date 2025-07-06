
import { useState } from "react";
import { motion } from "framer-motion";
import { ProfileCard } from "./ProfileCard";
import { LoyaltyProgress } from "./LoyaltyProgress";

interface FlipCardProps {
  isFlipped: boolean;
  onFlip: () => void;
}

export const FlipCard = ({ isFlipped, onFlip }: FlipCardProps) => {
  return (
    <div className="relative w-full h-[400px] perspective-1000">
      <motion.div
        className="relative w-full h-full preserve-3d cursor-pointer"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
        onClick={onFlip}
      >
        {/* Front Side */}
        <motion.div className="absolute inset-0 backface-hidden">
          <ProfileCard />
        </motion.div>

        {/* Back Side */}
        <motion.div 
          className="absolute inset-0 backface-hidden"
          style={{ transform: "rotateY(180deg)" }}
        >
          <LoyaltyProgress />
        </motion.div>
      </motion.div>
    </div>
  );
};
