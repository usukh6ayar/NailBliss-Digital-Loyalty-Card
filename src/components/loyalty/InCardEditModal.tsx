
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Save, X, Camera, Check } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface InCardEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cardRef: React.RefObject<HTMLDivElement>;
}

const templates = {
  pink: {
    name: "Rose Blush",
    gradient: "from-rose-400 via-pink-500 to-purple-600",
  },
  gold: {
    name: "Golden Hour",
    gradient: "from-amber-400 via-yellow-500 to-orange-600",
  },
  floral: {
    name: "Ocean Breeze",
    gradient: "from-emerald-400 via-teal-500 to-cyan-600",
  },
  minimalist: {
    name: "Midnight",
    gradient: "from-gray-600 via-slate-700 to-gray-800",
  },
};

export const InCardEditModal = ({ open, onOpenChange, cardRef }: InCardEditModalProps) => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [username, setUsername] = useState(profile?.username || "");
  const [selectedTemplate, setSelectedTemplate] = useState(profile?.card_template || "pink");
  const [loading, setSaving] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(
    localStorage.getItem(`profile-image-${user?.id}`) || null
  );

  useEffect(() => {
    if (profile) {
      setUsername(profile.username || "");
      setSelectedTemplate(profile.card_template || "pink");
    }
  }, [profile]);

  const handleSave = async () => {
    if (!user || !username.trim()) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ 
          username: username.trim(),
          card_template: selectedTemplate 
        })
        .eq("id", user.id);

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success! ✨",
          description: "Profile updated successfully!",
        });
        onOpenChange(false);
        // Reload to apply changes
        setTimeout(() => window.location.reload(), 1000);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
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
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => onOpenChange(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Edit Profile</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onOpenChange(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-6">
              {/* Avatar Section */}
              <div className="flex flex-col items-center space-y-3">
                <div className="relative">
                  <Avatar className="h-20 w-20 border-4 border-gray-200">
                    <AvatarImage src={profileImage || profile?.avatar_url || ""} />
                    <AvatarFallback className="bg-gray-100 text-gray-600 font-semibold text-lg">
                      {profile?.first_name?.[0]}{profile?.last_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-rose-500 hover:bg-rose-600 text-white p-0"
                    onClick={() => document.getElementById('avatar-upload')?.click()}
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
                <p className="text-sm text-gray-500">Click camera to change avatar</p>
              </div>

              {/* Username */}
              <div>
                <label htmlFor="username" className="block text-sm font-medium mb-2 text-gray-700">
                  Username
                </label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="w-full"
                />
              </div>

              {/* Card Templates */}
              <div>
                <label className="block text-sm font-medium mb-3 text-gray-700">
                  Card Design
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(templates).map(([key, template]) => (
                    <motion.div
                      key={key}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`relative h-16 cursor-pointer rounded-lg border-2 transition-all duration-200 ${
                        selectedTemplate === key 
                          ? "border-rose-500 shadow-lg" 
                          : "border-gray-200 hover:border-rose-300"
                      }`}
                      onClick={() => setSelectedTemplate(key)}
                    >
                      <div className={`w-full h-full bg-gradient-to-br ${template.gradient} rounded-md flex items-center justify-center`}>
                        {selectedTemplate === key && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="bg-white/90 rounded-full p-1"
                          >
                            <Check className="h-4 w-4 text-rose-600" />
                          </motion.div>
                        )}
                      </div>
                      <p className="absolute bottom-1 left-1 right-1 text-white text-xs font-medium text-center bg-black/20 rounded px-1">
                        {template.name}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleSave}
                  disabled={loading || !username.trim()}
                  className="flex-1 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? "Saving..." : "Save Changes"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
