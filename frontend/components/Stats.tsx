import { TrendingUp, Users, Coins, CheckCircle } from "lucide-react";

const stats = [
  {
    icon: Coins,
    value: "2.4M+",
    label: "STX Raised",
    description: "Total funds raised through BitRaise",
  },
  {
    icon: Users,
    value: "15K+",
    label: "Active Backers",
    description: "Community members supporting projects",
  },
  {
    icon: TrendingUp,
    value: "89%",
    label: "Success Rate",
    description: "Campaigns reaching their goals",
  },
  {
    icon: CheckCircle,
    value: "340+",
    label: "Funded Projects",
    description: "Successfully completed campaigns",
  },
];

const Stats = () => {
  return (
    <section className="py-24 relative">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-card" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="glass-strong rounded-3xl p-8 md:p-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                {/* Icon */}
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                  <stat.icon className="w-6 h-6" />
                </div>

                {/* Value */}
                <div className="text-3xl md:text-4xl font-bold text-foreground mb-1">
                  {stat.value}
                </div>

                {/* Label */}
                <div className="text-lg font-semibold text-foreground mb-1">
                  {stat.label}
                </div>

                {/* Description */}
                <p className="text-sm text-muted-foreground hidden md:block">
                  {stat.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Stats;
