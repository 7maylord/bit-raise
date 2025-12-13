import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Clock, Users, ArrowUpRight } from "lucide-react";

interface CampaignCardProps {
  id: string;
  title: string;
  description: string;
  image: string;
  raised: number;
  goal: number;
  backers: number;
  daysLeft: number;
  category: string;
}

const CampaignCard = ({
  id,
  title,
  description,
  image,
  raised,
  goal,
  backers,
  daysLeft,
  category,
}: CampaignCardProps) => {
  const progress = (raised / goal) * 100;
  const isFullyFunded = progress >= 100;

  return (
    <div className="group relative bg-gradient-card rounded-2xl overflow-hidden border border-border/50 hover:border-primary/50 transition-all duration-500 hover:shadow-glow hover:-translate-y-1">
      {/* Image Container */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
        
        {/* Category Badge */}
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-primary/90 text-primary-foreground">
            {category}
          </span>
        </div>

        {/* Funded Badge */}
        {isFullyFunded && (
          <div className="absolute top-4 right-4">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[hsl(var(--success))] text-[hsl(var(--success-foreground))]">
              Funded!
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-lg font-bold text-foreground mb-2 line-clamp-1 group-hover:text-primary transition-colors">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {description}
        </p>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="font-semibold text-foreground">{raised.toLocaleString()} STX</span>
            <span className="text-muted-foreground">of {goal.toLocaleString()} STX</span>
          </div>
          <Progress 
            value={Math.min(progress, 100)} 
            className="h-2 bg-muted"
          />
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{backers} backers</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{daysLeft} days left</span>
          </div>
        </div>

        {/* CTA */}
        <Link to={`/campaign/${id}`}>
          <Button variant="outline" className="w-full group/btn">
            <span>Back this project</span>
            <ArrowUpRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default CampaignCard;
