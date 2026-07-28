import Razorpay from "razorpay";

let razorpaySingleton: Razorpay | null = null;

export function getRazorpay(): Razorpay {
  if (razorpaySingleton) return razorpaySingleton;

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    throw new Error(
      "RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET are not set. Add your Razorpay API keys to .env to enable billing.",
    );
  }

  razorpaySingleton = new Razorpay({ key_id: keyId, key_secret: keySecret });
  return razorpaySingleton;
}

export function isRazorpayConfigured(): boolean {
  return Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
}
