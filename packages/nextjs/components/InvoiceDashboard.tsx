"use client";

import { useAccount } from "wagmi";
import { useMintInvoiceNFT, useUserInvoices } from "~~/hooks/useInvoiceQueries";
import { useInvoiceStore, type Invoice } from "~~/services/store/invoiceStore";

const InvoiceCard = ({ invoice }: { invoice: Invoice }) => {
  const mintNFTMutation = useMintInvoiceNFT();
  const { isLoading } = useInvoiceStore();

  const handleMintNFT = () => {
    if (invoice.status === "verified") {
      mintNFTMutation.mutate(invoice);
    }
  };

  const getStatusColor = (status: Invoice["status"]) => {
    switch (status) {
      case "pending": return "badge-warning";
      case "verified": return "badge-info";
      case "minted": return "badge-success";
      case "funded": return "badge-primary";
      default: return "badge-ghost";
    }
  };

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <div className="flex justify-between items-start">
          <h3 className="card-title text-lg">{invoice.description}</h3>
          <div className={`badge ${getStatusColor(invoice.status)}`}>
            {invoice.status}
          </div>
        </div>
        
        <div className="space-y-2 text-sm">
          <p><span className="font-semibold">Amount:</span> {invoice.amount} {invoice.currency}</p>
          <p><span className="font-semibold">Due Date:</span> {new Date(invoice.dueDate).toLocaleDateString()}</p>
          <p><span className="font-semibold">Recipient:</span> {invoice.recipientAddress.slice(0, 10)}...</p>
          
          {invoice.verificationScore && (
            <p><span className="font-semibold">AI Score:</span> {(invoice.verificationScore * 100).toFixed(1)}%</p>
          )}
          
          {invoice.tokenId && (
            <p><span className="font-semibold">Token ID:</span> {invoice.tokenId}</p>
          )}
        </div>

        <div className="card-actions justify-end mt-4">
          {invoice.status === "verified" && (
            <button
              onClick={handleMintNFT}
              disabled={isLoading}
              className="btn btn-primary btn-sm"
            >
              {isLoading ? (
                <>
                  <span className="loading loading-spinner loading-xs"></span>
                  Minting...
                </>
              ) : (
                "Mint NFT"
              )}
            </button>
          )}
          
          {invoice.status === "minted" && (
            <button className="btn btn-secondary btn-sm" disabled>
              Ready for Lending
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export const InvoiceDashboard = () => {
  const { address } = useAccount();
  const { data: invoices, isLoading: isLoadingInvoices, error } = useUserInvoices(address);
  const { invoices: storeInvoices } = useInvoiceStore();

  // Combine fetched invoices with store invoices (for newly created ones)
  const allInvoices = [...(invoices || []), ...storeInvoices];

  if (!address) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Connect your wallet to view your invoices</p>
      </div>
    );
  }

  if (isLoadingInvoices) {
    return (
      <div className="flex justify-center py-8">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error">
        <span>Error loading invoices: {error.message}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Your Invoices</h2>
        <div className="stats shadow">
          <div className="stat">
            <div className="stat-title">Total Invoices</div>
            <div className="stat-value text-primary">{allInvoices.length}</div>
          </div>
        </div>
      </div>

      {allInvoices.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No invoices found</p>
          <p className="text-sm text-gray-400">Create your first invoice to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allInvoices.map((invoice) => (
            <InvoiceCard key={invoice.id} invoice={invoice} />
          ))}
        </div>
      )}
    </div>
  );
};
