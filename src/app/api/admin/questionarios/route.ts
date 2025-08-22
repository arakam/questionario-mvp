import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdminOnly } from '@/lib/supabaseAdminOnly';
import { requireAdmin } from '@/lib/adminGuard';

export async function POST(req: NextRequest) {
  const guard = await requireAdmin(req);
  if (!guard.ok) return guard.res;

  const form = await req.formData();
  const nome = String(form.get('nome') ?? '').trim();
  const slug = String(form.get('slug') ?? '').trim();
  const camposConfiguraveis = form.get('campos_configuraveis');

  if (!nome || !slug) {
    return NextResponse.json({ error: 'Nome e slug são obrigatórios' }, { status: 400 });
  }

  // Parse dos campos configuráveis
  let camposParsed = null;
  if (camposConfiguraveis) {
    try {
      camposParsed = JSON.parse(String(camposConfiguraveis));
    } catch (error) {
      console.error('❌ Erro ao fazer parse dos campos configuráveis:', error);
      return NextResponse.json({ error: 'Formato inválido dos campos configuráveis' }, { status: 400 });
    }
  }

  const admin = supabaseAdminOnly();
  
  // Dados do questionário
  const questionarioData: any = { nome, slug };
  if (camposParsed) {
    questionarioData.campos_configuraveis = camposParsed;
  }

  const { error } = await admin.from('questionarios').insert(questionarioData);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.redirect(new URL('/admin/questionarios', req.url));
}
