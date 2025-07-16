import { NodeState } from "@/lib/graph/NodeState";
import { DragEventHandler } from "react";

export function Node({
    nodeState,
    onMouseDown,
    onMouseMove,
    onMouseUp,
}: {
    nodeState: NodeState<any, any>;
    onMouseDown: DragEventHandler<HTMLDivElement>;
    onMouseMove: DragEventHandler<HTMLDivElement>;
    onMouseUp: DragEventHandler<HTMLDivElement>;
}) {
    return (
        <div
            className="absolute rounded bg-primary text-primary-foreground p-2 shadow-md"
            style={{
            left: nodeState.position.x,
            top: nodeState.position.y,
            transition: "left 0.05s ease-out, top 0.05s ease-out",
            }}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
        >
            {nodeState.id} {nodeState.name}
        </div>
    );
}
