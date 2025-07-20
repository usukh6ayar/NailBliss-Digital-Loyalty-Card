import { useEffect, useRef, useState } from "react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { CheckCircle, Camera, X, AlertCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { decryptQRData } from "@/lib/qr";
import { supabase } from "@/integrations/supabase/client";
import { QRConfirmationDialog } from "./QRConfirmationDialog";

export const QRScanner = () => {
  const scannerRef = useRef<HTMLDivElement>(null);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const [scanning, setScanning] = useState(false);
  const [showScannerDiv, setShowScannerDiv] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [customerData, setCustomerData] = useState<any>(null);
  const [isInitializing, setIsInitializing] = useState(false);

  const startScanner = async () => {
    setError(null);
    setIsInitializing(true);
    setShowScannerDiv(true);

    // Wait for the div to render
    setTimeout(async () => {
      try {
        // ✅ 1. Check browser support
        if (
          typeof window === "undefined" ||
          !navigator.mediaDevices ||
          typeof navigator.mediaDevices.getUserMedia !== "function"
        ) {
          throw new Error(
            "Camera access not supported on this device/browser."
          );
        }

        // ✅ 2. Get list of cameras
        const cameras = await Html5Qrcode.getCameras();
        if (!cameras || cameras.length === 0) {
          throw new Error("No cameras found on this device.");
        }

        // ✅ 3. Prefer back camera if available
        const rearCamera = cameras.find((cam) =>
          cam.label.toLowerCase().includes("back")
        );
        const selectedCameraId = rearCamera?.id || cameras[0].id;

        if (!scannerRef.current) {
          throw new Error("Scanner element not found");
        }

        html5QrCodeRef.current = new Html5Qrcode("qr-scanner");

        const config = {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
          disableFlip: false,
          supportedScanTypes: [Html5QrcodeSupportedFormats.QR_CODE],
          experimentalFeatures: {
            useBarCodeDetectorIfSupported: true,
          },
        };

        await html5QrCodeRef.current.start(
          selectedCameraId,
          config,
          (decodedText) => {
            handleQRSuccess(decodedText);
          },
          (errorMessage) => {
            if (errorMessage && !errorMessage.includes("No QR code found")) {
              console.warn("QR scan error:", errorMessage);
            }
          }
        );

        setScanning(true);
        setIsInitializing(false);
      } catch (err: any) {
        console.error("Scanner initialization error:", err);

        let errorMsg = "Failed to start camera";
        if (err.name === "NotAllowedError") {
          errorMsg =
            "Camera permission denied. Please allow camera access and try again.";
        } else if (err.name === "NotFoundError") {
          errorMsg = "No camera found on this device.";
        } else if (err.name === "NotSupportedError") {
          errorMsg = "Camera not supported on this device.";
        } else if (err.message) {
          errorMsg = err.message;
        }

        setError(errorMsg);
        toast({
          title: "Camera Error",
          description: errorMsg,
          variant: "destructive",
        });
        setShowScannerDiv(false);
        setIsInitializing(false);
      }
    }, 100);
  };

  const handleQRSuccess = async (decodedText: string) => {
    setResult(decodedText);
    stopScanner();

    // Try to decrypt and process the QR data
    const decryptedData = decryptQRData(decodedText);

    if (decryptedData) {
      try {
        // Fetch customer profile and loyalty card data
        const [profileResult, loyaltyResult] = await Promise.all([
          supabase
            .from("profiles")
            .select("first_name, last_name, username, avatar_url")
            .eq("id", decryptedData.userId)
            .single(),
          supabase
            .from("loyalty_cards")
            .select("points, total_visits")
            .eq("customer_id", decryptedData.userId)
            .single(),
        ]);

        if (profileResult.error && profileResult.error.code !== "PGRST116") {
          throw profileResult.error;
        }

        if (loyaltyResult.error && loyaltyResult.error.code !== "PGRST116") {
          throw loyaltyResult.error;
        }

        // Set customer data and show confirmation
        setCustomerData({
          userId: decryptedData.userId,
          profile: profileResult.data,
          loyaltyCard: loyaltyResult.data,
        });
        setShowConfirmation(true);
      } catch (error: any) {
        console.error("Error fetching customer data:", error);
        toast({
          title: "Error Loading Customer Data",
          description: "Unable to load customer information. Please try again.",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Invalid QR Code",
        description: "This QR code is not valid or has expired.",
        variant: "destructive",
      });
    }
  };

  const stopScanner = async () => {
    if (html5QrCodeRef.current && scanning) {
      try {
        await html5QrCodeRef.current.stop();
        await html5QrCodeRef.current.clear();
        html5QrCodeRef.current = null;
        setScanning(false);
        setShowScannerDiv(false); // Hide scanner div
      } catch (err) {
        console.error("Error stopping scanner:", err);
        setScanning(false);
        setShowScannerDiv(false);
      }
    }
  };

  const resetScanner = () => {
    setResult(null);
    setError(null);
    setScanning(false);
    setShowScannerDiv(false);
    setShowConfirmation(false);
    setCustomerData(null);
    setIsInitializing(false);
  };

  const handleConfirmationSuccess = () => {
    // Reset the scanner after successful confirmation
    resetScanner();
  };

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (html5QrCodeRef.current && scanning) {
        stopScanner();
      }
    };
  }, [scanning]);
  return (
    <div className="w-full max-w-xs mx-auto flex flex-col items-center gap-4 py-8">
      <div className="w-full">
        {/* Scanner View */}
        <AnimatePresence mode="wait">
          {showScannerDiv ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              className="relative w-full aspect-square flex items-center justify-center"
            >
              <div
                id="qr-scanner"
                ref={scannerRef}
                className="w-full h-full rounded-xl bg-neutral-100"
              />
              {/* Minimal scan area frame */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-32 h-32 border-2 border-neutral-300 rounded-lg" />
              </div>
              {isInitializing && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/60">
                  <Loader2 className="animate-spin text-neutral-400 w-6 h-6" />
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="flex flex-col items-center justify-center w-full aspect-square bg-neutral-50 border border-neutral-100 rounded-lg"
            >
              <Camera className="w-8 h-8 text-neutral-300 mb-2" />
              <p className="text-xs text-neutral-400">Tap to scan</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Just one action button */}
      <AnimatePresence mode="wait">
        {!scanning && !isInitializing ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className="w-full"
          >
            <Button
              onClick={startScanner}
              disabled={!!error}
              variant="outline"
              className="w-full flex items-center justify-center gap-2 rounded-lg"
            >
              <Camera className="w-5 h-5" />
              <span>Scan</span>
            </Button>
          </motion.div>
        ) : scanning ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className="w-full"
          >
            <Button
              onClick={stopScanner}
              variant="ghost"
              className="w-full flex items-center justify-center gap-2 text-red-500 rounded-lg"
            >
              <X className="w-5 h-5" />
              <span>Stop</span>
            </Button>
          </motion.div>
        ) : (
          <motion.div>
            <Button disabled className="w-full">
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Initializing...
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* error & result (super minimal, under scan box) */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 2 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 2 }}
            className="text-xs text-red-500 bg-red-50 px-2 py-1 rounded"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 2 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 2 }}
            className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded break-all max-w-full"
          >
            Success!
          </motion.div>
        )}
      </AnimatePresence>

      <p className="text-xs text-neutral-400">Point camera at customer QR</p>

      <QRConfirmationDialog
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        customerData={customerData}
        onConfirm={resetScanner}
      />
    </div>
  );
};
