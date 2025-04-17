import numberToIpv4 from "./numberToIpv4";

export default function ipv4CalculateSubnetBorders(subnet: number, inverseMask: number): { firstHost: string, lastHost: string, broadcast: string } {
  const broadcast = (subnet | inverseMask) >>> 0;

  const firstHost = (subnet + 1) >>> 0;
  const lastHost = (broadcast - 1) >>> 0;

  // Edge case: /31
  if (firstHost > lastHost) {
      const broadcastIp = numberToIpv4(broadcast)
      return { firstHost: numberToIpv4(subnet), lastHost: broadcastIp, broadcast: broadcastIp };
  }

  // Edge case: /32
  if (subnet === broadcast) {
      const subnetIp = numberToIpv4(subnet)
      return { firstHost: subnetIp, lastHost: subnetIp, broadcast: subnetIp };
  }

  return {
      firstHost: numberToIpv4(firstHost),
      lastHost: numberToIpv4(lastHost),
      broadcast: numberToIpv4(broadcast)
  };
}
