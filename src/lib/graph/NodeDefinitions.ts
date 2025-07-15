import { NodeDefinition } from "@/lib/graph/NodeDefinition";

export type NODE_TYPES = "input" | "output" | "textToBase64";

export const NODE_DEFINITIONS: {[key in NODE_TYPES]: NodeDefinition<any, any>} = {
    input: {
        type: "input",
        name: "node.input.generic",
        inputs: [],
        outputs: [{
            name: "node.input.generic.input",
            type: "node.types.generic",
        }],
        execute: async () => {},
        state: {},
    },
    output: {
        type: "output",
        name: "node.output.generic",
        inputs: [],
        outputs: [{
            name: "node.output.generic.output",
            type: "node.types.generic",
        }],
        execute: async () => {},
        state: {},
    },
    textToBase64: {
        type: "operation",
        name: "node.output.generic",
        inputs: [],
        outputs: [{
            name: "node.output.generic.output",
            type: "node.types.generic",
        }],
        execute: async () => {},
        state: {},
    },
};
