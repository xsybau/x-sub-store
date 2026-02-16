import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  createHmac,
} from "node:crypto";

const getSecret = () => {
  const config = useRuntimeConfig();
  const secret = config.appSecret || process.env.APP_SECRET;
  if (!secret) throw new Error("APP_SECRET is not set");
  // If secret is not 32 bytes, hash it to get 32 bytes (sha256 produces 32 bytes)
  return createHmac("sha256", secret).update("key-derivation").digest();
};

export const encryptToken = (text: string) => {
  const key = getSecret();
  const iv = randomBytes(12); // 96-bit IV for GCM
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag().toString("hex");
  return `${iv.toString("hex")}:${authTag}:${encrypted}`;
};

export const decryptToken = (text: string) => {
  const key = getSecret();
  const [ivHex, authTagHex, encryptedHex] = text.split(":");
  if (!ivHex || !authTagHex || !encryptedHex)
    throw new Error("Invalid ciphertext format");

  const decipher = createDecipheriv(
    "aes-256-gcm",
    key,
    Buffer.from(ivHex, "hex"),
  );
  decipher.setAuthTag(Buffer.from(authTagHex, "hex"));
  let decrypted = decipher.update(encryptedHex, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
};

export const hashToken = (token: string) => {
  const key = getSecret();
  // HMAC-SHA256 for lookup
  return createHmac("sha256", key).update(token).digest("hex");
};
