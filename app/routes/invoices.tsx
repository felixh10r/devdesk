import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useLoaderData, useSearchParams } from "@remix-run/react";
import InvoiceRow from "~/components/InvoiceRow";
import type { Invoice } from "~/lib/services/InvoiceService";
import { invoiceToString } from "~/lib/services/InvoiceService";
import invoiceService from "../lib/services/InvoiceService";

interface LoaderData {
  unassignedInvoices: Invoice[];
  invoicesForMonth: Invoice[];
}

const SUBMIT_ID = "button-submit";
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

  const data: LoaderData = {
    unassignedInvoices: invoiceService.getUnassignedInvoices(),
    invoicesForMonth: invoiceService.getInvoicesForMonth(month),
  };

  return json(data);
};

export const action: ActionFunction = async ({ request }) => {
  const body = await request.formData();

  invoiceService.saveInvoice(body);

  return null;
};

export default function Invoices() {
  const [searchParams] = useSearchParams();
  const { unassignedInvoices, invoicesForMonth } = useLoaderData<LoaderData>();

  const onCopyToClipboard = () => {
    const strings = invoicesForMonth
      .filter((i) => i.amount && i.paymentDate)
      .map(invoiceToString);

    navigator.clipboard.writeText(strings.join("\n"));
  };

  return (
    <div className="two-panes">
      <div>
        <div className="container">
          <h1>devDesk</h1>
          <Form method="get" className="filter-bar">
            <input
              type="month"
              name="month"
              defaultValue={searchParams.get("month")!}
              onChange={() => document.getElementById(SUBMIT_ID)!.click()}
            />
            <button id={SUBMIT_ID} type="submit" title="Aktualisieren">
              ↩️
            </button>
            <button
              type="button"
              title="In Zwischenablage kopieren"
              onClick={onCopyToClipboard}
            >
              📋
            </button>
          </Form>
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
