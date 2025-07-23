"use client"
import { Checkbox } from "@/components/ui/checkbox";
import { CopyToClipboard } from "@/components/ui/copyToClipboard";
import { Input } from "@/components/ui/input";
import { Ipv6AddressInput } from "@/components/ui/ipv6AddressInput";
import { Label } from "@/components/ui/label";
import { Section } from "@/components/ui/Section";
import { Separator } from "@/components/ui/separator";
import ipv6CalculateSubnetBorders from "@/lib/network/ipv6CalculateSubnetBorders";
import ipv6CidrToMask from "@/lib/network/ipv6CidrToMask";
import ipv6NetworkFromMask from "@/lib/network/ipv6NetworkFromMask";
import ipv6ToUintArray from "@/lib/network/ipv6ToUintArray";
import { useTranslations } from 'next-intl';
import { useEffect, useState } from "react";

function getNumberHosts(cidr: number): bigint {
  return 2n ** (128n - BigInt(cidr));
}

function getNumberHostsString(hosts: bigint, cidr: number): string {
  if (hosts <= 268435456) {
    return `${hosts}`;
  } else {
    return `2^${128 - cidr}`;
  }
}

export default function IPCalculator6 () {
    const t = useTranslations("tools.network.ipcalc6");

    const [ip, setIp] = useState<string>("d0d0:0015:dead:0000:0000:0000:0000:0006");
    const [prefixLength, setPrefixLength] = useState<number>(108);
    const [networkAddress, setNetworkAddress] = useState<string>("");
    const [numberHosts, setNumberHosts] = useState<bigint>(0n);
    const [firstHost, setFirstHost] = useState<string>("");
    const [lastHost, setLastHost] = useState<string>("");
    const [compress, setCompress] = useState<boolean>(false);

    const [error, setError] = useState<string>(""); // TODO: add error handling

    useEffect(() => {
        try {
            const _ipIntArray = ipv6ToUintArray(ip);
            const _ipMask = ipv6CidrToMask(prefixLength);

            setNetworkAddress(ipv6NetworkFromMask(_ipIntArray, _ipMask, compress) + `/${prefixLength}`);
            const subnetBorders = ipv6CalculateSubnetBorders(_ipIntArray, _ipMask, compress);
            setFirstHost(subnetBorders.firstHost);
            setLastHost(subnetBorders.lastHost);
            setNumberHosts(getNumberHosts(prefixLength));
        } catch (e) {
            setError(e as string);
        }
    }, [ip, prefixLength, compress]);

    return <div className="flex flex-col gap-4 lg:gap-8 pt-2">
        <Section variant={"primary"}>
            <h1 className="header-section-1 mb-6">{t("title")}</h1>
            <span className="flex flex-col md:flex-row gap-4 items-center">
                <span className="flex flex-row items-center gap-2 w-full">
                    <div className="flex flex-col">
                        <Label className="w-full pl-1 pr-1 pb-2" htmlFor="input">{t("inputAddress")}</Label>
                        <Ipv6AddressInput valueIp={ip} valueCidr={prefixLength} onChange={(ip, cidr) => {
                            setIp(ip);
                            setPrefixLength(+cidr);
                        }} />
                    </div>

                </span>
            </span>

            <div className="flex flex-row flex-wrap gap-2 lg:gap-4 my-2">
                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="compress"
                        checked={compress}
                        onCheckedChange={(value) => setCompress(value === true)} />
                    <label
                        htmlFor="compress"
                        className="peer-disabled:cursor-not-allowed hover:cursor-pointer"
                    >
                        {t("compress")}
                    </label>
                </div>
            </div>

            <Separator orientation="horizontal" className="my-4 md:my-8" />

            <span className="w-1/2 space-y-1">
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
                <Label className="w-full pl-1 pr-1 pb-2" htmlFor="input">{t("resultAmountHost")}</Label>
                <span className="flex flex-row items-center gap-2 w-full">
                    <Input value={getNumberHostsString(numberHosts, prefixLength)} className="transition-colors duration-500 w-1/2" readOnly style={{
                        borderColor: "grey",
                    }} />
                    <CopyToClipboard clipboardContent={numberHosts.toString()} className="mt-[1px]" />
                </span>
            </span>
        </Section>
    </div>
}
