
"use client";

import QRCode from "react-qr-code";
import { type Invoice } from "~~/services/store/invoiceStore";

interface InvoiceDetailsModalProps {
  invoice: Invoice | null;
  onClose: () => void;
}

export const InvoiceDetailsModal = ({ invoice, onClose }: InvoiceDetailsModalProps) => {
  if (!invoice) return null;

  const invoiceUrl = `${window.location.origin}/invoice/${invoice.id}`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-2xl w-full" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Invoice Details</h2>
          <button onClick={onClose} className="btn btn-sm btn-circle btn-ghost">✕</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="space-y-2">
              <p><span className="font-semibold">Description:</span> {invoice.description}</p>
              <p><span className="font-semibold">Amount:</span> {invoice.amount} {invoice.currency}</p>
              <p><span className="font-semibold">Due Date:</span> {new Date(invoice.dueDate).toLocaleDateString()}</p>
              <p><span className="font-semibold">Recipient:</span> {invoice.recipientAddress}</p>
              {invoice.verificationScore && (
                <p><span className="font-semibold">AI Score:</span> {(invoice.verificationScore * 100).toFixed(1)}%</p>
              )}
              {invoice.tokenId && (
                <p><span className="font-semibold">Token ID:</span> {invoice.tokenId}</p>
              )}
            </div>
          </div>
          <div className="flex flex-col items-center justify-center">
            <div className="p-4 bg-white rounded-md">
              <QRCode value={invoiceUrl} size={128} />
            </div>
            <p className="text-sm text-gray-500 mt-2">Scan to view invoice online</p>
          </div>
        </div>
        <div className="mt-6 flex justify-end space-x-2">
          <button className="btn btn-outline" onClick={() => console.log('Download PDF')}>
            Download PDF
          </button>
          <button className="btn">Share</button>
        </div>
      </div>
    </div>
  );
};
