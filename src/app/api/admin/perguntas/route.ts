import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdminOnly } from '@/lib/supabaseAdminOnly';
import { requireAdmin } from '@/lib/adminGuard';

export async function POST(req: NextRequest) {
  const guard = await requireAdmin(req);
  if (!guard.ok) return guard.res;

  const form = await req.formData();
  const texto = String(form.get('texto') ?? '').trim();
  const peso = Number(form.get('peso') ?? 1);
  const categoria_id = form.get('categoria_id') ? String(form.get('categoria_id')) : null;
  const ativa = form.getAll('ativa').length > 0;
  const tipo = String(form.get('tipo') ?? 'sim_nao');
  
  // Campos específicos por tipo
  const opcoes = form.get('opcoes') ? JSON.parse(String(form.get('opcoes'))) : null;
  const config_escala = form.get('config_escala') ? JSON.parse(String(form.get('config_escala'))) : null;

  // Logs para debug
  console.log('🔍 API - Dados recebidos:', {
    texto,
    peso,
    categoria_id,
    ativa,
    tipo,
    opcoes,
    config_escala
  });

  if (!texto) return NextResponse.json({ error: 'Texto é obrigatório' }, { status: 400 });
  if (Number.isNaN(peso) || peso < 0) return NextResponse.json({ error: 'Peso inválido' }, { status: 400 });

  // Validações específicas por tipo
  if (tipo.includes('multipla_escolha') && (!opcoes || opcoes.length < 2)) {
    return NextResponse.json({ error: 'Múltipla escolha deve ter pelo menos 2 opções' }, { status: 400 });
  }

  if (tipo === 'escala' && (!config_escala || config_escala.escalaMin >= config_escala.escalaMax)) {
    console.log('❌ Validação de escala falhou:', config_escala);
    return NextResponse.json({ error: 'Configuração de escala inválida' }, { status: 400 });
  }

  const admin = supabaseAdminOnly();
  
  // Dados da pergunta
  const perguntaData: any = { 
    texto, 
    peso, 
    categoria_id, 
    ativa,
    tipo,
    opcoes: opcoes ? JSON.stringify(opcoes) : null,
    config_escala: config_escala ? JSON.stringify(config_escala) : null
  };

  console.log('💾 Salvando pergunta no banco:', perguntaData);

  const { error } = await admin.from('perguntas').insert(perguntaData);
  if (error) {
    console.error('❌ Erro ao salvar pergunta:', error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  console.log('✅ Pergunta salva com sucesso!');
  return NextResponse.redirect(new URL('/admin/perguntas', req.url));
}
