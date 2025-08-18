import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdminOnly } from '@/lib/supabaseAdminOnly';
import { requireAdmin } from '@/lib/adminGuard';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdmin(req);
  if (!guard.ok) return guard.res;

  const { id } = await params;
  const admin = supabaseAdminOnly();
  
  const { data: pergunta, error } = await admin
    .from('perguntas')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !pergunta) {
    return NextResponse.json({ error: 'Pergunta não encontrada' }, { status: 404 });
  }

  return NextResponse.json(pergunta);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdmin(req);
  if (!guard.ok) return guard.res;

  const { id } = await params;
  const form = await req.formData();
  
  const texto = String(form.get('texto') ?? '').trim();
  const peso = Number(form.get('peso') ?? 1);
  const categoria_id = form.get('categoria_id') ? String(form.get('categoria_id')) : null;
  const ativa = form.getAll('ativa').length > 0;
  const tipo = String(form.get('tipo') ?? 'sim_nao');
  
  // Campos específicos por tipo
  const opcoes = form.get('opcoes') ? JSON.parse(String(form.get('opcoes'))) : null;
  const config_escala = form.get('config_escala') ? JSON.parse(String(form.get('config_escala'))) : null;

  if (!texto) return NextResponse.json({ error: 'Texto é obrigatório' }, { status: 400 });
  if (Number.isNaN(peso) || peso < 0) return NextResponse.json({ error: 'Peso inválido' }, { status: 400 });

  // Validações específicas por tipo
  if (tipo.includes('multipla_escolha') && (!opcoes || opcoes.length < 2)) {
    return NextResponse.json({ error: 'Múltipla escolha deve ter pelo menos 2 opções' }, { status: 400 });
  }

  if (tipo === 'escala' && (!config_escala || config_escala.escalaMin >= config_escala.escalaMax)) {
    return NextResponse.json({ error: 'Configuração de escala inválida' }, { status: 400 });
  }

  const admin = supabaseAdminOnly();
  
  // Dados da pergunta para atualização
  const perguntaData: any = { 
    texto, 
    peso, 
    categoria_id, 
    ativa,
    tipo,
    opcoes: opcoes ? JSON.stringify(opcoes) : null,
    config_escala: config_escala ? JSON.stringify(config_escala) : null
  };

  const { error } = await admin
    .from('perguntas')
    .update(perguntaData)
    .eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.redirect(new URL('/admin/perguntas', req.url));
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdmin(req);
  if (!guard.ok) return guard.res;

  const { id } = await params;
  const admin = supabaseAdminOnly();
  
  const { error } = await admin
    .from('perguntas')
    .delete()
    .eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.redirect(new URL('/admin/perguntas', req.url));
}
