import { PassThrough } from "stream";
import type { EntryContext } from "@remix-run/node";
import { Response } from "@remix-run/node";
import { RemixServer } from "@remix-run/react";
import { renderToPipeableStream } from "react-dom/server";
const ABORT_DELAY = 5000;

declare global {
  namespace NodeJS {
    export interface ProcessEnv {
      DEFAULT_INVOICE_PATH: string;
      INVOICE_INCOMING_BANK_FOLDER: string;
      INVOICE_INCOMING_CASH_FOLDER: string;
      INVOICE_OUTGOING_FOLDER: string;
      INVOICE_PATH_BASE: string;
      MAIL_SENDER_NAME: string;
      MAIL_TO: string;
      PORT: string;
    }
  }
}

export default function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext,
) {
  return new Promise((resolve, reject) => {
    let didError = false;

    const { pipe, abort } = renderToPipeableStream(
      <RemixServer context={remixContext} url={request.url} />,
      {
        onShellReady: () => {
          const body = new PassThrough();

          responseHeaders.set("Content-Type", "text/html");

          resolve(
            new Response(body, {
              headers: responseHeaders,
              status: didError ? 500 : responseStatusCode,
            }),
          );

          pipe(body);
        },
        onShellError: (err) => {
          reject(err);
        },
        onError: (error) => {
          didError = true;

          console.error(error);
        },
      },
    );

    setTimeout(abort, ABORT_DELAY);
  });
}
