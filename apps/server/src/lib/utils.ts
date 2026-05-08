import { env } from "../env";

export function getBaseUrl() {
  console.log("server=", `http://${env.SERVER_HOST}:${env.SERVER_PORT}`);
  return `http://${env.SERVER_HOST}:${env.SERVER_PORT}`;
}
