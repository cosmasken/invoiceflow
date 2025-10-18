"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { useVerifyInvoice } from "~~/hooks/useInvoiceQueries";
import { useInvoiceStore } from "~~/services/store/invoiceStore";

export const InvoiceForm = () => {
  const { address } = useAccount();
  const { isLoading, error } = useInvoiceStore();
  const verifyInvoiceMutation = useVerifyInvoice();

  const [formData, setFormData] = useState({
    amount: "",
    currency: "USD",
    dueDate: "",
    recipientAddress: "",
    description: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!address) {
      alert("Please connect your wallet first");
      return;
    }

    const invoiceData = {
      ...formData,
      amount: parseFloat(formData.amount),
      issuerAddress: address,
      status: "pending" as const,
    };

    verifyInvoiceMutation.mutate(invoiceData);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Create Invoice NFT</h2>
      
      {error && (
        <div className="alert alert-error mb-4">
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">
              <span className="label-text">Amount</span>
            </label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleInputChange}
              className="input input-bordered w-full"
              placeholder="5000"
              required
              min="0"
              step="0.01"
            />
          </div>

          <div>
            <label className="label">
              <span className="label-text">Currency</span>
            </label>
            <select
              name="currency"
              value={formData.currency}
              onChange={handleInputChange}
              className="select select-bordered w-full"
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="ETH">ETH</option>
            </select>
          </div>
        </div>

        <div>
          <label className="label">
            <span className="label-text">Due Date</span>
          </label>
          <input
            type="date"
            name="dueDate"
            value={formData.dueDate}
            onChange={handleInputChange}
            className="input input-bordered w-full"
            required
          />
        </div>

        <div>
          <label className="label">
            <span className="label-text">Recipient Address</span>
          </label>
          <input
            type="text"
            name="recipientAddress"
            value={formData.recipientAddress}
            onChange={handleInputChange}
            className="input input-bordered w-full"
            placeholder="0x742d35Cc6634C0532925a3b8D4C9db96590e4CAF"
            required
          />
        </div>

        <div>
          <label className="label">
            <span className="label-text">Description</span>
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            className="textarea textarea-bordered w-full"
            placeholder="Web development services for Q4 2024"
            rows={3}
            required
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || !address}
          className="btn btn-primary w-full"
        >
          {isLoading ? (
            <>
              <span className="loading loading-spinner"></span>
              Verifying Invoice...
            </>
          ) : (
            "Create & Verify Invoice"
          )}
        </button>
      </form>

      {!address && (
        <div className="alert alert-warning mt-4">
          <span>Please connect your wallet to create invoices</span>
        </div>
      )}
    </div>
  );
};
