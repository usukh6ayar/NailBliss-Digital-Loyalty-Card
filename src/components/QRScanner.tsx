import { useEffect, useRef, useState } from "react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { CheckCircle, Camera, X, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { decryptQRData } from "@/lib/qr";

export const QRScanner = () => {
  const scannerRef = useRef<HTMLDivElement>(null);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startScanner = async () => {
    try {
      setError(null);

      // ✅ 1. Check browser support
      if (
        typeof window === "undefined" ||
        !navigator.mediaDevices ||
        typeof navigator.mediaDevices.getUserMedia !== "function"
      ) {
        throw new Error("Camera access not supported on this device/browser.");
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
        selectedCameraId, // 🔥 instead of facingMode
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
    }
  };

  const handleQRSuccess = (decodedText: string) => {
    setResult(decodedText);
    stopScanner();

    // Try to decrypt and process the QR data
    const decryptedData = decryptQRData(decodedText);

    if (decryptedData) {
      toast({
        title: "QR Code Scanned Successfully!",
        description: `Customer ID: ${decryptedData.userId.substring(0, 8)}...`,
      });

      // TODO: Process the loyalty point addition here
      // Call your loyalty point function with decryptedData.userId
      console.log("Decrypted QR data:", decryptedData);
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
        html5QrCodeRef.current.clear();
        html5QrCodeRef.current = null;
        setScanning(false);
      } catch (err) {
        console.error("Error stopping scanner:", err);
        setScanning(false);
      }
    }
  };

  const resetScanner = () => {
    setResult(null);
    setError(null);
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
    <div className="space-y-4">
      <div className="text-center space-y-2">
        {!scanning ? (
          <div className="space-y-2">
            <Button
              onClick={startScanner}
              className="bg-gradient-to-r from-rose-400 to-pink-500 text-white hover:from-rose-500 hover:to-pink-600"
              disabled={!!error}
            >
              <Camera className="w-4 h-4 mr-2" />
              Start Scanning
            </Button>
            {result && (
              <Button onClick={resetScanner} variant="outline" size="sm">
                Scan Another
              </Button>
            )}
          </div>
        ) : (
          <Button onClick={stopScanner} variant="outline">
            <X className="w-4 h-4 mr-2" />
            Stop Scanning
          </Button>
        )}
      </div>

      {/* Scanner container */}
      <div className="relative">
        <div
          id="qr-scanner"
          ref={scannerRef}
          className={`w-full h-64 rounded-lg bg-black ${
            scanning ? "block" : "hidden"
          }`}
        />

        {/* Show placeholder when not scanning */}
        {!scanning && !result && (
          <div className="w-full h-64 rounded-lg bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <Camera className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Click "Start Scanning" to begin</p>
            </div>
          </div>
        )}
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
    </div>
  );
};
