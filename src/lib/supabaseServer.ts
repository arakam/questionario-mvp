import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Força o uso do Node.js runtime para evitar problemas com Edge Runtime
export const runtime = 'nodejs';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Client do Supabase para uso em Server Components (RSC) e layouts/pages do App Router.
 * - Apenas LÊ cookies (get). set/remove são NO-OP para evitar o erro:
 *   "Cookies can only be modified in a Server Action or Route Handler."
 * - Para escrever cookies, use os adapters locais nos Route Handlers (ex.: login/logout).
 */
export async function createSupabaseServer(): Promise<SupabaseClient> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  if (!url || !anon) {
    throw new Error('Supabase URL/Anon Key ausentes nas variáveis de ambiente.');
  }

  const cookieStore = await cookies();

  const cookieMethods = {
    get(name: string) {
      return cookieStore.get(name)?.value;
    },
    // NO-OP em RSC: escrita de cookies só em Route Handler / Server Action
    set(_name: string, _value: string, _options: CookieOptions) {
      /* no-op em Server Components */
    },
    remove(_name: string, _options: CookieOptions) {
      /* no-op em Server Components */
    },
  } as unknown as NonNullable<Parameters<typeof createServerClient>[2]>['cookies'];

  return createServerClient(url, anon, { cookies: cookieMethods });
}
