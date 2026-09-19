import { StageKey, defaultProbabilityForStage } from "@/lib/stages";

export type DealFormValues = {
  id?: string;
  name: string;
  account: string;
  contactName: string;
  value: string;
  stage: StageKey;
  probability: string;
  expectedCloseDate: string;
  notes: string;
};

function toDateInputValue(date?: string) {
  if (!date) return "";
  return date.slice(0, 10);
}

export function emptyDealForm(): DealFormValues {
  const inTwoWeeks = new Date();
  inTwoWeeks.setDate(inTwoWeeks.getDate() + 14);
  return {
    name: "",
    account: "",
    contactName: "",
    value: "",
    stage: "LEAD",
    probability: String(defaultProbabilityForStage("LEAD")),
    expectedCloseDate: toDateInputValue(inTwoWeeks.toISOString()),
    notes: "",
  };
}
