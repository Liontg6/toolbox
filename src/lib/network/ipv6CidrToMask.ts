export default function ipv6CidrToMask(cidr: number): Uint8Array {
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
