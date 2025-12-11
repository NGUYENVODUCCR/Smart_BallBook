import QRCode from "qrcode";

export async function generateQRCode(data) {
  try {
    if (!data) {
      throw new Error("Data is required for QR code");
    }

    const payload =
      typeof data === "string" ? data : JSON.stringify(data);

    const qr = await QRCode.toDataURL(payload, {
      errorCorrectionLevel: "H",
      type: "image/png",
      margin: 2,
      width: 300,
    });

    return qr;
  } catch (error) {
    console.error("QR generation error:", error.message);
    throw new Error("Failed to generate QR code");
  }
}
