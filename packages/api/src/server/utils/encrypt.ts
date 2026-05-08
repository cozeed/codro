import { Buffer } from "buffer";
import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;

const SECRET_KEY = process.env.APP_ENCRYPTION_KEY!;
if (!SECRET_KEY)
  throw new Error(`'APP_ENCRYPTION_KEY' is not set. 
	Please set it in your environment variables,
	You can generate one with 'openssl rand -hex 32'.`);

const KEY = Buffer.from(SECRET_KEY, "hex");
if (KEY.length !== 32) throw new Error("APP_ENCRYPTION_KEY must be 32 bytes (256 bits)");

/** Encrypt string */
export function encrypt(data: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
  const encrypted = Buffer.concat([cipher.update(data, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted.toString("hex")}`;
}

/** Decrypt string */
export function decrypt(encrypted: string): string {
  const [ivHex, authTagHex, encryptedHex] = encrypted.split(":");
  if (!ivHex || !authTagHex || !encryptedHex) throw new Error("Invalid encrypted format");
  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");
  const encryptedData = Buffer.from(encryptedHex, "hex");

  const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
  decipher.setAuthTag(authTag);
  const decrypted = Buffer.concat([decipher.update(encryptedData), decipher.final()]);
  return decrypted.toString("utf8");
}
