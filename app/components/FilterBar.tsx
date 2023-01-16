import { Form, useSearchParams } from "@remix-run/react";
import useHasJSEnabled from "~/lib/hooks/useHasJSEnabled";
import type { Invoice } from "~/lib/services/InvoiceService";
import { invoiceToString } from "~/lib/services/InvoiceService";

interface Props {
  invoicesForMonth: Invoice[];
  mailSenderName: string;
  mailTo: string;
}

export default function FilterBar({
  invoicesForMonth,
  mailSenderName,
  mailTo,
}: Props) {
  const [searchParams] = useSearchParams();
  const hasJsEnabled = useHasJSEnabled();

  const composeEmailHref = (() => {
    const subject = `BH ${searchParams.get("month")}`;

    const qs = new URLSearchParams({
      subject,
      body: `Sehr geehrte Damen und Herren,

anbei die Unterlagen für die ${subject}, vielen Dank!

Mit freundlichen Grüßen
${mailSenderName}
`,
    })
      .toString()
      .replace(/\+/g, "%20");

    return `mailto:${mailTo}?${qs}`;
  })();

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
        🔄
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
      <button type="submit" name="action" value="open" title="Ordner anzeigen">
        📂
      </button>
      <a href={composeEmailHref} title="Buchhaltungs E-Mail verfassen…">
        ✉️
      </a>
    </Form>
  );
}
