import { NodeDefinition } from "@/lib/graph/NodeDefinition";
import { createNodeDefinition } from "./CreateNodeDefinition.factory";

export type NODE_TYPE = "input" | "output" | "textToBase64" | "concatenateStrings" | "waitAndForward";

export const NODE_DEFINITIONS: { [key in NODE_TYPE]: NodeDefinition<any, any> } = {
    input: createNodeDefinition<[], ["node.input.generic.input"]>({
        type: "input",
        name: "node.input.generic",
        inputs: [],
        outputs: [{
            name: "node.input.generic.input",
            type: "node.types.generic",
        }],
        execute: async () => { return { "node.input.generic.input": "TODO: INPUT THIS VALUE USING UI" } }
    }),
    output: createNodeDefinition<["node.output.generic.output"], []>({
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
        }
    }),
    textToBase64: createNodeDefinition<["node.operation.text.textToBase64.inputs.text"],
        ["node.operation.text.textToBase64.outputs.base64"]>({
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
            }
        }),
    concatenateStrings: createNodeDefinition<
        ["node.operation.text.concatenateStrings.inputs.stringA", "node.operation.text.concatenateStrings.inputs.stringB"],
        ["node.operation.text.concatenateStrings.outputs.concatenated"]>({
            type: "operation",
            name: "node.operation.text.concatenateStrings",
            inputs: [{
                name: "node.operation.text.concatenateStrings.inputs.stringA",
                type: "node.types.text",
            }, {
                name: "node.operation.text.concatenateStrings.inputs.stringB",
                type: "node.types.text",
            }],
            outputs: [{
                name: "node.operation.text.concatenateStrings.outputs.concatenated",
                type: "node.types.text",
            }],
            execute: async (parameters: { "node.operation.text.concatenateStrings.inputs.stringA": string, "node.operation.text.concatenateStrings.inputs.stringB": string }) => {
                const inputA = parameters["node.operation.text.concatenateStrings.inputs.stringA"];
                const inputB = parameters["node.operation.text.concatenateStrings.inputs.stringB"];
                return { "node.operation.text.concatenateStrings.outputs.concatenated": inputA + inputB };
            }
        }),
    waitAndForward: createNodeDefinition<
        ["node.operation.waitAndForward.inputs.input"],
        ["node.operation.waitAndForward.outputs.output"]>({
            type: "operation",
            name: "node.operation.waitAndForward",
            inputs: [{
                name: "node.operation.waitAndForward.inputs.input",
                type: "node.types.generic",
            }],
            outputs: [{
                name: "node.operation.waitAndForward.outputs.output",
                type: "node.types.generic",
            }],
            execute: async ({ "node.operation.waitAndForward.inputs.input": input }) => {
                console.info("Waiting for 2 seconds before forwarding:", input);
                await new Promise(resolve => setTimeout(resolve, 2000));
                return { "node.operation.waitAndForward.outputs.output": input };
            }
        }),
};

