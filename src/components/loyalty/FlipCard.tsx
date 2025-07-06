
import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Edit3 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { ProfileCardFront } from "./ProfileCardFront";
import { ProfileCardBack } from "./ProfileCardBack";
import { InCardEditModal } from "./InCardEditModal";

export const FlipCard = () => {
  const { user, profile } = useAuth();
  const [isFlipped, setIsFlipped] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  if (!user || !profile || profile.role !== "customer") {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
      </div>
    );
  }

  const selectedTemplate = profile?.card_template || "pink";

  const getCardStyles = (template: string) => {
    const templates = {
      pink: "from-rose-400 via-pink-500 to-purple-600",
      gold: "from-amber-400 via-yellow-500 to-orange-600",
      floral: "from-emerald-400 via-teal-500 to-cyan-600",
      minimalist: "from-gray-600 via-slate-700 to-gray-800",
    };
    return templates[template as keyof typeof templates] || templates.pink;
  };

  return (
    <div className="perspective-1000 w-full max-w-sm mx-auto">
      <motion.div
        ref={cardRef}
        className="relative w-full h-96 preserve-3d cursor-pointer"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        {/* Front Side */}
        <div className="absolute inset-0 backface-hidden">
          <div className={`w-full h-full bg-gradient-to-br ${getCardStyles(selectedTemplate)} rounded-2xl shadow-xl overflow-hidden`}>
            <ProfileCardFront 
              profile={profile}
              onEditClick={(e) => {
                e.stopPropagation();
                setShowEditModal(true);
              }}
            />
          </div>
        </div>

        {/* Back Side */}
        <div className="absolute inset-0 backface-hidden rotate-y-180">
          <div className={`w-full h-full bg-gradient-to-br ${getCardStyles(selectedTemplate)} rounded-2xl shadow-xl overflow-hidden`}>
            <ProfileCardBack />
          </div>
        </div>
      </motion.div>

      {/* In-Card Edit Modal */}
      <InCardEditModal 
        open={showEditModal}
        onOpenChange={setShowEditModal}
        cardRef={cardRef}
      />
    </div>
  );
};
