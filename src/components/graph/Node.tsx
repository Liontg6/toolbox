import { NODE_TYPE } from "@/lib/graph/NodeDefinitions";
import { NodeState } from "@/lib/graph/NodeState";
import { MouseEventHandler } from "react";
import { NodeIO } from "./NodeIO";

export function Node({
    nodeState,
    onMouseDown,
    onMouseMove,
    onMouseUp,
}: {
    nodeState: NodeState<any, any>;
    onMouseDown: MouseEventHandler<HTMLDivElement>;
    onMouseMove: MouseEventHandler<HTMLDivElement>;
    onMouseUp: MouseEventHandler<HTMLDivElement>;
}) {
    const inputs = nodeState.inputs.map((input, index) => (
        <NodeIO
            key={index}
            type="input"
            data_type={input.type}
            onConnectNodes={(fromId, toId) => {
                console.log(`Connecting ${fromId} to ${toId}`);
            }}
            nodeId={nodeState.id}
            ioName={input.name}
        />
    ));

    const outputs = nodeState.outputs.map((output, index) => (
        <NodeIO
            key={index}
            type="output"
            data_type={output.type}
            onConnectNodes={(fromId, toId) => {
                console.log(`Connecting ${fromId} to ${toId}`);
            }}
            nodeId={nodeState.id}
            ioName={output.name}
        />
    ));

    return (
        <div
            className="absolute rounded bg-primary text-primary-foreground p-2 shadow-md"
            style={{
                left: nodeState.position.x,
                top: nodeState.position.y,
                transition: "left 0.05s ease-out, top 0.05s ease-out",
            }}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseDown={e => {
                // Only call onMouseDown if data-node-dragable-handle is true
                const target = e.target as HTMLElement;
                console.log(target);
                
                if (target.getAttribute("data-node-dragable-handle") === "true") {
                    onMouseDown(e);
                }
            }}
            data-node-dragable-handle="true"
        >
            <div data-node-dragable-handle="true" className="p-1 bg-primary-foreground text-primary rounded">DRAG HERE</div>
            {nodeState.id} {nodeState.name}
            <div className="flex flex-col gap-1 mt-2">
                <div className="flex flex-col gap-1">
                    <div className="text-xs">Inputs:</div>
                    <div className="flex flex-col gap-1">
                        {inputs}
                    </div>
                </div>
                <div className="flex flex-col gap-1">
                    <div className="text-xs">Outputs:</div>
                    <div className="flex flex-col gap-1">
                        {outputs}
                    </div>
                </div>
            </div>
        </div>
    );
}
