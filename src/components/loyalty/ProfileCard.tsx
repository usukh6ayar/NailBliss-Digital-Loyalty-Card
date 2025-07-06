
import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Edit3, Save, X, Camera } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CardTemplateSelector } from "./CardTemplateSelector";

export const ProfileCard = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState(profile?.username || "");
  const [profileImage, setProfileImage] = useState<string | null>(
    localStorage.getItem(`profile-image-${user?.id}`) || null
  );
  const [loading, setLoading] = useState(false);
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

  const handleSaveUsername = async () => {
    if (!user || !username.trim()) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ username: username.trim() })
        .eq("id", user.id);

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Username updated successfully!",
        });
        setIsEditing(false);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update username",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
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
    <Card className={`overflow-hidden shadow-xl border-0 h-full ${getCardStyles(selectedTemplate)}`}>
      <CardContent className="p-6 h-full flex flex-col justify-between">
        <div className="text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative inline-block mb-4"
          >
            <Avatar className="h-20 w-20 border-4 border-white/50 shadow-lg">
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
          >
            <h2 className="text-white font-bold text-xl mb-1">
              {profile?.first_name} {profile?.last_name}
            </h2>
            
            {isEditing ? (
              <div className="space-y-3 mt-4">
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  className="bg-white/90 text-gray-800 border-0"
                />
                <div className="flex gap-2 justify-center">
                  <Button
                    size="sm"
                    onClick={handleSaveUsername}
                    disabled={loading}
                    className="bg-white/90 text-gray-800 hover:bg-white"
                  >
                    <Save className="h-4 w-4 mr-1" />
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setIsEditing(false);
                      setUsername(profile?.username || "");
                    }}
                    className="text-white hover:bg-white/20"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="mt-4">
                <p className="text-white/90 text-sm mb-2">
                  Welcome back, {username || "valued customer"}!
                </p>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsEditing(true)}
                  className="text-white hover:bg-white/20"
                >
                  <Edit3 className="h-4 w-4 mr-1" />
                  Edit Profile
                </Button>
              </div>
            )}
          </motion.div>
        </div>

        <div className="mt-6">
          <CardTemplateSelector />
        </div>

        <div className="text-center mt-4">
          <p className="text-white/70 text-xs">
            Tap to view loyalty progress
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
