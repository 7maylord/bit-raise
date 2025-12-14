/**
 * Test script for IPFS upload functionality
 * Run with: npx ts-node scripts/test-ipfs.ts
 */

import { uploadCampaignMetadata, fetchCampaignMetadata } from "../lib/ipfs";

async function testIPFSUpload() {
  console.log("🧪 Testing IPFS Upload...\n");

  // Test metadata
  const testMetadata = {
    title: "Test Campaign",
    description: "This is a test campaign for IPFS upload",
    fullDescription: "A longer description explaining the test campaign in detail. This is to ensure that all fields are properly uploaded to IPFS.",
    category: "DeFi",
    goal: 100,
    duration: 30,
    createdAt: Date.now(),
  };

  try {
    console.log("📤 Uploading metadata to IPFS...");
    console.log("Metadata:", JSON.stringify(testMetadata, null, 2));

    const ipfsUri = await uploadCampaignMetadata(testMetadata);

    console.log("\n✅ Upload successful!");
    console.log("IPFS URI:", ipfsUri);

    // Try fetching it back
    console.log("\n📥 Fetching metadata from IPFS...");
    const fetchedMetadata = await fetchCampaignMetadata(ipfsUri);

    if (fetchedMetadata) {
      console.log("✅ Fetch successful!");
      console.log("Fetched metadata:", JSON.stringify(fetchedMetadata, null, 2));

      // Verify data integrity
      if (JSON.stringify(testMetadata) === JSON.stringify(fetchedMetadata)) {
        console.log("\n✅ Data integrity verified! Upload and fetch working correctly.");
      } else {
        console.log("\n⚠️  Data mismatch detected");
      }
    } else {
      console.log("❌ Failed to fetch metadata");
    }
  } catch (error) {
    console.error("\n❌ Test failed:", error);
    process.exit(1);
  }
}

testIPFSUpload();
