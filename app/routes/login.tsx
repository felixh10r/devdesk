import type { LoaderFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { checkPassword } from "~/lib/helpers/auth";
import { userAuth } from "~/cookies";

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const password = url.searchParams.get("password");

  if (!checkPassword(password ?? "")) {
    throw new Response("Unauthorized", {
      status: 401,
    });
  }

  return redirect("/", {
    headers: {
      "Set-Cookie": await userAuth.serialize(password),
    },
  });
};
