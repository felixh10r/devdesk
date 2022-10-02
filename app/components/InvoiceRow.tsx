import { Form } from "@remix-run/react";
import { useState } from "react";
import type { Invoice } from "~/lib/services/InvoiceService";
import { invoiceToString } from "~/lib/services/InvoiceService";

interface Props {
  inv: Invoice;
  target: string;
}

export default function InvoiceRow({ inv, target }: Props) {
  const form = `form-${inv.path}`;
  const [isDirty, setIsDirty] = useState(false);

  const setDirty = () => setIsDirty(true);

  const onCopyToClipboard = () => {
    navigator.clipboard.writeText(invoiceToString(inv));
  };

  return (
    <tr>
      <td>
        <a href={`/static${inv.path}`} {...{ target }}>
          {inv.name}
        </a>
        <Form id={form} method="post" onSubmit={() => setIsDirty(false)}>
          <input type="hidden" name="name" defaultValue={inv.name} />
          <input type="hidden" name="path" defaultValue={inv.path} />
        </Form>
      </td>
      <td>
        <input
          {...{ form }}
          type="date"
          name="paymentDate"
          defaultValue={inv.paymentDate}
          onChange={setDirty}
        />
      </td>
      <td>
        <input
          {...{ form }}
          type="date"
          name="invoiceDate"
          defaultValue={inv.invoiceDate}
          onChange={setDirty}
        />
      </td>
      <td>
        <input
          {...{ form }}
          className={`number-field ${
            parseFloat(inv.amount) > 0 ? "positive" : "negative"
          }`}
          type="text"
          name="amount"
          defaultValue={inv.amount}
          onChange={setDirty}
        />
      </td>
      <td>
        <input
          {...{ form }}
          className="number-field vat-field"
          type="text"
          name="vat"
          defaultValue={inv.vat}
          onChange={setDirty}
        />
      </td>
      <td>
        <select
          {...{ form }}
          name="bankOrCash"
          defaultValue={inv.bankOrCash}
          onChange={setDirty}
        >
          <option value="bank">🏦</option>
          <option value="cash">👛</option>
        </select>
      </td>
      <td>
        <button
          {...{ form }}
          type="submit"
          title="Speichern"
          disabled={!isDirty}
        >
          💾
        </button>
        <button
          {...{ form }}
          type="button"
          title="In Zwischenablage kopieren"
          onClick={onCopyToClipboard}
          disabled={!inv.amount || !inv.paymentDate || isDirty}
        >
          📋
        </button>
      </td>
    </tr>
  );
}
