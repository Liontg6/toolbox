"use client";

import { Graph } from "@/components/graph/Graph";
import { Section } from "@/components/ui/Section";
import { createNode } from "@/lib/graph/CreateNode.factory";

export default function Home() {
    return (
        <Section className="flex flex-col gap-4">
            <h1 className="header-section-1">Graph based tools Debug</h1>

            <Graph initialNodeStates={[
                createNode("input", "1", { x: 50, y: 50 }),
                createNode("textToBase64", "2", { x: 250, y: 50 }),
                createNode("output", "3", { x: 450, y: 50 }),
            ]} />
        </Section>
    );
}
