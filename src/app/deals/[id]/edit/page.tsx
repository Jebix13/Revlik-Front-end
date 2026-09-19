import { notFound } from "next/navigation";
import NavBar from "@/components/NavBar";
import DealForm from "@/components/DealForm";
import { DealFormValues } from "@/lib/dealForm";
import { prisma } from "@/lib/prisma";
import { StageKey } from "@/lib/stages";

export default async function EditDealPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const deal = await prisma.deal.findUnique({ where: { id } });
  if (!deal) notFound();

  const initial: DealFormValues = {
    id: deal.id,
    name: deal.name,
    account: deal.account,
    contactName: deal.contactName ?? "",
    value: String(deal.value),
    stage: deal.stage as StageKey,
    probability: String(deal.probability),
    expectedCloseDate: deal.expectedCloseDate.toISOString().slice(0, 10),
    notes: deal.notes ?? "",
  };

  return (
    <div className="min-h-screen bg-[#f9f9f7] dark:bg-[#0d0d0d]">
      <NavBar />
      <main className="mx-auto max-w-6xl px-6 py-8">
        <h1 className="mb-6 text-lg font-semibold text-[#0b0b0b] dark:text-white">
          Edit deal
        </h1>
        <DealForm initial={initial} />
      </main>
    </div>
  );
}
