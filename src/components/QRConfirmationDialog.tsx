import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CheckCircle, X, User, Calendar, Award } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface QRConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  customerData: {
    userId: string;
    profile?: {
      first_name?: string;
      last_name?: string;
      username?: string;
      avatar_url?: string;
    };
    loyaltyCard?: {
      points: number;
      total_visits: number;
    };
  } | null;
  onConfirm: () => void;
}

export const QRConfirmationDialog = ({
  isOpen,
  onClose,
  customerData,
  onConfirm,
}: QRConfirmationDialogProps) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleConfirm = async () => {
    if (!customerData) return;

    setIsProcessing(true);
    try {
      // Call the add_loyalty_point function
      const { error } = await supabase.rpc("add_loyalty_point", {
        p_customer_id: customerData.userId,
        p_staff_id: (await supabase.auth.getUser()).data.user?.id,
      });

      if (error) {
        throw error;
      }

      // Show success message
      toast({
        title: "Stamp Added Successfully! 🎉",
        description: `${getDisplayName()} earned a loyalty stamp!`,
      });

      onConfirm();
      onClose();
    } catch (error: any) {
      console.error("Error adding loyalty point:", error);
      toast({
        title: "Error Adding Stamp",
        description: error.message || "Failed to add loyalty point. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getDisplayName = () => {
    if (!customerData?.profile) return "Customer";
    
    const { first_name, last_name, username } = customerData.profile;
    
    if (first_name && last_name) {
      return `${first_name} ${last_name}`;
    }
    if (username) {
      return username;
    }
    if (first_name) {
      return first_name;
    }
    return "Customer";
  };

  const getInitials = () => {
    const name = getDisplayName();
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <AnimatePresence>
      {isOpen && customerData && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Dialog */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-full max-w-sm"
            >
              <Card className="bg-background/95 backdrop-blur-sm border shadow-2xl">
                <CardContent className="p-6">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-foreground">
                      Confirm Stamp
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onClose}
                      className="h-8 w-8 p-0 hover:bg-muted/50"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Customer Info */}
                  <div className="text-center mb-6">
                    <Avatar className="h-20 w-20 mx-auto mb-4 ring-2 ring-primary/20">
                      <AvatarImage 
                        src={customerData.profile?.avatar_url} 
                        alt={getDisplayName()}
                      />
                      <AvatarFallback className="bg-primary/10 text-primary text-lg font-medium">
                        {getInitials()}
                      </AvatarFallback>
                    </Avatar>

                    <h4 className="text-xl font-semibold text-foreground mb-1">
                      {getDisplayName()}
                    </h4>
                    
                    {customerData.profile?.username && (
                      <p className="text-sm text-muted-foreground mb-3">
                        @{customerData.profile.username}
                      </p>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-muted/30 rounded-lg p-3 text-center">
                      <Calendar className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Visits</p>
                      <p className="text-lg font-semibold text-foreground">
                        {customerData.loyaltyCard?.total_visits || 0}
                      </p>
                    </div>
                    <div className="bg-muted/30 rounded-lg p-3 text-center">
                      <Award className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Stamps</p>
                      <p className="text-lg font-semibold text-foreground">
                        {customerData.loyaltyCard?.points || 0}/5
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <Button
                      onClick={handleConfirm}
                      disabled={isProcessing}
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-12 text-base font-medium"
                    >
                      {isProcessing ? (
                        <>
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-5 h-5 mr-2" />
                          Confirm Stamp
                        </>
                      )}
                    </Button>

                    <Button
                      variant="outline"
                      onClick={onClose}
                      disabled={isProcessing}
                      className="w-full h-10"
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};