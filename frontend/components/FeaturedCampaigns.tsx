import CampaignCard from "./CampaignCard";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { campaigns } from "@/data/campaigns";

const FeaturedCampaigns = () => {
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
              <span className="text-sm font-semibold uppercase tracking-wider">Featured Campaigns</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Discover Projects Worth<br />
              <span className="text-gradient">Backing</span>
            </h2>
          </div>
          <Button variant="outline" className="group">
            View All Campaigns
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>

        {/* Campaign Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((campaign, index) => (
            <CampaignCard key={index} {...campaign} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedCampaigns;
