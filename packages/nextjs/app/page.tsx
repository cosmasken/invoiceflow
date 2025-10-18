"use client";

import Link from "next/link";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { CurrencyDollarIcon, DocumentTextIcon, ShieldCheckIcon } from "@heroicons/react/24/outline";
import { Address } from "~~/components/scaffold-eth";

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Hero Section */}
        <div className="flex items-center flex-col pt-20 pb-16">
          <div className="px-5 max-w-4xl mx-auto text-center">
            <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
              InvoiceFlow AI
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Transform your unpaid invoices into instant financing with AI-powered verification and blockchain security
              on Polygon zkEVM
            </p>

            {connectedAddress ? (
              <div className="flex justify-center items-center space-x-2 flex-col mb-8">
                <p className="text-sm font-medium text-gray-500">Connected Wallet:</p>
                <Address address={connectedAddress} />
              </div>
            ) : (
              <p className="text-gray-500 mb-8">Connect your wallet to get started</p>
            )}

            <div className="flex gap-4 justify-center flex-wrap">
              <Link
                href="/invoice"
                className="btn btn-primary btn-lg px-8 py-3 text-white bg-blue-600 hover:bg-blue-700 border-none rounded-xl"
              >
                Create Invoice NFT
              </Link>
              <Link
                href="/lending"
                className="btn btn-outline btn-lg px-8 py-3 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl"
              >
                Explore Lending
              </Link>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-white py-16">
          <div className="max-w-6xl mx-auto px-8">
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">How InvoiceFlow Works</h2>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <DocumentTextIcon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-800">1. Upload & Verify</h3>
                <p className="text-gray-600">
                  Upload your invoice and let our AI verify authenticity with OCR and fraud detection
                </p>
              </div>

              <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200">
                <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShieldCheckIcon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-800">2. Mint NFT</h3>
                <p className="text-gray-600">
                  Convert your verified invoice into an NFT stored securely on Polygon zkEVM
                </p>
              </div>

              <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-green-50 to-green-100 border border-green-200">
                <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CurrencyDollarIcon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-800">3. Get Financing</h3>
                <p className="text-gray-600">
                  Use your invoice NFT as collateral to borrow funds instantly at competitive rates
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-16 text-white">
          <div className="max-w-4xl mx-auto px-8 text-center">
            <h2 className="text-3xl font-bold mb-12">Solving the $500B SMB Financing Gap</h2>

            <div className="grid md:grid-cols-3 gap-8">
              <div>
                <div className="text-4xl font-bold mb-2">80%</div>
                <div className="text-blue-100">Process Automation</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">3-5%</div>
                <div className="text-blue-100">Competitive Rates</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">Instant</div>
                <div className="text-blue-100">Financing Access</div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gray-50 py-16">
          <div className="max-w-4xl mx-auto px-8 text-center">
            <h2 className="text-3xl font-bold mb-6 text-gray-800">Ready to Transform Your Invoices?</h2>
            <p className="text-xl text-gray-600 mb-8">
              Join the future of invoice financing with AI and blockchain technology
            </p>

            <div className="flex gap-4 justify-center flex-wrap">
              <Link
                href="/invoice"
                className="btn btn-primary btn-lg px-8 py-3 text-white bg-blue-600 hover:bg-blue-700 border-none rounded-xl"
              >
                Start Now
              </Link>
              <Link
                href="/invoices"
                className="btn btn-outline btn-lg px-8 py-3 border-gray-400 text-gray-600 hover:bg-gray-600 hover:text-white rounded-xl"
              >
                View Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
