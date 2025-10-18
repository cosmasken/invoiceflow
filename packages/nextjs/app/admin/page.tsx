"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { Address } from "~~/components/scaffold-eth";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

const AdminPanel = () => {
  const { address: connectedAddress } = useAccount();
  const [newOwner, setNewOwner] = useState("");
  const [verificationAgent, setVerificationAgent] = useState("");
  const [lockerAddress, setLockerAddress] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(true);
  const [newLTV, setNewLTV] = useState("");
  const [newInterestRate, setNewInterestRate] = useState("");

  const { writeContractAsync: transferOwnership } = useScaffoldWriteContract("InvoiceNFT");
  const { writeContractAsync: addVerificationAgent } = useScaffoldWriteContract("InvoiceVerification");
  const { writeContractAsync: removeVerificationAgent } = useScaffoldWriteContract("InvoiceVerification");
  const { writeContractAsync: authorizeLocker } = useScaffoldWriteContract("InvoiceNFT");
  const { writeContractAsync: updateLTV } = useScaffoldWriteContract("InvoiceLendingPool");
  const { writeContractAsync: updateInterestRate } = useScaffoldWriteContract("InvoiceLendingPool");

  const { data: invoiceNFTOwner } = useScaffoldReadContract({
    contractName: "InvoiceNFT",
    functionName: "owner",
  });

  const { data: baseLTV } = useScaffoldReadContract({
    contractName: "InvoiceLendingPool",
    functionName: "baseLTV",
  });

  const { data: baseInterestRate } = useScaffoldReadContract({
    contractName: "InvoiceLendingPool",
    functionName: "baseInterestRate",
  });

  const isAdmin = connectedAddress === invoiceNFTOwner;

  const handleTransferOwnership = async () => {
    if (!newOwner) {
      notification.error("Please enter a new owner address");
      return;
    }

    try {
      await transferOwnership({
        functionName: "transferOwnership",
        args: [newOwner],
      });

      notification.success("Ownership transferred successfully!");
      setNewOwner("");
    } catch (error) {
      console.error("Error transferring ownership:", error);
      notification.error("Failed to transfer ownership");
    }
  };

  const handleAddVerificationAgent = async () => {
    if (!verificationAgent) {
      notification.error("Please enter a verification agent address");
      return;
    }

    try {
      await addVerificationAgent({
        functionName: "addVerificationAgent",
        args: [verificationAgent],
      });

      notification.success("Verification agent added successfully!");
      setVerificationAgent("");
    } catch (error) {
      console.error("Error adding verification agent:", error);
      notification.error("Failed to add verification agent");
    }
  };

  const handleRemoveVerificationAgent = async () => {
    if (!verificationAgent) {
      notification.error("Please enter a verification agent address");
      return;
    }

    try {
      await removeVerificationAgent({
        functionName: "removeVerificationAgent",
        args: [verificationAgent],
      });

      notification.success("Verification agent removed successfully!");
      setVerificationAgent("");
    } catch (error) {
      console.error("Error removing verification agent:", error);
      notification.error("Failed to remove verification agent");
    }
  };

  const handleAuthorizeLocker = async () => {
    if (!lockerAddress) {
      notification.error("Please enter a locker address");
      return;
    }

    try {
      await authorizeLocker({
        functionName: "authorizeLocker",
        args: [lockerAddress, isAuthorized],
      });

      notification.success(`Locker ${isAuthorized ? "authorized" : "unauthorized"} successfully!`);
      setLockerAddress("");
    } catch (error) {
      console.error("Error authorizing locker:", error);
      notification.error(`Failed to ${isAuthorized ? "authorize" : "unauthorize"} locker`);
    }
  };

  const handleUpdateLTV = async () => {
    if (!newLTV) {
      notification.error("Please enter a new LTV value");
      return;
    }

    const ltvValue = parseInt(newLTV);
    if (isNaN(ltvValue) || ltvValue < 0 || ltvValue > 10000) {
      notification.error("LTV must be between 0 and 10000 (basis points)");
      return;
    }

    try {
      await updateLTV({
        functionName: "updateLTV",
        args: [BigInt(ltvValue)],
      });

      notification.success("LTV updated successfully!");
      setNewLTV("");
    } catch (error) {
      console.error("Error updating LTV:", error);
      notification.error("Failed to update LTV");
    }
  };

  const handleUpdateInterestRate = async () => {
    if (!newInterestRate) {
      notification.error("Please enter a new interest rate");
      return;
    }

    const rateValue = parseInt(newInterestRate);
    if (isNaN(rateValue) || rateValue < 0 || rateValue > 10000) {
      notification.error("Interest rate must be between 0 and 10000 (basis points)");
      return;
    }

    try {
      await updateInterestRate({
        functionName: "updateInterestRate",
        args: [BigInt(rateValue)],
      });

      notification.success("Interest rate updated successfully!");
      setNewInterestRate("");
    } catch (error) {
      console.error("Error updating interest rate:", error);
      notification.error("Failed to update interest rate");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-base-300">
      <div className="flex flex-col items-center justify-center flex-1 p-6 sm:p-10">
        <div className="w-full max-w-4xl bg-base-100 rounded-2xl shadow-xl p-8 sm:p-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-center mb-8 text-primary">InvoiceFlow Admin Panel</h1>

          {!isAdmin ? (
            <div className="alert alert-warning shadow-lg mb-8">
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
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <span>You are not the contract owner. Only the owner can access admin functions.</span>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Contract Ownership */}
              <div className="card bg-base-200 shadow-lg">
                <div className="card-body">
                  <h2 className="card-title text-2xl mb-4">Contract Ownership</h2>
                  <div className="form-control mb-4">
                    <label className="label">
                      <span className="label-text">Current Owner</span>
                    </label>
                    <div className="bg-base-100 p-3 rounded-lg">
                      <Address address={invoiceNFTOwner || ""} />
                    </div>
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Transfer Ownership</span>
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={newOwner}
                        onChange={e => setNewOwner(e.target.value)}
                        className="input input-bordered flex-1"
                        placeholder="New owner address"
                      />
                      <button className="btn btn-primary" onClick={handleTransferOwnership} disabled={!newOwner}>
                        Transfer
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Verification Agents */}
              <div className="card bg-base-200 shadow-lg">
                <div className="card-body">
                  <h2 className="card-title text-2xl mb-4">Verification Agents</h2>
                  <div className="form-control mb-4">
                    <label className="label">
                      <span className="label-text">Add/Remove Verification Agent</span>
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={verificationAgent}
                        onChange={e => setVerificationAgent(e.target.value)}
                        className="input input-bordered flex-1"
                        placeholder="Agent address"
                      />
                      <button
                        className="btn btn-primary"
                        onClick={handleAddVerificationAgent}
                        disabled={!verificationAgent}
                      >
                        Add
                      </button>
                      <button
                        className="btn btn-secondary"
                        onClick={handleRemoveVerificationAgent}
                        disabled={!verificationAgent}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Authorized Lockers */}
              <div className="card bg-base-200 shadow-lg">
                <div className="card-body">
                  <h2 className="card-title text-2xl mb-4">Authorized Lockers</h2>
                  <div className="form-control mb-4">
                    <label className="label">
                      <span className="label-text">Authorize/Unauthorize Locker</span>
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={lockerAddress}
                        onChange={e => setLockerAddress(e.target.value)}
                        className="input input-bordered flex-1"
                        placeholder="Locker address"
                      />
                      <select
                        className="select select-bordered"
                        value={isAuthorized ? "authorize" : "unauthorize"}
                        onChange={e => setIsAuthorized(e.target.value === "authorize")}
                      >
                        <option value="authorize">Authorize</option>
                        <option value="unauthorize">Unauthorize</option>
                      </select>
                      <button className="btn btn-primary" onClick={handleAuthorizeLocker} disabled={!lockerAddress}>
                        Update
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Lending Parameters */}
              <div className="card bg-base-200 shadow-lg">
                <div className="card-body">
                  <h2 className="card-title text-2xl mb-4">Lending Parameters</h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">
                          Base LTV ({baseLTV ? (Number(baseLTV) / 100).toFixed(2) : 0}%)
                        </span>
                      </label>
                      <div className="flex space-x-2">
                        <input
                          type="number"
                          min="0"
                          max="10000"
                          value={newLTV}
                          onChange={e => setNewLTV(e.target.value)}
                          className="input input-bordered flex-1"
                          placeholder="New LTV (basis points)"
                        />
                        <button className="btn btn-primary" onClick={handleUpdateLTV} disabled={!newLTV}>
                          Update
                        </button>
                      </div>
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">
                          Base Interest Rate ({baseInterestRate ? (Number(baseInterestRate) / 100).toFixed(2) : 0}%)
                        </span>
                      </label>
                      <div className="flex space-x-2">
                        <input
                          type="number"
                          min="0"
                          max="10000"
                          value={newInterestRate}
                          onChange={e => setNewInterestRate(e.target.value)}
                          className="input input-bordered flex-1"
                          placeholder="New interest rate (basis points)"
                        />
                        <button
                          className="btn btn-primary"
                          onClick={handleUpdateInterestRate}
                          disabled={!newInterestRate}
                        >
                          Update
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
