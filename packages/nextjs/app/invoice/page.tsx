"use client";

import { useRef, useState } from "react";
import { useAccount } from "wagmi";
import { Address, Balance } from "~~/components/scaffold-eth";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

const InvoicePage = () => {
  const { address: connectedAddress } = useAccount();
  const { writeContractAsync: mintInvoice } = useScaffoldWriteContract({
    contractName: "InvoiceNFT",
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [invoiceAmount, setInvoiceAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [issuer, setIssuer] = useState("");
  const [recipient, setRecipient] = useState("");
  const [ipfsHash, setIpfsHash] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [aiVerificationResult, setAiVerificationResult] = useState<any>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);

    try {
      notification.info("Analyzing invoice with AI...");

      // Use mock AI service for demo
      const { mockAIVerification } = await import("~~/services/ai/mockAIService");
      const aiResult = await mockAIVerification();

      // Update form with AI results
      setInvoiceAmount((parseFloat(aiResult.amount.replace("$", "").replace(",", "")) / 1000).toString()); // Convert to ETH equivalent
      setDueDate(aiResult.dueDate);
      setIssuer(aiResult.company);
      setRecipient(connectedAddress || "Your Company");

      setAiVerificationResult({
        fraudScore: aiResult.fraudScore,
        reasoning: `Verified ${aiResult.company} invoice with ${(aiResult.confidence * 100).toFixed(1)}% confidence`,
        confidence: aiResult.confidence,
        verified: aiResult.verified,
      });

      notification.success(
        `AI Analysis Complete: ${aiResult.company} invoice verified with fraud score ${aiResult.fraudScore}/100`,
      );
    } catch (error) {
      console.error("Error processing invoice:", error);
      notification.error("Failed to process invoice with AI");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMintInvoice = async () => {
    if (!invoiceAmount || !dueDate || !issuer || !recipient || !ipfsHash) {
      notification.error("Please fill in all fields");
      return;
    }

    if (!aiVerificationResult) {
      notification.error("Please analyze the invoice with AI first");
      return;
    }

    try {
      const amount = BigInt(parseFloat(invoiceAmount) * 1e18); // Convert to wei
      const dueTimestamp = Math.floor(new Date(dueDate).getTime() / 1000);

      await mintInvoice({
        functionName: "mintInvoice",
        args: [amount, BigInt(dueTimestamp), issuer, recipient, ipfsHash],
      });

      notification.success("Invoice NFT minted successfully!");

      // Reset form
      setInvoiceAmount("");
      setDueDate("");
      setIssuer("");
      setRecipient("");
      setIpfsHash("");
      setAiVerificationResult(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Error minting invoice:", error);
      notification.error("Failed to mint invoice NFT");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-base-300">
      <div className="flex flex-col items-center justify-center flex-1 p-6 sm:p-10">
        <div className="w-full max-w-4xl bg-base-100 rounded-2xl shadow-xl p-8 sm:p-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-center mb-8 text-primary">InvoiceFlow AI</h1>

          <div className="flex flex-col sm:flex-row gap-8">
            <div className="flex-1">
              <div className="card bg-base-200 shadow-lg">
                <div className="card-body">
                  <h2 className="card-title text-2xl mb-4">Connect Wallet</h2>
                  {connectedAddress ? (
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">Connected:</span>
                        <Address address={connectedAddress} />
                      </div>
                      <div>
                        <span className="text-sm font-medium">Balance:</span>
                        <div className="mt-1">
                          <Balance address={connectedAddress} />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-error">Please connect your wallet to proceed</p>
                  )}
                </div>
              </div>

              <div className="card bg-base-200 shadow-lg mt-6">
                <div className="card-body">
                  <h2 className="card-title text-2xl mb-4">Upload Invoice</h2>

                  {/* Sample Invoice Downloads */}
                  <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h3 className="font-semibold text-blue-800 mb-2">Try with Sample Invoices:</h3>
                    <div className="flex gap-2 flex-wrap">
                      <button
                        className="btn btn-xs btn-outline btn-primary"
                        onClick={async () => {
                          const { downloadSampleInvoice } = await import("~~/utils/sampleInvoices");
                          downloadSampleInvoice("walmart-001");
                        }}
                      >
                        Download Walmart Sample
                      </button>
                      <button
                        className="btn btn-xs btn-outline btn-primary"
                        onClick={async () => {
                          const { downloadSampleInvoice } = await import("~~/utils/sampleInvoices");
                          downloadSampleInvoice("amazon-001");
                        }}
                      >
                        Download Amazon Sample
                      </button>
                      <button
                        className="btn btn-xs btn-outline btn-primary"
                        onClick={async () => {
                          const { downloadSampleInvoice } = await import("~~/utils/sampleInvoices");
                          downloadSampleInvoice("apple-001");
                        }}
                      >
                        Download Apple Sample
                      </button>
                    </div>
                    <p className="text-xs text-blue-600 mt-2">
                      Download, then upload these sample invoices to test AI verification
                    </p>
                  </div>

                  <div className="form-control mb-4">
                    <label className="label">
                      <span className="label-text">Invoice Document (PDF/Image)</span>
                    </label>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      className="file-input file-input-bordered w-full"
                      accept=".pdf,.png,.jpg,.jpeg"
                      disabled={isLoading || !connectedAddress}
                    />
                    {isLoading && (
                      <div className="flex justify-center mt-4">
                        <div className="loading loading-spinner"></div>
                      </div>
                    )}
                  </div>

                  {aiVerificationResult && (
                    <div className="alert alert-success shadow-lg mb-4">
                      <div>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="stroke-current flex-shrink-0 h-6 w-6"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span>
                          <strong>AI Verification Complete!</strong>
                          <br />
                          Fraud Score: {aiVerificationResult.fraudScore}/100
                          <br />
                          Confidence: {(aiVerificationResult.confidence * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  )}

                  <h2 className="card-title text-2xl mb-4 mt-6">Mint Invoice NFT</h2>
                  <form
                    onSubmit={e => {
                      e.preventDefault();
                      handleMintInvoice();
                    }}
                  >
                    <div className="form-control mb-4">
                      <label className="label">
                        <span className="label-text">Invoice Amount (ETH)</span>
                      </label>
                      <input
                        type="text"
                        value={invoiceAmount}
                        onChange={e => setInvoiceAmount(e.target.value)}
                        className="input input-bordered"
                        placeholder="e.g., 1.0 for 1 ETH"
                        disabled={!connectedAddress || isLoading}
                      />
                    </div>

                    <div className="form-control mb-4">
                      <label className="label">
                        <span className="label-text">Due Date</span>
                      </label>
                      <input
                        type="date"
                        value={dueDate}
                        onChange={e => setDueDate(e.target.value)}
                        className="input input-bordered"
                        disabled={!connectedAddress || isLoading}
                      />
                    </div>

                    <div className="form-control mb-4">
                      <label className="label">
                        <span className="label-text">Invoice Issuer</span>
                      </label>
                      <input
                        type="text"
                        value={issuer}
                        onChange={e => setIssuer(e.target.value)}
                        className="input input-bordered"
                        placeholder="Company that issued the invoice"
                        disabled={!connectedAddress || isLoading}
                      />
                    </div>

                    <div className="form-control mb-4">
                      <label className="label">
                        <span className="label-text">Invoice Recipient</span>
                      </label>
                      <input
                        type="text"
                        value={recipient}
                        onChange={e => setRecipient(e.target.value)}
                        className="input input-bordered"
                        placeholder="Company that received the invoice"
                        disabled={!connectedAddress || isLoading}
                      />
                    </div>

                    <div className="form-control mb-4">
                      <label className="label">
                        <span className="label-text">IPFS Hash</span>
                      </label>
                      <input
                        type="text"
                        value={ipfsHash}
                        onChange={e => setIpfsHash(e.target.value)}
                        className="input input-bordered"
                        placeholder="Qm... IPFS hash of invoice document"
                        disabled={!connectedAddress || isLoading}
                      />
                    </div>

                    <button
                      type="submit"
                      className="btn btn-primary w-full"
                      disabled={!connectedAddress || !invoiceAmount || isLoading}
                    >
                      {isLoading ? "Processing..." : "Mint Invoice NFT"}
                    </button>
                  </form>
                </div>
              </div>
            </div>

            <div className="flex-1">
              <div className="card bg-base-200 shadow-lg">
                <div className="card-body">
                  <h2 className="card-title text-2xl mb-4">InvoiceFlow Overview</h2>
                  <p className="mb-4">
                    InvoiceFlow AI tokenizes unpaid invoices as NFTs for collateralized lending on Polygon zkEVM. Upload
                    your invoice, get it verified by our AI, and use it as collateral to get instant financing.
                  </p>

                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="bg-primary rounded-full p-2 mr-3">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-white"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-bold">AI-Powered Verification</h3>
                        <p className="text-sm opacity-80">OCR extraction and fraud detection</p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="bg-primary rounded-full p-2 mr-3">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-white"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-bold">Tokenize Invoices</h3>
                        <p className="text-sm opacity-80">Convert invoices to NFTs for collateral use</p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="bg-primary rounded-full p-2 mr-3">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-white"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-bold">Instant Financing</h3>
                        <p className="text-sm opacity-80">Borrow against verified invoices</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card bg-base-200 shadow-lg mt-6">
                <div className="card-body">
                  <h2 className="card-title text-2xl mb-4">How It Works</h2>
                  <ol className="steps steps-vertical">
                    <li className="step step-primary">Upload Invoice</li>
                    <li className="step step-primary">AI Verification</li>
                    <li className="step step-primary">Mint NFT</li>
                    <li className="step step-primary">Use as Collateral</li>
                    <li className="step step-primary">Get Financing</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoicePage;
