
/**
 * Calculates the subnet mask from a given prefix length
 */
export default function ipv4SubnetMaskFromCidr(cidr: number): number {
    return (0xFFFFFFFF << (32 - cidr)) >>> 0;
}
