import querystring from "qs";
import crypto from "crypto";
import moment from "moment";

export const createVNPayUrl = (req, amount, bookingId) => {
  const ipAddr =
    req.headers["x-forwarded-for"] ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    "127.0.0.1";

  const tmnCode = process.env.VNP_TMN_CODE;
  const secretKey = process.env.VNP_HASH_SECRET;
  const vnpUrl = process.env.VNP_URL;
  const returnUrl = process.env.VNP_RETURN_URL;

  if (!tmnCode || !secretKey || !vnpUrl || !returnUrl) {
    throw new Error("Missing VNPay environment variables");
  }

  const createDate = moment().format("YYYYMMDDHHmmss");
  const orderInfo = `BOOKING#${bookingId}`; // ✅ format chuẩn để BE xử lý
  const orderType = "billpayment";
  const locale = "vn";
  const currCode = "VND";
  const vnpTxnRef = `${bookingId}_${moment().format("HHmmss")}`;

  let vnp_Params = {
    vnp_Version: "2.1.0",
    vnp_Command: "pay",
    vnp_TmnCode: tmnCode,
    vnp_Locale: locale,
    vnp_CurrCode: currCode,
    vnp_TxnRef: vnpTxnRef,
    vnp_OrderInfo: orderInfo,
    vnp_OrderType: orderType,
    vnp_Amount: Math.floor(amount * 100),
    vnp_ReturnUrl: returnUrl,
    vnp_IpAddr: ipAddr,
    vnp_CreateDate: createDate,
  };

  // ✅ Sort params
  vnp_Params = sortObject(vnp_Params);

  // ✅ Create hash
  const signData = querystring.stringify(vnp_Params, { encode: false });
  const hmac = crypto.createHmac("sha512", secretKey);
  const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

  // ✅ Append secure hash
  vnp_Params.vnp_SecureHash = signed;

  // ✅ Build payment URL
  const paymentUrl = `${vnpUrl}?${querystring.stringify(vnp_Params, {
    encode: false,
  })}`;

  return paymentUrl;
};

// ✅ Verify VNPay response
export const verifyVNPayResponse = (vnp_Params) => {
  const secureHash = vnp_Params.vnp_SecureHash;
  if (!secureHash) return false;

  delete vnp_Params.vnp_SecureHash;
  delete vnp_Params.vnp_SecureHashType;

  const secretKey = process.env.VNP_HASH_SECRET;
  if (!secretKey) return false;

  vnp_Params = sortObject(vnp_Params);

  const signData = querystring.stringify(vnp_Params, { encode: false });
  const hmac = crypto.createHmac("sha512", secretKey);
  const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

  return secureHash === signed;
};

// ✅ Helper
function sortObject(obj) {
  const sorted = {};
  Object.keys(obj)
    .sort()
    .forEach((key) => {
      sorted[key] = obj[key];
    });
  return sorted;
}
