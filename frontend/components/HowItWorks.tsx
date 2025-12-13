import { Wallet, Rocket, Users, Shield, ArrowRight } from "lucide-react";

const steps = [
  {
    icon: Wallet,
    title: "Connect Your Wallet",
    description: "Link your Stacks wallet to start backing projects or creating campaigns with just one click.",
    step: "01",
  },
  {
    icon: Rocket,
    title: "Launch or Discover",
    description: "Create your own campaign with smart contract funding, or explore innovative projects to support.",
    step: "02",
  },
  {
    icon: Users,
    title: "Back with STX",
    description: "Support projects with STX tokens. All contributions are secured by Bitcoin's network.",
    step: "03",
  },
  {
    icon: Shield,
    title: "Trustless Settlement",
    description: "Funds are released automatically when goals are met, or returned if campaigns don't succeed.",
    step: "04",
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-24 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-0 w-full h-full" 
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--muted)) 1px, transparent 0)`,
            backgroundSize: '48px 48px'
          }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary mb-3 block">
            How It Works
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Fundraising Made{" "}
            <span className="text-gradient">Trustless</span>
          </h2>
          <p className="text-muted-foreground">
            No middlemen, no hidden fees. Just transparent, blockchain-powered crowdfunding 
            secured by the most decentralized network in the world.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <div key={index} className="relative group">
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-16 left-full w-full z-0">
                  <div className="h-px w-full bg-gradient-to-r from-primary/50 to-transparent" />
                  <ArrowRight className="absolute -right-2 -top-2 w-4 h-4 text-primary/50" />
                </div>
              )}

              {/* Card */}
              <div className="glass rounded-2xl p-6 h-full hover:border-primary/50 transition-all duration-300 hover:-translate-y-1">
                {/* Step Number */}
                <div className="text-6xl font-bold text-muted/30 absolute top-4 right-4">
                  {step.step}
                </div>

                {/* Icon */}
                <div className="relative w-14 h-14 rounded-xl bg-gradient-primary flex items-center justify-center mb-6 shadow-button group-hover:shadow-glow transition-shadow duration-300">
                  <step.icon className="w-7 h-7 text-primary-foreground" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-foreground mb-3">{step.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
