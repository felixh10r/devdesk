import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
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

  return (
    <div className="two-panes">
      <div>
        <div className="container">
          <h1>devDesk</h1>
          <FilterBar {...{ invoicesForMonth }} />
          {!!outstandingAmount && (
            <p>
              Offene Forderungen:{" "}
              {new Intl.NumberFormat("de-DE", {
                style: "currency",
                currency: "EUR",
              }).format(outstandingAmount)}
            </p>
          )}
        </div>

        <table>
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
              <td>&nbsp;</td>
            </tr>
          </tbody>
          <tbody>
            {invoicesForMonth.map((inv) => (
              <InvoiceRow key={inv.path} {...{ inv }} target={IFRAME_NAME} />
            ))}
          </tbody>
        </table>
      </div>

      <iframe name={IFRAME_NAME} title="Vorschau"></iframe>
    </div>
  );
}
