export default function ipv6CalculateSubnetBorders(ip: Uint8Array, cidr: number): { firstHost: string; lastHost: string } {
  const mask = cidrToIPv6Mask(cidr);
  const wildcard = invertIPv6Mask(mask);
  const firstHost = new Uint8Array(16);
  const lastHost = new Uint8Array(16);

  for (let i = 0; i < 16; i++) {
    firstHost[i] = ip[i] & mask[i];
    lastHost[i] = ip[i] | wildcard[i];
  }

  // Hilfsfunktion: Bytes → IPv6 String
  function bytesToIPv6(bytes: Uint8Array): string {
    const hex = [];
    for (let i = 0; i < 16; i += 2) {
      const group = (bytes[i] << 8) | bytes[i + 1];
      hex.push(group.toString(16).padStart(4, '0'));
    }
    return hex.join(':').replace(/(:0)+:/g, '::').replace(/:+/g, ':');
  }

  return {
    firstHost: bytesToIPv6(firstHost),
    lastHost: bytesToIPv6(lastHost),
  };
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

function invertIPv6Mask(mask: Uint8Array): Uint8Array {
  const inverted = new Uint8Array(16);
  for (let i = 0; i < 16; i++) {
    inverted[i] = ~mask[i] & 0xff;
  }
  return inverted;
}
