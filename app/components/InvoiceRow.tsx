import { Form } from "@remix-run/react";
import { useRef, useState } from "react";
import useHasJSEnabled from "~/lib/hooks/useHasJSEnabled";
import type { Invoice } from "~/lib/services/InvoiceService";
import { invoiceToString } from "~/lib/services/InvoiceService";

interface Props {
  inv: Invoice;
  target: string;
  isEven: boolean;
}

export default function InvoiceRow({ inv, target, isEven }: Props) {
  const form = `form-${inv.path}`;
  const [isDirty, setIsDirty] = useState(false);
  const hasJsEnabled = useHasJSEnabled();
  const viewButton = useRef<HTMLAnchorElement | null>(null);

  const setDirty = () => setIsDirty(true);

  const onCopyToClipboard = () =>
    navigator.clipboard.writeText(invoiceToString(inv));

  const onFocus = () => viewButton.current?.click();

  const cellClassName = `invoice-grid__cell${isEven ? " is-even" : ""}`;

  return (
    <>
      <div className={cellClassName}>
        <input
          {...{ form, onFocus }}
          name="name"
          minLength={2}
          defaultValue={inv.name}
          onChange={setDirty}
        />
        <Form id={form} method="post" onSubmit={() => setIsDirty(false)}>
          <input type="hidden" name="path" defaultValue={inv.path} />
        </Form>
        {/* eslint-disable-next-line jsx-a11y/anchor-has-content */}
        <a
          ref={viewButton}
          className="invoice-view-link"
          href={`/static${inv.path}`}
          {...{ target }}
        />
      </div>
      <div className={cellClassName}>
        <input
          {...{ form }}
          type="date"
          name="paymentDate"
          defaultValue={inv.paymentDate}
          onChange={setDirty}
        />
      </div>
      <div className={cellClassName}>
        <input
          {...{ form }}
          type="date"
          name="invoiceDate"
          defaultValue={inv.invoiceDate}
          onChange={setDirty}
        />
      </div>
      <div className={`${cellClassName} cell--align-end`}>
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
      </div>
      <div className={`${cellClassName} cell--align-end`}>
        <input
          {...{ form }}
          className="number-field vat-field"
          type="text"
          name="vat"
          defaultValue={inv.vat}
          onChange={setDirty}
        />
      </div>
      <div className={cellClassName}>
        <select
          {...{ form }}
          name="bankOrCash"
          defaultValue={inv.bankOrCash}
          onChange={setDirty}
        >
          <option value="bank">🏦</option>
          <option value="cash">👛</option>
        </select>
      </div>
      <div className={cellClassName}>
        <button
          {...{ form }}
          type="submit"
          title="Speichern"
          disabled={hasJsEnabled && !isDirty}
        >
          💾
        </button>
        {hasJsEnabled && (
          <button
            {...{ form }}
            type="button"
            title="In Zwischenablage kopieren"
            onClick={onCopyToClipboard}
            disabled={!inv.amount || !inv.paymentDate || isDirty}
          >
            📋
          </button>
        )}
      </div>
    </>
  );
}
