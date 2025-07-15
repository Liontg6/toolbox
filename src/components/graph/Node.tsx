import { NodeState } from "@/lib/graph/NodeState";
import { DragEventHandler } from "react";

export function Node({
    nodeState,
    onDragStart,
    onDrag,
    onDragEnd,
}: {
    nodeState: NodeState<any, any>;
    onDragStart: DragEventHandler<HTMLDivElement>;
    onDrag: DragEventHandler<HTMLDivElement>;
    onDragEnd: DragEventHandler<HTMLDivElement>;
}) {
    return (
        <div
            className="absolute rounded bg-primary text-primary-foreground p-2 shadow-md"
            style={{
                left: nodeState.position.x,
                top: nodeState.position.y,
            }}
            draggable="true"
            onDragStart={onDragStart}
            onDrag={onDrag}
            onDragEnd={onDragEnd}
        >
            {nodeState.id} {nodeState.name}
        </div>
    );
}
