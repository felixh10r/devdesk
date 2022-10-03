import fs from "fs";
import path from "path";

export interface Invoice {
  name: string;
  path: string;
  invoiceDate: string;
  paymentDate: string;
  amount: string;
  vat: string;
  bankOrCash: "bank" | "cash";
}

const DEFAULT_VAT = "20";
export const REVERSE_CHARGE_TOKEN = "R";

export function invoiceToString(inv: Invoice) {
  let text = "";

  if (inv.paymentDate) {
    const [year, month, date] = inv.paymentDate.split("-");
    text += `${date}.${month}.${year}`;
  }

  const vatStr =
    inv.vat === REVERSE_CHARGE_TOKEN ? REVERSE_CHARGE_TOKEN : inv.vat + "%";

  text += `\t${inv.name}\t${inv.amount} €\t${vatStr}`;

  return text;
}

function resolveInvoiceBasePath(dateWithFullYear: string) {
  const quarter = getQuarter(dateWithFullYear);
  const [year, month] = dateWithFullYear.split("-");

  return process.env
    .INVOICE_PATH_BASE!.replace(/\{yyyy}/g, year)
    .replace(/\{mm}/g, month)
    .replace("{q}", quarter.toString());
}

function getQuarter(date: string) {
  return Math.floor((new Date(date).getMonth() + 3) / 3);
}

function expandDate(date: string) {
  return date ? `20${date}` : "";
}

function amountToNumber(amount: string) {
  return parseFloat(amount.replace(",", "."));
}

function numberToAmount(amountNumber: number) {
  return amountNumber.toFixed(2).replace(".", ",");
}

function contractDate(date: string) {
  return date.replace(/20(\d\d)/, "$1");
}

function pathToInvoiceData(path: string) {
  const baseName = path.split("/").pop()!.split(".")[0];
  const matches = baseName.match(
    /(?<firstDate>\d\d-\d\d-\d\d)? ?(?<secondDate>\d\d-\d\d-\d\d)? ?(?<fileName>.+)/u,
  );

  if (!matches?.groups) {
    throw Error("no match");
  }

  const inv: Invoice = {
    name: "",
    path,
    paymentDate: "",
    invoiceDate: "",
    amount: "",
    bankOrCash: path.includes(`/${process.env.INVOICE_INCOMING_CASH_FOLDER}/`)
      ? "cash"
      : "bank",
    vat: "",
  };

  const { firstDate, secondDate, fileName } = matches.groups;

  if (firstDate && !secondDate) {
    inv.invoiceDate = expandDate(firstDate);
  }

  if (firstDate && secondDate) {
    inv.paymentDate = expandDate(firstDate);
    inv.invoiceDate = expandDate(secondDate);
  }

  const metaMatch = fileName.match(/\[(?<meta>.+)]/);

  if (metaMatch?.groups) {
    const [amount, vat] = metaMatch.groups.meta.split("|");
    inv.name = fileName.split(" [")[0];
    inv.amount = amount;
    inv.vat = vat;
  } else {
    inv.name = fileName;

    // simplify input for new entries
    if (!inv.invoiceDate) {
      inv.vat = DEFAULT_VAT;
    }
  }

  return inv;
}

function getInvoicesForFolder(folder: string) {
  const ret: Invoice[] = [];

  try {
    const dir = fs.readdirSync(folder);

    dir
      .map((d) => `${folder}/${d}`)
      .filter((path) => !fs.statSync(path).isDirectory())
      .forEach((path) => {
        try {
          ret.push(pathToInvoiceData(path));
        } catch (e) {}
      });
  } catch (e) {}

  return ret;
}

const invoiceService = {
  getUnassignedInvoices(): Invoice[] {
    return getInvoicesForFolder(process.env.DEFAULT_INVOICE_PATH!);
  },
  getInvoicesForMonth(month: string) {
    const basePath = resolveInvoiceBasePath(month);

    const outgoing = path.join(basePath, process.env.INVOICE_OUTGOING_FOLDER!);
    const incoming = path.join(
      basePath,
      process.env.INVOICE_INCOMING_BANK_FOLDER!,
    );
    const incomingCash = path.join(
      basePath,
      process.env.INVOICE_INCOMING_CASH_FOLDER!,
    );

    return [
      ...getInvoicesForFolder(outgoing),
      ...getInvoicesForFolder(incoming),
      ...getInvoicesForFolder(incomingCash),
    ].sort((a, b) => (a.paymentDate > b.paymentDate ? 1 : -1));
  },
  saveInvoice(formData: FormData): boolean {
    const inv = Object.fromEntries(formData) as unknown as Invoice;

    if (inv.vat === "r") {
      inv.vat = REVERSE_CHARGE_TOKEN;
    }

    const ext = inv.path.split(".").pop();
    let filename = inv.name;

    if (inv.invoiceDate) {
      filename = `${contractDate(inv.invoiceDate)} ${filename}`;

      if (!inv.paymentDate && inv.bankOrCash === "cash") {
        inv.paymentDate = inv.invoiceDate;
      }
    }

    if (inv.paymentDate) {
      filename = `${contractDate(inv.paymentDate)} ${filename}`;
    }

    const amountNumber = inv.amount ? amountToNumber(inv.amount) : null;

    if (amountNumber || inv.vat) {
      const amount = (() => {
        if (!amountNumber) {
          return "";
        }

        return numberToAmount(amountNumber);
      })();

      const meta = [amount, inv.vat].filter(Boolean).join("|");
      const metaBrackets = meta ? `[${meta}]` : "";

      filename = [filename, metaBrackets].join(" ");
    }

    filename = `${filename}.${ext}`;

    const newFolder = (() => {
      if (!inv.paymentDate) {
        return process.env.DEFAULT_INVOICE_PATH!;
      }

      const basePath = resolveInvoiceBasePath(inv.paymentDate);

      const folder = (() => {
        if (amountNumber && amountNumber > 0) {
          return process.env.INVOICE_OUTGOING_FOLDER!;
        }

        return inv.bankOrCash == "bank"
          ? process.env.INVOICE_INCOMING_BANK_FOLDER!
          : process.env.INVOICE_INCOMING_CASH_FOLDER!;
      })();

      return path.join(basePath, folder);
    })();

    const newFileName = path.join(newFolder, filename);

    if (inv.path !== newFileName) {
      if (!fs.existsSync(newFolder)) {
        fs.mkdirSync(newFolder, { recursive: true });
      }

      fs.renameSync(inv.path, newFileName);
    }

    return false;
  },
  getOutstandingAmount(invoices: Invoice[]) {
    return invoices.reduce((acc, ui) => {
      const amountNumber = amountToNumber(ui.amount);

      return acc + (amountNumber > 0 ? amountNumber : 0);
    }, 0);
  },
};

export default invoiceService;
