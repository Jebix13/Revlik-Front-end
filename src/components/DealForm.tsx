"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { STAGE_ORDER, STAGES, StageKey, defaultProbabilityForStage } from "@/lib/stages";
import { DealFormValues } from "@/lib/dealForm";

const inputClass =
  "rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm text-[#0b0b0b] outline-none focus:border-[#2a78d6] dark:border-white/10 dark:text-white";
const labelClass = "text-sm font-medium text-[#52514e] dark:text-[#c3c2b7]";

export default function DealForm({ initial }: { initial: DealFormValues }) {
  const router = useRouter();
  const [values, setValues] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const isEdit = Boolean(initial.id);

  function update<K extends keyof DealFormValues>(key: K, value: DealFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  function handleStageChange(stage: StageKey) {
    setValues((v) => ({
      ...v,
      stage,
      probability: String(defaultProbabilityForStage(stage)),
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      name: values.name,
      account: values.account,
      contactName: values.contactName || null,
      value: Number(values.value),
      stage: values.stage,
      probability: Number(values.probability),
      expectedCloseDate: values.expectedCloseDate,
      notes: values.notes || null,
    };

    const res = await fetch(isEdit ? `/api/deals/${initial.id}` : "/api/deals", {
      method: isEdit ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setSaving(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Something went wrong");
      return;
    }

    router.push("/pipeline");
    router.refresh();
  }

  async function handleDelete() {
    if (!initial.id) return;
    if (!confirm(`Delete "${values.name}"? This cannot be undone.`)) return;
    setSaving(true);
    const res = await fetch(`/api/deals/${initial.id}`, { method: "DELETE" });
    setSaving(false);
    if (!res.ok) {
      setError("Could not delete this deal");
      return;
    }
    router.push("/pipeline");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-xl flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label className={labelClass} htmlFor="name">
          Deal name
        </label>
        <input
          id="name"
          required
          className={inputClass}
          value={values.name}
          onChange={(e) => update("name", e.target.value)}
          placeholder="Acme Corp — Annual renewal"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className={labelClass} htmlFor="account">
            Account
          </label>
          <input
            id="account"
            required
            className={inputClass}
            value={values.account}
            onChange={(e) => update("account", e.target.value)}
            placeholder="Acme Corp"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className={labelClass} htmlFor="contactName">
            Contact (optional)
          </label>
          <input
            id="contactName"
            className={inputClass}
            value={values.contactName}
            onChange={(e) => update("contactName", e.target.value)}
            placeholder="Jane Smith"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className={labelClass} htmlFor="value">
            Deal value (USD)
          </label>
          <input
            id="value"
            type="number"
            min="0"
            step="1"
            required
            className={inputClass}
            value={values.value}
            onChange={(e) => update("value", e.target.value)}
            placeholder="25000"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className={labelClass} htmlFor="expectedCloseDate">
            Expected close date
          </label>
          <input
            id="expectedCloseDate"
            type="date"
            required
            className={inputClass}
            value={values.expectedCloseDate}
            onChange={(e) => update("expectedCloseDate", e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className={labelClass} htmlFor="stage">
            Stage
          </label>
          <select
            id="stage"
            className={inputClass}
            value={values.stage}
            onChange={(e) => handleStageChange(e.target.value as StageKey)}
          >
            {STAGE_ORDER.map((s) => (
              <option key={s} value={s}>
                {STAGES[s].label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className={labelClass} htmlFor="probability">
            Win probability (%)
          </label>
          <input
            id="probability"
            type="number"
            min="0"
            max="100"
            step="1"
            required
            className={inputClass}
            value={values.probability}
            onChange={(e) => update("probability", e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={labelClass} htmlFor="notes">
          Notes (optional)
        </label>
        <textarea
          id="notes"
          rows={4}
          className={inputClass}
          value={values.notes}
          onChange={(e) => update("notes", e.target.value)}
          placeholder="Next steps, blockers, key stakeholders…"
        />
      </div>

      {error && (
        <p className="text-sm text-[#d03b3b]" role="alert">
          {error}
        </p>
      )}

      <div className="mt-2 flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-[#2a78d6] px-4 py-2 text-sm font-medium text-white hover:bg-[#1c5cab] disabled:opacity-50"
        >
          {saving ? "Saving…" : isEdit ? "Save changes" : "Create deal"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/pipeline")}
          className="rounded-lg px-4 py-2 text-sm font-medium text-[#52514e] hover:bg-black/5 dark:text-[#c3c2b7] dark:hover:bg-white/5"
        >
          Cancel
        </button>
        {isEdit && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={saving}
            className="ml-auto rounded-lg px-4 py-2 text-sm font-medium text-[#d03b3b] hover:bg-[#d03b3b]/10 disabled:opacity-50"
          >
            Delete deal
          </button>
        )}
      </div>
    </form>
  );
}
