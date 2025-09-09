import React, { useContext, useEffect } from "react";
import { GraphContext } from "./Graph";
import { isEdgeDropValid } from "@/lib/graph/isEdgeDropValid";
import { NodeIOIdentifier } from "./NodeIO";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";


type NodeIOLabelProps = {
    type: "input" | "output";
    data_type: string;
    nodeIOIdentifier: NodeIOIdentifier;
    ioTranslationKey: string;
    children?: React.ReactNode;
};


export const NodeIOLabel: React.FC<NodeIOLabelProps> = ({ children, type, data_type, nodeIOIdentifier, ioTranslationKey }) => {
    const {
        nodes,
        setPreviewEdge,
    } = useContext(GraphContext);
    const t = useTranslations("graph");

    return (
        <div
            className={cn("flex items-center", type === "input" ? "pl-2" : "pr-2")}
        >
            {t(ioTranslationKey)} {children}
        </div>
    );
};