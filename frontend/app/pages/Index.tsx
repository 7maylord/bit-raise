import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import FeaturedCampaigns from "@/components/FeaturedCampaigns";
import HowItWorks from "@/components/HowItWorks";
import Stats from "@/components/Stats";
import WhyBitRaise from "@/components/WhyBitRaise";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import { Helmet } from "react-helmet-async";

const Index = () => {
  return (
    <>
      <Helmet>
        <title>BitRaise - Decentralized Crowdfunding on Bitcoin L2</title>
        <meta
          name="description"
          content="Fund your vision with Bitcoin's security. BitRaise is the leading decentralized crowdfunding platform built on Stacks, Bitcoin's Layer 2."
        />
        <meta property="og:title" content="BitRaise - Decentralized Crowdfunding on Bitcoin L2" />
        <meta
          property="og:description"
          content="Fund your vision with Bitcoin's security. Launch campaigns, back innovations, and build the future on the most secure blockchain."
        />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://bitraise.io" />
      </Helmet>

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
    </>
  );
};

export default Index;
