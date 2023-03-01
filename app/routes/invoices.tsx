import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData, useSearchParams } from "@remix-run/react";
import FilterBar from "~/components/FilterBar";
import InvoiceRow from "~/components/InvoiceRow";
import type { Invoice } from "~/lib/services/InvoiceService";
import invoiceService from "../lib/services/InvoiceService";
import {checkAuth} from "~/lib/helpers/auth";

interface LoaderData {
  unassignedInvoices: Invoice[];
  invoicesForMonth: Invoice[];
  outstandingAmount: number;
  mailSenderName: string;
  mailTo: string;
}

const IFRAME_NAME = "iframe-preview";

// below this date, the default month will be last month
const BOOKKEEPING_THRESHOLD_DATE = 7;

export const loader: LoaderFunction = async ({ request }) => {
  await checkAuth(request);

  const url = new URL(request.url);
  const month = url.searchParams.get("month");
  const action = url.searchParams.get("action");

  if (!month) {
    const currentMonth = new Date();

    if (currentMonth.getDate() < BOOKKEEPING_THRESHOLD_DATE) {
      // this seems to work for year rollover
      currentMonth.setMonth(currentMonth.getMonth() - 1);
    }

    const monthStr = currentMonth
      .toISOString()
      .split("-")
      .slice(0, 2)
      .join("-");

    return redirect(`${url.pathname}?month=${monthStr}`);
  }

  if (action === "open") {
    invoiceService.openFolderForMonth(month);
  }

  const unassignedInvoices = invoiceService.getUnassignedInvoices();

  const outstandingAmount =
    invoiceService.getOutstandingAmount(unassignedInvoices);

  const data: LoaderData = {
    invoicesForMonth: invoiceService.getInvoicesForMonth(month),
    unassignedInvoices,
    outstandingAmount,
    mailSenderName: process.env.MAIL_SENDER_NAME,
    mailTo: process.env.MAIL_TO,
  };

  return json(data);
};

export const action: ActionFunction = async ({ request }) => {
  await checkAuth(request);

  const body = await request.formData();

  invoiceService.saveInvoice(body);

  return null;
};

export default function Invoices() {
  const {
    unassignedInvoices,
    invoicesForMonth,
    outstandingAmount,
    mailSenderName,
    mailTo,
  } = useLoaderData<LoaderData>();

  const [searchParams] = useSearchParams();
  const monthName = new Intl.DateTimeFormat("de-DE", { month: "long" }).format(
    new Date(searchParams.get("month")!),
  );

  return (
    <div className="two-panes">
      <div>
        <div className="container">
          <h1>devDesk</h1>
          <FilterBar {...{ invoicesForMonth, mailSenderName, mailTo }} />
          {!!outstandingAmount && (
            <p>
              Offene Forderungen:{" "}
              <span className="positive">
                {new Intl.NumberFormat("de-DE", {
                  style: "currency",
                  currency: "EUR",
                }).format(outstandingAmount)}
              </span>
            </p>
          )}
        </div>

        <div className="container">
          <section>
            <h2>Offene Rechnungen</h2>
            <div className="invoice-grid">
              <div className="invoice-grid__header">
                <span></span>
                <span>Zahlung</span>
                <span>Rechnung</span>
                <span className="header--align-end">Brutto</span>
                <span className="header--align-end">%</span>
              </div>
              <div className="invoice-grid__body">
                {unassignedInvoices.map((inv, idx) => (
                  <InvoiceRow
                    key={inv.path}
                    {...{ inv }}
                    target={IFRAME_NAME}
                    isEven={!(idx % 2)}
                  />
                ))}
              </div>
            </div>
          </section>

          <section>
            <h2>Abgelegte Rechnungen – {monthName}</h2>
            <div className="invoice-grid">
              <div className="invoice-grid__header">
                <span></span>
                <span>Zahlung</span>
                <span>Rechnung</span>
                <span className="header--align-end">Brutto</span>
                <span className="header--align-end">%</span>
              </div>
              <div className="invoice-grid__body">
                {invoicesForMonth.map((inv, idx) => (
                  <InvoiceRow
                    key={inv.path}
                    {...{ inv }}
                    target={IFRAME_NAME}
                    isEven={!(idx % 2)}
                  />
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>

      <iframe name={IFRAME_NAME} title="Vorschau"></iframe>
    </div>
  );
}
