import React, { useContext, useEffect } from "react";
import { GraphContext } from "./Graph";
import { isEdgeDropValid } from "@/lib/graph/isEdgeDropValid";
import { NodeIOIdentifier } from "./NodeIO";
import { cn } from "@/lib/utils";


type NodeIOLabelProps = {
    type: "input" | "output";
    data_type: string;
    nodeIOIdentifier: NodeIOIdentifier;
    children?: React.ReactNode;
};


export const NodeIOLabel: React.FC<NodeIOLabelProps> = ({ children, type, data_type, nodeIOIdentifier }) => {
    const {
        nodes,
        setPreviewEdge,
    } = useContext(GraphContext);

    return (
        <div
            className={cn("flex items-center", type === "input" ? "pl-2" : "pr-2")}
        >
            {nodeIOIdentifier.nodeIOName} {children}
        </div>
    );
};