import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Rocket, Sparkles } from "lucide-react";

const CTA = () => {
  return (
    <section id="create" className="py-24 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-card" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-[hsl(45,93%,47%)]/10 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">
              Ready to build something amazing?
            </span>
          </div>

          {/* Heading */}
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
            Your Next Big Idea Deserves{" "}
            <span className="text-gradient">Bitcoin&apos;s Backing</span>
          </h2>

          {/* Description */}
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
            Join thousands of innovators who&apos;ve chosen the most secure way to fund their dreams.
            Create your campaign in minutes and tap into the Bitcoin community.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/create">
              <Button variant="hero" size="xl" className="min-w-[200px]">
                <Rocket className="w-5 h-5" />
                Start Your Campaign
              </Button>
            </Link>
            <a href="#explore">
              <Button variant="outline" size="xl" className="min-w-[200px] group">
                Explore Projects
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </a>
          </div>

          {/* Trust Note */}
          <p className="text-sm text-muted-foreground mt-8">
            No upfront fees • Launch in under 5 minutes • Powered by smart contracts
          </p>
        </div>
      </div>
    </section>
  );
};

export default CTA;
