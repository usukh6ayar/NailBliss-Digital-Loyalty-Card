import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Save, X, Check } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { PreviewCard } from "@/components/PreviewCard";

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

export const InCardEditModal = ({
  open,
  onOpenChange,
  cardRef,
}: InCardEditModalProps) => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [username, setUsername] = useState(profile?.username || "");
  const [selectedTemplate, setSelectedTemplate] = useState(
    profile?.card_template || "pink"
  );
  const [loading, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setUsername(profile.username || "");
      setSelectedTemplate(profile.card_template || "pink");
    }
  }, [profile]);

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const handleSave = async () => {
    if (!user || !username.trim()) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          username: username.trim(),
          card_template: selectedTemplate,
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

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ minHeight: "100vh" }}
          onClick={() => onOpenChange(false)}
        >
          <motion.div
            initial={{ scale: 0.97, opacity: 0, y: -40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.97, opacity: 0, y: -40 }}
            className="bg-white rounded-2xl w-full max-w-sm shadow-xl mx-auto h-[95vh] max-h-[95svh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Edit Profile
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onOpenChange(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-6">
                {/* Username */}
                <div>
                  <label
                    htmlFor="username"
                    className="block text-sm font-medium mb-2 text-gray-700"
                  >
                    Username
                  </label>
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    className="w-full"
                    maxLength={32}
                  />
                </div>

                <hr className="my-2 border-gray-200" />

                {/* Card Templates */}
                <div>
                  <label className="block text-sm font-medium mb-3 text-gray-700">
                    Card Design
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(templates).map(([key, template]) => (
                      <motion.div
                        key={key}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        className={`relative h-16 cursor-pointer rounded-lg border-2 transition-all duration-200 ${
                          selectedTemplate === key
                            ? "border-rose-500 shadow-lg"
                            : "border-gray-200 hover:border-rose-300"
                        }`}
                        onClick={() => setSelectedTemplate(key)}
                      >
                        <div
                          className={`w-full h-full bg-gradient-to-br ${template.gradient} rounded-md flex items-center justify-center`}
                        >
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

                  {/* Live Preview */}
                  <div className="mt-6">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Live Preview
                    </p>
                    <div className="flex justify-center md:justify-end">
                      <PreviewCard
                        username={username}
                        gradient={templates[selectedTemplate]?.gradient}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Action Buttons */}
            <div className="flex flex-col gap-2 p-4 border-t sm:flex-row sm:gap-3">
              <Button
                onClick={handleSave}
                disabled={loading || !username.trim()}
                className="w-full sm:flex-1 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700"
              >
                <Save className="h-4 w-4 mr-2" />
                {loading ? "Saving..." : "Save Changes"}
              </Button>
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="w-full sm:flex-1"
              >
                Cancel
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
