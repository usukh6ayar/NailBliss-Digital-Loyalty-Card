
import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Edit3, Camera } from "lucide-react";

interface ProfileCardFrontProps {
  profile: any;
  onEditClick: (e: React.MouseEvent) => void;
}

export const ProfileCardFront = ({ profile, onEditClick }: ProfileCardFrontProps) => {
  const [profileImage, setProfileImage] = useState<string | null>(
    localStorage.getItem(`profile-image-${profile?.id}`) || null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = e.target?.result as string;
        setProfileImage(imageData);
        localStorage.setItem(`profile-image-${profile?.id}`, imageData);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="relative w-full h-full p-6 flex flex-col justify-center items-center text-white">
      {/* Edit Button */}
      <Button
        size="sm"
        variant="ghost"
        className="absolute top-4 right-4 text-white hover:bg-white/20 transition-all duration-200"
        onClick={onEditClick}
      >
        <Edit3 className="h-4 w-4" />
      </Button>

      {/* Avatar Section */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative mb-6"
      >
        <Avatar className="h-24 w-24 border-4 border-white/50 shadow-lg">
          <AvatarImage src={profileImage || profile?.avatar_url || ""} />
          <AvatarFallback className="bg-white/20 text-white font-semibold text-xl">
            {profile?.first_name?.[0]}{profile?.last_name?.[0]}
          </AvatarFallback>
        </Avatar>
        <Button
          size="sm"
          variant="ghost"
          className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-white/90 hover:bg-white text-gray-700 p-0"
          onClick={(e) => {
            e.stopPropagation();
            fileInputRef.current?.click();
          }}
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

      {/* User Info */}
      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="text-center space-y-3"
      >
        <h2 className="text-white font-bold text-xl leading-relaxed">
          {profile?.username || `${profile?.first_name} ${profile?.last_name}`}
        </h2>
        
        <p className="text-white/90 text-base leading-relaxed">
          Welcome back, valued customer!
        </p>
      </motion.div>

      {/* Flip Hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="absolute bottom-4 left-1/2 transform -translate-x-1/2"
      >
        <p className="text-white/70 text-xs">Tap to view QR & rewards</p>
      </motion.div>
    </div>
  );
};
