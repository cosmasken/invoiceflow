"use client";

import type { NextPage } from "next";
import { InvoiceDashboard } from "~~/components/InvoiceDashboard";

const InvoicesPage: NextPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Invoice Dashboard
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Manage your invoice NFTs and track their verification status
          </p>
        </div>

        <InvoiceDashboard />
      </div>
    </div>
  );
};

export default InvoicesPage;
