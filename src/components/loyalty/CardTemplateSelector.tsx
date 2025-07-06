
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Palette, Check } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const templates = {
  pink: {
    name: "Rose Blush",
    gradient: "bg-gradient-to-br from-rose-400 via-pink-500 to-purple-600",
  },
  gold: {
    name: "Golden Hour",
    gradient: "bg-gradient-to-br from-amber-400 via-yellow-500 to-orange-600",
  },
  floral: {
    name: "Ocean Breeze",
    gradient: "bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600",
  },
  minimalist: {
    name: "Midnight",
    gradient: "bg-gradient-to-br from-gray-600 via-slate-700 to-gray-800",
  },
};

export const CardTemplateSelector = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [showSelector, setShowSelector] = useState(false);
  const [loading, setLoading] = useState(false);

  const selectedTemplate = profile?.card_template || "pink";

  const handleTemplateSelect = async (templateKey: string) => {
    if (!user || loading) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ card_template: templateKey })
        .eq("id", user.id);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to update card template",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Card template updated!",
        });
        setShowSelector(false);
        // Reload page to apply new template
        window.location.reload();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update card template",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!showSelector) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowSelector(true)}
        className="text-white hover:bg-white/20"
      >
        <Palette className="h-4 w-4 mr-1" />
        Choose Card Design
      </Button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      <div className="flex justify-between items-center">
        <p className="text-white/90 text-sm font-medium">Choose Your Card Style</p>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowSelector(false)}
          className="text-white hover:bg-white/20 h-6 w-6 p-0"
        >
          ×
        </Button>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        {Object.entries(templates).map(([key, template]) => (
          <motion.div
            key={key}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Card
              className={`relative h-16 cursor-pointer border-2 ${
                selectedTemplate === key 
                  ? "border-white shadow-lg" 
                  : "border-white/30 hover:border-white/60"
              } ${template.gradient}`}
              onClick={() => handleTemplateSelect(key)}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                {selectedTemplate === key && (
                  <Check className="h-5 w-5 text-white" />
                )}
              </div>
              <div className="absolute bottom-1 left-1 right-1">
                <p className="text-white text-xs font-medium text-center">
                  {template.name}
                </p>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};
