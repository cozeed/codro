import { env } from "@/env";
import { toast } from "sonner";

export const uploadFile = async (file: File, type: string) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("type", type);

  const response = await fetch(`${env.PUBLIC_SERVER_URL}${env.PUBLIC_SERVER_API_PATH}/storage/upload`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  let result;

  try {
    result = await response.json();
  } catch {
    throw new Error(`HTTP ${response.status}`);
  }

  if (!response.ok) {
    throw new Error(result?.message || `HTTP ${response.status}`);
  }

  return result;
};

export const deleteFile = async (filePath: string, token: string) => {
  const url = `${env.PUBLIC_SERVER_URL}${env.PUBLIC_SERVER_API_PATH}/storage/delete`;

  try {
    const response = await fetch(url, {
      method: "DELETE",
      credentials: "include",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ filePath }),
    });

    if (!response.ok) {
      return { code: response.status, message: response.statusText };
    }

    const result = await response.json();
    return result;
  } catch (error) {
    toast.error(`Error during file deletion: ${error}`);
    return { code: 500, message: "Internal Server Error" };
  }
};

export const getFileUrl = async (filePath: string) => {
  const response = await fetch(`${env.PUBLIC_SERVER_URL}${env.PUBLIC_SERVER_API_PATH}/storage/file-url`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ filePath }),
  });

  const result = await response.json().catch(() => {
    throw new Error(`HTTP ${response.status}`);
  });

  if (!response.ok) {
    throw new Error(result?.message || `HTTP ${response.status}`);
  }

  return result;
};
