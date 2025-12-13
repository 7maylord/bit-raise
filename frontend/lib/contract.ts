"use client";

import {
  uintCV,
  stringUtf8CV,
  stringAsciiCV,
  principalCV,
  cvToValue,
  fetchCallReadOnlyFunction,
  ClarityValue,
} from "@stacks/transactions";
import { StacksNetwork } from "@stacks/network";

// Contract configuration

export const CONTRACT_ADDRESS = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"; // Placeholder - update after deployment
export const CONTRACT_NAME = "bitraise";

// Campaign state constants (matching smart contract)
export const STATE_ACTIVE = "active";
export const STATE_SUCCESSFUL = "successful";
export const STATE_FAILED = "failed";
export const STATE_CANCELLED = "cancelled";

// Error codes (matching smart contract)
export const ERR_NOT_AUTHORIZED = 100;
export const ERR_CAMPAIGN_NOT_FOUND = 101;
export const ERR_CAMPAIGN_ENDED = 102;
export const ERR_CAMPAIGN_ACTIVE = 103;
export const ERR_INVALID_AMOUNT = 104;
export const ERR_GOAL_NOT_REACHED = 105;
export const ERR_ALREADY_WITHDRAWN = 106;
export const ERR_NO_PLEDGE_FOUND = 107;
export const ERR_ALREADY_REFUNDED = 108;
export const ERR_INVALID_DEADLINE = 109;
export const ERR_INVALID_GOAL = 110;
export const ERR_CONTRACT_PAUSED = 111;
export const ERR_TRANSFER_FAILED = 112;
export const ERR_INVALID_FEE = 113;

export interface Campaign {
  creator: string;
  title: string;
  description: string;
  goal: number;
  deadline: number;
  totalPledged: number;
  state: string;
  metadataUri: string;
  withdrawn: boolean;
  createdAt: number;
}

export interface Pledge {
  amount: number;
  refunded: boolean;
  pledgedAt: number;
}

/**
 * Create a new campaign
 */
export async function createCampaign(
  title: string,
  description: string,
  goalInStx: number,
  durationInBlocks: number,
  metadataUri: string
) {
  const goalInMicroStx = Math.floor(goalInStx * 1_000_000);

  return {
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: "create-campaign",
    functionArgs: [
      stringUtf8CV(title),
      stringUtf8CV(description),
      uintCV(goalInMicroStx),
      uintCV(durationInBlocks),
      stringAsciiCV(metadataUri),
    ],
  };
}

/**
 * Pledge to a campaign
 */
export async function pledgeToCampaign(
  campaignId: number,
  amountInStx: number
) {
  const amountInMicroStx = Math.floor(amountInStx * 1_000_000);

  return {
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: "pledge",
    functionArgs: [
      uintCV(campaignId),
      uintCV(amountInMicroStx),
    ],
  };
}

/**
 * Withdraw funds from successful campaign (creator only)
 */
export async function withdrawFunds(campaignId: number) {
  return {
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: "withdraw-funds",
    functionArgs: [uintCV(campaignId)],
  };
}

/**
 * Request refund from failed campaign (backer only)
 */
export async function requestRefund(campaignId: number) {
  return {
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: "refund",
    functionArgs: [uintCV(campaignId)],
  };
}

/**
 * Cancel campaign (creator only, no pledges)
 */
export async function cancelCampaign(campaignId: number) {
  return {
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: "cancel-campaign",
    functionArgs: [uintCV(campaignId)],
  };
}

// ========================================
// READ-ONLY FUNCTIONS
// ========================================

/**
 * Get campaign details
 */
export async function getCampaign(
  campaignId: number,
  network: StacksNetwork
): Promise<Campaign | null> {
  try {
    const result = await fetchCallReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: "get-campaign",
      functionArgs: [uintCV(campaignId)],
      senderAddress: CONTRACT_ADDRESS,
      network,
    });

    const value = cvToValue(result);

    if (!value || !value.value) {
      return null;
    }

    const campaignData = value.value;

    return {
      creator: campaignData.creator.value,
      title: campaignData.title.value,
      description: campaignData.description.value,
      goal: Number(campaignData.goal.value),
      deadline: Number(campaignData.deadline.value),
      totalPledged: Number(campaignData["total-pledged"].value),
      state: campaignData.state.value,
      metadataUri: campaignData["metadata-uri"].value,
      withdrawn: campaignData.withdrawn.value,
      createdAt: Number(campaignData["created-at"].value),
    };
  } catch (error) {
    console.error("Error fetching campaign:", error);
    return null;
  }
}

/**
 * Get pledge details for a backer
 */
export async function getPledge(
  campaignId: number,
  backer: string,
  network: StacksNetwork
): Promise<Pledge | null> {
  try {
    const result = await fetchCallReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: "get-pledge",
      functionArgs: [uintCV(campaignId), principalCV(backer)],
      senderAddress: CONTRACT_ADDRESS,
      network,
    });

    const value = cvToValue(result);

    if (!value || !value.value) {
      return null;
    }

    const pledgeData = value.value;

    return {
      amount: Number(pledgeData.amount.value),
      refunded: pledgeData.refunded.value,
      pledgedAt: Number(pledgeData["pledged-at"].value),
    };
  } catch (error) {
    console.error("Error fetching pledge:", error);
    return null;
  }
}

/**
 * Get backer count for a campaign
 */
export async function getBackerCount(
  campaignId: number,
  network: StacksNetwork
): Promise<number> {
  try {
    const result = await fetchCallReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: "get-backer-count",
      functionArgs: [uintCV(campaignId)],
      senderAddress: CONTRACT_ADDRESS,
      network,
    });

    const value = cvToValue(result);
    return Number(value.count.value) || 0;
  } catch (error) {
    console.error("Error fetching backer count:", error);
    return 0;
  }
}

/**
 * Get campaign nonce (next campaign ID)
 */
export async function getCampaignNonce(
  network: StacksNetwork
): Promise<number> {
  try {
    const result = await fetchCallReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: "get-campaign-nonce",
      functionArgs: [],
      senderAddress: CONTRACT_ADDRESS,
      network,
    });

    const value = cvToValue(result);
    return Number(value) || 0;
  } catch (error) {
    console.error("Error fetching campaign nonce:", error);
    return 0;
  }
}

/**
 * Get campaign progress percentage
 */
export async function getCampaignProgress(
  campaignId: number,
  network: StacksNetwork
): Promise<number> {
  try {
    const result = await fetchCallReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: "get-campaign-progress",
      functionArgs: [uintCV(campaignId)],
      senderAddress: CONTRACT_ADDRESS,
      network,
    });

    const value = cvToValue(result);
    return Number(value) || 0;
  } catch (error) {
    console.error("Error fetching campaign progress:", error);
    return 0;
  }
}

/**
 * Check if campaign is successful
 */
export async function isCampaignSuccessful(
  campaignId: number,
  network: StacksNetwork
): Promise<boolean> {
  try {
    const result = await fetchCallReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: "is-campaign-successful",
      functionArgs: [uintCV(campaignId)],
      senderAddress: CONTRACT_ADDRESS,
      network,
    });

    const value = cvToValue(result);
    return value === true;
  } catch (error) {
    console.error("Error checking campaign success:", error);
    return false;
  }
}

/**
 * Check if campaign has failed
 */
export async function isCampaignFailed(
  campaignId: number,
  network: StacksNetwork
): Promise<boolean> {
  try {
    const result = await fetchCallReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: "is-campaign-failed",
      functionArgs: [uintCV(campaignId)],
      senderAddress: CONTRACT_ADDRESS,
      network,
    });

    const value = cvToValue(result);
    return value === true;
  } catch (error) {
    console.error("Error checking campaign failure:", error);
    return false;
  }
}

/**
 * Get user campaign count
 */
export async function getUserCampaignCount(
  user: string,
  network: StacksNetwork
): Promise<number> {
  try {
    const result = await fetchCallReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: "get-user-campaign-count",
      functionArgs: [principalCV(user)],
      senderAddress: CONTRACT_ADDRESS,
      network,
    });

    const value = cvToValue(result);
    return Number(value.count.value) || 0;
  } catch (error) {
    console.error("Error fetching user campaign count:", error);
    return 0;
  }
}

/**
 * Get platform fee percentage
 */
export async function getPlatformFeePercentage(
  network: StacksNetwork
): Promise<number> {
  try {
    const result = await fetchCallReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: "get-platform-fee-percentage",
      functionArgs: [],
      senderAddress: CONTRACT_ADDRESS,
      network,
    });

    const value = cvToValue(result);
    return Number(value) || 0;
  } catch (error) {
    console.error("Error fetching platform fee:", error);
    return 0;
  }
}

/**
 * Check if contract is paused
 */
export async function isContractPaused(
  network: StacksNetwork
): Promise<boolean> {
  try {
    const result = await fetchCallReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: "is-contract-paused",
      functionArgs: [],
      senderAddress: CONTRACT_ADDRESS,
      network,
    });

    const value = cvToValue(result);
    return value === true;
  } catch (error) {
    console.error("Error checking contract pause status:", error);
    return false;
  }
}
