import type { LoaderFunction } from "@remix-run/node";
import fs from "node:fs";
import { checkAuth } from "~/lib/helpers/auth";

export const loader: LoaderFunction = async ({ params, request }) => {
  await checkAuth(request);

  const data = await fs.promises.readFile(`/${params["*"]}` as string);

  return new Response(data, {
    headers: {
      "Content-Type": "application/pdf",
    },
  });
};
