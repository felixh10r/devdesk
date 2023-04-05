import { userAuth } from "~/cookies";

export function checkPassword(password: string) {
  if (!process.env.USER_AUTH) {
    return true;
  }

  return password === process.env.USER_AUTH;
}

export async function checkAuth(request: Request) {
  if (!checkPassword(await userAuth.parse(request.headers.get("Cookie")))) {
    throw new Response("Unauthorized", {
      status: 401,
    });
  }
}
