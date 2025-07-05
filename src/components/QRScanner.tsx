import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { AlertCircle, CheckCircle, Camera, X } from "lucide-react";
import { motion } from "framer-motion";

export const QRScanner = () => {
  const scannerRef = useRef<HTMLDivElement>(null);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const startScanner = async () => {
    try {
      const cameraPermission = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      cameraPermission.getTracks().forEach((track) => track.stop());

      const config = { fps: 10, qrbox: { width: 250, height: 250 } };

      if (!scannerRef.current) return;

      html5QrCodeRef.current = new Html5Qrcode(scannerRef.current.id);

      await html5QrCodeRef.current.start(
        { facingMode: "environment" },
        config,
        (decodedText) => {
          setResult(decodedText);
          stopScanner();
          toast({
            title: "Success",
            description: "QR code scanned: " + decodedText,
          });
          // TODO: decryptQRData(decodedText) → process logic
        },
        (error) => {
          console.warn("QR scan error", error);
        }
      );

      setScanning(true);
    } catch (err) {
      toast({
        title: "Camera Error",
        description: "Permission denied or no camera found.",
        variant: "destructive",
      });
    }
  };

  const stopScanner = () => {
    if (html5QrCodeRef.current) {
      html5QrCodeRef.current.stop().then(() => {
        html5QrCodeRef.current?.clear();
        html5QrCodeRef.current = null;
        setScanning(false);
      });
    }
  };

  useEffect(() => {
    return () => {
      stopScanner(); // clean up when unmount
    };
  }, []);

  return (
    <div className="space-y-4">
      <div className="text-center space-y-2">
        {!scanning ? (
          <Button
            onClick={startScanner}
            className="bg-gradient-to-r from-rose-400 to-pink-500 text-white"
          >
            <Camera className="w-4 h-4 mr-2" />
            Start Scanning
          </Button>
        ) : (
          <Button onClick={stopScanner} variant="outline">
            <X className="w-4 h-4 mr-2" />
            Stop
          </Button>
        )}
      </div>

      <div
        id="qr-scanner"
        ref={scannerRef}
        className="w-full h-64 rounded-lg bg-black"
      ></div>

      {result && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 border border-green-300 rounded-lg p-4 text-green-700 flex items-center gap-2"
        >
          <CheckCircle className="w-5 h-5" />
          <p className="text-sm">Scanned: {result}</p>
        </motion.div>
      )}
    </div>
  );
};
