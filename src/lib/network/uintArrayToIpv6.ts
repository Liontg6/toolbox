import ipv6ToUintArray from "./ipv6ToUintArray";

/**
 * Converts an IPv6 address as string to a Uint8Array
 */
export default function uintArrayToIpv6(ip: string, cidr: number): string {
  const ipBytes = ipv6ToUintArray(ip);
  const maskBytes = cidrToIPv6Mask(cidr);
  const networkBytes = new Uint8Array(16);

  for (let i = 0; i < 16; i++) {
    networkBytes[i] = ipBytes[i] & maskBytes[i];
  }

  // Bytes -> IPv6 String
  const hex = [];
  for (let i = 0; i < 8; i++) {
    const group = (networkBytes[i * 2] << 8) | networkBytes[i * 2 + 1];
    hex.push(group.toString(16));
  }

  return hex.join(':');
}

function cidrToIPv6Mask(cidr: number): Uint8Array {
  const mask = new Uint8Array(16);
  let remaining = cidr;
  for (let i = 0; i < 16; i++) {
    if (remaining >= 8) {
      mask[i] = 0xff;
      remaining -= 8;
    } else if (remaining > 0) {
      mask[i] = 0xff << (8 - remaining);
      remaining = 0;
    } else {
      mask[i] = 0x00;
    }
  }
  return mask;
}