import NavBar from "@/components/NavBar";
import PipelineBoard, { DealSummary } from "@/components/PipelineBoard";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function PipelinePage() {
  const deals = await prisma.deal.findMany({ orderBy: { expectedCloseDate: "asc" } });

  const summaries: DealSummary[] = deals.map((d) => ({
    id: d.id,
    name: d.name,
    account: d.account,
    value: d.value,
    stage: d.stage as DealSummary["stage"],
    probability: d.probability,
    expectedCloseDate: d.expectedCloseDate.toISOString(),
  }));

  return (
    <div className="min-h-screen bg-[#f9f9f7] dark:bg-[#0d0d0d]">
      <NavBar />
      <main className="mx-auto max-w-6xl px-6 py-8">
        <h1 className="mb-6 text-lg font-semibold text-[#0b0b0b] dark:text-white">
          Pipeline
        </h1>
        {summaries.length === 0 ? (
          <p className="text-sm text-[#52514e] dark:text-[#c3c2b7]">
            No deals yet.{" "}
            <a href="/deals/new" className="text-[#2a78d6] hover:underline">
              Add your first deal
            </a>{" "}
            to start building your pipeline.
          </p>
        ) : (
          <PipelineBoard deals={summaries} />
        )}
      </main>
    </div>
  );
}
