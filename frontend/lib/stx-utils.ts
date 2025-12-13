/**
 * Stacks utility functions for BitRaise
 */

/**
 * Abbreviate a Stacks address for display
 * @param address - Full Stacks address
 * @returns Abbreviated address (e.g., "ST1SJ...Q8YPD5")
 */
export function abbreviateAddress(address: string): string {
  if (!address) return "";
  return `${address.substring(0, 5)}...${address.substring(address.length - 6)}`;
}

/**
 * Convert micro-STX to STX
 * @param microStx - Amount in micro-STX (1 STX = 1,000,000 micro-STX)
 * @returns Amount in STX
 */
export function microStxToStx(microStx: number | bigint): number {
  return Number(microStx) / 1_000_000;
}

/**
 * Convert STX to micro-STX
 * @param stx - Amount in STX
 * @returns Amount in micro-STX
 */
export function stxToMicroStx(stx: number): number {
  return Math.floor(stx * 1_000_000);
}

/**
 * Format STX amount for display
 * @param microStx - Amount in micro-STX
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted string (e.g., "10.50 STX")
 */
export function formatStx(microStx: number | bigint, decimals: number = 2): string {
  const stx = microStxToStx(microStx);
  return `${stx.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })} STX`;
}

/**
 * Calculate campaign progress percentage
 * @param pledged - Total pledged amount
 * @param goal - Campaign goal amount
 * @returns Progress percentage (0-100)
 */
export function calculateProgress(pledged: number, goal: number): number {
  if (goal === 0) return 0;
  return Math.min(Math.floor((pledged / goal) * 100), 100);
}

/**
 * Convert block duration to days
 * @param blocks - Number of blocks (10 min per block)
 * @returns Number of days
 */
export function blocksToDays(blocks: number): number {
  return Math.floor((blocks * 10) / (60 * 24));
}

/**
 * Convert days to blocks
 * @param days - Number of days
 * @returns Number of blocks (10 min per block)
 */
export function daysToBlocks(days: number): number {
  return Math.floor((days * 24 * 60) / 10);
}

/**
 * Format block height as date
 * @param blockHeight - Block height
 * @param currentHeight - Current block height
 * @returns Human-readable time remaining
 */
export function formatTimeRemaining(blockHeight: number, currentHeight: number): string {
  const blocksRemaining = blockHeight - currentHeight;

  if (blocksRemaining <= 0) {
    return "Ended";
  }

  const daysRemaining = blocksToDays(blocksRemaining);

  if (daysRemaining === 0) {
    const hoursRemaining = Math.floor((blocksRemaining * 10) / 60);
    return `${hoursRemaining} ${hoursRemaining === 1 ? 'hour' : 'hours'} remaining`;
  }

  return `${daysRemaining} ${daysRemaining === 1 ? 'day' : 'days'} remaining`;
}
