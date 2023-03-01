import type { LoaderFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { checkAuth } from "~/lib/helpers/auth";

export const loader: LoaderFunction = async ({ request }) => {
  await checkAuth(request);

  return redirect("/invoices");
};
