import React, { useRef } from "react";

type NodeIOProps = {
    type: "input" | "output";
    data_type: string;
    onConnectNodes: (fromId: string, toId: string) => void;
    nodeId: string;
};

export const NodeIO: React.FC<NodeIOProps> = ({ type, onConnectNodes, nodeId, data_type }) => {
    const dragData = useRef<string | null>(null);

    const handleDragStart = (e: React.DragEvent) => {
        if (type === "input") {
            dragData.current = nodeId;
            e.dataTransfer.setData("fromId", nodeId);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        if (type === "output") {
            e.preventDefault();

            e.dataTransfer.dropEffect = "move"; // Show move cursor
            const fromId = e.dataTransfer.getData("fromId");
            console.log({ fromId, nodeId });
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        if (type === "output") {
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
            >
                Input: {data_type}
            </div>
        );
    }

    return (
        <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
        >
            Output: {data_type}
        </div>
    );
};