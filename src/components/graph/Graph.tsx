import { NodeState } from "@/lib/graph/NodeState";

import { Node } from "@/components/graph/Node";
import { createContext, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Position } from "@/lib/graph/Position.type";
import { cn } from "@/lib/utils";
import { NodeIOIdentifier } from "./NodeIO";
import { set } from "react-hook-form";

export const GraphContext = createContext<{
    nodes: NodeState<any, any>[];
    /**
     * Sets the preview edge for the graph, that the user can see while dragging an edge.
     */
    setPreviewEdge?: (edge: { fromIO: NodeIOIdentifier; toIO?: NodeIOIdentifier } | null) => void;
    addEdge?: (fromIO: NodeIOIdentifier, toIO: NodeIOIdentifier) => void;
    currentlyDraggingNode?: { nodeId: string; startPosition: Position, offset: Position } | null;
}>({
    nodes: [],
    currentlyDraggingNode: null,
});

export function Graph({
    initialNodeStates,
}: {
    initialNodeStates: NodeState<any, any>[];
}) {
    const [nodes, setNodes] = useState<NodeState<any, any>[]>(
        initialNodeStates,
    );

    const [edges, setEdges] = useState<{
        fromIO: NodeIOIdentifier;
        toIO?: NodeIOIdentifier;
    }[]>([]);
    const addEdge = (fromIO: NodeIOIdentifier, toIO: NodeIOIdentifier) => {
        setEdges((prevEdges) => [...prevEdges, { fromIO, toIO }]);
    };

    const [currentlyDraggingNode, setCurrentlyDraggingNode] = useState<
        { nodeId: string; startPosition: Position, offset: Position } | null
    >(null);

    const [previewEdge, setPreviewEdge] = useState<{
        fromIO: NodeIOIdentifier;
        toIO?: NodeIOIdentifier;
    } | null>(null);
    const [previewEdgeStartPosition, setPreviewEdgeStartPosition] = useState<Position | null>(null);

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

        if (previewEdge) {
            const currentPosition = {
                x: e.clientX - (graphRef.current?.offsetLeft || 0),
                y: e.clientY - (graphRef.current?.offsetTop || 0),
            };
            setPreviewEdge({
                ...previewEdge,
                toIO: {
                    nodeId: previewEdge.fromIO.nodeId,
                    nodeIOName: previewEdge.fromIO.nodeIOName,
                },
            });
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

    useEffect(() => {
        console.log("edges changed", edges);
    }, [edges]);

    const renderedEdges = useEdgeRenderer(nodes, graphRef, edges);

    return (
        <GraphContext.Provider value={{ nodes, setPreviewEdge, addEdge, currentlyDraggingNode }}>
            <div
                ref={graphRef}
                className={cn("relative rounded bg-background text-foreground p-4 shadow-md overflow-scroll w-full aspect-video", currentlyDraggingNode ? "cursor-grabbing" : undefined)}
                onMouseMove={onMouseMove}
                onMouseUp={onMouseUp}
            >
                <svg
                    className="absolute inset-0 w-full h-full pointer-events-none z-20"
                >
                    {renderedEdges}
                </svg>
                {nodes.map((nodeState) => (
                    <Node
                        key={nodeState.id}
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
            stroke="blue"
            strokeWidth="2"
            strokeLinecap="round"
        />
    );

}


const useEdgeRenderer = (
    nodes: NodeState<any, any>[],
    graphRef: React.RefObject<HTMLDivElement>,
    edges: {
        fromIO: NodeIOIdentifier;
        toIO?: NodeIOIdentifier;
    }[]
) => {
    const [renderedEdges, setRenderedEdges] = useState<JSX.Element[]>([]);

    const recaculateEdges = () => {
        if (graphRef.current === null) {
            console.warn("Graph ref is null, cannot recalculate edges.");
            setRenderedEdges([]);
            return;
        }

        const graphBounds = graphRef.current.getBoundingClientRect();

        const elements = edges.map((edge, index) => {
            if (graphRef.current === null) return null;
            if (!edge.toIO) return null;

            const startIOBounds = graphRef.current.querySelector(`[data-io-identifier='${JSON.stringify(edge.fromIO)}']`)?.getBoundingClientRect();
            if (!startIOBounds) return null;
            const endIOBounds = graphRef.current.querySelector(`[data-io-identifier='${JSON.stringify(edge.toIO)}']`)?.getBoundingClientRect();
            if (!endIOBounds) return null;
            // TODO: take scrolling into account

            const startPosition: Position = {
                x: startIOBounds.left + startIOBounds.width / 2 - graphBounds.left,
                y: startIOBounds.top + startIOBounds.height / 2 - graphBounds.top,
            };

            const currentPosition: Position = {
                x: endIOBounds.left + endIOBounds.width / 2 - graphBounds.left || startPosition.x,
                y: endIOBounds.top + endIOBounds.height / 2 - graphBounds.top || startPosition.y,
            };

            return (
                <PreviewEdge
                    key={index}
                    fromId={edge.fromIO.nodeId}
                    toId={edge.toIO?.nodeId}
                    startPosition={startPosition}
                    currentPosition={currentPosition}
                />
            );
        });

        setRenderedEdges(elements.filter((el): el is JSX.Element => el !== null));
    }

    useEffect(() => {
        graphRef.current?.addEventListener("transitionend", recaculateEdges);
        return () => {
            graphRef.current?.removeEventListener("transitionend", recaculateEdges);
        };
    }, [graphRef, edges, nodes, setRenderedEdges]);

    useLayoutEffect(() => {
        recaculateEdges();
    }, [edges, nodes]);

    return renderedEdges;
}