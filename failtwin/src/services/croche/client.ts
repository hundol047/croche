/**
 * Croche client boundary.
 *
 * ⚠️ REAL CROCHE INTEGRATION POINT ⚠️
 * This file is where the actual Croche SDK / client is constructed. In this
 * build it is a typed placeholder because the Croche SDK/package was not
 * available in the development environment and could not be installed
 * (offline). Do NOT invent SDK symbols here — wire the real SDK when available.
 *
 * To wire the real SDK:
 *   1. Install the official Croche SDK package (per Croche docs).
 *   2. Replace `createCrocheClient` below to construct the real client using
 *      the env config (base URL / API key / workspace).
 *   3. Implement RealCrocheAIService using this client (see RealCrocheAIService.ts).
 */

export interface CrocheClientConfig {
  baseUrl: string;
  apiKey: string;
  modelCheap: string;
  modelQuality: string;
}

export function readCrocheConfig(): CrocheClientConfig {
  return {
    baseUrl: process.env.EXPO_PUBLIC_CROCHE_BASE_URL ?? '',
    // Prefer server-proxied secrets; see .env.example.
    apiKey: process.env.CROCHE_API_KEY ?? '',
    modelCheap: process.env.EXPO_PUBLIC_CROCHE_MODEL_CHEAP ?? 'croche-cheap-default',
    modelQuality: process.env.EXPO_PUBLIC_CROCHE_MODEL_QUALITY ?? 'croche-quality-default',
  };
}

/**
 * Shape of the minimal client the Real AI service expects. When you wire the
 * real SDK, make the returned object satisfy this interface (adapt as needed to
 * the official SDK surface — this is intentionally thin).
 */
export interface CrocheClient {
  /**
   * Run a chat/completion that MUST return JSON matching the given purpose.
   * The real implementation sends: system+user prompt, selected memories (as
   * context), the chosen model (tier), and asks for structured JSON output.
   */
  completeJson(args: {
    model: string;
    system: string;
    user: string;
    /** Pre-selected memory snippets (NOT the whole history) for context. */
    context: string[];
  }): Promise<unknown>;
}

/**
 * Returns a real client when configured, else null. Returning null lets the AI
 * factory fall back to the Mock so the app always runs.
 */
export function createCrocheClient(): CrocheClient | null {
  const cfg = readCrocheConfig();
  if (!cfg.baseUrl) return null;

  // TODO(croche): construct and return the real Croche SDK client here.
  // Example (pseudo — replace with the official SDK):
  //   const sdk = new CrocheSDK({ baseUrl: cfg.baseUrl, apiKey: cfg.apiKey });
  //   return {
  //     completeJson: ({ model, system, user, context }) =>
  //       sdk.chat.completeJson({ model, messages: [...], context }),
  //   };
  return null;
}
