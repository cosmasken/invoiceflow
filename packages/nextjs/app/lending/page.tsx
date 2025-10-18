"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { Address, Balance } from "~~/components/scaffold-eth";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

const LendingPage = () => {
  const { address: connectedAddress } = useAccount();
  const { writeContractAsync: borrowAgainstInvoice } = useScaffoldWriteContract({
    contractName: "InvoiceLendingPool",
  });
  const { writeContractAsync: fundPool } = useScaffoldWriteContract({
    contractName: "InvoiceLendingPool",
  });

  const [invoiceTokenId, setInvoiceTokenId] = useState("");
  const [loanAmount, setLoanAmount] = useState("");
  const [fundingAmount, setFundingAmount] = useState("");

  const handleBorrow = async () => {
    if (!invoiceTokenId || !loanAmount) {
      notification.error("Please provide invoice token ID and loan amount");
      return;
    }

    try {
      // Parse token ID - handle both "INV-0000" format and plain numbers
      let tokenIdNumber;
      if (invoiceTokenId.startsWith("INV-")) {
        tokenIdNumber = parseInt(invoiceTokenId.replace("INV-", ""));
      } else {
        tokenIdNumber = parseInt(invoiceTokenId);
      }

      if (isNaN(tokenIdNumber)) {
        notification.error("Invalid invoice token ID format");
        return;
      }

      const tokenId = BigInt(tokenIdNumber);
      const amount = BigInt(loanAmount);

      await borrowAgainstInvoice({
        functionName: "borrowAgainstInvoice",
        args: [tokenId, amount],
      });

      notification.success("Loan created successfully!");
    } catch (error) {
      console.error("Error creating loan:", error);
      notification.error("Failed to create loan");
    }
  };

  const handleFundPool = async () => {
    if (!fundingAmount) {
      notification.error("Please provide funding amount");
      return;
    }

    try {
      const amount = BigInt(fundingAmount);

      await fundPool({
        functionName: "fundPool",
        args: [amount],
        value: amount, // Send the amount as value for MATIC
      });

      notification.success("Lending pool funded successfully!");
    } catch (error) {
      console.error("Error funding pool:", error);
      notification.error("Failed to fund lending pool");
    }
  };

  // const handleRepay = async () => {
  //   const loanId = 0; // This should be dynamic in a real implementation
  //   if (!loanId) {
  //     notification.error("Please provide loan ID to repay");
  //     return;
  //   }

  //   try {
  //     await lendingPoolWrite({
  //       functionName: "repayLoan",
  //       args: [BigInt(loanId)],
  //     });

  //     notification.success("Loan repaid successfully!");
  //   } catch (error) {
  //     console.error("Error repaying loan:", error);
  //     notification.error("Failed to repay loan");
  //   }
  // };

  // Get lending pool stats with direct reads
  const { data: poolBalance } = useScaffoldReadContract({
    contractName: "InvoiceLendingPool",
    functionName: "lendingPoolBalance",
  });

  const { data: activeLoans } = useScaffoldReadContract({
    contractName: "InvoiceLendingPool",
    functionName: "activeLoans",
  });

  const { data: totalBorrowed } = useScaffoldReadContract({
    contractName: "InvoiceLendingPool",
    functionName: "totalBorrowed",
  });

  return (
    <div className="flex flex-col min-h-screen bg-base-300">
      <div className="flex flex-col items-center justify-center flex-1 p-6 sm:p-10">
        <div className="w-full max-w-6xl bg-base-100 rounded-2xl shadow-xl p-8 sm:p-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-center mb-8 text-primary">InvoiceFlow Lending</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Stats Card */}
            <div className="card bg-base-200 shadow-lg lg:col-span-1">
              <div className="card-body">
                <h2 className="card-title text-2xl mb-4">Lending Pool Stats</h2>

                <div className="space-y-4">
                  <div className="bg-base-100 p-4 rounded-lg">
                    <div className="text-sm opacity-75">Pool Balance</div>
                    <div className="text-xl font-bold">{poolBalance ? Number(poolBalance) / 1e18 : 0} MATIC</div>
                  </div>

                  <div className="bg-base-100 p-4 rounded-lg">
                    <div className="text-sm opacity-75">Active Loans</div>
                    <div className="text-xl font-bold">{activeLoans ? Number(activeLoans) : 0}</div>
                  </div>

                  <div className="bg-base-100 p-4 rounded-lg">
                    <div className="text-sm opacity-75">Total Borrowed</div>
                    <div className="text-xl font-bold">{totalBorrowed ? Number(totalBorrowed) / 1e18 : 0} MATIC</div>
                  </div>

                  <div className="bg-base-100 p-4 rounded-lg">
                    <div className="text-sm opacity-75">APY</div>
                    <div className="text-xl font-bold">5-8%</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Connect Wallet Card */}
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

              {/* Borrow Card */}
              <div className="card bg-base-200 shadow-lg">
                <div className="card-body">
                  <h2 className="card-title text-2xl mb-4">Borrow Against Invoice</h2>
                  <div className="form-control mb-4">
                    <label className="label">
                      <span className="label-text">Invoice Token ID</span>
                    </label>
                    <input
                      type="text"
                      value={invoiceTokenId}
                      onChange={e => setInvoiceTokenId(e.target.value)}
                      className="input input-bordered"
                      placeholder="Token ID of your invoice NFT"
                      disabled={!connectedAddress}
                    />
                  </div>

                  <div className="form-control mb-4">
                    <label className="label">
                      <span className="label-text">Loan Amount (in wei)</span>
                    </label>
                    <input
                      type="text"
                      value={loanAmount}
                      onChange={e => setLoanAmount(e.target.value)}
                      className="input input-bordered"
                      placeholder="e.g., 500000000000000000 for 0.5 tokens"
                      disabled={!connectedAddress}
                    />
                  </div>

                  <button className="btn btn-primary" onClick={handleBorrow} disabled={!connectedAddress}>
                    Borrow Against Invoice
                  </button>
                </div>
              </div>

              {/* Fund Pool Card */}
              <div className="card bg-base-200 shadow-lg">
                <div className="card-body">
                  <h2 className="card-title text-2xl mb-4">Fund Lending Pool</h2>
                  <p className="mb-4 text-sm opacity-75">
                    Contribute to the lending pool and earn yield from borrower interest payments
                  </p>

                  <div className="form-control mb-4">
                    <label className="label">
                      <span className="label-text">Amount to Fund (in wei)</span>
                    </label>
                    <input
                      type="text"
                      value={fundingAmount}
                      onChange={e => setFundingAmount(e.target.value)}
                      className="input input-bordered"
                      placeholder="e.g., 1000000000000000000 for 1 token"
                      disabled={!connectedAddress}
                    />
                  </div>

                  <button className="btn btn-primary" onClick={handleFundPool} disabled={!connectedAddress}>
                    Fund Pool
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LendingPage;
