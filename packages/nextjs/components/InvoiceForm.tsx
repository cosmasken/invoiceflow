"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { useVerifyInvoice } from "~~/hooks/useInvoiceQueries";
import { useInvoiceStore } from "~~/services/store/invoiceStore";
import { Input } from "~~/components/ui/input";
import { Label } from "~~/components/ui/label";
import { Textarea } from "~~/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~~/components/ui/card";
import { Button } from "~~/components/ui/button";
import { FileText, Upload } from "lucide-react";

export const InvoiceForm = () => {
  const { address } = useAccount();
  const { isLoading, error } = useInvoiceStore();
  const verifyInvoiceMutation = useVerifyInvoice();

  const [formData, setFormData] = useState({
    amount: "",
    dueDate: "",
    issuer: "",
    recipient: "",
    description: ""
  });
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!address) {
      alert("Please connect your wallet first");
      return;
    }

    const invoiceData = {
      ...formData,
      amount: parseFloat(formData.amount),
      issuerAddress: address,
      status: "pending" as const,
    };

    verifyInvoiceMutation.mutate(invoiceData);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  return (
    <Card>
      <form onSubmit={handleSubmit}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Invoice Details
        </CardTitle>
        <CardDescription>Enter the invoice information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-md text-destructive text-sm">
            {error}
          </div>
        )}
        
        <div className="space-y-2">
          <Label htmlFor="amount">Amount ($) *</Label>
          <Input
            id="amount"
            name="amount"
            type="number"
            placeholder="10000"
            value={formData.amount}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="dueDate">Due Date *</Label>
          <Input
            id="dueDate"
            name="dueDate"
            type="date"
            value={formData.dueDate}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="issuer">Issuer *</Label>
          <Input
            id="issuer"
            name="issuer"
            placeholder="Company Name"
            value={formData.issuer}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="recipient">Recipient *</Label>
          <Input
            id="recipient"
            name="recipient"
            placeholder="Recipient Name"
            value={formData.recipient}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            placeholder="Brief description of services/products"
            value={formData.description}
            onChange={handleInputChange}
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="file">Upload Invoice (PDF/Image)</Label>
          <div className="relative">
            <Input
              id="file"
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={handleFileChange}
              className="cursor-pointer"
            />
            {file && (
              <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                <Upload className="w-4 h-4" />
                <span>{file.name}</span>
              </div>
            )}
          </div>
        </div>

        <Button 
          type="submit" 
          disabled={isLoading || !address}
          className="w-full"
          size="lg"
        >
          {isLoading ? "Verifying..." : "Verify & Mint"}
        </Button>
        
        {!address && (
          <div className="p-3 bg-warning/10 border border-warning/30 rounded-md text-warning text-sm">
            Please connect your wallet to create invoices
          </div>
        )}
      </CardContent>
      </form>
    </Card>
  );
};
