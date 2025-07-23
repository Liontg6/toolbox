import invertIPv6Mask from "./ipv6MaskToInverseMask";
import ipv6UintArrayToString from "./ipv6UintArrayToString";

export default function ipv6CalculateSubnetBorders(ip: Uint8Array, mask: Uint8Array, compress: boolean): { firstHost: string; lastHost: string } {
  const wildcard = invertIPv6Mask(mask);
  const firstHost = new Uint8Array(16);
  const lastHost = new Uint8Array(16);

  for (let i = 0; i < 16; i++) {
    firstHost[i] = ip[i] & mask[i];
    lastHost[i] = ip[i] | wildcard[i];
  }

  return {
    firstHost: ipv6UintArrayToString(firstHost, compress),
    lastHost: ipv6UintArrayToString(lastHost, compress),
  };
}
