import * as contract from "@/lib/contract";
import {
  AppConfig,
  openContractCall,
  showConnect,
  type UserData,
  UserSession,
} from "@stacks/connect";
import { STACKS_TESTNET, STACKS_MAINNET } from "@stacks/network";
import { PostConditionMode } from "@stacks/transactions";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const appDetails = {
  name: "BitRaise",
  icon: "https://cryptologos.cc/logos/stacks-stx-logo.png",
};

const appConfig = new AppConfig(["store_write"]);
const userSession = new UserSession({ appConfig });

const USE_TESTNET = true;
const NETWORK = USE_TESTNET ? STACKS_TESTNET : STACKS_MAINNET;

export function useStacks() {
  const [userData, setUserData] = useState<UserData | null>(null);

  function connectWallet() {
    showConnect({
      appDetails,
      onFinish: () => {
        window.location.reload();
      },
      userSession,
    });
  }

  function disconnectWallet() {
    userSession.signUserOut();
    setUserData(null);
  }

  function getAddress(): string | null {
    if (!userData) return null;
    return USE_TESTNET
      ? userData.profile.stxAddress.testnet
      : userData.profile.stxAddress.mainnet;
  }

  async function createCampaign(
    title: string,
    description: string,
    goalInStx: number,
    durationInBlocks: number,
    metadataUri: string
  ) {
    if (typeof window === "undefined") return;

    try {
      if (!userData) throw new Error("Please connect your wallet first");
      const txOptions = await contract.createCampaign(
        title,
        description,
        goalInStx,
        durationInBlocks,
        metadataUri
      );
      await openContractCall({
        ...txOptions,
        appDetails,
        onFinish: (data) => {
          console.log(data);
          toast.success("Campaign created successfully!");
        },
        postConditionMode: PostConditionMode.Allow,
      });
    } catch (_err) {
      const err = _err as Error;
      console.error(err);
      toast.error(err.message);
    }
  }

  async function pledge(campaignId: number, amountInStx: number) {
    if (typeof window === "undefined") return;

    try {
      if (!userData) throw new Error("Please connect your wallet first");
      const txOptions = await contract.pledgeToCampaign(campaignId, amountInStx);
      await openContractCall({
        ...txOptions,
        appDetails,
        onFinish: (data) => {
          console.log(data);
          toast.success("Pledge submitted successfully!");
        },
        postConditionMode: PostConditionMode.Allow,
      });
    } catch (_err) {
      const err = _err as Error;
      console.error(err);
      toast.error(err.message);
    }
  }

  async function withdrawFunds(campaignId: number) {
    if (typeof window === "undefined") return;

    try {
      if (!userData) throw new Error("Please connect your wallet first");
      const txOptions = await contract.withdrawFunds(campaignId);
      await openContractCall({
        ...txOptions,
        appDetails,
        onFinish: (data) => {
          console.log(data);
          toast.success("Withdrawal submitted successfully!");
        },
        postConditionMode: PostConditionMode.Allow,
      });
    } catch (_err) {
      const err = _err as Error;
      console.error(err);
      toast.error(err.message);
    }
  }

  async function requestRefund(campaignId: number) {
    if (typeof window === "undefined") return;

    try {
      if (!userData) throw new Error("Please connect your wallet first");
      const txOptions = await contract.requestRefund(campaignId);
      await openContractCall({
        ...txOptions,
        appDetails,
        onFinish: (data) => {
          console.log(data);
          toast.success("Refund requested successfully!");
        },
        postConditionMode: PostConditionMode.Allow,
      });
    } catch (_err) {
      const err = _err as Error;
      console.error(err);
      toast.error(err.message);
    }
  }

  async function cancelCampaign(campaignId: number) {
    if (typeof window === "undefined") return;

    try {
      if (!userData) throw new Error("Please connect your wallet first");
      const txOptions = await contract.cancelCampaign(campaignId);
      await openContractCall({
        ...txOptions,
        appDetails,
        onFinish: (data) => {
          console.log(data);
          toast.success("Campaign cancelled successfully!");
        },
        postConditionMode: PostConditionMode.Allow,
      });
    } catch (_err) {
      const err = _err as Error;
      console.error(err);
      toast.error(err.message);
    }
  }

  useEffect(() => {
    try {
      if (userSession.isSignInPending()) {
        userSession.handlePendingSignIn().then((userData) => {
          setUserData(userData);
        });
      } else if (userSession.isUserSignedIn()) {
        setUserData(userSession.loadUserData());
      }
    } catch (error) {
      console.error("Error loading user session:", error);
      // Clear corrupted session data
      userSession.signUserOut();
      setUserData(null);
    }
  }, []);

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
