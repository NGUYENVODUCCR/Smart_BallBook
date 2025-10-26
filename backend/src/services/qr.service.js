import QRCode from "qrcode";

export async function generateQRCode(data) {
  try {
    const qr = await QRCode.toDataURL(JSON.stringify(data));
    return qr;
  } catch (error) {
    console.error("QR generation error:", error);
    throw new Error("Failed to generate QR");
  }
}
