import { createServerFn } from "@tanstack/react-start";
import { fetchRouterStatus } from "./mikrotik-status.server";

export const getRouterStatus = createServerFn({ method: "GET" }).handler(async () => {
  return fetchRouterStatus();
});
