import { Hono } from "hono";

import { handleChatStream } from "../services/chat";

const chatRouter = new Hono();
chatRouter.post("/", handleChatStream);

export default chatRouter;
