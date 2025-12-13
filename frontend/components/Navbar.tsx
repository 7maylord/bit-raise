"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, X, Wallet, Zap, LogOut } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useStacks } from "@/hooks/use-stacks";
import { abbreviateAddress } from "@/lib/stx-utils";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { userData, connectWallet, disconnectWallet, getAddress } = useStacks();

  console.log("🎨 Navbar render - userData:", userData);
  console.log("🔌 connectWallet function:", connectWallet);

  const navLinks = [
    { name: "Explore", href: "/#explore", isRoute: true },
    { name: "How It Works", href: "/#how-it-works", isRoute: true },
    { name: "Create Campaign", href: "/create", isRoute: true },
    { name: "About", href: "/#about", isRoute: true },
  ];

  const address = getAddress();

  const handleConnectClick = () => {
    console.log("🖱️ Connect button clicked in Navbar");
    connectWallet();
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-strong">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow group-hover:scale-110 transition-transform duration-300">
              <Zap className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">
              Bit<span className="text-gradient">Raise</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-muted-foreground hover:text-foreground transition-colors duration-200 text-sm font-medium"
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />
            {userData && address ? (
              <div className="flex items-center gap-2">
                <Button variant="glass" size="default" disabled>
                  <Wallet className="w-4 h-4" />
                  {abbreviateAddress(address)}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={disconnectWallet}
                  title="Disconnect wallet"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Button variant="glass" size="default" onClick={handleConnectClick}>
                <Wallet className="w-4 h-4" />
                Connect Wallet
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-foreground"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-border/50">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-muted-foreground hover:text-foreground transition-colors duration-200 py-2"
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              <div className="flex items-center gap-3 mt-2">
                <ThemeToggle />
                {userData && address ? (
                  <>
                    <Button variant="glass" className="flex-1" disabled>
                      <Wallet className="w-4 h-4" />
                      {abbreviateAddress(address)}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={disconnectWallet}
                      title="Disconnect wallet"
                    >
                      <LogOut className="w-4 h-4" />
                    </Button>
                  </>
                ) : (
                  <Button variant="glass" className="flex-1" onClick={handleConnectClick}>
                    <Wallet className="w-4 h-4" />
                    Connect Wallet
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
