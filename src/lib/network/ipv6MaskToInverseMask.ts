export default function invertIPv6Mask(mask: Uint8Array): Uint8Array {
  const inverted = new Uint8Array(16);
  for (let i = 0; i < 16; i++) {
    inverted[i] = ~mask[i] & 0xff;
  }
  return inverted;
}
