import { NodeState } from "@/lib/graph/NodeState";

import { Node } from "@/components/graph/Node";
import { useRef, useState } from "react";
import { Position } from "@/lib/graph/Position.type";

export function Graph({
    initialNodeStates,
}: {
    initialNodeStates: NodeState<any, any>[];
}) {
    const [nodes, setNodes] = useState<NodeState<any, any>[]>(
        initialNodeStates,
    );

    const [currentlyDraggingNode, setCurrentlyDraggingNode] = useState<
        { nodeId: string; startPosition: Position } | null
    >(null);

    const graphRef = useRef<HTMLDivElement>(null);
    const dragRef = useRef<{ current: HTMLDivElement | null }>({ current: null });

    const setNodePosition = (
        id: string,
        position: { x: number; y: number },
    ) => {
        setNodes((prevNodes) =>
            prevNodes.map((node) =>
                node.id === id ? { ...node, position } : node
            )
        );
    };

    console.log(nodes);

    return (
        <div
            ref={graphRef}
            className="relative rounded bg-background text-foreground p-4 shadow-md overflow-scroll w-full aspect-video"
            onDragOver={(e) => {
                console.log("drag over", e);
                setNodePosition(
                    currentlyDraggingNode!.nodeId,
                    {
                        x: e.clientX - (graphRef.current?.offsetLeft || 0), // Center the node
                        y: e.clientY - (graphRef.current?.offsetTop || 0),
                    },
                );
            }}
        >
            {nodes.map((nodeState) => (
                <Node
                    nodeState={nodeState}
                    onDragStart={(e) => {
                        console.log("drag start", e);
                        setCurrentlyDraggingNode({
                            nodeId: nodeState.id,
                            startPosition: {
                                x: e.clientX,
                                y: e.clientY,
                            },
                        });
                        dragRef.current!.current = e.currentTarget;
                    }}
                    onDrag={(e) => {
                        console.log("dragging", e);
                    }}
                    onDragEnd={(e) => {
                        console.log("drag end", e);
                        setCurrentlyDraggingNode(null);
                    }}
                />
            ))}
        </div>
    );
}
