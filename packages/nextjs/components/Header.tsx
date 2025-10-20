"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { hardhat } from "viem/chains";
import {
  Bars3Icon,
  BugAntIcon,
  Cog6ToothIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  RectangleStackIcon,
  BriefcaseIcon,
  ShoppingCartIcon
} from "@heroicons/react/24/outline";
import { FaucetButton, RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";
import { useAccount } from "wagmi";
import { useOutsideClick, useTargetNetwork } from "~~/hooks/scaffold-eth";
import { useUserProfileStore, UserProfile } from "~~/services/store/userProfileStore";
import { Button } from "~~/components/ui/button";

type HeaderMenuLink = {
  label: string;
  href: string;
  icon?: React.ReactNode;
  requiresAuth?: boolean;
  userTypes?: UserProfile[];
};

export const menuLinks: HeaderMenuLink[] = [
  {
    label: "Home",
    href: "/",
  },
  {
    label: "Create Invoice",
    href: "/invoice",
    icon: <DocumentTextIcon className="h-4 w-4" />,
    requiresAuth: true,
  },
  {
    label: "My Invoices",
    href: "/invoices",
    icon: <RectangleStackIcon className="h-4 w-4" />,
    requiresAuth: true,
  },
  {
    label: "Lending",
    href: "/lending",
    icon: <CurrencyDollarIcon className="h-4 w-4" />,
    requiresAuth: true,
    userTypes: ["seller", "buyer"],
  },
  {
    label: "Debug",
    href: "/debug",
    icon: <BugAntIcon className="h-4 w-4" />,
    requiresAuth: false,
  },
  {
    label: "Admin",
    href: "/admin",
    icon: <Cog6ToothIcon className="h-4 w-4" />,
    requiresAuth: true,
    userTypes: ["seller"], // Only available for sellers
  },
];

export const HeaderMenuLinks = ({ connected }: { connected: boolean }) => {
  const pathname = usePathname();
  const { userProfile } = useUserProfileStore();

  return (
    <>
      {menuLinks
        .filter(link => {
          // If the link requires auth and user is not connected, hide it
          if (link.requiresAuth && !connected) return false;
          // If the link has user type restrictions, check if current user type is allowed
          if (link.userTypes && !link.userTypes.includes(userProfile)) return false;
          return true;
        })
        .map(({ label, href, icon }) => {
          const isActive = pathname === href;
          return (
            <li key={href}>
              <Link
                href={href}
                passHref
                className={`${isActive
                  ? "bg-primary text-primary-foreground border-primary/30"
                  : "text-foreground/70 hover:text-foreground hover:bg-primary/10"
                  } transition-all duration-200 py-2 px-4 text-sm rounded-[2px] gap-2 flex items-center border border-transparent hover:border-primary/30 font-mono uppercase tracking-wide`}
              >
                {icon}
                <span className="font-medium">{label}</span>
              </Link>
            </li>
          );
        })}
    </>
  );
};

/**
 * Site header with responsive navigation based on auth state and user type
 */
export const Header = () => {
  const { targetNetwork } = useTargetNetwork();
  const isLocalNetwork = targetNetwork.id === hardhat.id;
  const { userProfile, setUserProfile } = useUserProfileStore();
  const { address: connectedAddress } = useAccount();
  const isConnected = !!connectedAddress;

  const burgerMenuRef = useRef<HTMLDetailsElement>(null);
  useOutsideClick(burgerMenuRef, () => {
    burgerMenuRef?.current?.removeAttribute("open");
  });

  return (
    <div className="sticky lg:static top-0 bg-background/95 backdrop-blur-sm min-h-0 shrink-0 justify-between z-20 border-b border-border/40 px-4 py-3">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-8">
          {/* Mobile menu button */}
          <details className="dropdown lg:hidden" ref={burgerMenuRef}>
            <summary className="btn btn-ghost hover:bg-primary/10 text-foreground/70 hover:text-foreground">
              <Bars3Icon className="h-6 w-6" />
            </summary>
            <ul
              className="menu menu-compact dropdown-content mt-3 p-2 shadow-lg bg-background rounded-[4px] w-56 border border-border/40"
              onClick={() => {
                burgerMenuRef?.current?.removeAttribute("open");
              }}
            >
              <HeaderMenuLinks connected={isConnected} />
            </ul>
          </details>

          {/* Logo */}
          <Link href="/" passHref className="flex items-center gap-2">
            <div className="flex relative w-10 h-10 bg-primary rounded-[2px] items-center justify-center">
              <DocumentTextIcon className="h-6 w-6 text-primary-foreground" />
            </div>
            <div className="hidden sm:block">
              <span className="font-mono text-xl font-bold uppercase tracking-wide bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                InvoiceFlow AI
              </span>
            </div>
          </Link>

          {/* Desktop navigation */}
          <nav className="hidden lg:flex lg:flex-nowrap gap-1">
            <HeaderMenuLinks connected={isConnected} />
          </nav>
        </div>

        {/* Right side - user profile switcher and wallet */}
        <div className="flex items-center gap-4">
          {isConnected && (
            <div className="hidden sm:flex items-center gap-2 p-1 bg-muted/30 rounded-[2px] border border-border/30">
              <Button
                variant={userProfile === 'seller' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setUserProfile('seller')}
                className="gap-2 text-xs font-mono font-medium uppercase tracking-wide px-3 py-1.5"
              >
                <BriefcaseIcon className="w-3 h-3" />
                Seller
              </Button>
              <Button
                variant={userProfile === 'buyer' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setUserProfile('buyer')}
                className="gap-2 text-xs font-mono font-medium uppercase tracking-wide px-3 py-1.5"
              >
                <ShoppingCartIcon className="w-3 h-3" />
                Buyer
              </Button>
            </div>
          )}

          <div className="flex items-center gap-2">
            <RainbowKitCustomConnectButton />
            {isLocalNetwork && <FaucetButton />}
          </div>
        </div>
      </div>
    </div>
  );
};