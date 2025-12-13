"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { UserData } from "@stacks/connect";
import { StacksNetwork } from "@stacks/network";
import { UserSession } from "@stacks/connect";
import { useStacks } from "@/hooks/use-stacks";

interface StacksContextType {
  userData: UserData | null;
  network: StacksNetwork;
  userSession: UserSession | null;
  connectWallet: () => void;
  disconnectWallet: () => void;
  getAddress: () => string | null;
  createCampaign: (
    title: string,
    description: string,
    goalInStx: number,
    durationInBlocks: number,
    metadataUri: string
  ) => Promise<unknown>;
  pledge: (campaignId: number, amountInStx: number) => Promise<unknown>;
  withdrawFunds: (campaignId: number) => Promise<unknown>;
  requestRefund: (campaignId: number) => Promise<unknown>;
  cancelCampaign: (campaignId: number) => Promise<unknown>;
}

const StacksContext = createContext<StacksContextType | undefined>(undefined);

export function StacksProvider({ children }: { children: ReactNode }) {
  const stacksState = useStacks();

  return (
    <StacksContext.Provider value={stacksState}>
      {children}
    </StacksContext.Provider>
  );
}

export function useStacksContext() {
  const context = useContext(StacksContext);
  if (context === undefined) {
    throw new Error("useStacksContext must be used within a StacksProvider");
  }
  return context;
}
