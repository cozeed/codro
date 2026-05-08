import { Hono } from "hono";

import { deleteFile, getFileUrl, uploadFile } from "../services/storage";

const storageRouter = new Hono();
storageRouter.post("/upload", uploadFile);
storageRouter.delete("/delete", deleteFile);
storageRouter.post("/file-url", getFileUrl);

export default storageRouter;
