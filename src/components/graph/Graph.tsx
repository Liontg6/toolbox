import { NodeState } from "@/lib/graph/NodeState";

import { Node } from "@/components/graph/Node";
import { Position } from "@/lib/graph/Position.type";
import { cn } from "@/lib/utils";
import { createContext, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Button } from "../ui/button";
import { NodeIOIdentifier } from "./NodeIO";
import { areTypesCompatible } from "@/lib/graph/areTypesCompatible";
import { cva } from "class-variance-authority";

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

    const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
    const [scrollStart, setScrollStart] = useState<{ x: number; y: number } | null>(null);

    const startDragging = (e: React.MouseEvent<HTMLDivElement>) => {
        setDragStart({ x: e.clientX, y: e.clientY });
        setScrollStart({
            x: graphRef.current?.scrollLeft || 0,
            y: graphRef.current?.scrollTop || 0
        });
    };

    const doDragging = (e: React.MouseEvent<HTMLDivElement>) => {
        if (dragStart && scrollStart) {
            const currentX = e.clientX;
            const currentY = e.clientY;
            const deltaX = currentX - dragStart.x;
            const deltaY = currentY - dragStart.y;
            if (graphRef.current) {
                graphRef.current.scrollLeft = scrollStart.x - deltaX;
                graphRef.current.scrollTop = scrollStart.y - deltaY;
            }
        }
    };

    const stopDragging = () => {
        setDragStart(null);
        setScrollStart(null);
    };

    const onMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === graphRef.current) {
            e.preventDefault();
            e.stopPropagation();
            startDragging(e);
        }
    };


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
        doDragging(e);

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

        stopDragging();

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


    const sizeRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const resizeScrollArea = () => {
            if (!sizeRef.current)
                return;

            const parentScrollLeft = (sizeRef.current.parentElement?.clientWidth ?? 0) + (sizeRef.current.parentElement?.scrollLeft ?? 0);
            const parentScrollHeight = (sizeRef.current.parentElement?.clientHeight ?? 0) + (sizeRef.current.parentElement?.scrollTop ?? 0);
            sizeRef.current.style.minHeight = (parentScrollHeight + (sizeRef.current.parentElement?.clientHeight ?? 0)) + "px";
            sizeRef.current.style.minWidth = (parentScrollLeft + (sizeRef.current.parentElement?.clientWidth ?? 0)) + "px";
        }

        resizeScrollArea();
        const resizeObserver = new ResizeObserver(resizeScrollArea);
        if (sizeRef.current?.parentElement)
            resizeObserver.observe(sizeRef.current.parentElement);

        sizeRef.current?.parentElement?.addEventListener("scroll", resizeScrollArea);

        return () => {
            resizeObserver.disconnect();
            sizeRef.current?.parentElement?.removeEventListener("scroll", resizeScrollArea);
        };
    }, [sizeRef.current?.parentElement?.scrollLeft, sizeRef.current?.parentElement?.clientWidth, sizeRef.current?.parentElement?.scrollTop, sizeRef.current?.parentElement?.clientHeight, sizeRef.current?.parentElement]);

    return (
        <GraphContext.Provider value={{ nodes, setPreviewEdge, addEdge, currentlyDraggingNode }}>
            <Button onClick={() => {
                executeGraph(nodes, edges, updatenodeState);
            }}>Execute</Button>
            <div
                ref={graphRef}
                className={cn("relative rounded bg-background text-foreground p-0 shadow-md overflow-scroll w-full aspect-video",
                    currentlyDraggingNode ? "cursor-grabbing" : undefined,
                    dragStart != null ? "cursor-grab" : undefined)}
                onMouseMove={onMouseMove}
                onMouseUp={onMouseUp}
                onMouseDown={onMouseDown}
                onMouseLeave={stopDragging}
            >
                <div className="w-full h-full pointer-events-none" ref={sizeRef} />
                <svg
                    className="sticky inset-0 w-full h-full pointer-events-none z-20"
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


function Edge({
    fromId,
    toId,
    startPosition,
    currentPosition,
    variant,
}: {
    fromId: string;
    toId?: string;
    startPosition: Position;
    currentPosition: Position;
    variant?: "default" | "typewarning" | "typeerror";
}) {
    const geomDistance = Math.sqrt(
        Math.pow(currentPosition.x - startPosition.x, 2) +
        Math.pow(currentPosition.y - startPosition.y, 2)
    );

    const stroke = variant === "typeerror"
        ? "var(--edge-type-error-foreground)" : (variant === "typewarning"
            ? "var(--edge-type-warning-foreground)" : "var(--edge-foreground)");
    return (
        <path
            d={`
                M ${startPosition.x} ${startPosition.y}
                C ${startPosition.x + Math.min(100, geomDistance)} ${startPosition.y},
                  ${currentPosition.x - Math.min(100, geomDistance)} ${currentPosition.y},
                  ${currentPosition.x} ${currentPosition.y}
            `}
            stroke={stroke}
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            shapeRendering="geometricPrecision" // TODO: add option to disable geometricPrecision
            style={{
                strokeDasharray: "10000",
                strokeDashoffset: "10000",
                animation: "draw-line 0.5s ease forwards"
            }} />
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

            const compatibility = areTypesCompatible(
                nodes.find(n => n.id === edge.fromIO.nodeId)?.getAllIO().find(io => io.name === edge.fromIO.nodeIOName)?.type || "any",
                nodes.find(n => n.id === edge.toIO?.nodeId)?.getAllIO().find(io => io.name === edge.toIO?.nodeIOName)?.type || "any",
            );

            const edgeVariant = compatibility === "compatible" ? "default" : (compatibility === "warning" ? "typewarning" : "typeerror");

            return (
                <Edge
                    key={index}
                    fromId={edge.fromIO.nodeId}
                    toId={edge.toIO?.nodeId}
                    startPosition={startPosition}
                    currentPosition={currentPosition}
                    variant={edgeVariant}
                />
            );
        });

        setRenderedEdges(elements.filter((el): el is JSX.Element => el !== null));
    }

    useEffect(() => {
        graphRef.current?.addEventListener("transitionend", recaculateEdges);
        graphRef.current?.addEventListener("scroll", recaculateEdges);
        return () => {
            graphRef.current?.removeEventListener("transitionend", recaculateEdges);
            graphRef.current?.removeEventListener("scroll", recaculateEdges);
        };
    }, [graphRef, graphRef.current, edges, nodes, setRenderedEdges]);

    useLayoutEffect(() => {
        recaculateEdges();
    }, [edges, nodes]);

    return renderedEdges;
}




async function executeGraph(
    nodes: NodeState<any, any>[],
    edges: {
        fromIO: NodeIOIdentifier;
        toIO?: NodeIOIdentifier
    }[],
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