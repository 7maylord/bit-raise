"use client";

import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import FeaturedCampaigns from "@/components/FeaturedCampaigns";
import HowItWorks from "@/components/HowItWorks";
import Stats from "@/components/Stats";
import WhyBitRaise from "@/components/WhyBitRaise";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <HeroSection />
        <Stats />
        <FeaturedCampaigns />
        <HowItWorks />
        <WhyBitRaise />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
