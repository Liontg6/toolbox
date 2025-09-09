import { NodeDefinition } from "@/lib/graph/NodeDefinition";
import { createNodeDefinition } from "./CreateNodeDefinition.factory";

export type NODE_TYPE =
    | "input"
    | "output"
    | "textToBase64"
    | "concatenateStrings"
    | "waitAndForward";

export const NODE_DEFINITIONS: {
    [key in NODE_TYPE]: NodeDefinition<any, any>;
} = {
    input: createNodeDefinition<[], ["input.generic.input"]>({
        type: "input",
        name: "input.generic",
        inputs: [],
        outputs: [{
            name: "input.generic.input",
            translationKey: "types.generic",
            type: "types.generic",
        }],
        execute: async () => {
            return { "input.generic.input": "TODO: INPUT THIS VALUE USING UI" };
        },
    }),
    output: createNodeDefinition<["output.generic.output"], []>({
        type: "output",
        name: "output.generic",
        inputs: [{
            name: "output.generic.output",
            translationKey: "types.generic",
            type: "types.generic",
        }],
        outputs: [],
        execute: async (stateOfInputs) => {
            console.warn("TODO: output to ui", stateOfInputs);
            return {};
        },
    }),
    textToBase64: createNodeDefinition<
        ["operation.text.textToBase64.inputs.text"],
        ["operation.text.textToBase64.outputs.base64"]
    >({
        type: "operation",
        name: "operation.text.textToBase64",
        inputs: [{
            name: "operation.text.textToBase64.inputs.text",
            translationKey: "types.text.any",
            type: "types.text.text",
        }],
        outputs: [{
            name: "operation.text.textToBase64.outputs.base64",
            translationKey: "types.text.base64",
            type: "types.text.base64",
        }],
        execute: async (
            parameters: { "operation.text.textToBase64.inputs.text": string },
        ) => {
            const inputkey = "operation.text.textToBase64.inputs.text";

            console.info(parameters[inputkey]);

            if (!parameters[inputkey]) {
                throw new Error(`Input ${inputkey} is required`);
            }

            return {
                "operation.text.textToBase64.outputs.base64": btoa(
                    unescape(encodeURIComponent(parameters[inputkey])),
                ),
            };
        },
    }),
    concatenateStrings: createNodeDefinition<
        [
            "operation.text.concatenateStrings.inputs.stringA",
            "operation.text.concatenateStrings.inputs.stringB",
        ],
        ["operation.text.concatenateStrings.outputs.concatenated"]
    >({
        type: "operation",
        name: "operation.text.concatenateStrings",
        inputs: [{
            name: "operation.text.concatenateStrings.inputs.stringA",
            translationKey: "types.text.any",
            type: "types.text",
        }, {
            name: "operation.text.concatenateStrings.inputs.stringB",
            translationKey: "types.text.any",
            type: "types.text",
        }],
        outputs: [{
            name: "operation.text.concatenateStrings.outputs.concatenated",
            translationKey: "types.text.any",
            type: "types.text",
        }],
        execute: async (
            parameters: {
                "operation.text.concatenateStrings.inputs.stringA": string;
                "operation.text.concatenateStrings.inputs.stringB": string;
            },
        ) => {
            const inputA =
                parameters["operation.text.concatenateStrings.inputs.stringA"];
            const inputB =
                parameters["operation.text.concatenateStrings.inputs.stringB"];
            return {
                "operation.text.concatenateStrings.outputs.concatenated":
                    inputA + inputB,
            };
        },
    }),
    waitAndForward: createNodeDefinition<
        ["operation.waitAndForward.inputs.input"],
        ["operation.waitAndForward.outputs.output"]
    >({
        type: "operation",
        name: "operation.waitAndForward",
        inputs: [{
            name: "operation.waitAndForward.inputs.input",
            translationKey: "types.generic",
            type: "types.generic",
        }],
        outputs: [{
            name: "operation.waitAndForward.outputs.output",
            translationKey: "types.generic",
            type: "types.generic",
        }],
        execute: async ({ "operation.waitAndForward.inputs.input": input }) => {
            console.info("Waiting for 2 seconds before forwarding:", input);
            await new Promise((resolve) => setTimeout(resolve, 2000));
            return { "operation.waitAndForward.outputs.output": input };
        },
    }),
};
