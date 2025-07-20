export type NodeIO = {
    name: string;
    type: string;
};

export type NodeDefinition<I, O> = {
    type: "input" | "output" | "operation";
    name: string;
    /**
     * Each name must be unique within the node definition.
     */
    inputs: NodeIO[];
    /**
     * Each name must be unique within the node definition.
     */
    outputs: NodeIO[];
    /**
     * @param parameters
     * @returns
     */
    execute: (parameters: I) => Promise<O>;
    state: O;
};