export type NodeDefinition<I, O> = {
    type: "input" | "output" | "operation";
    name: string;
    inputs: { name: string; type: string }[];
    outputs: { name: string; type: string }[];
    /**
     * @param parameters
     * @returns
     */
    execute: (parameters: I) => Promise<O>;
    state: O;
};