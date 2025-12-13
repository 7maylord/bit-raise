import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Shield, Zap, Bitcoin } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroBg.src}
          alt="Bitcoin network visualization"
          className="w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
      </div>

      {/* Animated Glow Effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse-glow" />
      <div
        className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-[hsl(45,93%,47%)]/15 rounded-full blur-3xl animate-pulse-glow"
        style={{ animationDelay: "1s" }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8 animate-float">
            <Bitcoin className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">
              Powered by Stacks • Bitcoin L2
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6">
            Fund Your Vision with{" "}
            <span className="text-gradient">Bitcoin&apos;s Security</span>
          </h1>

          {/* Subheading */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            BitRaise brings decentralized crowdfunding to the most secure
            blockchain. Launch campaigns, back innovations, and build the future
            — all secured by Bitcoin.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link href="/create">
              <Button variant="hero" size="xl">
                Start a Campaign
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Button variant="glass" size="xl">
              <Play className="w-5 h-5" />
              Watch Demo
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
            {[
              { icon: Shield, label: "Bitcoin Secured", value: "100%" },
              { icon: Zap, label: "Instant Settlements", value: "<1min" },
              { label: "Total Raised", value: "2,450 STX" },
              { label: "Active Campaigns", value: "127+" },
            ].map((stat, index) => (
              <div
                key={index}
                className="glass rounded-xl p-4 hover:border-primary/50 transition-colors duration-300"
              >
                {stat.icon && (
                  <stat.icon className="w-5 h-5 text-primary mx-auto mb-2" />
                )}
                <div className="text-2xl font-bold text-foreground">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-2">
          <div className="w-1 h-2 bg-primary rounded-full animate-pulse" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
