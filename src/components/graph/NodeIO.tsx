import React, { useContext, useRef } from "react";
import { GraphContext } from "./Graph";

type NodeIOProps = {
    type: "input" | "output";
    data_type: string;
    onConnectNodes: (fromId: string, toId: string) => void;
    nodeId: string;
};

export const NodeIO: React.FC<NodeIOProps> = ({ type, onConnectNodes, nodeId, data_type }) => {
    const nodes = useContext(GraphContext).nodes;

    const handleDragStart = (e: React.DragEvent) => {
        console.log(`Dragging ${type} with nodeId: ${nodeId}`);

        e.dataTransfer.setData("fromId", nodeId);
    };

    const handleDragOver = (e: React.DragEvent) => {
        // TODO: add checks to ensure the drop is valid
        e.preventDefault();

        e.dataTransfer.dropEffect = "move";
        const fromId = e.dataTransfer.getData("fromId");
        console.log({ fromId, nodeId });
    };

    const handleDrop = (e: React.DragEvent) => {
        if (e.dataTransfer && e.dataTransfer.getData("fromId")) { // TODO: add checks to ensure the drop is valid
            const fromId = e.dataTransfer.getData("fromId");
            if (fromId && fromId !== nodeId) {
                onConnectNodes(fromId, nodeId);
            }
        }
    };

    if (type === "input") {
        return (
            <div
                draggable={true}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
            >
                Input: {data_type}
            </div>
        );
    }

    return (
        <div
            draggable={true}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
        >
            Output: {data_type}
        </div>
    );
};