import { Form, useSearchParams } from "@remix-run/react";
import useHasJSEnabled from "~/lib/hooks/useHasJSEnabled";
import type { Invoice } from "~/lib/services/InvoiceService";
import { invoiceToString } from "~/lib/services/InvoiceService";

interface Props {
  invoicesForMonth: Invoice[];
}

export default function FilterBar({ invoicesForMonth }: Props) {
  const [searchParams] = useSearchParams();
  const hasJsEnabled = useHasJSEnabled();

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
      />
      <button type="submit" name="action" value="refresh" title="Aktualisieren">
        ↩️
      </button>
      <button type="submit" name="action" value="open" title="Ordner öffnen">
        📂
      </button>
      {hasJsEnabled && (
        <button
          type="button"
          title="In Zwischenablage kopieren"
          onClick={onCopyToClipboard}
        >
          📋
        </button>
      )}
    </Form>
  );
}
