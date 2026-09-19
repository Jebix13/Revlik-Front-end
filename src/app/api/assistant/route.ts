import Anthropic from "@anthropic-ai/sdk";
import { betaZodTool } from "@anthropic-ai/sdk/helpers/beta/zod";
import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";
import { STAGE_ORDER, StageKey } from "@/lib/stages";
import * as dealActions from "@/lib/dealActions";

const StageEnum = z.enum(STAGE_ORDER as unknown as [StageKey, ...StageKey[]]);

export async function POST(request: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "ANTHROPIC_API_KEY is not configured. Add your Anthropic API key to .env and restart the server.",
      },
      { status: 500 }
    );
  }

  const body = await request.json().catch(() => null);
  const history = Array.isArray(body?.messages) ? body.messages : null;
  if (!history || history.length === 0) {
    return NextResponse.json({ error: "No message provided" }, { status: 400 });
  }

  const client = new Anthropic({ apiKey });
  let changed = false;

  const listDeals = betaZodTool({
    name: "list_deals",
    description:
      "List every deal in the pipeline with its id, name, account, value, stage, win probability, and expected close date. Always call this before updating or deleting a deal referred to by name, to find its id.",
    inputSchema: z.object({}),
    run: async () => JSON.stringify(await dealActions.listDeals()),
  });

  const updateDeal = betaZodTool({
    name: "update_deal",
    description:
      "Update one or more fields on an existing deal, looked up by id. Only pass the fields that should change. If you change the stage and don't specify a new probability, the stage's default win probability is applied automatically.",
    inputSchema: z.object({
      id: z.string().describe("The deal's id, from list_deals"),
      name: z.string().optional(),
      account: z.string().optional(),
      value: z.number().min(0).optional(),
      stage: StageEnum.optional(),
      probability: z.number().min(0).max(100).optional(),
      expectedCloseDate: z.string().optional().describe("YYYY-MM-DD"),
      notes: z.string().optional(),
    }),
    run: async (input) => {
      try {
        const deal = await dealActions.updateDeal(input);
        changed = true;
        return JSON.stringify(deal);
      } catch {
        return JSON.stringify({ error: `No deal found with id ${input.id}` });
      }
    },
  });

  const createDeal = betaZodTool({
    name: "create_deal",
    description: "Create a new deal in the pipeline.",
    inputSchema: z.object({
      name: z.string(),
      account: z.string(),
      value: z.number().min(0),
      stage: StageEnum.optional(),
      probability: z.number().min(0).max(100).optional(),
      expectedCloseDate: z.string().describe("YYYY-MM-DD"),
      notes: z.string().optional(),
    }),
    run: async (input) => {
      const deal = await dealActions.createDeal(input);
      changed = true;
      return JSON.stringify(deal);
    },
  });

  const deleteDeal = betaZodTool({
    name: "delete_deal",
    description: "Permanently delete a deal from the pipeline, looked up by id.",
    inputSchema: z.object({ id: z.string() }),
    run: async (input) => {
      try {
        await dealActions.deleteDeal(input.id);
        changed = true;
        return JSON.stringify({ ok: true });
      } catch {
        return JSON.stringify({ error: `No deal found with id ${input.id}` });
      }
    },
  });

  const today = new Date().toISOString().slice(0, 10);

  try {
    const finalMessage = await client.beta.messages.toolRunner({
      model: "claude-opus-5",
      max_tokens: 4096,
      system: `You are Revlik's pipeline assistant. You help a salesperson update their deals by name in plain language (e.g. "move Acme to negotiation", "bump Globex to $70k", "Umbrella closed lost").

Today's date is ${today}. Deal stages, in order: Lead (10%), Qualified (25%), Proposal (50%), Negotiation (75%), Closed Won (100%), Closed Lost (0%).

Always resolve a deal by name via list_deals first - never guess an id. If a name is ambiguous (matches multiple deals), ask which one they mean instead of guessing. After making a change, confirm briefly what changed in one or two sentences - don't restate the whole deal. If asked a question rather than for a change (e.g. "what's my biggest deal"), just answer using list_deals - don't make changes.`,
      tools: [listDeals, updateDeal, createDeal, deleteDeal],
      messages: history,
    });

    const textBlock = finalMessage.content.find((b) => b.type === "text") as
      | Anthropic.Beta.BetaTextBlock
      | undefined;
    const reply = textBlock?.text ?? "Done.";

    return NextResponse.json({ reply, changed });
  } catch (err) {
    if (err instanceof Anthropic.AuthenticationError) {
      return NextResponse.json(
        { error: "Invalid Anthropic API key. Check ANTHROPIC_API_KEY in .env." },
        { status: 500 }
      );
    }
    if (err instanceof Anthropic.RateLimitError) {
      return NextResponse.json(
        { error: "Rate limited by the Anthropic API - try again shortly." },
        { status: 500 }
      );
    }
    if (err instanceof Anthropic.APIError) {
      return NextResponse.json({ error: `Anthropic API error: ${err.message}` }, { status: 500 });
    }
    throw err;
  }
}
