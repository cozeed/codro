import { disk } from "./flydrive";

/**
 * Storage module: wraps disk driver operations
 */
export const storage = {
  /**
   * Upload file
   * @param filePath File path
   * @param file File content as Buffer or Uint8Array
   */
  async upload(filePath: string, file: Buffer | string | Uint8Array) {
    // Determine file type and upload
    await disk.put(filePath, file);
  },
  /**
   * Read file
   * @param filePath File path
   * @returns File content as Buffer
   */
  async read(filePath: string) {
    return await disk.getBytes(filePath);
  },

  /**
   * Check if file exists
   * @param filePath File path
   * @returns Boolean indicating whether file exists
   */
  async exists(filePath: string) {
    return await disk.exists(filePath);
  },

  /**
   * Get file URL
   * @param filePath File path
   * @returns File URL
   */
  async getUrl(filePath: string) {
    return await disk.getUrl(filePath);
  },

  /**
   * Get signed URL (temporary)
   * @param filePath File path
   * @param expireIn Expiration time in seconds, default 3600
   * @returns Signed URL
   */
  async getSignedUrl(filePath: string, expireIn = 3600) {
    return await disk.getSignedUrl(filePath, { expiresInSeconds: expireIn });
  },

  /**
   * Delete file
   * @param filePath File path
   */
  async delete(filePath: string) {
    await disk.delete(filePath);
  },

  /**
   * Get driver instance
   * @returns Driver instance
   */
  getDriver() {
    return disk.driver;
  },
};
