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
  const camposConfiguraveis = form.get('campos_configuraveis');

  if (!camposConfiguraveis) {
    return NextResponse.json({ error: 'Campos configuráveis são obrigatórios' }, { status: 400 });
  }

  // Parse dos campos configuráveis
  let camposParsed = null;
  try {
    camposParsed = JSON.parse(String(camposConfiguraveis));
  } catch (error) {
    console.error('❌ Erro ao fazer parse dos campos configuráveis:', error);
    return NextResponse.json({ error: 'Formato inválido dos campos configuráveis' }, { status: 400 });
  }

  const admin = supabaseAdminOnly();
  
  // Atualiza apenas os campos configuráveis
  const { error } = await admin
    .from('questionarios')
    .update({ campos_configuraveis: camposParsed })
    .eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ success: true });
}
