import { headers } from 'next/headers';

export const dynamic = 'force-dynamic';

function sanitizeRedirectParam(v: string | null): string {
  if (!v) return '/admin';
  try {
    const u = new URL(v);
    if (u.origin && u.protocol) return '/admin';
  } catch { /* não é absoluta, ok */ }
  return v.startsWith('/') ? v : `/${v}`;
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = (await searchParams) ?? {};
  const redirectRaw = Array.isArray(sp.redirect) ? sp.redirect[0] : sp.redirect ?? '/admin';
  const redirect = sanitizeRedirectParam(redirectRaw);

  const h = await headers();
  const host = h.get('x-forwarded-host') ?? h.get('host') ?? '';
  const proto = h.get('x-forwarded-proto') ?? 'http';

  return (
    <main className="min-h-dvh grid place-items-center p-6">
      <form
        action="/admin/login/action"
        method="post"
        className="w-full max-w-sm border rounded-xl p-6 space-y-3 bg-white shadow-sm"
      >
        <h1 className="text-xl font-semibold">Login do Admin</h1>
        <input name="email" type="email" required placeholder="E-mail" className="border rounded px-3 py-2 w-full" />
        <input name="password" type="password" required placeholder="Senha" className="border rounded px-3 py-2 w-full" />
        <input type="hidden" name="redirect" value={redirect} />
        <button className="w-full bg-black text-white rounded px-3 py-2">Entrar</button>

        <p className="text-[11px] text-gray-500 pt-2">
          Você está acessando: {proto}://{host}
        </p>
      </form>
    </main>
  );
}
