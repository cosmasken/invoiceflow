"use client";

import type { NextPage } from "next";
import { InvoiceForm } from "~~/components/InvoiceForm";

const InvoicePage: NextPage = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-mono mb-2 uppercase tracking-wide">Create Invoice</h1>
        <p className="text-muted-foreground font-sans">Submit your invoice for AI verification and NFT minting</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <InvoiceForm />
        
        {/* AI Verification Panel */}
        <div className="bg-card rounded-[4px] border border-secondary/40 p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-primary/10 rounded-[2px] flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5 5 10 10 0 0 0 0-20z"/>
                <path d="M12 6v6l4 2"/>
              </svg>
            </div>
            <h2 className="text-xl font-mono uppercase text-sm tracking-wide">AI Verification</h2>
          </div>
          <p className="text-muted-foreground font-sans text-sm mb-6">Automated fraud detection and verification</p>
          
          <div className="py-12 text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-pulse">
                <path d="M15 13a3 3 0 1 0-6 0"/>
                <path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16"/>
                <path d="M12 4v1"/>
                <path d="M12 23v-1"/>
                <path d="M4 12h1"/>
                <path d="M23 12h-1"/>
                <path d="M18.6 18.6a9 9 0 0 1-12-12"/>
                <path d="M21 12a9 9 0 0 0-9-9"/>
                <path d="M3 12a9 9 0 0 0 9 9"/>
              </svg>
            </div>
            <p className="text-muted-foreground mb-4">
              Submit your invoice to start AI-powered analysis
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoicePage;
