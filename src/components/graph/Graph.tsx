import { NodeState } from "@/lib/graph/NodeState";

import { Node } from "@/components/graph/Node";
import { useEffect, useRef, useState } from "react";
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
        { nodeId: string; startPosition: Position, offset: Position } | null
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

    useEffect(() => {
        console.log("currentlyDraggingNode changed", currentlyDraggingNode);
    }, [currentlyDraggingNode]);

    return (
        <div
            ref={graphRef}
            className="relative rounded bg-background text-foreground p-4 shadow-md overflow-scroll w-full aspect-video"
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
        >
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
    );
}
