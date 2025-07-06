
import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Edit3, Palette, Camera, Crown, Gift } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { ProfileEditModal } from "./ProfileEditModal";
import { CardTemplateModal } from "./CardTemplateModal";
import { LoyaltyProgressBubbles } from "./LoyaltyProgressBubbles";

export const ProfileCard = () => {
  const { user, profile } = useAuth();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(
    localStorage.getItem(`profile-image-${user?.id}`) || null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = e.target?.result as string;
        setProfileImage(imageData);
        localStorage.setItem(`profile-image-${user?.id}`, imageData);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <>
      <Card className={`overflow-hidden shadow-xl border-0 ${getCardStyles(selectedTemplate)}`}>
        <CardContent className="p-6">
          {/* Profile Section */}
          <div className="text-center mb-6">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative inline-block mb-4"
            >
              <Avatar className="h-20 w-20 border-4 border-white/50 shadow-lg mx-auto">
                <AvatarImage src={profileImage || profile?.avatar_url || ""} />
                <AvatarFallback className="bg-white/20 text-white font-semibold text-xl">
                  {profile?.first_name?.[0]}{profile?.last_name?.[0]}
                </AvatarFallback>
              </Avatar>
              <Button
                size="sm"
                variant="ghost"
                className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-white/90 hover:bg-white text-gray-700 p-0"
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera className="h-4 w-4" />
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </motion.div>

            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="space-y-3"
            >
              <h2 className="text-white font-bold text-xl">
                {profile?.first_name} {profile?.last_name}
              </h2>
              
              <p className="text-white/90 text-base leading-relaxed">
                Welcome back, {profile?.username || "valued customer"}!
              </p>
            </motion.div>
          </div>

          {/* Loyalty Progress */}
          <LoyaltyProgressBubbles />

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowEditModal(true)}
              className="flex-1 text-white hover:bg-white/20 transition-all duration-200 hover:scale-105"
            >
              <Edit3 className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowTemplateModal(true)}
              className="flex-1 text-white hover:bg-white/20 transition-all duration-200 hover:scale-105"
            >
              <Palette className="h-4 w-4 mr-2" />
              Card Design
            </Button>
          </div>
        </CardContent>
      </Card>

      <ProfileEditModal 
        open={showEditModal} 
        onOpenChange={setShowEditModal}
      />
      <CardTemplateModal 
        open={showTemplateModal} 
        onOpenChange={setShowTemplateModal}
      />
    </>
  );
};
