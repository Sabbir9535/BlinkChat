import CryptoJS from "crypto-js";

const SECRET_KEY = "blinkchat-123456"; // Client er sathe same

export function encryptAES(text) {
  return CryptoJS.AES.encrypt(text, SECRET_KEY).toString();
}

export function decryptAES(ciphertext) {
  const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
}