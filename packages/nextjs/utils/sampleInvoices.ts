// Sample invoice generator for demo purposes
export interface SampleInvoice {
  id: string;
  company: string;
  companyAddress: string;
  recipient: string;
  amount: number;
  dueDate: string;
  description: string;
  invoiceNumber: string;
}

export const SAMPLE_INVOICES: SampleInvoice[] = [
  {
    id: "walmart-001",
    company: "Walmart Inc.",
    companyAddress: "702 SW 8th Street, Bentonville, AR 72716",
    recipient: "ABC Supply Co.",
    amount: 25000,
    dueDate: "2024-12-15",
    description: "Retail merchandise supply - Q4 2024",
    invoiceNumber: "WMT-2024-001",
  },
  {
    id: "amazon-001",
    company: "Amazon.com Inc.",
    companyAddress: "410 Terry Avenue North, Seattle, WA 98109",
    recipient: "XYZ Logistics LLC",
    amount: 45000,
    dueDate: "2024-11-30",
    description: "Fulfillment services - November 2024",
    invoiceNumber: "AMZ-2024-001",
  },
  {
    id: "apple-001",
    company: "Apple Inc.",
    companyAddress: "One Apple Park Way, Cupertino, CA 95014",
    recipient: "Tech Components Inc.",
    amount: 75000,
    dueDate: "2024-12-31",
    description: "Component manufacturing - iPhone accessories",
    invoiceNumber: "AAPL-2024-001",
  },
];

// Generate invoice PDF content (for demo)
export const generateInvoicePDF = (invoice: SampleInvoice): string => {
  return `
INVOICE

From: ${invoice.company}
${invoice.companyAddress}

To: ${invoice.recipient}

Invoice #: ${invoice.invoiceNumber}
Date: ${new Date().toLocaleDateString()}
Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}

Description: ${invoice.description}
Amount: $${invoice.amount.toLocaleString()}

Payment Terms: Net 30
Status: Unpaid

---
This is a sample invoice for demonstration purposes only.
  `.trim();
};

// Create downloadable sample invoice
export const downloadSampleInvoice = (invoiceId: string) => {
  const invoice = SAMPLE_INVOICES.find(inv => inv.id === invoiceId);
  if (!invoice) return;

  const content = generateInvoicePDF(invoice);
  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `${invoice.invoiceNumber}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
