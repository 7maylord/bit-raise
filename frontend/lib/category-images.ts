/**
 * Default images for campaign categories
 * These are used when a campaign doesn't have a custom image
 */
export const CATEGORY_IMAGES: Record<string, string> = {
  Music: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=500&h=300&fit=crop",
  DeFi: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=500&h=300&fit=crop",
  Gaming: "https://images.unsplash.com/photo-1614680376593-902f74cf0d41?w=500&h=300&fit=crop",
  NFT: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=500&h=300&fit=crop",
  Infrastructure: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=500&h=300&fit=crop",
  Social: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=500&h=300&fit=crop",
  Education: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=500&h=300&fit=crop",
  DAO: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&h=300&fit=crop",
  Art: "https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=500&h=300&fit=crop",
  Other: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=500&h=300&fit=crop",
};

/**
 * Get image for a category
 * @param category Campaign category
 * @returns Image URL for the category
 */
export function getCategoryImage(category: string): string {
  return CATEGORY_IMAGES[category] || CATEGORY_IMAGES.Other;
}
