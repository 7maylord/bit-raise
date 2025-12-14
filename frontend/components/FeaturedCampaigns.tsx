"use client";

import { useEffect, useState } from "react";
import CampaignCard from "./CampaignCard";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Loader2 } from "lucide-react";
import { getAllCampaigns, Campaign, STATE_ACTIVE, getBackerCount, getCurrentBlockHeight } from "@/lib/contract";
import { useStacks } from "@/hooks/use-stacks";
import { campaigns as mockCampaigns } from "@/data/campaigns";
import { fetchCampaignMetadata, CampaignMetadata } from "@/lib/ipfs";
import { getCategoryImage } from "@/lib/category-images";

interface CampaignWithId extends Campaign {
  id: number;
}

interface EnrichedCampaign extends CampaignWithId {
  metadata?: CampaignMetadata;
  backerCount: number;
  currentBlockHeight: number;
}

const FeaturedCampaigns = () => {
  const { network } = useStacks();
  const [campaigns, setCampaigns] = useState<EnrichedCampaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCampaigns() {
      try {
        setLoading(true);
        const allCampaigns = await getAllCampaigns(network);

        // Filter only active campaigns and take the first 6
        const activeCampaigns = allCampaigns
          .filter((c) => c.state === STATE_ACTIVE)
          .slice(0, 6);

        // If no real campaigns, use mock data
        if (activeCampaigns.length === 0) {
          console.log("No campaigns found on-chain, using mock data");
          setCampaigns([]);
          return;
        }

        // Get current block height once for all campaigns
        const currentBlockHeight = await getCurrentBlockHeight(network);

        // Enrich campaigns with metadata and backer count
        const enrichedCampaigns = await Promise.all(
          activeCampaigns.map(async (campaign) => {
            // Fetch metadata from IPFS
            const metadata = await fetchCampaignMetadata(campaign.metadataUri);

            // Fetch backer count
            const backerCount = await getBackerCount(campaign.id, network);

            return {
              ...campaign,
              metadata: metadata || undefined,
              backerCount,
              currentBlockHeight,
            };
          })
        );

        setCampaigns(enrichedCampaigns);
      } catch (error) {
        console.error("Error fetching campaigns:", error);
        // On error, campaigns will be empty array
        setCampaigns([]);
      } finally {
        setLoading(false);
      }
    }

    fetchCampaigns();
  }, [network]);

  return (
    <section id="explore" className="py-24 relative">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 text-primary mb-3">
              <Sparkles className="w-5 h-5" />
              <span className="text-sm font-semibold uppercase tracking-wider">
                Featured Campaigns
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Discover Projects Worth
              <br />
              <span className="text-gradient">Backing</span>
            </h2>
          </div>
          <Button variant="outline" className="group">
            View All Campaigns
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>

        {/* Campaign Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : campaigns.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((campaign) => {
              const category = campaign.metadata?.category || "Other";
              const image = getCategoryImage(category);

              // Stacks blocks are ~10 minutes each (600 seconds)
              const STACKS_BLOCK_TIME = 600;

              // Calculate remaining blocks until deadline
              const blocksRemaining = Math.max(0, campaign.deadline - campaign.currentBlockHeight);
              const daysLeft = Math.floor((blocksRemaining * STACKS_BLOCK_TIME) / (24 * 60 * 60));

              return (
                <CampaignCard
                  key={campaign.id}
                  id={campaign.id.toString()}
                  title={campaign.title}
                  description={campaign.description}
                  category={category}
                  image={image}
                  raised={campaign.totalPledged / 1_000_000}
                  goal={campaign.goal / 1_000_000}
                  backers={campaign.backerCount}
                  daysLeft={daysLeft}
                />
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-muted-foreground mb-6">
              No active campaigns yet. Be the first to create one!
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockCampaigns.map((campaign, index) => (
                <CampaignCard key={index} {...campaign} />
              ))}
            </div>
            <p className="text-sm text-muted-foreground mt-6">
              (Showing example campaigns)
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedCampaigns;
