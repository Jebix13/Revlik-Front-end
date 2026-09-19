import NavBar from "@/components/NavBar";
import DealForm from "@/components/DealForm";
import { emptyDealForm } from "@/lib/dealForm";

export default function NewDealPage() {
  return (
    <div className="min-h-screen bg-[#f9f9f7] dark:bg-[#0d0d0d]">
      <NavBar />
      <main className="mx-auto max-w-6xl px-6 py-8">
        <h1 className="mb-6 text-lg font-semibold text-[#0b0b0b] dark:text-white">
          New deal
        </h1>
        <DealForm initial={emptyDealForm()} />
      </main>
    </div>
  );
}
