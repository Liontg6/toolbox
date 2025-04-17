/**
 * Converts an IP as string to a single number with binary operations
 */
export default function ipv4ToNumber(ip: string): number {
  const [a, b, c, d] = ip.split('.').map(Number);
  return (a << 24) | (b << 16) | (c << 8) | d;
}