"use client";

import type { NextPage } from "next";
import { InvoiceForm } from "~~/components/InvoiceForm";

const InvoicePage: NextPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Create Invoice NFT
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Transform your invoice into a verified NFT using AI-powered verification on Polygon zkEVM
          </p>
        </div>

        <InvoiceForm />

        <div className="mt-12 max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">How It Works</h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-blue-600 font-bold">1</span>
                </div>
                <h3 className="font-semibold mb-2">Submit Invoice</h3>
                <p className="text-sm text-gray-600">Enter your invoice details and recipient information</p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-purple-600 font-bold">2</span>
                </div>
                <h3 className="font-semibold mb-2">AI Verification</h3>
                <p className="text-sm text-gray-600">Our AI analyzes and scores your invoice for authenticity</p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-green-600 font-bold">3</span>
                </div>
                <h3 className="font-semibold mb-2">Mint NFT</h3>
                <p className="text-sm text-gray-600">Convert verified invoice to NFT for lending and trading</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoicePage;
