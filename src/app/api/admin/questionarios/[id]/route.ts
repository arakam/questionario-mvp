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
  const nome = String(form.get('nome') ?? '');
  const slug = String(form.get('slug') ?? '');

  if (!nome || !slug) {
    return NextResponse.json({ error: 'Nome e slug são obrigatórios' }, { status: 400 });
  }

  const admin = supabaseAdminOnly();
  
  // Dados do questionário (apenas nome e slug)
  const questionarioData = { nome, slug };

  const { error } = await admin.from('questionarios').update(questionarioData).eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.redirect(new URL(`/admin/questionarios/${id}`, req.url));
}
