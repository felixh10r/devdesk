import type { LoaderFunction } from "@remix-run/node";
import { promises as fs } from "fs";

export const loader: LoaderFunction = async ({ params }) => {
  const data = await fs.readFile(`/${params["*"]}` as string);

  return new Response(data, {
    headers: {
      "Content-Type": "application/pdf",
    },
  });
};
