/**
 * API Key Validation Middleware
 * 
 * Validates API keys for external integrations (e.g., store bulk imports)
 */

import { TRPCError } from "@trpc/server";
import * as db from "./db";

/**
 * Validates an API key and returns the associated store
 * @param apiKey - The API key to validate
 * @returns The store object if valid
 * @throws TRPCError if invalid or not found
 */
export async function validateApiKey(apiKey: string) {
  if (!apiKey || apiKey.trim() === '') {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'API key é obrigatória. Inclua o header X-API-Key na requisição.',
    });
  }

  const store = await db.getStoreByApiKey(apiKey);
  
  if (!store) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'API key inválida ou expirada.',
    });
  }

  return store;
}

/**
 * Extract API key from request headers
 * @param headers - Request headers object
 * @returns The API key or null
 */
export function extractApiKey(headers: Record<string, string | string[] | undefined>): string | null {
  const apiKey = headers['x-api-key'] || headers['X-API-Key'];
  
  if (Array.isArray(apiKey)) {
    return apiKey[0] || null;
  }
  
  return apiKey || null;
}
