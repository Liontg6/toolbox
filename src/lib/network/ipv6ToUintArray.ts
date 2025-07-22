/**
 * Converts an IPv6 address as string to a Uint8Array
 */
export default function ipv6ToUintArray(ip: string): Uint8Array {
  const padded = ip.replace('::', ':' + '0:'.repeat(8 - ip.split(':').filter(x => x).length)).replace(/(^:|:$)/g, '');
  const groups = padded.split(':').map(g => parseInt(g || '0', 16));
  const buffer = new Uint8Array(16);
  for (let i = 0; i < groups.length; i++) {
    buffer[i * 2] = (groups[i] >> 8) & 0xff;
    buffer[i * 2 + 1] = groups[i] & 0xff;
  }
  return buffer;
}