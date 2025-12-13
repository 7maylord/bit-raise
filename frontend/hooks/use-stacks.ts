"use client";

import { useState, useEffect, useCallback } from "react";
import {
  AppConfig,
  openContractCall,
  showConnect,
  type UserData,
  UserSession,
} from "@stacks/connect";
import { STACKS_TESTNET, STACKS_MAINNET } from "@stacks/network";
import { PostConditionMode } from "@stacks/transactions";
import * as contract from "@/lib/contract";

type UserSessionType = InstanceType<typeof UserSession>;

// App configuration
const appDetails = {
  name: "BitRaise",
  icon: typeof window !== "undefined" ? `${window.location.origin}/icon.png` : "",
};

// Network configuration
const USE_TESTNET = true;
const NETWORK = USE_TESTNET ? STACKS_TESTNET : STACKS_MAINNET;

export function useStacks() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [userSession, setUserSession] = useState<UserSessionType | null>(null);

  // Initialize user session
  useEffect(() => {
    const appConfig = new AppConfig(["store_write"]);
    const session = new UserSession({ appConfig });
    setUserSession(session);

    // Handle pending sign-in
    if (session.isSignInPending()) {
      session.handlePendingSignIn().then((data) => {
        setUserData(data);
      });
    } else if (session.isUserSignedIn()) {
      setUserData(session.loadUserData());
    }
  }, []);

  // Connect wallet
  const connectWallet = useCallback(() => {
    if (!userSession) return;

    showConnect({
      appDetails,
      onFinish: () => {
        window.location.reload();
      },
      userSession,
    });
  }, [userSession]);

  // Disconnect wallet
  const disconnectWallet = useCallback(() => {
    if (!userSession) return;

    userSession.signUserOut();
    setUserData(null);
  }, [userSession]);

  // Get user's STX address
  const getAddress = useCallback((): string | null => {
    if (!userData) return null;
    return USE_TESTNET
      ? userData.profile.stxAddress.testnet
      : userData.profile.stxAddress.mainnet;
  }, [userData]);

  // Create campaign
  const createCampaign = useCallback(
    async (
      title: string,
      description: string,
      goalInStx: number,
      durationInBlocks: number,
      metadataUri: string
    ) => {
      if (!userData) {
        throw new Error("Please connect your wallet first");
      }

      const txOptions = await contract.createCampaign(
        title,
        description,
        goalInStx,
        durationInBlocks,
        metadataUri
      );

      return new Promise((resolve, reject) => {
        openContractCall({
          ...txOptions,
          appDetails,
          postConditionMode: PostConditionMode.Allow,
          onFinish: (data) => {
            console.log("Campaign created:", data);
            resolve(data);
          },
          onCancel: () => {
            reject(new Error("Transaction cancelled"));
          },
        });
      });
    },
    [userData]
  );

  // Pledge to campaign
  const pledge = useCallback(
    async (campaignId: number, amountInStx: number) => {
      if (!userData) {
        throw new Error("Please connect your wallet first");
      }

      const txOptions = await contract.pledgeToCampaign(campaignId, amountInStx);

      return new Promise((resolve, reject) => {
        openContractCall({
          ...txOptions,
          appDetails,
          postConditionMode: PostConditionMode.Allow,
          onFinish: (data) => {
            console.log("Pledge successful:", data);
            resolve(data);
          },
          onCancel: () => {
            reject(new Error("Transaction cancelled"));
          },
        });
      });
    },
    [userData]
  );

  // Withdraw funds
  const withdrawFunds = useCallback(
    async (campaignId: number) => {
      if (!userData) {
        throw new Error("Please connect your wallet first");
      }

      const txOptions = await contract.withdrawFunds(campaignId);

      return new Promise((resolve, reject) => {
        openContractCall({
          ...txOptions,
          appDetails,
          postConditionMode: PostConditionMode.Deny, // Safer for withdrawals
          onFinish: (data) => {
            console.log("Withdrawal successful:", data);
            resolve(data);
          },
          onCancel: () => {
            reject(new Error("Transaction cancelled"));
          },
        });
      });
    },
    [userData]
  );

  // Request refund
  const requestRefund = useCallback(
    async (campaignId: number) => {
      if (!userData) {
        throw new Error("Please connect your wallet first");
      }

      const txOptions = await contract.requestRefund(campaignId);

      return new Promise((resolve, reject) => {
        openContractCall({
          ...txOptions,
          appDetails,
          postConditionMode: PostConditionMode.Deny, // Safer for refunds
          onFinish: (data) => {
            console.log("Refund successful:", data);
            resolve(data);
          },
          onCancel: () => {
            reject(new Error("Transaction cancelled"));
          },
        });
      });
    },
    [userData]
  );

  // Cancel campaign
  const cancelCampaign = useCallback(
    async (campaignId: number) => {
      if (!userData) {
        throw new Error("Please connect your wallet first");
      }

      const txOptions = await contract.cancelCampaign(campaignId);

      return new Promise((resolve, reject) => {
        openContractCall({
          ...txOptions,
          appDetails,
          postConditionMode: PostConditionMode.Allow,
          onFinish: (data) => {
            console.log("Campaign cancelled:", data);
            resolve(data);
          },
          onCancel: () => {
            reject(new Error("Transaction cancelled"));
          },
        });
      });
    },
    [userData]
  );

  return {
    userData,
    network: NETWORK,
    userSession,
    connectWallet,
    disconnectWallet,
    getAddress,
    createCampaign,
    pledge,
    withdrawFunds,
    requestRefund,
    cancelCampaign,
  };
}
