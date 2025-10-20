"use client";

import Link from "next/link";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { FileText, TrendingUp, Shield, Zap } from "lucide-react";
import { Button } from "~~/components/ui/button";
import { Card, CardContent } from "~~/components/ui/card";
import { Address } from "~~/components/scaffold-eth";

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-mono mb-6 uppercase tracking-wide animate-curl">
            InvoiceFlow AI
          </h1>
          <p className="text-xl md:text-2xl font-sans font-light text-muted-foreground mb-8 animate-fold">
            Unlock liquidity from your invoices with AI-powered verification and blockchain security
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fold">
            <Button asChild size="lg" className="text-lg px-8">
              <Link href="/invoice">Create Invoice</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-lg px-8">
              <Link href="/lending">Lending Dashboard</Link>
            </Button>
          </div>
          
          {connectedAddress && (
            <div className="mt-6 flex justify-center items-center space-x-2 flex-col">
              <p className="text-sm font-medium text-muted-foreground">Connected Wallet:</p>
              <Address address={connectedAddress} />
            </div>
          )}
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="transition-all hover:scale-[1.02] hover:shadow-emboss">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-primary/10 rounded-[2px] flex items-center justify-center mb-4 border border-primary/20">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-mono mb-2 uppercase text-sm tracking-wide">Smart Invoice NFTs</h3>
              <p className="text-muted-foreground font-sans font-light text-sm">
                Convert invoices into tradeable NFTs secured on Polygon blockchain
              </p>
            </CardContent>
          </Card>

          <Card className="transition-all hover:scale-[1.02] hover:shadow-emboss">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-secondary/10 rounded-[2px] flex items-center justify-center mb-4 border border-secondary/20">
                <Shield className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="text-xl font-mono mb-2 uppercase text-sm tracking-wide">AI Verification</h3>
              <p className="text-muted-foreground font-sans font-light text-sm">
                Advanced fraud detection and company verification with 95%+ accuracy
              </p>
            </CardContent>
          </Card>

          <Card className="transition-all hover:scale-[1.02] hover:shadow-emboss">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-accent/10 rounded-[2px] flex items-center justify-center mb-4 border border-accent/20">
                <TrendingUp className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-mono mb-2 uppercase text-sm tracking-wide">Instant Liquidity</h3>
              <p className="text-muted-foreground font-sans font-light text-sm">
                Borrow up to 80% of invoice value with competitive rates
              </p>
            </CardContent>
          </Card>

          <Card className="transition-all hover:scale-[1.02] hover:shadow-emboss">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-primary/10 rounded-[2px] flex items-center justify-center mb-4 border border-primary/20">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-mono mb-2 uppercase text-sm tracking-wide">Earn Yield</h3>
              <p className="text-muted-foreground font-sans font-light text-sm">
                Provide liquidity to earn up to 6.2% APY on your capital
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-mono text-center mb-12 uppercase tracking-wide">How It Works</h2>
          
          <div className="space-y-8">
            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-primary text-primary-foreground rounded-[2px] flex items-center justify-center font-mono font-bold text-xl border-2 border-dashed border-primary/30">
                1
              </div>
              <div>
                <h3 className="text-xl font-mono mb-2 uppercase text-sm tracking-wide">Submit Invoice</h3>
                <p className="text-muted-foreground font-sans font-light">
                  Upload your invoice details and supporting documents for AI-powered verification
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-secondary text-secondary-foreground rounded-[2px] flex items-center justify-center font-mono font-bold text-xl border-2 border-dashed border-secondary/30">
                2
              </div>
              <div>
                <h3 className="text-xl font-mono mb-2 uppercase text-sm tracking-wide">AI Verification</h3>
                <p className="text-muted-foreground font-sans font-light">
                  Our AI analyzes your invoice for fraud detection, OCR processing, and company verification
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-accent text-accent-foreground rounded-[2px] flex items-center justify-center font-mono font-bold text-xl border-2 border-dashed border-accent/30">
                3
              </div>
              <div>
                <h3 className="text-xl font-mono mb-2 uppercase text-sm tracking-wide">Mint NFT</h3>
                <p className="text-muted-foreground font-sans font-light">
                  Verified invoices are minted as NFTs on Polygon, creating a permanent record
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-primary text-primary-foreground rounded-[2px] flex items-center justify-center font-mono font-bold text-xl border-2 border-dashed border-primary/30">
                4
              </div>
              <div>
                <h3 className="text-xl font-mono mb-2 uppercase text-sm tracking-wide">Access Liquidity</h3>
                <p className="text-muted-foreground font-sans font-light">
                  Borrow against your invoice NFTs or earn yield by providing liquidity to the pool
                </p>
              </div>
            </div>
          </div>

          <div className="mt-12 text-center">
            <Button asChild size="lg" className="text-lg px-8">
              <Link href="/invoice">Get Started Now</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="bg-card rounded-[4px] shadow-inset p-8 md:p-12 border border-secondary/40 ledger-lines">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl md:text-5xl font-mono mb-2 text-primary">$2.5M+</div>
              <div className="text-muted-foreground font-sans text-sm uppercase tracking-wide">Total Pool Value</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-mono mb-2 text-primary">47</div>
              <div className="text-muted-foreground font-sans text-sm uppercase tracking-wide">Active Loans</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-mono mb-2 text-primary">6.2%</div>
              <div className="text-muted-foreground font-sans text-sm uppercase tracking-wide">Average APY</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
