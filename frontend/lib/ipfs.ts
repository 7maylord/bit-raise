export interface CampaignMetadata {
  title: string;
  description: string;
  fullDescription: string;
  category: string;
  goal: number;
  duration: number;
  createdAt: number;
}

/**
 * Upload campaign metadata to IPFS via Pinata
 * @param metadata Campaign metadata object
 * @returns IPFS URI (ipfs://...)
 */
export async function uploadCampaignMetadata(
  metadata: CampaignMetadata
): Promise<string> {
  const JWT = process.env.NEXT_PUBLIC_PINATA_JWT;

  if (!JWT) {
    throw new Error("Pinata JWT not configured");
  }

  try {
    const response = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${JWT}`,
      },
      body: JSON.stringify({
        pinataContent: metadata,
        pinataMetadata: {
          name: `campaign-${metadata.title}-${Date.now()}`,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Pinata upload error:", error);
      throw new Error("Failed to upload to IPFS");
    }

    const data = await response.json();

    // Return IPFS URI
    return `ipfs://${data.IpfsHash}`;
  } catch (error) {
    console.error("Error uploading to IPFS:", error);
    throw new Error("Failed to upload campaign metadata to IPFS");
  }
}

/**
 * Fetch campaign metadata from IPFS
 * @param ipfsUri IPFS URI (ipfs://... or just the hash)
 * @returns Campaign metadata
 */
export async function fetchCampaignMetadata(
  ipfsUri: string
): Promise<CampaignMetadata | null> {
  try {
    // Extract hash from URI
    const hash = ipfsUri.replace("ipfs://", "");

    // Fetch from Pinata gateway
    const response = await fetch(`https://gateway.pinata.cloud/ipfs/${hash}`);

    if (!response.ok) {
      throw new Error("Failed to fetch from IPFS");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching from IPFS:", error);
    return null;
  }
}
