"use client"
import { Button } from "@/components/ui/button";
import { CopyToClipboard } from "@/components/ui/copyToClipboard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Section } from "@/components/ui/Section";
import { Separator } from "@/components/ui/separator";
import { PaperPlaneIcon } from "@radix-ui/react-icons";
import { useTranslations } from 'next-intl';
import { useEffect, useState } from "react";

export default function IPCalculator () {
    const t = useTranslations("tools.network.ipcalc");

    const [address, setAddress] = useState<string>("192.168.1.0");
    const [mask, setMask] = useState<number>(24);
    const [output, setOutput] = useState<string>("");

    useEffect(() => {
        try {
            setOutput(address);
        } catch (e) {
            setOutput(e as string);
        }
    }, [address]);

    return <div className="flex flex-col gap-4 lg:gap-8 pt-2">
        <Section variant={"primary"}>
            <h1 className="header-section-1 mb-6">{t("title")}</h1>
            <span className="flex flex-col md:flex-row gap-4 items-center">
                <span className="flex flex-row items-center gap-2 w-full">
                    <div className="flex flex-col w-full">
                        <Label className="w-full pl-1 pr-1 pb-2" htmlFor="input">{t("inputAddress")}</Label>
                        <Input value={address} onChange={(e) => setAddress(e.currentTarget.value)} />
                    </div>
                    <div className="flex flex-col">
                        <Label>/</Label>
                    </div>
                    <div className="flex flex-col w-full">
                        <Label className="w-full pl-1 pr-1 pb-2" htmlFor="input">{t("inputPrefix")}</Label>
                        <Input value={mask} onChange={(e) => setMask(+e.currentTarget.value)} />
                    </div>
                </span>
            </span>

            <Button variant={"default"} className="flex flex-row gap-2" onClick={handleCalculation}>
                <span>{t("buttonCalculate")}</span>
                <PaperPlaneIcon className="h-4 w-4" />
            </Button>

            <Separator orientation="horizontal" className="mt-4" />

            <span className="w-1/2 space-y-1">
                <Label className="w-full pl-1 pr-1 pb-2" htmlFor="input">{t("resultNetmask")}</Label>
                <span className="flex flex-row items-center gap-2 w-full pb-5">
                    <Input value={output} className="transition-colors duration-500 w-1/2" readOnly style={{
                        borderColor: "grey",
                    }} />
                    <CopyToClipboard clipboardContent={output} className="mt-[1px]" />
                </span>
                <Label className="w-full pl-1 pr-1 pb-2" htmlFor="input">{t("resultWildcard")}</Label>
                <span className="flex flex-row items-center gap-2 w-full pb-5">
                    <Input value={output} className="transition-colors duration-500 w-1/2" readOnly style={{
                        borderColor: "grey",
                    }} />
                    <CopyToClipboard clipboardContent={output} className="mt-[1px]" />
                </span>
                <Label className="w-full pl-1 pr-1 pb-2" htmlFor="input">{t("resultNetwork")}</Label>
                <span className="flex flex-row items-center gap-2 w-full pb-5">
                    <Input value={output} className="transition-colors duration-500 w-1/2" readOnly style={{
                        borderColor: "grey",
                    }} />
                    <CopyToClipboard clipboardContent={output} className="mt-[1px]" />
                </span>
                <Label className="w-full pl-1 pr-1 pb-2" htmlFor="input">{t("resultFirstHost")}</Label>
                <span className="flex flex-row items-center gap-2 w-full pb-5">
                    <Input value={output} className="transition-colors duration-500 w-1/2" readOnly style={{
                        borderColor: "grey",
                    }} />
                    <CopyToClipboard clipboardContent={output} className="mt-[1px]" />
                </span>
                <Label className="w-full pl-1 pr-1 pb-2" htmlFor="input">{t("resultLastHost")}</Label>
                <span className="flex flex-row items-center gap-2 w-full pb-5">
                    <Input value={output} className="transition-colors duration-500 w-1/2" readOnly style={{
                        borderColor: "grey",
                    }} />
                    <CopyToClipboard clipboardContent={output} className="mt-[1px]" />
                </span>
                <Label className="w-full pl-1 pr-1 pb-2" htmlFor="input">{t("resultBroadcast")}</Label>
                <span className="flex flex-row items-center gap-2 w-full pb-5">
                    <Input value={output} className="transition-colors duration-500 w-1/2" readOnly style={{
                        borderColor: "grey",
                    }} />
                    <CopyToClipboard clipboardContent={output} className="mt-[1px]" />
                </span>
                <Label className="w-full pl-1 pr-1 pb-2" htmlFor="input">{t("resultAmountHost")}</Label>
                <span className="flex flex-row items-center gap-2 w-full">
                    <Input value={output} className="transition-colors duration-500 w-1/2" readOnly style={{
                        borderColor: "grey",
                    }} />
                    <CopyToClipboard clipboardContent={output} className="mt-[1px]" />
                </span>
            </span>
        </Section>
    </div>
}

const handleCalculation = () => {
    const ip = "192.168.15.65"
    const prefixLength = 24
    const ipNumber = ipToNumber(ip)
    const subnetMask = subnetMaskFromCidr(prefixLength)
    const inverseSubnetMask = 0xFFFFFFFF ^ subnetMask
    const networkNumber = ipNumber & subnetMask
    const networkAddress = numberToIp(networkNumber)
    const numberHosts = Math.abs(Math.pow(2, 32 - prefixLength) - 2)
    const subnetBorders = calculateSubnetBorders(networkNumber, inverseSubnetMask)
    console.log("IP: " + ip)
    console.log("Subnet Mask: " + numberToIp(subnetMask))
    console.log("Subnet Wildcard Mask: " + numberToIp(inverseSubnetMask))
    console.log("Subnet Address: " + networkAddress)
    console.log("Hosts: " + numberHosts)
    console.log("First Host: " + subnetBorders.firstHost)
    console.log("Last Host: " + subnetBorders.lastHost)
    console.log("Broadcast: " + subnetBorders.broadcast)
}

// Converts an IP as string to a single number with binary operations
// Example: 192.168.1.0
// (192 << 24) + (168 << 16) + (1 << 8) + 0 = -1062731520
function ipToNumber(ip: string): number {
    const [a, b, c, d] = ip.split('.').map(Number);
    return (a << 24) | (b << 16) | (c << 8) | d;
}

// Converts a single number back to an IP string with binary operations
// Example: -1062731520
// (-1062731520 >> 24) & 0xFF = 192
// (-1062731520 >> 16) & 0xFF = 168
// (-1062731520 >> 8) & 0xFF = 1
// (-1062731520 >> 0) & 0xFF = 0
// -> 192.168.1.0
function numberToIp(num: number): string {
    return [
        (num >> 24) & 0xFF,
        (num >> 16) & 0xFF,
        (num >> 8) & 0xFF,
        num & 0xFF
    ].join('.');
}

// Calculates the subnet mask from a given prefix length
// Example: /24
function subnetMaskFromCidr(cidr: number): number {
    return (0xFFFFFFFF << (32 - cidr)) >>> 0;
}

// Calculates the network address from any IP in the network and a given prefix length
// Example: 192.168.1.5/24
// -> 192.168.1.0
function calculateNetworkAddress(ip: string, cidr: number): string {
    const ipNumber = ipToNumber(ip);
    const subnetMask = subnetMaskFromCidr(cidr);
    const networkNumber = ipNumber & subnetMask;
    return numberToIp(networkNumber);
}

function calculateSubnetBorders(subnet: number, inverseMask: number): { firstHost: string, lastHost: string, broadcast: string } {
    const broadcast = (subnet | inverseMask) >>> 0;

    const firstHost = (subnet + 1) >>> 0;
    const lastHost = (broadcast - 1) >>> 0;

    // Edge case: /31
    if (firstHost > lastHost) {
        const broadcastIp = numberToIp(broadcast)
        return { firstHost: numberToIp(subnet), lastHost: broadcastIp, broadcast: broadcastIp };
    }

    // Edge case: /32
    if (subnet === broadcast) {
        const subnetIp = numberToIp(subnet)
        return { firstHost: subnetIp, lastHost: subnetIp, broadcast: subnetIp };
    }

    return {
        firstHost: numberToIp(firstHost),
        lastHost: numberToIp(lastHost),
        broadcast: numberToIp(broadcast)
    };
}
