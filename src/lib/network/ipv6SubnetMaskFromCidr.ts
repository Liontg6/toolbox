import ipv6UintArrayToString from "./ipv6UintArrayToString";

/**
 * Calculates the subnet mask from a given prefix length
 */
export default function ipv6SubnetFromMask(ip: Uint8Array, mask: Uint8Array, compress: boolean): string {
  const subnet = new Uint8Array(16);
  for (let i = 0; i < 16; i++) {
    subnet[i] = ip[i] & mask[i];
  }
  return ipv6UintArrayToString(subnet, compress);
}
