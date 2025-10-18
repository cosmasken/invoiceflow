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
} from "@heroicons/react/24/outline";
import { FaucetButton, RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";
import { useOutsideClick, useTargetNetwork } from "~~/hooks/scaffold-eth";

type HeaderMenuLink = {
  label: string;
  href: string;
  icon?: React.ReactNode;
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
  },
  {
    label: "My Invoices",
    href: "/invoices",
    icon: <RectangleStackIcon className="h-4 w-4" />,
  },
  {
    label: "Lending",
    href: "/lending",
    icon: <CurrencyDollarIcon className="h-4 w-4" />,
  },
  {
    label: "Admin",
    href: "/admin",
    icon: <Cog6ToothIcon className="h-4 w-4" />,
  },
  {
    label: "Debug",
    href: "/debug",
    icon: <BugAntIcon className="h-4 w-4" />,
  },
];

export const HeaderMenuLinks = () => {
  const pathname = usePathname();

  return (
    <>
      {menuLinks.map(({ label, href, icon }) => {
        const isActive = pathname === href;
        return (
          <li key={href}>
            <Link
              href={href}
              passHref
              className={`${
                isActive
                  ? "bg-blue-100 text-blue-700 border-blue-200"
                  : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
              } transition-all duration-200 py-2 px-4 text-sm rounded-lg gap-2 flex items-center border border-transparent hover:border-blue-200`}
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
 * Site header
 */
export const Header = () => {
  const { targetNetwork } = useTargetNetwork();
  const isLocalNetwork = targetNetwork.id === hardhat.id;

  const burgerMenuRef = useRef<HTMLDetailsElement>(null);
  useOutsideClick(burgerMenuRef, () => {
    burgerMenuRef?.current?.removeAttribute("open");
  });

  return (
    <div className="sticky lg:static top-0 navbar bg-white/95 backdrop-blur-sm min-h-0 shrink-0 justify-between z-20 shadow-sm border-b border-gray-100 px-4 sm:px-6">
      <div className="navbar-start w-auto lg:w-1/2">
        <details className="dropdown" ref={burgerMenuRef}>
          <summary className="ml-1 btn btn-ghost lg:hidden hover:bg-blue-50 text-gray-600">
            <Bars3Icon className="h-6 w-6" />
          </summary>
          <ul
            className="menu menu-compact dropdown-content mt-3 p-3 shadow-lg bg-white rounded-xl w-56 border border-gray-100"
            onClick={() => {
              burgerMenuRef?.current?.removeAttribute("open");
            }}
          >
            <HeaderMenuLinks />
          </ul>
        </details>

        <Link href="/" passHref className="hidden lg:flex items-center gap-3 ml-4 mr-8 shrink-0">
          <div className="flex relative w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg items-center justify-center">
            <DocumentTextIcon className="h-6 w-6 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              InvoiceFlow AI
            </span>
            <span className="text-xs text-gray-500">Blockchain Invoice Financing</span>
          </div>
        </Link>

        <ul className="hidden lg:flex lg:flex-nowrap menu menu-horizontal px-1 gap-1">
          <HeaderMenuLinks />
        </ul>
      </div>

      <div className="navbar-end flex items-center gap-3 mr-2">
        <RainbowKitCustomConnectButton />
        {isLocalNetwork && <FaucetButton />}
      </div>
    </div>
  );
};
