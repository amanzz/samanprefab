import { NextRequest, NextResponse } from "next/server";
import { callAIByType, type AISetting } from "@/lib/ai.service";

const API_URL = process.env.API_URL ?? "http://localhost:4000";

// ─── Fetch admin AI settings (server-side) ─────────────────────────────────────

async function fetchAdminSettings(context: "product" | "blog" | "global"): Promise<AISetting | null> {
  try {
    const res = await fetch(`${API_URL}/api/v1/ai-settings/${context}`, {
      cache: "no-store",
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) return null;
    const json = await res.json();
    const row = json?.data;
    if (!row) return null;
    return {
      id:             row.id,
      context:        row.context,
      systemPrompt:   row.systemPrompt   ?? row.system_prompt   ?? "",
      tone:           row.tone           ?? "professional",
      targetKeywords: row.targetKeywords ?? row.target_keywords ?? "",
      language:       row.language       ?? "English",
      contentRules:   row.contentRules   ?? row.content_rules   ?? {},
      isActive:       row.isActive       ?? row.is_active       ?? true,
    } as AISetting;
  } catch {
    return null;
  }
}

// ─── Log AI generation ─────────────────────────────────────────────────────────

async function logGeneration(payload: {
  context: string;
  actionType: string;
  inputSummary: string;
  outputPreview: string;
  durationMs: number;
  success: boolean;
  errorMessage?: string;
}) {
  try {
    await fetch(`${API_URL}/api/v1/ai-settings/log`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        context:       payload.context === "product" || payload.context === "blog" ? payload.context : "global",
        actionType:    payload.actionType,
        inputSummary:  payload.inputSummary.substring(0, 500),
        outputPreview: payload.outputPreview.substring(0, 500),
        durationMs:    payload.durationMs,
        success:       payload.success,
        errorMessage:  payload.errorMessage,
      }),
      signal: AbortSignal.timeout(2000),
    });
  } catch {
    // Log failure is non-fatal
  }
}

// ─── Route handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  let body: { type: string; context: Record<string, any>; contentContext?: "product" | "blog" };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { type, context = {}, contentContext } = body;
  if (!type) {
    return NextResponse.json({ error: "Missing required field: type" }, { status: 400 });
  }

  // Determine which AI settings context to load
  const settingsContext: "product" | "blog" | "global" =
    contentContext === "blog"    ? "blog"    :
    contentContext === "product" ? "product" :
    type === "blog_post"         ? "blog"    :
    type === "product_content"   ? "product" : "global";

  // Fetch admin settings (graceful fallback to null if API unreachable)
  const adminSettings = await fetchAdminSettings(settingsContext);

  const started = Date.now();
  try {
    const data = await callAIByType(type, context, adminSettings);
    const durationMs = Date.now() - started;

    // Log async (fire-and-forget)
    const inputSummary = context.name ?? context.title ?? context.text?.substring(0, 80) ?? type;
    const outputPreview = JSON.stringify(data).substring(0, 500);
    logGeneration({ context: settingsContext, actionType: type, inputSummary, outputPreview, durationMs, success: true });

    return NextResponse.json({
      data,
      _meta: {
        settingsLoaded: !!adminSettings,
        settingsContext,
        durationMs,
        model: process.env.AI_MODEL ?? "deepseek-v3.2",
      },
    });
  } catch (e: any) {
    const durationMs = Date.now() - started;
    const msg: string = e?.message ?? "AI generation failed";

    logGeneration({
      context: settingsContext,
      actionType: type,
      inputSummary: context.name ?? context.title ?? type,
      outputPreview: "",
      durationMs,
      success: false,
      errorMessage: msg,
    });

    if (msg.includes("AGENTROUTER_API_KEY")) {
      return NextResponse.json({ error: msg }, { status: 503 });
    }
    if (msg.includes("unparseable")) {
      return NextResponse.json({ error: "AI returned unexpected format", detail: msg }, { status: 500 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
