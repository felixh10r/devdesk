import type { MetaFunction } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";

export function links() {
  return [
    {
      rel: "stylesheet",
      href: "/styles/reset.css",
    },
    {
      rel: "stylesheet",
      href: "/styles/styles.css",
    },
  ];
}

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "devDesk",
  viewport: "width=device-width,initial-scale=1",
});

export default function App() {
  return (
    <html lang="de">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
