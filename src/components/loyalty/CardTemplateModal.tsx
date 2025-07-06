import { useState } from "react";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CardTemplateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const templates = {
  pink: {
    name: "Rose Blush",
    gradient: "bg-gradient-to-br from-rose-400 via-pink-500 to-fuchsia-600",
  },
  gold: {
    name: "Golden Hour",
    gradient: "bg-gradient-to-br from-yellow-300 via-amber-400 to-orange-500",
  },
  ocean: {
    name: "Ocean Breeze",
    gradient: "bg-gradient-to-br from-cyan-400 via-sky-500 to-indigo-600",
  },
  lavender: {
    name: "Lavender Dream",
    gradient: "bg-gradient-to-br from-violet-400 via-purple-500 to-indigo-500",
  },
  nude: {
    name: "Minimal Nude",
    gradient: "bg-gradient-to-br from-neutral-200 via-zinc-300 to-neutral-400",
  },
};

export const CardTemplateModal = ({
  open,
  onOpenChange,
}: CardTemplateModalProps) => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
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
          title: "Success! ✨",
          description: "Card design updated!",
        });
        onOpenChange(false);
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="text-center">Choose Card Design</DialogTitle>
        </DialogHeader>

        <div className="p-4">
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(templates).map(([key, template]) => (
              <motion.div
                key={key}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card
                  className={`relative h-24 cursor-pointer border-2 transition-all duration-200 ${
                    selectedTemplate === key
                      ? "border-rose-500 shadow-lg scale-105"
                      : "border-gray-200 hover:border-rose-300 hover:shadow-md"
                  } ${template.gradient}`}
                  onClick={() => handleTemplateSelect(key)}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    {selectedTemplate === key && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="bg-white/90 rounded-full p-2"
                      >
                        <Check className="h-5 w-5 text-rose-600" />
                      </motion.div>
                    )}
                  </div>
                  <div className="absolute bottom-2 left-2 right-2">
                    <p className="text-white text-xs font-medium text-center bg-black/20 rounded px-2 py-1">
                      {template.name}
                    </p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="mt-6 text-center">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="w-full"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
