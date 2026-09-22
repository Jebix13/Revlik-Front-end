import {
  GoogleGenAI,
  Type,
  type Content,
  type FunctionCall,
  type FunctionDeclaration,
} from "@google/genai";
import { NextRequest, NextResponse } from "next/server";
import { STAGE_ORDER, StageKey } from "@/lib/stages";
import * as dealActions from "@/lib/dealActions";

const STAGE_VALUES = STAGE_ORDER as unknown as StageKey[];

type ChatMessage = { role: "user" | "assistant"; content: string };

const functionDeclarations: FunctionDeclaration[] = [
  {
    name: "list_deals",
    description:
      "List every deal in the pipeline with its id, name, account, value, stage, win probability, and expected close date. Always call this before updating or deleting a deal referred to by name, to find its id.",
    parameters: { type: Type.OBJECT, properties: {} },
  },
  {
    name: "update_deal",
    description:
      "Update one or more fields on an existing deal, looked up by id. Only pass the fields that should change. If you change the stage and don't specify a new probability, the stage's default win probability is applied automatically.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        id: { type: Type.STRING, description: "The deal's id, from list_deals" },
        name: { type: Type.STRING },
        account: { type: Type.STRING },
        value: { type: Type.NUMBER },
        stage: { type: Type.STRING, enum: STAGE_VALUES },
        probability: { type: Type.NUMBER },
        expectedCloseDate: { type: Type.STRING, description: "YYYY-MM-DD" },
        notes: { type: Type.STRING },
      },
      required: ["id"],
    },
  },
  {
    name: "create_deal",
    description: "Create a new deal in the pipeline.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING },
        account: { type: Type.STRING },
        value: { type: Type.NUMBER },
        stage: { type: Type.STRING, enum: STAGE_VALUES },
        probability: { type: Type.NUMBER },
        expectedCloseDate: { type: Type.STRING, description: "YYYY-MM-DD" },
        notes: { type: Type.STRING },
      },
      required: ["name", "account", "value", "expectedCloseDate"],
    },
  },
  {
    name: "delete_deal",
    description: "Permanently delete a deal from the pipeline, looked up by id.",
    parameters: {
      type: Type.OBJECT,
      properties: { id: { type: Type.STRING } },
      required: ["id"],
    },
  },
];

const tools = [{ functionDeclarations }];

async function runTool(name: string, args: Record<string, unknown>, markChanged: () => void) {
  switch (name) {
    case "list_deals":
      return dealActions.listDeals();
    case "update_deal":
      try {
        const deal = await dealActions.updateDeal(args as dealActions.UpdateDealInput);
        markChanged();
        return deal;
      } catch {
        return { error: `No deal found with id ${args.id}` };
      }
    case "create_deal": {
      const deal = await dealActions.createDeal(args as dealActions.CreateDealInput);
      markChanged();
      return deal;
    }
    case "delete_deal":
      try {
        await dealActions.deleteDeal(args.id as string);
        markChanged();
        return { ok: true };
      } catch {
        return { error: `No deal found with id ${args.id}` };
      }
    default:
      return { error: `Unknown tool ${name}` };
  }
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "GEMINI_API_KEY is not configured. Add your Gemini API key to .env and restart the server.",
      },
      { status: 500 }
    );
  }

  const body = await request.json().catch(() => null);
  const history: ChatMessage[] | null = Array.isArray(body?.messages) ? body.messages : null;
  if (!history || history.length === 0) {
    return NextResponse.json({ error: "No message provided" }, { status: 400 });
  }

  const ai = new GoogleGenAI({ apiKey });
  let changed = false;
  const markChanged = () => {
    changed = true;
  };

  const today = new Date().toISOString().slice(0, 10);
  const systemInstruction = `You are Revlik's pipeline assistant. You help a salesperson update their deals by name in plain language (e.g. "move Acme to negotiation", "bump Globex to $70k", "Umbrella closed lost").

Today's date is ${today}. Deal stages, in order: Lead (10%), Qualified (25%), Proposal (50%), Negotiation (75%), Closed Won (100%), Closed Lost (0%).

Always resolve a deal by name via list_deals first - never guess an id. If a name is ambiguous (matches multiple deals), ask which one they mean instead of guessing. After making a change, confirm briefly what changed in one or two sentences - don't restate the whole deal. If asked a question rather than for a change (e.g. "what's my biggest deal"), just answer using list_deals - don't make changes.`;

  const contents: Content[] = history.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  try {
    let reply = "Done.";

    for (let turn = 0; turn < 8; turn++) {
      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents,
        config: { systemInstruction, tools },
      });

      const parts = response.candidates?.[0]?.content?.parts ?? [];
      const functionCalls = parts
        .map((p) => p.functionCall)
        .filter((c): c is FunctionCall => Boolean(c));

      if (functionCalls.length === 0) {
        reply = response.text ?? reply;
        break;
      }

      contents.push({ role: "model", parts });

      const responseParts = [];
      for (const call of functionCalls) {
        const result = await runTool(call.name ?? "", call.args ?? {}, markChanged);
        responseParts.push({
          functionResponse: { name: call.name ?? "", response: { result } },
        });
      }
      contents.push({ role: "user", parts: responseParts });
    }

    return NextResponse.json({ reply, changed });
  } catch (err) {
    const status = (err as { status?: number })?.status;
    if (status === 401 || status === 403) {
      return NextResponse.json(
        { error: "Invalid Gemini API key. Check GEMINI_API_KEY in .env." },
        { status: 500 }
      );
    }
    if (status === 429) {
      return NextResponse.json(
        { error: "Rate limited by the Gemini API - try again shortly." },
        { status: 500 }
      );
    }
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: `Gemini API error: ${message}` }, { status: 500 });
  }
}
