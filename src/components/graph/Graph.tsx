import { NodeState } from "@/lib/graph/NodeState";

import { Node } from "@/components/graph/Node";
import { createContext, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Position } from "@/lib/graph/Position.type";
import { cn } from "@/lib/utils";
import { NodeIOIdentifier } from "./NodeIO";
import { Button } from "../ui/button";

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

    /**
     * Adds an edge between two node IOs.
     * 
     * Edges are always directed from the source node IO to the target node IO.
     * 
     * @param fromIO The source node IO.
     * @param toIO The target node IO.
     */
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

    const renderedEdges = useEdgeRenderer(nodes, graphRef, edges);

    const updatenodeState = (nodeId: string, newState: Partial<NodeState<any, any>>) => {
        setNodes((prevNodes) =>
            prevNodes.map((node) =>
                node.id === nodeId ? { ...node, ...newState } : node
            )
        );
    };

    return (
        <GraphContext.Provider value={{ nodes, setPreviewEdge, addEdge, currentlyDraggingNode }}>
            <Button onClick={() => {
                executeGraph(nodes, edges, updatenodeState);
            }}>Execute</Button>
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
            style={{
                strokeDasharray: "10000",
                strokeDashoffset: "10000",
                animation: "draw-line 0.5s ease forwards"
            }}
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
                x: startIOBounds.left + startIOBounds.width / 2 - graphBounds.left + graphRef.current.scrollLeft,
                y: startIOBounds.top + startIOBounds.height / 2 - graphBounds.top + graphRef.current.scrollTop,
            };

            const currentPosition: Position = {
                x: endIOBounds.left + endIOBounds.width / 2 - graphBounds.left + graphRef.current.scrollLeft || startPosition.x,
                y: endIOBounds.top + endIOBounds.height / 2 - graphBounds.top + graphRef.current.scrollTop || startPosition.y,
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



async function executeGraph(
    nodes: NodeState<any, any>[],
    edges: { fromIO: NodeIOIdentifier;
    toIO?: NodeIOIdentifier }[],
    setNodeState: (nodeId: string, newState: Partial<NodeState<any, any>>) => void) {
    console.log("Executing graph with nodes:", nodes, "and edges:", edges);

    // STEP A: prepare

    // override setNodeState to also update the node state in this context
    const originalSetNodeState = setNodeState;
    setNodeState = (nodeId: string, newState: Partial<NodeState<any, any>>) => {
        originalSetNodeState(nodeId, newState);
        const nodeIndex = nodes.findIndex(node => node.id === nodeId);
        if (nodeIndex !== -1) {
            nodes[nodeIndex] = { ...nodes[nodeIndex], ...newState };
        }
    }

    // STEP B: find all output nodes and build a execution order
    const outputNodes = nodes.filter(node => node.type === "output");
    if (outputNodes.length === 0) {
        console.warn("No output nodes found in the graph.");
        return;
    }

    const executionOrder: NodeState<any, any>[] = [];
    const visitedNodes = new Set<string>();

    const visitNode = (node: NodeState<any, any>) => {
        if (visitedNodes.has(node.id)) return;
        visitedNodes.add(node.id);

        // Visit all connected input nodes
        const inputEdges = edges.filter(edge => edge.toIO?.nodeId === node.id);
        inputEdges.forEach(edge => {
            const inputNode = nodes.find(n => n.id === edge.fromIO.nodeId);
            if (inputNode) {
                visitNode(inputNode);
            }
        });

        executionOrder.push(node);
    };

    outputNodes.forEach(outputNode => {
        visitNode(outputNode);
    });


    console.info("Execution order:", executionOrder);
    // TODO: save this order of execution as it should not change if the graph is not modified.

    // STEP C: execute each node in the order
    for (const node of executionOrder) {
        console.info(`Executing node ${node.id} of type ${node.type}`);

        // set node isProcessing to true
        setNodeState(node.id, { isProcessing: true });

        const getStateOfPreviousNodes = () => {
            const inputEdges = edges.filter(edge => edge.toIO?.nodeId === node.id);
            const previousStates: Record<string, any> = {};
            inputEdges.forEach(edge => {
                const inputNode = nodes.find(n => n.id === edge.fromIO.nodeId);
                if (inputNode) {
                    previousStates[edge.fromIO.nodeIOName] = inputNode.state;
                }
            });
            return previousStates;
        };

        const previousStates = getStateOfPreviousNodes();
        console.log(`Previous states for node ${node.id}:`, previousStates);

        // map the output of the prevoius nodes to the input of the current node, using the edges
        const parameters: Record<string, any> = {};
        node.inputs.forEach(input => {
            const inputEdge = edges.find(edge => edge.toIO?.nodeId === node.id && edge.toIO.nodeIOName === input.name);
            if (inputEdge) {
                const inputNode = nodes.find(n => n.id === inputEdge.fromIO.nodeId);
                if (inputNode) {
                    parameters[input.name] = inputNode.state[inputEdge.fromIO.nodeIOName];
                }
            } else {
                parameters[input.name] = previousStates[input.name] || null; // fallback to previous state
            }
        });

        await node.execute(parameters).then((result) => {
            console.info(`Node ${node.id} executed successfully with result:`, result, "and parameters:", parameters);
            
            setNodeState(node.id, { state: { ...node.state, ...result } });
            console.info(`Node ${node.id} state updated to:`, { ...node.state, ...result });
        }).catch((error) => {
            console.error(`Error executing node ${node.id}:`, error);
            // Optionally handle errors, e.g., set an error state
            setNodeState(node.id, { isProcessing: false, error: error.message });
        }).finally(() => {
            // set node isProcessing to false
            setNodeState(node.id, { isProcessing: false });
        });
    }
}