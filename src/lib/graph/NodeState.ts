import { NodeDefinition } from "./NodeDefinition";

export type NodeState<I, O> = NodeDefinition<I, O> & {
    id: string;
    position: {
        x: number;
        y: number;
    }
}