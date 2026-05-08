import { extname } from "path";
import type { Context } from "hono";
import { nanoid } from "nanoid";

import { storage } from "../lib/storage-driver";

export const uploadFile = async (c: Context) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get("file");
    const type = formData.get("type");

    // check file is valid, ensure it is a File type
    if (!file || !(file instanceof Blob)) {
      return c.json({ code: 400, message: "missing valid file to upload", data: null }, 400);
    }

    const ext = extname(file.name);
    const fileName = `${nanoid()}${ext}`;
    const filePath = `${type}/${fileName}`;
    // convert file to Buffer
    const buffer = await file.arrayBuffer(); // convert Blob to ArrayBuffer
    const fileBuffer = Buffer.from(buffer); // convert ArrayBuffer to Buffer
    // upload file
    await storage.upload(filePath, fileBuffer);
    const fileUrl = await storage.getUrl(filePath);

    //
    return c.json({ code: 200, message: "File uploaded successfully", data: { fileName, filePath, fileUrl } }, 200);
  } catch (error) {
    return c.json(
      { code: 500, message: error instanceof Error ? error.message : "unknown error uploading file", data: null },
      500,
    );
  }
};

export const deleteFile = async (c: Context) => {
  try {
    const { filePath } = await c.req.json();

    if (!filePath || typeof filePath !== "string") {
      return c.json({ code: 400, message: "missing valid file path", data: null }, 400);
    }

    await storage.delete(filePath);
    return c.json({ code: 200, message: "File deleted successfully", data: { filePath } }, 200);
  } catch (error) {
    return c.json(
      { code: 500, message: error instanceof Error ? error.message : "unknown error deleting file", data: null },
      500,
    );
  }
};

export const getFileUrl = async (c: Context) => {
  try {
    const { filePath } = await c.req.json();

    if (!filePath || typeof filePath !== "string") {
      return c.json({ code: 400, message: "missing valid file path", data: null }, 400);
    }
    const isUrl = /^https?:\/\//.test(filePath);
    const fileUrl = isUrl ? filePath : await storage.getUrl(filePath);
    return c.json({ code: 200, message: "File URL retrieved successfully", data: { fileUrl } }, 200);
  } catch (error) {
    return c.json(
      { code: 500, message: error instanceof Error ? error.message : "unknown error retrieving file URL", data: null },
      500,
    );
  }
};
