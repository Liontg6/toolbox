import { NodeState } from "@/lib/graph/NodeState";

import { Node } from "@/components/graph/Node";
import { createContext, useEffect, useRef, useState } from "react";
import { Position } from "@/lib/graph/Position.type";
import { cn } from "@/lib/utils";
import { NodeIOIdentifier } from "./NodeIO";

export const GraphContext = createContext<{
    nodes: NodeState<any, any>[];
    /**
     * Sets the preview edge for the graph, that the user can see while dragging an edge.
     */
    setPreviewEdge?: (edge: { fromIO: NodeIOIdentifier; toIO?: NodeIOIdentifier } | null) => void;
}>({
    nodes: [],
});

export function Graph({
    initialNodeStates,
}: {
    initialNodeStates: NodeState<any, any>[];
}) {
    const [nodes, setNodes] = useState<NodeState<any, any>[]>(
        initialNodeStates,
    );

    const [currentlyDraggingNode, setCurrentlyDraggingNode] = useState<
        { nodeId: string; startPosition: Position, offset: Position } | null
    >(null);

    const [previewEdge, setPreviewEdge] = useState<{
        fromIO: NodeIOIdentifier;
        toIO?: NodeIOIdentifier;
    } | null>(null);

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

    const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (currentlyDraggingNode) {
            const newPosition = {
                x: e.clientX - (graphRef.current?.offsetLeft || 0) + currentlyDraggingNode.offset.x,
                y: e.clientY - (graphRef.current?.offsetTop || 0) + currentlyDraggingNode.offset.y,
            };
            setNodePosition(currentlyDraggingNode.nodeId, newPosition);
        }
    };
    const onMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (currentlyDraggingNode) {
            setCurrentlyDraggingNode(null);
        }
    };

    console.log("previewEdge changed", previewEdge);
    

    useEffect(() => {
        console.log("currentlyDraggingNode changed", currentlyDraggingNode);
    }, [currentlyDraggingNode]);

    return (
        <GraphContext.Provider value={{ nodes, setPreviewEdge }}>
            <div
                ref={graphRef}
                className={cn("relative rounded bg-background text-foreground p-4 shadow-md overflow-scroll w-full aspect-video", currentlyDraggingNode ? "cursor-grabbing" : undefined)}
                onMouseMove={onMouseMove}
                onMouseUp={onMouseUp}
            >
                <svg
                    className="absolute inset-0 w-full h-full pointer-events-none"
                    style={{ zIndex: -1 }}
                >
                    // TODO: preview edge rendering
                </svg>
                {nodes.map((nodeState) => (
                    <Node
                        nodeState={nodeState}
                        onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setCurrentlyDraggingNode({
                                nodeId: nodeState.id,
                                startPosition: {
                                    x: e.clientX - (graphRef.current?.offsetLeft || 0),
                                    y: e.clientY - (graphRef.current?.offsetTop || 0),
                                },
                                offset: {
                                    x: nodeState.position.x - (e.clientX - (graphRef.current?.offsetLeft || 0)),
                                    y: nodeState.position.y - (e.clientY - (graphRef.current?.offsetTop || 0)),
                                },
                            });
                            dragRef.current.current = e.currentTarget;
                        }}
                        onMouseMove={onMouseMove}
                        onMouseUp={onMouseUp}
                    />
                ))}
            </div>
        </GraphContext.Provider>
    );
}


function PreviewEdge({
    fromId,
    toId,
    startPosition,
    currentPosition,
}: {
    fromId: string;
    toId?: string;
    startPosition: Position;
    currentPosition: Position;
}) {
    return (
        <line
            x1={startPosition.x}
            y1={startPosition.y}
            x2={currentPosition.x}
            y2={currentPosition.y}
            stroke="white"
            strokeWidth={2}
            markerEnd="url(#arrowhead)"
            className="transition-all duration-200 ease-in-out"
        />
    );

}