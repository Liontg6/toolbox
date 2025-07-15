"use client";

import { Graph } from "@/components/graph/Graph";
import { Section } from "@/components/ui/Section";
import { createNode } from "@/lib/graph/CreateNode.factory";

export default function Home() {
    return (
        <Section className="flex flex-col gap-4">
            <h1 className="header-section-1">Graph based tools Debug</h1>

            <Graph initialNodeStates={[createNode("textToBase64", "1", {x: 0, y: 0})]} />
        </Section>
    );
}
