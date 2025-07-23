import ipv6UintArrayToString from "./ipv6UintArrayToString";

/**
 * Calculates the network from a given IP and mask
 */
export default function ipv6NetworkFromMask(ip: Uint8Array, mask: Uint8Array, compress: boolean): string {
  const network = new Uint8Array(16);
  for (let i = 0; i < 16; i++) {
    network[i] = ip[i] & mask[i];
  }
  return ipv6UintArrayToString(network, compress);
}
