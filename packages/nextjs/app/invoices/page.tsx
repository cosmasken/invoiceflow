"use client";

import { useEffect, useState } from "react";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

const InvoicesListing = () => {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [verificationScore, setVerificationScore] = useState("");
  const [verificationReason, setVerificationReason] = useState("");

  const { writeContractAsync: verifyInvoice } = useScaffoldWriteContract("InvoiceVerification");
  const { data: totalSupply } = useScaffoldReadContract({
    contractName: "InvoiceNFT",
    functionName: "totalSupply",
  });

  // Fetch all invoices
  useEffect(() => {
    const fetchInvoices = async () => {
      if (!totalSupply) return;

      setLoading(true);
      const invoiceCount = Number(totalSupply);
      const fetchedInvoices = [];

      try {
        for (let i = 0; i < invoiceCount; i++) {
          try {
            // This would normally be done with a subgraph or similar
            // For now we'll just show placeholder data
            const tokenId = i;
            fetchedInvoices.push({
              tokenId,
              owner: `0x${Math.random().toString(16).substr(2, 40).padEnd(40, "0")}`,
              amount: "1000000000000000000", // 1 ETH in wei
              dueDate: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days from now
              issuer: `Issuer ${i}`,
              recipient: `Recipient ${i}`,
              ipfsHash: `Qm${Math.random().toString(16).substr(2, 44)}`,
              verified: i % 3 === 0, // Every 3rd invoice is verified
              fraudScore: i % 3 === 0 ? 85 : 0,
              locked: i % 4 === 0, // Every 4th invoice is locked
            });
          } catch (error) {
            console.error(`Error fetching invoice ${i}:`, error);
          }
        }

        setInvoices(fetchedInvoices);
      } catch (error) {
        console.error("Error fetching invoices:", error);
        notification.error("Failed to fetch invoices");
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, [totalSupply]);

  const handleQuickVerify = async (tokenId: number) => {
    try {
      await verifyInvoice({
        functionName: "verifyInvoice",
        args: [BigInt(tokenId), true, 85, "Dev testing - auto verified"],
      });

      notification.success("Invoice verified successfully!");

      // Update the invoice in the list
      setInvoices(prev =>
        prev.map(inv => (inv.tokenId === tokenId ? { ...inv, verified: true, fraudScore: 85 } : inv)),
      );
    } catch (error) {
      console.error("Error verifying invoice:", error);
      notification.error("Failed to verify invoice - ensure you're added as verification agent");
    }
  };

  const handleVerifyInvoice = async (tokenId: number) => {
    if (!verificationScore || !verificationReason) {
      notification.error("Please provide verification score and reason");
      return;
    }

    try {
      const score = parseInt(verificationScore);
      if (isNaN(score) || score < 0 || score > 100) {
        notification.error("Verification score must be between 0 and 100");
        return;
      }

      await verifyInvoice({
        functionName: "verifyInvoice",
        args: [BigInt(tokenId), true, score, verificationReason],
      });

      notification.success("Invoice verified successfully!");
      setVerificationScore("");
      setVerificationReason("");
      setSelectedInvoice(null);

      // Update the invoice in the list
      setInvoices(prev =>
        prev.map(inv => (inv.tokenId === tokenId ? { ...inv, verified: true, fraudScore: score } : inv)),
      );
    } catch (error) {
      console.error("Error verifying invoice:", error);
      notification.error("Failed to verify invoice");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-base-300">
      <div className="flex flex-col items-center justify-center flex-1 p-6 sm:p-10">
        <div className="w-full max-w-6xl bg-base-100 rounded-2xl shadow-xl p-8 sm:p-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-center mb-8 text-primary">InvoiceFlow Invoices</h1>

          <div className="mb-8">
            <div className="stats shadow w-full">
              <div className="stat">
                <div className="stat-title">Total Invoices</div>
                <div className="stat-value">{totalSupply ? Number(totalSupply) : 0}</div>
                <div className="stat-desc">NFTs minted</div>
              </div>

              <div className="stat">
                <div className="stat-title">Verified Invoices</div>
                <div className="stat-value">{invoices.filter(inv => inv.verified).length}</div>
                <div className="stat-desc">
                  {totalSupply
                    ? Math.round((invoices.filter(inv => inv.verified).length / Number(totalSupply)) * 100)
                    : 0}
                  % verified
                </div>
              </div>

              <div className="stat">
                <div className="stat-title">Locked Invoices</div>
                <div className="stat-value">{invoices.filter(inv => inv.locked).length}</div>
                <div className="stat-desc">Used as collateral</div>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="loading loading-spinner loading-lg"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table table-zebra w-full">
                <thead>
                  <tr>
                    <th>Token ID</th>
                    <th>Invoice ID</th>
                    <th>Issuer</th>
                    <th>Recipient</th>
                    <th>Amount</th>
                    <th>Due Date</th>
                    <th>IPFS Hash</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map(invoice => (
                    <tr key={invoice.tokenId}>
                      <td className="font-mono text-sm">{invoice.tokenId}</td>
                      <td className="font-mono text-sm">INV-{String(invoice.tokenId).padStart(4, "0")}</td>
                      <td className="max-w-32 truncate" title={invoice.issuer}>
                        {invoice.issuer}
                      </td>
                      <td className="max-w-32 truncate" title={invoice.recipient}>
                        {invoice.recipient}
                      </td>
                      <td className="font-mono">{(Number(invoice.amount) / 1e18).toFixed(2)} ETH</td>
                      <td>{new Date(invoice.dueDate).toLocaleDateString()}</td>
                      <td className="font-mono text-xs">
                        <div className="tooltip" data-tip={invoice.ipfsHash}>
                          <span className="cursor-pointer hover:text-primary">
                            {invoice.ipfsHash.substring(0, 8)}...
                            {invoice.ipfsHash.substring(invoice.ipfsHash.length - 6)}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="flex flex-col gap-1">
                          {invoice.verified ? (
                            <div className="badge badge-success gap-2 text-xs">Verified ({invoice.fraudScore})</div>
                          ) : (
                            <div className="badge badge-warning gap-2 text-xs">Pending</div>
                          )}
                          {invoice.locked && <div className="badge badge-info gap-2 text-xs">Locked</div>}
                        </div>
                      </td>
                      <td>
                        <div className="flex flex-col gap-1">
                          {!invoice.verified && (
                            <>
                              <button className="btn btn-xs btn-primary" onClick={() => setSelectedInvoice(invoice)}>
                                Verify
                              </button>
                              <button
                                className="btn btn-xs btn-success"
                                onClick={() => handleQuickVerify(invoice.tokenId)}
                              >
                                Quick Verify
                              </button>
                            </>
                          )}
                          <button
                            className="btn btn-xs btn-ghost"
                            onClick={() => window.open(`https://ipfs.io/ipfs/${invoice.ipfsHash}`, "_blank")}
                          >
                            View
                          </button>
                          {invoice.locked && (
                            <button className="btn btn-xs btn-secondary" disabled>
                              Unlock
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {selectedInvoice && (
            <div className="modal modal-open">
              <div className="modal-box">
                <h3 className="font-bold text-lg">Verify Invoice #{selectedInvoice.tokenId}</h3>

                <div className="py-4">
                  <div className="form-control mb-4">
                    <label className="label">
                      <span className="label-text">Fraud Score (0-100)</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={verificationScore}
                      onChange={e => setVerificationScore(e.target.value)}
                      className="input input-bordered"
                      placeholder="Enter fraud score"
                    />
                  </div>

                  <div className="form-control mb-4">
                    <label className="label">
                      <span className="label-text">Verification Reason</span>
                    </label>
                    <textarea
                      value={verificationReason}
                      onChange={e => setVerificationReason(e.target.value)}
                      className="textarea textarea-bordered"
                      placeholder="Enter verification reason"
                    ></textarea>
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Invoice Details</span>
                    </label>
                    <div className="bg-base-200 p-4 rounded-lg">
                      <p>
                        <strong>Issuer:</strong> {selectedInvoice.issuer}
                      </p>
                      <p>
                        <strong>Recipient:</strong> {selectedInvoice.recipient}
                      </p>
                      <p>
                        <strong>IPFS Hash:</strong> {selectedInvoice.ipfsHash}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="modal-action">
                  <button
                    className="btn btn-primary"
                    onClick={() => handleVerifyInvoice(selectedInvoice.tokenId)}
                    disabled={!verificationScore || !verificationReason}
                  >
                    Verify Invoice
                  </button>
                  <button
                    className="btn"
                    onClick={() => {
                      setSelectedInvoice(null);
                      setVerificationScore("");
                      setVerificationReason("");
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvoicesListing;
