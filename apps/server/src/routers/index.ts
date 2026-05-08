import { Hono } from "hono";

import chatRouter from "./chat";
import storageRouter from "./storage";

const restRouter = new Hono();
restRouter.get("/", (c) => {
  return c.text("Hello Hono!");
});

restRouter.get("/healthcheck", (c) => {
  return c.text("OK");
});

restRouter.route("/api/storage", storageRouter);
restRouter.route("/api/chat", chatRouter);

export default restRouter;
