import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdminOnly } from '@/lib/supabaseAdminOnly';
import { requireAdmin } from '@/lib/adminGuard';

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdmin(req);
  if (!guard.ok) return guard.res;

  const { id } = await ctx.params;

  const form = await req.formData();
  const values = form.getAll('pergunta_ids') as string[];

  const admin = supabaseAdminOnly();

  // Limpa as seleções atuais
  const del = await admin.from('questionario_perguntas').delete().eq('questionario_id', id);
  if (del.error) return NextResponse.json({ error: del.error.message }, { status: 400 });

  // Insere as novas seleções (se houver)
  if (values.length) {
    const rows = values.map((v) => ({ questionario_id: id, pergunta_id: v }));
    const ins = await admin.from('questionario_perguntas').insert(rows);
    if (ins.error) return NextResponse.json({ error: ins.error.message }, { status: 400 });
  }

  return NextResponse.redirect(new URL(`/admin/questionarios/${id}`, req.url));
}
