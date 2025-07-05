
// Simple encryption for QR codes (for demo purposes)
const ENCRYPTION_KEY = 'nailbliss-2024';

export const encryptQRData = (userId: string, timestamp: number): string => {
  const data = JSON.stringify({ userId, timestamp });
  // Simple base64 encoding for demo - in production use proper encryption
  return btoa(data + ENCRYPTION_KEY);
};

export const decryptQRData = (encryptedData: string): { userId: string; timestamp: number } | null => {
  try {
    const decoded = atob(encryptedData);
    const dataWithoutKey = decoded.replace(ENCRYPTION_KEY, '');
    const parsed = JSON.parse(dataWithoutKey);
    
    // Check if QR code is still valid (within 60 seconds)
    const now = Date.now();
    if (now - parsed.timestamp > 60000) {
      throw new Error('QR code expired');
    }
    
    return parsed;
  } catch (error) {
    console.error('Failed to decrypt QR data:', error);
    return null;
  }
};

export const generateQRCode = async (data: string): Promise<string> => {
  // Using a simple QR code generation approach
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(data)}`;
  return qrApiUrl;
};
