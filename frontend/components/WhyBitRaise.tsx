import { Shield, Zap, Globe, Lock, Coins, Code } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Bitcoin Security",
    description: "Every transaction is anchored to Bitcoin, giving you the security of the world's most battle-tested blockchain.",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Stacks enables near-instant transactions while maintaining Bitcoin's security guarantees.",
  },
  {
    icon: Lock,
    title: "Trustless Escrow",
    description: "Smart contracts handle all funds automatically — no third parties, no trust required.",
  },
  {
    icon: Globe,
    title: "Borderless Access",
    description: "Anyone, anywhere can participate. No bank accounts, no geographic restrictions.",
  },
  {
    icon: Coins,
    title: "Low Fees",
    description: "Minimal transaction costs mean more of your contribution goes directly to projects.",
  },
  {
    icon: Code,
    title: "Open Source",
    description: "Fully transparent, auditable code. Anyone can verify how the platform works.",
  },
];

const WhyBitRaise = () => {
  return (
    <section id="about" className="py-24 relative">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary mb-3 block">
            Why BitRaise
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            The Future of{" "}
            <span className="text-gradient">Crowdfunding</span>
          </h2>
          <p className="text-muted-foreground">
            Traditional crowdfunding is broken. High fees, payment failures, and geographic restrictions 
            leave billions of dollars and ideas on the table. We're fixing that.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative p-6 rounded-2xl border border-border/50 hover:border-primary/50 transition-all duration-300 hover:-translate-y-1 overflow-hidden"
            >
              {/* Hover Gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Content */}
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors duration-300">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyBitRaise;
