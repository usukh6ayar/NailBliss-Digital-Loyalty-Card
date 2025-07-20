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
            .single()
        ]);

        if (profileResult.error && profileResult.error.code !== 'PGRST116') {
          throw profileResult.error;
        }

        if (loyaltyResult.error && loyaltyResult.error.code !== 'PGRST116') {
          throw loyaltyResult.error;
        }

        // Set customer data and show confirmation
        setCustomerData({
          userId: decryptedData.userId,
          profile: profileResult.data,
          loyaltyCard: loyaltyResult.data
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
    <div className="space-y-6">
      {/* Main Scanner Interface */}
      <div className="relative">
        {/* Camera Preview Container */}
        <div className="relative w-full max-w-md mx-auto">
          <div className="relative overflow-hidden rounded-3xl bg-background/10 backdrop-blur-sm border border-border/20 shadow-2xl">
            {/* Scanner Viewport */}
            <div className="relative aspect-square">
              {/* Camera Feed or Placeholder */}
              <AnimatePresence mode="wait">
                {showScannerDiv ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                    className="relative w-full h-full"
                  >
                    <div
                      id="qr-scanner"
                      ref={scannerRef}
                      className="w-full h-full rounded-3xl overflow-hidden"
                    />
                    
                    {/* Scanning Overlay */}
                    <div className="absolute inset-0 pointer-events-none">
                      {/* Semi-transparent overlay */}
                      <div className="absolute inset-0 bg-black/30" />
                      
                      {/* Center cutout square */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="relative">
                          {/* Scanning frame */}
                          <div className="w-48 h-48 border-2 border-primary rounded-2xl bg-transparent relative">
                            {/* Corner indicators */}
                            <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-primary rounded-tl-lg" />
                            <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-primary rounded-tr-lg" />
                            <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-primary rounded-bl-lg" />
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-primary rounded-br-lg" />
                            
                            {/* Animated scanning line */}
                            <motion.div
                              className="absolute inset-x-2 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent rounded-full"
                              animate={{
                                y: [0, 184, 0]
                              }}
                              transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeInOut"
                              }}
                            />
                          </div>
                          
                          {/* Instructions */}
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 text-center"
                          >
                            <p className="text-sm font-medium text-foreground bg-background/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border border-border/20">
                              Position QR code within frame
                            </p>
                          </motion.div>
                        </div>
                      </div>
                    </div>

                    {/* Loading indicator during initialization */}
                    {isInitializing && (
                      <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center">
                        <div className="text-center space-y-3">
                          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
                          <p className="text-sm font-medium text-foreground">Starting camera...</p>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                    className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted/50 to-muted/30 backdrop-blur-sm"
                  >
                    <div className="text-center space-y-4 p-8">
                      <div className="relative">
                        <Camera className="w-16 h-16 mx-auto text-muted-foreground/50" />
                        <motion.div
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="absolute inset-0 rounded-full border-2 border-primary/20"
                        />
                      </div>
                      <div className="space-y-2">
                        <h3 className="font-semibold text-foreground">Ready to Scan</h3>
                        <p className="text-sm text-muted-foreground">Tap the button below to start scanning</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex justify-center mt-6 space-x-3">
          <AnimatePresence mode="wait">
            {!scanning && !isInitializing ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                key="start"
                className="space-y-3"
              >
                <Button
                  onClick={startScanner}
                  disabled={!!error}
                  size="lg"
                  className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-medium px-8 py-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                >
                  <Camera className="w-5 h-5 mr-2" />
                  Start Scanning
                </Button>
                {result && (
                  <Button onClick={resetScanner} variant="outline" size="sm" className="w-full rounded-xl">
                    Scan Another Code
                  </Button>
                )}
              </motion.div>
            ) : scanning ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                key="stop"
              >
                <Button
                  onClick={stopScanner}
                  variant="outline"
                  size="lg"
                  className="border-2 border-destructive/20 text-destructive hover:bg-destructive/10 px-8 py-6 rounded-2xl font-medium"
                >
                  <X className="w-5 h-5 mr-2" />
                  Stop Scanning
                </Button>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                key="loading"
              >
                <Button disabled size="lg" className="px-8 py-6 rounded-2xl">
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Initializing...
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Error display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-300 rounded-lg p-4 text-red-700 flex items-center gap-2"
        >
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium">Camera Error</p>
            <p className="text-xs">{error}</p>
          </div>
        </motion.div>
      )}

      {/* Success result */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 border border-green-300 rounded-lg p-4 text-green-700"
        >
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5" />
            <p className="text-sm font-medium">QR Code Scanned Successfully!</p>
          </div>
          <p className="text-xs text-gray-600 font-mono break-all bg-white p-2 rounded border">
            {result}
          </p>
        </motion.div>
      )}

      {/* Instructions */}
      <div className="text-center text-sm text-gray-500">
        <p>Point your camera at a customer's QR code to add loyalty points</p>
      </div>

      {/* Confirmation Dialog */}
      <QRConfirmationDialog
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        customerData={customerData}
        onConfirm={handleConfirmationSuccess}
      />
    </div>
  );
};
