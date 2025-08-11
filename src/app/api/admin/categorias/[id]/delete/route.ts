import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdminOnly } from '@/lib/supabaseAdminOnly';
import { requireAdmin } from '@/lib/adminGuard';

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> } // 👈 params como Promise
) {
  const guard = await requireAdmin(req);
  if (!guard.ok) return guard.res;

  const { id } = await ctx.params;          // 👈 await params
  const admin = supabaseAdminOnly();

  const { error } = await admin.from('categorias').delete().eq('id', id); // 👈 DELETE mesmo
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.redirect(new URL('/admin/categorias', req.url));
}
