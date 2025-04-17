/**
 * Converts a single number back to an IP string with binary operations
 */
export default function numberToIpv4(num: number): string {
  return [
      (num >> 24) & 0xFF,
      (num >> 16) & 0xFF,
      (num >> 8) & 0xFF,
      num & 0xFF
  ].join('.');
}