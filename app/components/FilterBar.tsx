import { Form, useSearchParams } from "@remix-run/react";
import type { Invoice } from "~/lib/services/InvoiceService";
import { invoiceToString } from "~/lib/services/InvoiceService";

interface Props {
  invoicesForMonth: Invoice[];
}

const SUBMIT_ID = "button-submit";

export default function FilterBar({ invoicesForMonth }: Props) {
  const [searchParams] = useSearchParams();

  const onCopyToClipboard = () => {
    const strings = invoicesForMonth
      .filter((i) => i.amount && i.paymentDate)
      .map(invoiceToString);

    navigator.clipboard.writeText(strings.join("\n"));
  };

  return (
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
  );
}
