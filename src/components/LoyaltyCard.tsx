import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { FlipCard } from "./loyalty/FlipCard";
import { QRCodeSection } from "./loyalty/QRCodeSection"; // <-- import QR code section

export const LoyaltyCard = () => {
  const { user, profile } = useAuth();

  if (!user || !profile || profile.role !== "customer") {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-sm mx-auto space-y-6"
    >
      {/* Loyalty Card */}
      <FlipCard />

      {/* QR Code Section */}
      <QRCodeSection />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center"
      >
        <p className="text-gray-600 text-sm">NailBliss Digital Loyalty Card</p>
      </motion.div>
    </motion.div>
  );
};
