import React from "react";
import Link from "next/link";
import { hardhat } from "viem/chains";
import { CurrencyDollarIcon, MagnifyingGlassIcon, GlobeAltIcon, DocumentTextIcon, CurrencyPoundIcon } from "@heroicons/react/24/outline";
import { HeartIcon } from "@heroicons/react/24/outline";
import { SwitchTheme } from "~~/components/SwitchTheme";
import { Faucet } from "~~/components/scaffold-eth";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";
import { useGlobalState } from "~~/services/store/store";

/**
 * Site footer with updated styling
 */
export const Footer = () => {
  const nativeCurrencyPrice = useGlobalState(state => state.nativeCurrency.price);
  const { targetNetwork } = useTargetNetwork();
  const isLocalNetwork = targetNetwork.id === hardhat.id;

  return (
    <footer className="bg-background border-t border-border/40 py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-6">
          <div>
            <h3 className="font-mono text-lg font-bold uppercase tracking-wide mb-4">InvoiceFlow</h3>
            <p className="text-sm text-muted-foreground font-sans">
              Transforming invoice financing with AI-powered verification and blockchain security.
            </p>
          </div>
          
          <div>
            <h4 className="font-mono text-sm font-bold uppercase tracking-wide mb-4">Product</h4>
            <ul className="space-y-2">
              <li><Link href="/invoice" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Create Invoice</Link></li>
              <li><Link href="/lending" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Lending</Link></li>
              <li><Link href="/invoices" className="text-sm text-muted-foreground hover:text-foreground transition-colors">My Invoices</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-mono text-sm font-bold uppercase tracking-wide mb-4">Resources</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Documentation</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">API</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Help Center</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-mono text-sm font-bold uppercase tracking-wide mb-4">Connect</h4>
            <ul className="space-y-2">
              <li><a href="https://github.com/scaffold-eth/se-2" target="_blank" rel="noreferrer" className="text-sm text-muted-foreground hover:text-foreground transition-colors">GitHub</a></li>
              <li><a href="https://t.me/joinchat/KByvmRe5wkR-8F_zz6AjpA" target="_blank" rel="noreferrer" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Support</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Discord</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-border/40 pt-6 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-4 mb-4 md:mb-0">
            <div className="flex gap-4">
              {nativeCurrencyPrice > 0 && (
                <div className="flex items-center gap-2 px-3 py-1 bg-primary/5 rounded-[2px] border border-primary/10">
                  <CurrencyDollarIcon className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">{nativeCurrencyPrice.toFixed(2)}</span>
                </div>
              )}
              {isLocalNetwork && (
                <>
                  <Faucet />
                  <Link href="/blockexplorer" className="flex items-center gap-2 px-3 py-1 bg-primary/5 rounded-[2px] border border-primary/10 hover:bg-primary/10 transition-colors">
                    <MagnifyingGlassIcon className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Block Explorer</span>
                  </Link>
                </>
              )}
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              Built with <HeartIcon className="inline-block h-4 w-4 text-red-500" /> by
              <a href="https://buidlguidl.com/" target="_blank" rel="noreferrer" className="font-medium hover:text-foreground transition-colors">
                BuidlGuidl
              </a>
            </div>
            <SwitchTheme className="justify-center" />
          </div>
        </div>
      </div>
    </footer>
  );
};
