import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

function forceOpenRouterModelEnv() {
  const modelValues = [process.env.MODEL, process.env.OPENROUTER_MODEL];
  const hasUnsafe = modelValues.some((value) => isUnsafeProviderModel(value));
  if (hasUnsafe) {
    console.error("FATAL: Unsafe provider-like model detected in runtime configuration");
    process.env.MODEL = "openrouter/free";
    process.env.OPENROUTER_MODEL = "openrouter/free";
    console.log("OPENROUTER ENFORCEMENT ACTIVE");
  }
}

forceOpenRouterModelEnv();

const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";
const RAW_DEFAULT_MODEL = process.env.MODEL || process.env.OPENROUTER_MODEL || "openrouter/free";
const DEFAULT_MODEL = sanitizeModel(RAW_DEFAULT_MODEL);
const OPENROUTER_API_KEY = (process.env.OPENROUTER_API_KEY || process.env.VITE_OPENROUTER_API_KEY || "").trim();
const OPENROUTER_RETRY_COUNT = 3;
const OPENROUTER_REQUEST_TIMEOUT_MS = Math.max(10000, Number(process.env.OPENROUTER_REQUEST_TIMEOUT_MS || 18000) || 18000);

let openRouterClient: OpenAI | null = null;
if (OPENROUTER_API_KEY) {
  openRouterClient = new OpenAI({
    apiKey: OPENROUTER_API_KEY,
    baseURL: OPENROUTER_BASE_URL,
    timeout: OPENROUTER_REQUEST_TIMEOUT_MS,
    defaultHeaders: {
      "HTTP-Referer": process.env.APP_URL || "https://trust-me-ai-builder.vercel.app",
      "X-Title": "Trust Me AI Builder"
    }
  });
}

function isUnsafeProviderModel(model: string | undefined): boolean {
  if (!model) return false;
  const value = String(model).trim();
  return /(google|vertex|genai)/i.test(value) && !/^openrouter\//i.test(value);
}

function sanitizeModel(model: string | undefined): string {
  const value = String(model || "").trim();
  const cleaned = value.replace(/^models\//i, "");
  if (!cleaned) return "openrouter/free";
  if (isUnsafeProviderModel(cleaned)) {
    console.warn(`[OpenRouter Model Sanitization] Unsafe provider model detected: "${cleaned}". Forcing openrouter/free.`);
    return "openrouter/free";
  }
  return cleaned;
}

function normalizeModel(model: string | undefined): string {
  const value = sanitizeModel(model || DEFAULT_MODEL || "openrouter/free");
  return value.replace(/^models\//, "");
}

function isRetryableError(error: any): boolean {
  const message = String(error?.message || error || "");
  const code = error?.status || error?.code || error?.statusCode;
  return /429|408|timeout|timed out|ECONNRESET|503|504|overloaded|rate limit|temporarily unavailable/i.test(message) || code === 408 || code === 429 || code === 503 || code === 504;
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalizeMessages(payload: any): Array<{ role: "system" | "user" | "assistant"; content: string }> {
  const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [];

  if (payload.systemPrompt) {
    messages.push({ role: "system", content: payload.systemPrompt });
  }

  if (Array.isArray(payload.messages)) {
    payload.messages.forEach((entry: any) => {
      if (!entry?.content && entry?.text) {
        messages.push({ role: entry.role === "user" ? "user" : "assistant", content: String(entry.text) });
      } else if (typeof entry?.content === "string") {
        messages.push({ role: entry.role === "user" ? "user" : entry.role === "assistant" ? "assistant" : "system", content: entry.content });
      }
    });
  } else if (Array.isArray(payload.contents)) {
    payload.contents.forEach((entry: any) => {
      const role = entry?.role === "user" ? "user" : entry?.role === "assistant" || entry?.role === "model" ? "assistant" : "system";
      if (Array.isArray(entry?.parts)) {
        const text = entry.parts.map((part: any) => part?.text || "").filter(Boolean).join("\n");
        if (text) {
          messages.push({ role, content: text });
        }
      }
    });
  }

  if (!messages.some((message) => message.role === "user") && payload.prompt) {
    messages.push({ role: "user", content: payload.prompt });
  }

  return messages;
}

export function isOpenRouterConfigured() {
  return Boolean(OPENROUTER_API_KEY);
}

export function getOpenRouterStatus() {
  return {
    active: isOpenRouterConfigured(),
    model: normalizeModel(process.env.MODEL || process.env.OPENROUTER_MODEL),
    provider: "OpenRouter"
  };
}

export async function generateOpenRouterResponse(payload: any) {
  if (!openRouterClient) {
    throw new Error("OpenRouter API key is not configured. Please set OPENROUTER_API_KEY in your environment.");
  }

  // ⚡ CRITICAL: Log provider and model at entry point
  const model = normalizeModel(payload.model || process.env.MODEL || process.env.OPENROUTER_MODEL);
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║               🔵 PROVIDER AUTHENTICATION CHECK                ║
╚════════════════════════════════════════════════════════════════╝
[Provider] OpenRouter AI Gateway (OpenRouter enforced)
[Model] ${model}
[BaseURL] ${OPENROUTER_BASE_URL}
[API Key Loaded] ${OPENROUTER_API_KEY ? '✅ YES' : '❌ NO'}
[External Provider Detected] ❌ NO (OpenRouter only)
[Timestamp] ${new Date().toISOString()}
════════════════════════════════════════════════════════════════
  `);

  // Debug: log incoming payload shape to ensure prompt/messages are present
  try {
    console.log('[OpenRouter Debug] payload keys=', Object.keys(payload || {}));
    console.log('[OpenRouter Debug] hasPrompt=', Boolean(payload && payload.prompt));
    if (payload && payload.prompt) console.log('[OpenRouter Debug] promptPreview=', String(payload.prompt).slice(0,200));
  } catch (e) {
    // ignore
  }

  // New: Log full payload (requested)
  try {
    console.log('OpenRouter Payload:', JSON.stringify(payload || {}, null, 2));
  } catch (e) {}

  // Build messages array strictly from supported formats. Reject legacy/unsupported fields.
  let messages: Array<{ role: any; content: string }> = [];
  if (Array.isArray(payload?.messages) && payload.messages.length > 0) {
    // Normalize each message role/content
    messages = payload.messages.map((m: any) => ({ role: (m.role || 'user'), content: String(m.content || m.text || '') }));
  } else if (typeof payload?.prompt === 'string' && payload.prompt.trim().length > 0) {
    messages = [{ role: 'user', content: payload.prompt }];
  } else {
    // Do not accept unsupported top-level shapes: contents, input, text, promptParts
    const unsupported = ['contents', 'input', 'text', 'promptParts'];
    const foundUnsupported = unsupported.filter((k) => Object.prototype.hasOwnProperty.call(payload || {}, k));
    if (foundUnsupported.length > 0) {
      console.warn('[OpenRouter] Unsupported payload fields detected and ignored:', foundUnsupported);
    }
    // Fallback: try to derive user text from nested shapes (but do not send raw 'contents')
    const derived = (payload && payload.prompt) || null;
    if (derived && typeof derived === 'string' && derived.trim().length > 0) {
      messages = [{ role: 'user', content: derived }];
    }
  }

  if (!Array.isArray(messages) || messages.length === 0) {
    throw new Error('OpenRouter payload missing required `prompt` or `messages` (user content).');
  }
  const maxTokens = Number(payload.maxTokens || 2000) || 2000;
  const temperature = Number(payload.temperature ?? 0.7) || 0.7;
  const requestFormat = (payload.responseFormat === "text")
    ? undefined
    : (payload?.config?.responseMimeType === "application/json" || payload?.config?.responseSchema)
      ? { type: "json_object" as const }
      : undefined;

  for (let attempt = 1; attempt <= OPENROUTER_RETRY_COUNT; attempt += 1) {
    try {
      // CRITICAL LOGGING: Document all request details
      console.log(`
╔════════════════════════════════════════════════════════════════╗
║                  OPENROUTER AI REQUEST INITIATED              ║
╚════════════════════════════════════════════════════════════════╝
[PROVIDER] OpenRouter AI Gateway
[BASE_URL] ${OPENROUTER_BASE_URL}
[MODEL] ${model}
[MESSAGES_COUNT] ${messages.length}
[MAX_TOKENS] ${maxTokens}
[TEMPERATURE] ${temperature}
[RESPONSE_FORMAT] ${requestFormat?.type || 'text'}
[ATTEMPT] ${attempt}/${OPENROUTER_RETRY_COUNT}
[TIMESTAMP] ${new Date().toISOString()}
════════════════════════════════════════════════════════════════
      `);

      const url = `${OPENROUTER_BASE_URL}/chat/completions`;
      const provider = 'OpenRouter';
      console.log("OUTBOUND URL =", url);
      console.log("MODEL =", model);
      console.log("PROVIDER =", provider);

      const response = await openRouterClient.chat.completions.create({
        model,
        messages,
        max_tokens: maxTokens,
        temperature,
        response_format: requestFormat,
        stream: Boolean(payload.stream)
      });

      // Log response status when available
      try {
        console.log('OpenRouter Response Status:', (response as any)?.status || (response as any)?.statusCode || 'unknown');
      } catch (e) {}

      const respAny: any = response;
      
      // Log successful response details
      console.log(`
╔════════════════════════════════════════════════════════════════╗
║              OPENROUTER AI RESPONSE RECEIVED                  ║
╚════════════════════════════════════════════════════════════════╝
[MODEL_USED] ${respAny?.model || model}
[FINISH_REASON] ${respAny?.choices?.[0]?.finish_reason || 'unknown'}
[TOKENS_USED] ${respAny?.usage?.total_tokens || 'unknown'}
[RESPONSE_LENGTH] ${respAny?.choices?.[0]?.message?.content?.length || 0} chars
[TIMESTAMP] ${new Date().toISOString()}
════════════════════════════════════════════════════════════════
      `);
      const content = respAny.choices?.[0]?.message?.content ?? "";

      // If request expected a JSON object response, normalize common shapes
      if (requestFormat && requestFormat.type === "json_object") {
        let parsedObj: any = null;
        if (typeof content === "string") {
          try {
            parsedObj = JSON.parse(content);
          } catch (e) {
            // not JSON, wrap as reply
            parsedObj = { reply: content };
          }
        } else if (typeof content === "object") {
          parsedObj = content;
        } else {
          parsedObj = { reply: String(content || "") };
        }

        if (parsedObj && typeof parsedObj === "object" && !parsedObj.reply) {
          // Try to extract a meaningful reply from values or keys
          const vals = Object.values(parsedObj).filter((v: any) => typeof v === "string" && v.trim().length > 0);
          if (vals.length > 0) {
            parsedObj = { ...parsedObj, reply: vals[0] };
          } else {
            const keys = Object.keys(parsedObj).filter(k => typeof k === "string" && k.trim().length > 0);
            parsedObj = { ...parsedObj, reply: keys.length > 0 ? keys[0] : JSON.stringify(parsedObj) };
          }
        }

        return {
          text: JSON.stringify(parsedObj),
          raw: response,
          model,
        };
      }

      return {
        text: typeof content === "string" ? content : JSON.stringify(content || ""),
        raw: response,
        model,
      };
    } catch (error: any) {
      const message = String(error?.message || error || "");
      const status = error?.status || error?.code || error?.statusCode;
      
      // CRITICAL: Detect if error is from an external unsafe provider endpoint (should NOT happen)
      const isUnsafeProviderError = message.includes("genai") || message.includes("google") || message.includes("vertex");
      
      console.error(`
╔════════════════════════════════════════════════════════════════╗
║                  OPENROUTER AI ERROR OCCURRED                 ║
╚════════════════════════════════════════════════════════════════╝
[ERROR_TYPE] ${isUnsafeProviderError ? '⚠️ External Unsafe Provider Detected (CRITICAL!)' : 'OpenRouter'}
[STATUS] ${status}
[MESSAGE] ${message}
[ATTEMPT] ${attempt}/${OPENROUTER_RETRY_COUNT}
[RETRYABLE] ${isRetryableError(error)}
[TIMESTAMP] ${new Date().toISOString()}
════════════════════════════════════════════════════════════════
      `);
      
      const shouldRetry = isRetryableError(error) && attempt < OPENROUTER_RETRY_COUNT;
      if (shouldRetry) {
        const backoffMs = Math.min(3000, 500 * attempt);
        console.warn(`[OpenRouter] Retry ${attempt}/${OPENROUTER_RETRY_COUNT} after ${backoffMs}ms...`);
        await delay(backoffMs);
        continue;
      }
      throw new Error(`OpenRouter request failed (Attempt ${attempt}): ${message}`);
    }
  }

  throw new Error("OpenRouter request failed after all retry attempts.");
}
