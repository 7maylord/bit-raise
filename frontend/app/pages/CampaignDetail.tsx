import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
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
  Share2
} from "lucide-react";
import { getCampaignById } from "@/data/campaigns";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DonationModal from "@/components/DonationModal";
import SocialShare from "@/components/SocialShare";

const CampaignDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);
  
  const campaign = getCampaignById(id || "");

  if (!campaign) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Campaign Not Found</h1>
          <Link to="/">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const progress = (campaign.raised / campaign.goal) * 100;
  const isFullyFunded = progress >= 100;

  return (
    <>
      <Helmet>
        <title>{campaign.title} - BitRaise</title>
        <meta name="description" content={campaign.description} />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navbar />

        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4">
            {/* Back Button */}
            <Link to="/#explore" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6 transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Campaigns
            </Link>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Hero Image */}
                <div className="relative rounded-2xl overflow-hidden">
                  <img
                    src={campaign.image}
                    alt={campaign.title}
                    className="w-full h-[400px] object-cover"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-primary/90 text-primary-foreground">
                      {campaign.category}
                    </span>
                  </div>
                  {isFullyFunded && (
                    <div className="absolute top-4 right-4">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[hsl(var(--success))] text-[hsl(var(--success-foreground))]">
                        Funded!
                      </span>
                    </div>
                  )}
                </div>

                {/* Title & Description */}
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                    {campaign.title}
                  </h1>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    {campaign.fullDescription}
                  </p>
                </div>

                {/* Creator Info */}
                <div className="bg-card border border-border rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Project Creator</h3>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                      <User className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Creator</p>
                      <p className="text-sm text-muted-foreground font-mono">
                        {campaign.creator.slice(0, 8)}...{campaign.creator.slice(-4)}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" className="ml-auto">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View on Explorer
                    </Button>
                  </div>
                </div>
              </div>

              {/* Sidebar - Funding Card */}
              <div className="lg:col-span-1">
                <div className="sticky top-24 bg-card border border-border rounded-2xl p-6 space-y-6">
                  {/* Progress */}
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-2xl font-bold text-foreground">
                        {campaign.raised.toLocaleString()} STX
                      </span>
                    </div>
                    <p className="text-muted-foreground mb-3">
                      raised of {campaign.goal.toLocaleString()} STX goal
                    </p>
                    <Progress 
                      value={Math.min(progress, 100)} 
                      className="h-3 bg-muted"
                    />
                    <p className="text-sm text-primary font-medium mt-2">
                      {progress.toFixed(1)}% funded
                    </p>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-muted/50 rounded-lg p-4 text-center">
                      <Users className="w-5 h-5 text-primary mx-auto mb-2" />
                      <p className="text-xl font-bold text-foreground">{campaign.backers}</p>
                      <p className="text-sm text-muted-foreground">Backers</p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-4 text-center">
                      <Clock className="w-5 h-5 text-primary mx-auto mb-2" />
                      <p className="text-xl font-bold text-foreground">{campaign.daysLeft}</p>
                      <p className="text-sm text-muted-foreground">Days Left</p>
                    </div>
                  </div>

                  {/* CTA */}
                  <Button 
                    className="w-full h-12 text-lg" 
                    onClick={() => setIsDonationModalOpen(true)}
                  >
                    <Heart className="w-5 h-5 mr-2" />
                    Back this Project
                  </Button>

                  {/* Share */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-foreground flex items-center gap-2">
                      <Share2 className="w-4 h-4" />
                      Share Campaign
                    </p>
                    <SocialShare title={campaign.title} />
                  </div>

                  {/* Date Info */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground pt-4 border-t border-border">
                    <Calendar className="w-4 h-4" />
                    <span>Campaign started {campaign.createdAt}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>

      {/* Donation Modal */}
      <DonationModal
        isOpen={isDonationModalOpen}
        onClose={() => setIsDonationModalOpen(false)}
        campaignTitle={campaign.title}
        campaignId={campaign.id}
      />
    </>
  );
};

export default CampaignDetail;
