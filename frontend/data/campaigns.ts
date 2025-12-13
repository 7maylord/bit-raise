export interface Campaign {
  id: string;
  title: string;
  description: string;
  fullDescription: string;
  image: string;
  raised: number;
  goal: number;
  backers: number;
  daysLeft: number;
  category: string;
  creator: string;
  createdAt: string;
}

export const campaigns: Campaign[] = [
  {
    id: "decentralized-music-platform",
    title: "Decentralized Music Platform",
    description: "Building a Web3 music streaming service where artists get 90% of revenue directly through smart contracts.",
    fullDescription: "We're revolutionizing the music industry by building a fully decentralized streaming platform on Stacks. Artists will receive 90% of all streaming revenue directly through smart contracts, eliminating middlemen and ensuring fair compensation. The platform features on-chain royalty splits, NFT-based music ownership, and community governance for playlist curation.",
    image: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=500&h=300&fit=crop",
    raised: 12500,
    goal: 20000,
    backers: 234,
    daysLeft: 18,
    category: "Music",
    creator: "SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKP9",
    createdAt: "2024-01-15",
  },
  {
    id: "bitcoin-native-dex",
    title: "Bitcoin-Native DEX on Stacks",
    description: "A fully decentralized exchange with atomic swaps and liquidity pools, all settled on Bitcoin.",
    fullDescription: "Building the most secure DEX in crypto - one that inherits Bitcoin's security guarantees. Our exchange features atomic swaps for trustless trading, concentrated liquidity pools for capital efficiency, and all transactions are ultimately settled on the Bitcoin blockchain. No wrapped tokens, no bridges, just pure Bitcoin security.",
    image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=500&h=300&fit=crop",
    raised: 45000,
    goal: 50000,
    backers: 567,
    daysLeft: 12,
    category: "DeFi",
    creator: "SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8Q",
    createdAt: "2024-01-10",
  },
  {
    id: "nft-gaming-ecosystem",
    title: "NFT Gaming Ecosystem",
    description: "Play-to-earn gaming platform with true ownership of in-game assets secured by Bitcoin.",
    fullDescription: "Enter a new era of gaming where you truly own your in-game assets. Our ecosystem lets players earn, trade, and own game items as NFTs on Stacks, secured by Bitcoin. Features include cross-game asset compatibility, player-driven marketplaces, and governance tokens for community-led game development.",
    image: "https://images.unsplash.com/photo-1614680376593-902f74cf0d41?w=500&h=300&fit=crop",
    raised: 8900,
    goal: 15000,
    backers: 156,
    daysLeft: 24,
    category: "Gaming",
    creator: "SP1HTBVD3JG9C05J7HBJTHGR0GGW7KXW28M",
    createdAt: "2024-01-20",
  },
  {
    id: "dao-governance-tools",
    title: "DAO Governance Tools",
    description: "Open-source toolkit for creating and managing DAOs with on-chain voting and treasury management.",
    fullDescription: "Empowering decentralized organizations with comprehensive governance tools. Our open-source toolkit includes proposal creation, on-chain voting with delegation, treasury management with multi-sig support, and analytics dashboards. All built on Stacks with Bitcoin finality for maximum security.",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&h=300&fit=crop",
    raised: 30000,
    goal: 30000,
    backers: 412,
    daysLeft: 5,
    category: "Tools",
    creator: "SP2C2YFP12AJZB4MABJBAJ55XECVS7E4P",
    createdAt: "2024-01-05",
  },
  {
    id: "privacy-layer-stacks",
    title: "Privacy Layer for Stacks",
    description: "Zero-knowledge proof integration for private transactions while maintaining Bitcoin's security.",
    fullDescription: "Privacy is a fundamental right. We're building a zero-knowledge proof layer for Stacks that enables private transactions without compromising Bitcoin's security guarantees. Users can choose to make transfers private, prove ownership without revealing amounts, and maintain financial sovereignty.",
    image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=500&h=300&fit=crop",
    raised: 18750,
    goal: 40000,
    backers: 289,
    daysLeft: 30,
    category: "Privacy",
    creator: "SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N",
    createdAt: "2024-01-25",
  },
  {
    id: "social-recovery-wallet",
    title: "Social Recovery Wallet",
    description: "Next-gen wallet with social recovery, multi-sig, and seamless UX for mainstream adoption.",
    fullDescription: "The wallet that makes self-custody safe for everyone. Features include social recovery through trusted guardians, multi-signature security options, gas abstraction for seamless UX, and hardware wallet integration. Designed to bring the next billion users to Bitcoin and Stacks.",
    image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=500&h=300&fit=crop",
    raised: 22000,
    goal: 35000,
    backers: 345,
    daysLeft: 15,
    category: "Wallet",
    creator: "SP1P72Z3704VMT3DMHPP2CB8TGQWGDBHD3R",
    createdAt: "2024-01-18",
  },
];

export const getCampaignById = (id: string): Campaign | undefined => {
  return campaigns.find(campaign => campaign.id === id);
};
