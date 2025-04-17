"use client"
import { Button } from "@/components/ui/button";
import { CopyToClipboard } from "@/components/ui/copyToClipboard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Section } from "@/components/ui/Section";
import { Separator } from "@/components/ui/separator";
import ipv4CalculateSubnetBorders from "@/lib/network/ipv4CalculateSubnetBorders";
import ipv4SubnetMaskFromCidr from "@/lib/network/ipv4SubnetMaskFromCidr";
import ipv4ToNumber from "@/lib/network/ipv4ToNumber";
import numberToIpv4 from "@/lib/network/numberToIpv4";
import { PaperPlaneIcon } from "@radix-ui/react-icons";
import { useTranslations } from 'next-intl';
import { useEffect, useState } from "react";


export default function IPCalculator () {
    const t = useTranslations("tools.network.ipcalc");

    const [ip, setIp] = useState<string>("192.168.15.65");
    const [prefixLength, setPrefixLength] = useState<number>(24);
    const [subnetMask, setSubnetMask] = useState<string>("");
    const [inverseSubnetMask, setInverseSubnetMask] = useState<string>("");
    const [networkAddress, setNetworkAddress] = useState<string>("");
    const [numberHosts, setNumberHosts] = useState<number>(0);
    const [firstHost, setFirstHost] = useState<string>("");
    const [lastHost, setLastHost] = useState<string>("");
    const [broadcast, setBroadcast] = useState<string>("");

    const [error, setError] = useState<string>(""); // TODO: add error handling

    useEffect(() => {
        try {
            const _ipNumber = ipv4ToNumber(ip);
            const _subnetMask = ipv4SubnetMaskFromCidr(prefixLength);
            const _inverseSubnetMask = 0xFFFFFFFF ^ _subnetMask;
            const _networkNumber = _ipNumber & _subnetMask;

            setSubnetMask(numberToIpv4(_subnetMask));
            setInverseSubnetMask(numberToIpv4(_inverseSubnetMask));
            setNetworkAddress(numberToIpv4(_networkNumber));
            setNumberHosts(Math.abs(Math.pow(2, 32 - prefixLength) - 2));
            const subnetBorders = ipv4CalculateSubnetBorders(_networkNumber, _inverseSubnetMask);
            setFirstHost(subnetBorders.firstHost);
            setLastHost(subnetBorders.lastHost);
            setBroadcast(subnetBorders.broadcast);
        } catch (e) {
            setError(e as string);
        }
    }, [ip, prefixLength]);

    return <div className="flex flex-col gap-4 lg:gap-8 pt-2">
        <Section variant={"primary"}>
            <h1 className="header-section-1 mb-6">{t("title")}</h1>
            <span className="flex flex-col md:flex-row gap-4 items-center">
                <span className="flex flex-row items-center gap-2 w-full">
                    <div className="flex flex-col w-full items-center">
                        <Label className="w-full pl-1 pr-1 pb-2" htmlFor="input">{t("inputAddress")}</Label>
                        <Input value={ip} onChange={(e) => setIp(e.currentTarget.value)} />
                    </div>
                    <span>
                        /
                    </span>
                    <div className="flex flex-col w-full">
                        <Label className="w-full pl-1 pr-1 pb-2" htmlFor="input">{t("inputPrefix")}</Label>
                        <Input value={prefixLength} onChange={(e) => setPrefixLength(+e.currentTarget.value)} />
                    </div>
                </span>
            </span>

            <Separator orientation="horizontal" className="mt-4" />

            <span className="w-1/2 space-y-1">
                <Label className="w-full pl-1 pr-1 pb-2" htmlFor="input">{t("resultNetmask")}</Label>
                <span className="flex flex-row items-center gap-2 w-full pb-5">
                    <Input value={subnetMask} className="transition-colors duration-500 w-1/2" readOnly />
                    <CopyToClipboard clipboardContent={subnetMask} className="mt-[1px]" />
                </span>
                <Label className="w-full pl-1 pr-1 pb-2" htmlFor="input">{t("resultWildcard")}</Label>
                <span className="flex flex-row items-center gap-2 w-full pb-5">
                    <Input value={inverseSubnetMask} className="transition-colors duration-500 w-1/2" readOnly style={{
                        borderColor: "grey",
                    }} />
                    <CopyToClipboard clipboardContent={inverseSubnetMask} className="mt-[1px]" />
                </span>
                <Label className="w-full pl-1 pr-1 pb-2" htmlFor="input">{t("resultNetwork")}</Label>
                <span className="flex flex-row items-center gap-2 w-full pb-5">
                    <Input value={networkAddress} className="transition-colors duration-500 w-1/2" readOnly style={{
                        borderColor: "grey",
                    }} />
                    <CopyToClipboard clipboardContent={networkAddress} className="mt-[1px]" />
                </span>
                <Label className="w-full pl-1 pr-1 pb-2" htmlFor="input">{t("resultFirstHost")}</Label>
                <span className="flex flex-row items-center gap-2 w-full pb-5">
                    <Input value={firstHost} className="transition-colors duration-500 w-1/2" readOnly style={{
                        borderColor: "grey",
                    }} />
                    <CopyToClipboard clipboardContent={firstHost} className="mt-[1px]" />
                </span>
                <Label className="w-full pl-1 pr-1 pb-2" htmlFor="input">{t("resultLastHost")}</Label>
                <span className="flex flex-row items-center gap-2 w-full pb-5">
                    <Input value={lastHost} className="transition-colors duration-500 w-1/2" readOnly style={{
                        borderColor: "grey",
                    }} />
                    <CopyToClipboard clipboardContent={lastHost} className="mt-[1px]" />
                </span>
                <Label className="w-full pl-1 pr-1 pb-2" htmlFor="input">{t("resultBroadcast")}</Label>
                <span className="flex flex-row items-center gap-2 w-full pb-5">
                    <Input value={broadcast} className="transition-colors duration-500 w-1/2" readOnly style={{
                        borderColor: "grey",
                    }} />
                    <CopyToClipboard clipboardContent={broadcast} className="mt-[1px]" />
                </span>
                <Label className="w-full pl-1 pr-1 pb-2" htmlFor="input">{t("resultAmountHost")}</Label>
                <span className="flex flex-row items-center gap-2 w-full">
                    <Input value={numberHosts} className="transition-colors duration-500 w-1/2" readOnly style={{
                        borderColor: "grey",
                    }} />
                    <CopyToClipboard clipboardContent={numberHosts.toString()} className="mt-[1px]" />
                </span>
            </span>
        </Section>
    </div>
}

const handleCalculation = () => {
    const ip = "192.168.15.65"
    const prefixLength = 24
    const ipNumber = ipv4ToNumber(ip)
    const subnetMask = ipv4SubnetMaskFromCidr(prefixLength)
    const inverseSubnetMask = 0xFFFFFFFF ^ subnetMask
    const networkNumber = ipNumber & subnetMask
    const networkAddress = numberToIpv4(networkNumber)
    const numberHosts = Math.abs(Math.pow(2, 32 - prefixLength) - 2)
    const subnetBorders = ipv4CalculateSubnetBorders(networkNumber, inverseSubnetMask)
    console.log("IP: " + ip)
    console.log("Subnet Mask: " + numberToIpv4(subnetMask))
    console.log("Subnet Wildcard Mask: " + numberToIpv4(inverseSubnetMask))
    console.log("Subnet Address: " + networkAddress)
    console.log("Hosts: " + numberHosts)
    console.log("First Host: " + subnetBorders.firstHost)
    console.log("Last Host: " + subnetBorders.lastHost)
    console.log("Broadcast: " + subnetBorders.broadcast)
}
