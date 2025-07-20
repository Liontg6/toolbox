import { NodeIOIdentifier } from "@/components/graph/NodeIO";
import { NodeState } from "./NodeState";

/**
 * Determines whether dropping an edge between two node IOs is valid within the graph.
 */
export const isEdgeDropValid: (fromIO: NodeIOIdentifier, toIO: NodeIOIdentifier, nodes: NodeState<any, any>[]) => {
    valid: boolean;
    reason: string;
} = (fromIO, toIO, nodes) => {
    if (fromIO.nodeId === toIO.nodeId) {
        return {
            valid: false,
            reason: "graph.nodeIO.connect.selfDropError",
        };
    }
    const fromNode = nodes.find(node => node.id === fromIO.nodeId);
    const toNode = nodes.find(node => node.id === toIO.nodeId);

    if (!fromNode || !toNode) {
        return {
            valid: false,
            reason: "graph.nodeIO.connect.nodeNotFound",
        };
    }

    const formNodeIO = fromNode?.getAllIO().find(io => io.name === fromIO.nodeIOName);
    const toNodeIO = toNode?.getAllIO().find(io => io.name === toIO.nodeIOName);

    if (!formNodeIO || !toNodeIO) {
        return {
            valid: false,
            reason: "graph.nodeIO.connect.ioNotFound",
        };
    }

    // TODO: add type checks for the input/output types

    return {
        valid: true,
        reason: "",
    };
}