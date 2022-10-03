import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData, useSearchParams } from "@remix-run/react";
import FilterBar from "~/components/FilterBar";
import InvoiceRow from "~/components/InvoiceRow";
import type { Invoice } from "~/lib/services/InvoiceService";
import invoiceService from "../lib/services/InvoiceService";

interface LoaderData {
  unassignedInvoices: Invoice[];
  invoicesForMonth: Invoice[];
  outstandingAmount: number;
}

const IFRAME_NAME = "iframe-preview";

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const month = url.searchParams.get("month");

  if (!month) {
    const currentMonth = new Date()
      .toISOString()
      .split("-")
      .slice(0, 2)
      .join("-");
    return redirect(`${url.pathname}?month=${currentMonth}`);
  }

  const unassignedInvoices = invoiceService.getUnassignedInvoices();

  const outstandingAmount =
    invoiceService.getOutstandingAmount(unassignedInvoices);

  const data: LoaderData = {
    invoicesForMonth: invoiceService.getInvoicesForMonth(month),
    unassignedInvoices,
    outstandingAmount,
  };

  return json(data);
};

export const action: ActionFunction = async ({ request }) => {
  const body = await request.formData();

  invoiceService.saveInvoice(body);

  return null;
};

export default function Invoices() {
  const { unassignedInvoices, invoicesForMonth, outstandingAmount } =
    useLoaderData<LoaderData>();

  const [searchParams] = useSearchParams();
  const monthName = new Intl.DateTimeFormat("de-DE", { month: "long" }).format(
    new Date(searchParams.get("month")!),
  );

  return (
    <div className="two-panes">
      <div>
        <div className="container">
          <h1>devDesk</h1>
          <FilterBar {...{ invoicesForMonth }} />
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
                  <InvoiceRow key={inv.path} {...{ inv }} target={IFRAME_NAME} isEven={!(idx % 2)} />
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
                  <InvoiceRow key={inv.path} {...{ inv }} target={IFRAME_NAME} isEven={!(idx % 2)} />
                ))}
              </div>
            </div>
          </section>
        </div>

        {/* <table>
          <thead>
            <tr>
              <th></th>
              <th>Zahlung</th>
              <th>Rechnung</th>
              <th>Brutto</th>
            </tr>
          </thead>
          <tbody>
            {unassignedInvoices.map((inv) => (
              <InvoiceRow key={inv.path} {...{ inv }} target={IFRAME_NAME} />
            ))}
          </tbody>
          <tbody>
            <tr>
              <td colSpan={7} className="table-divider">&nbsp;</td>
            </tr>
          </tbody>
          <tbody>
            {invoicesForMonth.map((inv) => (
              <InvoiceRow key={inv.path} {...{ inv }} target={IFRAME_NAME} />
            ))}
          </tbody>
        </table> */}
      </div>

      <iframe name={IFRAME_NAME} title="Vorschau"></iframe>
    </div>
  );
}
