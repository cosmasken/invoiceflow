"use client";

import type { NextPage } from "next";
import { InvoiceDashboard } from "~~/components/InvoiceDashboard";

const InvoicesPage: NextPage = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-mono mb-2 uppercase tracking-wide">Invoice Dashboard</h1>
        <p className="text-muted-foreground font-sans">Manage your invoice NFTs and track their verification status</p>
      </div>

      <InvoiceDashboard />
    </div>
  );
};

export default InvoicesPage;
