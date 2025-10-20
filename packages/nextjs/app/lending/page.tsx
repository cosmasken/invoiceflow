"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { Button } from "~~/components/ui/button";
import { Input } from "~~/components/ui/input";
import { Label } from "~~/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~~/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~~/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~~/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~~/components/ui/tabs";
import { Progress } from "~~/components/ui/progress";
import { Wallet, TrendingUp, DollarSign, Activity, Calculator, PieChart, Layers } from "lucide-react";
import { ProfileSwitcher } from "~~/components/ProfileSwitcher";

// Define types for our invoices, loans, and fraction ownership
type Invoice = {
  id: string;
  amount: number;
  verified: boolean;
  dueDate: string;
  issuer: string;
  recipient: string;
  description: string;
  fractionalized: boolean;
  totalFractions: number;
  availableFractions: number;
  pricePerFraction: number;
};

type Loan = {
  id: number;
  invoiceId: string;
  amount: number;
  rate: number;
  dueDate: string;
  status: 'Active' | 'Repaid';
  monthlyPayment: number;
};

type FractionOwnership = {
  invoiceId: string;
  fractionsOwned: number;
  totalInvested: number;
  currentValue: number;
  returnRate: number;
};

const mockInvoices: Invoice[] = [
  {
    id: 'INV-0001',
    amount: 10000,
    verified: true,
    dueDate: '2024-12-15',
    issuer: 'Acme Corp',
    recipient: 'Tech Solutions Inc',
    description: 'Q4 Software Development Services',
    fractionalized: true,
    totalFractions: 100,
    availableFractions: 35,
    pricePerFraction: 100
  },
  {
    id: 'INV-0002',
    amount: 15000,
    verified: true,
    dueDate: '2024-12-30',
    issuer: 'Global Industries',
    recipient: 'Manufacturing LLC',
    description: 'Equipment Maintenance Contract',
    fractionalized: true,
    totalFractions: 150,
    availableFractions: 80,
    pricePerFraction: 100
  },
  {
    id: 'INV-0003',
    amount: 8500,
    verified: true,
    dueDate: '2025-01-10',
    issuer: 'Digital Agency',
    recipient: 'Marketing Partners',
    description: 'Social Media Campaign Services',
    fractionalized: false,
    totalFractions: 0,
    availableFractions: 0,
    pricePerFraction: 0
  }
];

const mockLoans: Loan[] = [
  {
    id: 1,
    invoiceId: 'INV-0001',
    amount: 8000,
    rate: 5.5,
    dueDate: '2024-12-01',
    status: 'Active',
    monthlyPayment: 680
  },
  {
    id: 2,
    invoiceId: 'INV-0003',
    amount: 6800,
    rate: 5.8,
    dueDate: '2024-12-20',
    status: 'Active',
    monthlyPayment: 585
  }
];

const mockFractionOwnerships: FractionOwnership[] = [
  {
    invoiceId: 'INV-0001',
    fractionsOwned: 25,
    totalInvested: 2500,
    currentValue: 2575,
    returnRate: 3.0
  },
  {
    invoiceId: 'INV-0002',
    fractionsOwned: 40,
    totalInvested: 4000,
    currentValue: 4180,
    returnRate: 4.5
  }
];

const mockPoolStats = {
  totalBalance: 2500000,
  activeLoans: 47,
  averageAPY: 6.2,
  yourContribution: 0
};

const LendingPage = () => {
  const { address } = useAccount();
  const [userProfile, setUserProfile] = useState<'seller' | 'buyer'>('seller');
  const [selectedInvoice, setSelectedInvoice] = useState<string>("");
  const [borrowAmount, setBorrowAmount] = useState<string>("");
  const [buyInvoiceId, setBuyInvoiceId] = useState<string>("");
  const [buyFractionAmount, setBuyFractionAmount] = useState<string>("");
  const [fractionalizeId, setFractionalizeId] = useState<string>("");
  const [totalFractions, setTotalFractions] = useState<string>("100");

  const selectedInvoiceData = mockInvoices.find(inv => inv.id === selectedInvoice);
  const buyInvoiceData = mockInvoices.find(inv => inv.id === buyInvoiceId);
  const fractionalizeInvoiceData = mockInvoices.find(inv => inv.id === fractionalizeId);
  
  const maxLoanAmount = selectedInvoiceData ? selectedInvoiceData.amount * 0.8 : 0;
  const interestRate = 5.5;
  const monthlyPayment = borrowAmount 
    ? (parseFloat(borrowAmount) * (1 + interestRate / 100 / 12)).toFixed(2)
    : "0";

  const fractionCost = buyInvoiceData && buyFractionAmount
    ? (parseInt(buyFractionAmount) * buyInvoiceData.pricePerFraction).toFixed(2)
    : "0";

  // Seller View
  const renderSellerView = () => (
    <>
      <Tabs defaultValue="fractionalize" className="mb-8">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="fractionalize">Fractionalize</TabsTrigger>
          <TabsTrigger value="borrow">Borrow</TabsTrigger>
        </TabsList>

        <TabsContent value="fractionalize" className="mt-6">
          <Card className="max-w-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="w-5 h-5" />
                Fractionalize Invoice
              </CardTitle>
              <CardDescription>Split your invoice into tradeable fractions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fractionalize-select">Select Invoice</Label>
                <Select value={fractionalizeId} onValueChange={setFractionalizeId}>
                  <SelectTrigger id="fractionalize-select">
                    <SelectValue placeholder="Choose an invoice..." />
                  </SelectTrigger>
                  <SelectContent>
                    {mockInvoices.filter(inv => !inv.fractionalized).map(inv => (
                      <SelectItem key={inv.id} value={inv.id}>
                        {inv.id} - ${inv.amount.toLocaleString()} ({inv.issuer})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {fractionalizeInvoiceData && (
                <div className="bg-muted p-4 rounded-lg space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Invoice Value</span>
                    <span className="font-medium">${fractionalizeInvoiceData.amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Due Date</span>
                    <span className="font-medium">{fractionalizeInvoiceData.dueDate}</span>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="total-fractions">Number of Fractions (10-1000)</Label>
                <Input
                  id="total-fractions"
                  type="number"
                  placeholder="100"
                  value={totalFractions}
                  onChange={(e) => setTotalFractions(e.target.value)}
                  min={10}
                  max={1000}
                />
                {fractionalizeInvoiceData && totalFractions && (
                  <p className="text-sm text-muted-foreground">
                    Price per fraction: ${Math.round(fractionalizeInvoiceData.amount / parseInt(totalFractions))}
                  </p>
                )}
              </div>

              <Button className="w-full" size="lg">
                Fractionalize Invoice
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="borrow" className="mt-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Borrow Against Fractions</CardTitle>
                <CardDescription>Use fractionalized invoices as collateral</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="invoice-select">Select Invoice</Label>
                  <Select value={selectedInvoice} onValueChange={setSelectedInvoice}>
                    <SelectTrigger id="invoice-select">
                      <SelectValue placeholder="Choose an invoice..." />
                    </SelectTrigger>
                    <SelectContent>
                      {mockInvoices.filter(inv => inv.fractionalized).map(inv => (
                        <SelectItem key={inv.id} value={inv.id}>
                          {inv.id} - ${inv.amount.toLocaleString()} ({inv.totalFractions - inv.availableFractions}/{inv.totalFractions} sold)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedInvoiceData && (
                  <div className="bg-muted p-4 rounded-lg space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Invoice Value</span>
                      <span className="font-medium">${selectedInvoiceData.amount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Fractions Sold</span>
                      <span className="font-medium">
                        {selectedInvoiceData.totalFractions - selectedInvoiceData.availableFractions} / {selectedInvoiceData.totalFractions}
                      </span>
                    </div>
                    <Progress 
                      value={((selectedInvoiceData.totalFractions - selectedInvoiceData.availableFractions) / selectedInvoiceData.totalFractions) * 100}
                      className="mt-2"
                    />
                    <div className="flex justify-between text-sm pt-2">
                      <span className="text-muted-foreground">Max Loan (80% LTV)</span>
                      <span className="font-bold text-primary">${maxLoanAmount.toLocaleString()}</span>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="borrow-amount">Loan Amount ($)</Label>
                  <Input
                    id="borrow-amount"
                    type="number"
                    placeholder="8000"
                    value={borrowAmount}
                    onChange={(e) => setBorrowAmount(e.target.value)}
                    max={maxLoanAmount}
                  />
                </div>

                <Button className="w-full" size="lg">
                  Request Loan
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="w-5 h-5" />
                  Loan Calculator
                </CardTitle>
                <CardDescription>Estimated loan terms</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {borrowAmount && selectedInvoiceData ? (
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Loan Amount</span>
                      <span className="font-bold">${parseFloat(borrowAmount).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Interest Rate</span>
                      <span className="font-bold text-primary">{interestRate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Monthly Payment</span>
                      <span className="font-bold">${parseFloat(monthlyPayment).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t">
                      <span className="text-sm text-muted-foreground">Total Repayment</span>
                      <span className="font-bold text-lg">
                        ${(parseFloat(borrowAmount) * (1 + interestRate / 100)).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="py-12 text-center">
                    <Calculator className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">
                      Select invoice and enter amount
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Your Active Loans</CardTitle>
          <CardDescription>Manage borrowed positions</CardDescription>
        </CardHeader>
        <CardContent>
          {mockLoans.filter(l => l.status === 'Active').length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Loan ID</TableHead>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Rate</TableHead>
                  <TableHead>Monthly</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockLoans.filter(l => l.status === 'Active').map(loan => (
                  <TableRow key={loan.id}>
                    <TableCell className="font-mono">#{loan.id}</TableCell>
                    <TableCell className="font-mono">{loan.invoiceId}</TableCell>
                    <TableCell className="font-medium">${loan.amount.toLocaleString()}</TableCell>
                    <TableCell>{loan.rate}%</TableCell>
                    <TableCell>${loan.monthlyPayment.toLocaleString()}</TableCell>
                    <TableCell>{loan.dueDate}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                        Active
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline">
                        Repay
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">No active loans</p>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );

  // Buyer View
  const renderBuyerView = () => (
    <>
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              Buy Invoice Fractions
            </CardTitle>
            <CardDescription>Invest in fractionalized invoices</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="buy-invoice-select">Select Invoice</Label>
              <Select value={buyInvoiceId} onValueChange={setBuyInvoiceId}>
                <SelectTrigger id="buy-invoice-select">
                  <SelectValue placeholder="Choose an invoice..." />
                </SelectTrigger>
                <SelectContent>
                  {mockInvoices.filter(inv => inv.fractionalized && inv.availableFractions > 0).map(inv => (
                    <SelectItem key={inv.id} value={inv.id}>
                      {inv.id} - {inv.availableFractions}/{inv.totalFractions} available @ ${inv.pricePerFraction}/fraction
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {buyInvoiceData && (
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Invoice Value</span>
                  <span className="font-medium">${buyInvoiceData.amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Price per Fraction</span>
                  <span className="font-medium">${buyInvoiceData.pricePerFraction}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Available</span>
                  <span className="font-medium">{buyInvoiceData.availableFractions} / {buyInvoiceData.totalFractions}</span>
                </div>
                <Progress 
                  value={(buyInvoiceData.availableFractions / buyInvoiceData.totalFractions) * 100}
                  className="mt-2"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="buy-fraction-amount">Number of Fractions</Label>
              <Input
                id="buy-fraction-amount"
                type="number"
                placeholder="10"
                value={buyFractionAmount}
                onChange={(e) => setBuyFractionAmount(e.target.value)}
                max={buyInvoiceData?.availableFractions || 0}
              />
              {buyInvoiceData && buyFractionAmount && (
                <p className="text-sm text-muted-foreground">
                  Total cost: ${fractionCost}
                </p>
              )}
            </div>

            <Button className="w-full" size="lg">
              Buy Fractions
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Available Invoices</CardTitle>
            <CardDescription>Browse fractionalized opportunities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockInvoices.filter(inv => inv.fractionalized && inv.availableFractions > 0).map(inv => (
                <div key={inv.id} className="border rounded-lg p-3 hover:bg-muted/50 transition-base cursor-pointer"
                     onClick={() => setBuyInvoiceId(inv.id)}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-mono font-medium">{inv.id}</p>
                      <p className="text-sm text-muted-foreground">{inv.issuer}</p>
                    </div>
                    <span className="text-lg font-bold">${inv.amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground mb-2">
                    <span>{inv.availableFractions}/{inv.totalFractions} fractions</span>
                    <span>Due: {inv.dueDate}</span>
                  </div>
                  <Progress value={(1 - inv.availableFractions / inv.totalFractions) * 100} className="h-1" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Fraction Portfolio</CardTitle>
          <CardDescription>Track your invoice investments</CardDescription>
        </CardHeader>
        <CardContent>
          {mockFractionOwnerships.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice ID</TableHead>
                  <TableHead>Fractions Owned</TableHead>
                  <TableHead>Invested</TableHead>
                  <TableHead>Current Value</TableHead>
                  <TableHead>Return</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockFractionOwnerships.map(fo => {
                  const invoice = mockInvoices.find(inv => inv.id === fo.invoiceId);
                  return (
                    <TableRow key={fo.invoiceId}>
                      <TableCell className="font-mono">{fo.invoiceId}</TableCell>
                      <TableCell>
                        {fo.fractionsOwned} / {invoice?.totalFractions || 0}
                        <span className="text-xs text-muted-foreground ml-1">
                          ({((fo.fractionsOwned / (invoice?.totalFractions || 1)) * 100).toFixed(1)}%)
                        </span>
                      </TableCell>
                      <TableCell className="font-medium">${fo.totalInvested.toLocaleString()}</TableCell>
                      <TableCell className="font-medium">${fo.currentValue.toLocaleString()}</TableCell>
                      <TableCell>
                        <span className="text-accent font-medium">+{fo.returnRate.toFixed(1)}%</span>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent/10 text-accent">
                          Active
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="py-12 text-center">
              <PieChart className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No fraction holdings yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-mono mb-2 uppercase tracking-wide">Lending Dashboard</h1>
        <p className="text-muted-foreground font-sans">
          {userProfile === 'seller' 
            ? 'Fractionalize invoices and borrow against them' 
            : 'Buy invoice fractions and earn returns'}
        </p>
      </div>

      <ProfileSwitcher />

      {/* Pool Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Pool Balance</p>
                <p className="text-2xl font-bold">${(mockPoolStats.totalBalance / 1000000).toFixed(1)}M</p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Wallet className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Active Loans</p>
                <p className="text-2xl font-bold">{mockPoolStats.activeLoans}</p>
              </div>
              <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center">
                <Activity className="w-6 h-6 text-secondary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Average APY</p>
                <p className="text-2xl font-bold">{mockPoolStats.averageAPY}%</p>
              </div>
              <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Your Contribution</p>
                <p className="text-2xl font-bold">${mockPoolStats.yourContribution.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {userProfile === 'seller' ? renderSellerView() : renderBuyerView()}
    </div>
  );
};

export default LendingPage;
