"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  Clock,
  Users,
  Heart,
  Calendar,
  User,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { getCampaign, getBackerCount, getCurrentBlockHeight } from "@/lib/contract";
import { fetchCampaignMetadata, CampaignMetadata } from "@/lib/ipfs";
import { getCategoryImage } from "@/lib/category-images";
import { useStacks } from "@/hooks/use-stacks";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DonationModal from "@/components/DonationModal";
import SocialShare from "@/components/SocialShare";

interface EnrichedCampaignData {
  id: number;
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
  metadata?: CampaignMetadata;
  backerCount: number;
  currentBlockHeight: number;
}

export default function CampaignDetailPage() {
  const params = useParams();
  const { network } = useStacks();
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);
  const [campaign, setCampaign] = useState<EnrichedCampaignData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchCampaignData() {
      try {
        setLoading(true);
        const campaignId = parseInt(params?.id as string);

        if (isNaN(campaignId)) {
          setError(true);
          return;
        }

        // Fetch campaign from blockchain
        const campaignData = await getCampaign(campaignId, network);

        if (!campaignData) {
          setError(true);
          return;
        }

        // Fetch metadata from IPFS
        const metadata = await fetchCampaignMetadata(campaignData.metadataUri);

        // Fetch backer count and current block height
        const backerCount = await getBackerCount(campaignId, network);
        const currentBlockHeight = await getCurrentBlockHeight(network);

        setCampaign({
          id: campaignId,
          ...campaignData,
          metadata: metadata || undefined,
          backerCount,
          currentBlockHeight,
        });
      } catch (err) {
        console.error("Error fetching campaign:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    if (params?.id) {
      fetchCampaignData();
    }
  }, [params?.id, network]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Campaign Not Found</h1>
          <Link href="/">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const raised = campaign.totalPledged / 1_000_000;
  const goal = campaign.goal / 1_000_000;
  const progress = (raised / goal) * 100;
  const isFullyFunded = progress >= 100;

  // Stacks blocks are ~10 minutes each (600 seconds)
  const STACKS_BLOCK_TIME = 600; // 10 minutes in seconds

  // Calculate remaining blocks until deadline
  const blocksRemaining = Math.max(0, campaign.deadline - campaign.currentBlockHeight);
  const daysLeft = Math.floor((blocksRemaining * STACKS_BLOCK_TIME) / (24 * 60 * 60));

  // Calculate days since campaign creation
  const blocksElapsed = campaign.currentBlockHeight - campaign.createdAt;
  const daysAgo = Math.floor((blocksElapsed * STACKS_BLOCK_TIME) / (24 * 60 * 60));

  const category = campaign.metadata?.category || "Other";
  const image = getCategoryImage(category);
  const fullDescription = campaign.metadata?.fullDescription || campaign.description;

  return (
    <>
      <div className="min-h-screen">
        <Navbar />

        <div className="container mx-auto px-4 py-8">
          {/* Back Button */}
          <Link href="/">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Campaigns
            </Button>
          </Link>

          {/* Campaign Header */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {/* Main Content - 2/3 width */}
            <div className="md:col-span-2 space-y-6">
              {/* Campaign Image */}
              <div className="relative w-full h-[400px] rounded-xl overflow-hidden shadow-xl">
                <img
                  src={image}
                  alt={campaign.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary/90 text-primary-foreground">
                    {category}
                  </span>
                </div>
              </div>

              {/* Campaign Title & Creator */}
              <div>
                <h1 className="text-4xl font-bold mb-2 text-foreground">
                  {campaign.title}
                </h1>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <User className="w-4 h-4" />
                  <span className="text-sm">by {campaign.creator}</span>
                </div>
              </div>

              {/* Description Tabs */}
              <div className="bg-card rounded-lg p-6 shadow-md">
                <h2 className="text-2xl font-semibold mb-4">About this Campaign</h2>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {fullDescription}
                </p>
              </div>
            </div>

            {/* Sidebar - 1/3 width */}
            <div className="space-y-4">
              {/* Funding Card */}
              <div className="bg-card rounded-lg p-6 shadow-md sticky top-4">
                <div className="space-y-4">
                  {/* Progress */}
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-3xl font-bold text-primary">
                        {raised} STX
                      </span>
                      <span className="text-sm text-muted-foreground">
                        of {goal} STX
                      </span>
                    </div>
                    <Progress value={progress} className="h-2" />
                    <p className="text-sm text-muted-foreground mt-2">
                      {Math.round(progress)}% funded
                    </p>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 py-4 border-y border-border">
                    <div>
                      <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <Users className="w-4 h-4" />
                        <span className="text-xs">Backers</span>
                      </div>
                      <p className="text-2xl font-bold">{campaign.backerCount}</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <Clock className="w-4 h-4" />
                        <span className="text-xs">Days Left</span>
                      </div>
                      <p className="text-2xl font-bold">{daysLeft}</p>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={() => setIsDonationModalOpen(true)}
                    disabled={isFullyFunded}
                  >
                    {isFullyFunded ? (
                      <>
                        <Heart className="w-4 h-4 mr-2 fill-current" />
                        Fully Funded
                      </>
                    ) : (
                      <>
                        <Heart className="w-4 h-4 mr-2" />
                        Back This Campaign
                      </>
                    )}
                  </Button>

                  {/* Share Button */}
                  <SocialShare
                    url={typeof window !== 'undefined' ? window.location.href : ''}
                    title={campaign.title}
                  />

                  {/* Campaign Info */}
                  <div className="pt-4 space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>Created {daysAgo} days ago</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ExternalLink className="w-4 h-4" />
                      <a
                        href="#"
                        className="hover:text-primary transition-colors"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View on Stacks Explorer
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </div>

      {/* Donation Modal */}
      <DonationModal
        isOpen={isDonationModalOpen}
        onClose={() => setIsDonationModalOpen(false)}
        campaignTitle={campaign.title}
        campaignId={campaign.id.toString()}
      />
    </>
  );
}
