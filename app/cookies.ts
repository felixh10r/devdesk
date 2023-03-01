import { createCookie } from "@remix-run/node";

export const userAuth = createCookie("user-auth", {
  maxAge: 604_800 * 52,
});
