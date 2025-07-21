import { NodeDefinition } from "@/lib/graph/NodeDefinition";

export type NODE_TYPE = "input" | "output" | "textToBase64";

export const NODE_DEFINITIONS: {[key in NODE_TYPE]: NodeDefinition<any, any>} = {
    input: {
        type: "input",
        name: "node.input.generic",
        inputs: [],
        outputs: [{
            name: "node.input.generic.input",
            type: "node.types.generic",
        }],
        execute: async () => {return { "node.input.generic.input": "TODO: INPUT THIS VALUE USING UI" }},
        state: {},
    },
    output: {
        type: "output",
        name: "node.output.generic",
        inputs: [{
            name: "node.output.generic.output",
            type: "node.types.generic",
        }],
        outputs: [],
        execute: async (stateOfInputs) => {
            console.warn("TODO: output to ui", stateOfInputs);
            return {};
        },
        state: {},
    },
    textToBase64: {
        type: "operation",
        name: "node.operation.text.textToBase64",
        inputs: [{
            name: "node.operation.text.textToBase64.inputs.text",
            type: "node.types.text",
        }],
        outputs: [{
            name: "node.operation.text.textToBase64.outputs.base64",
            type: "node.types.text.base64",
        }],
        execute: async (parameters: { "node.operation.text.textToBase64.inputs.text": string }) => {
            const inputkey = "node.operation.text.textToBase64.inputs.text";

            console.info(parameters[inputkey])

            if (!parameters[inputkey]) {
                throw new Error(`Input ${inputkey} is required`);
            }

            return { "node.operation.text.textToBase64.outputs.base64": btoa(unescape(encodeURIComponent(parameters[inputkey]))) };
        },
        state: {},
    },
};
