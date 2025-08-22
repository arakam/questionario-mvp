import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validação básica - deve ter pelo menos nome e email
    if (!body.nome || !body.email) {
      return NextResponse.json({ 
        error: 'Nome e email são obrigatórios' 
      }, { status: 400 });
    }

    // Validação de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json({ 
        error: 'Formato de email inválido' 
      }, { status: 400 });
    }

    // Limpar dados vazios para evitar problemas com constraints
    const dadosLimpos: any = {
      nome: body.nome.trim(),
      email: body.email.trim().toLowerCase()
    };

    // Adicionar apenas campos que têm valor
    if (body.telefone && body.telefone.trim()) {
      dadosLimpos.telefone = body.telefone.trim();
    }
    
    if (body.cnpj && body.cnpj.trim()) {
      dadosLimpos.cnpj = body.cnpj.trim();
    }
    
    if (body.empresa && body.empresa.trim()) {
      dadosLimpos.empresa = body.empresa.trim();
    }
    
    if (body.qtd_funcionarios !== undefined && body.qtd_funcionarios !== null && body.qtd_funcionarios !== '') {
      dadosLimpos.qtd_funcionarios = parseInt(body.qtd_funcionarios);
    }
    
    if (body.ramo_atividade && body.ramo_atividade.trim()) {
      dadosLimpos.ramo_atividade = body.ramo_atividade.trim();
    }

    console.log('📤 Dados limpos para inserção:', dadosLimpos);

    const admin = supabaseAdmin();
    const { email } = dadosLimpos;

    // Procura por email (assumindo que email é único por pessoa)
    const { data: found, error: findErr } = await admin
      .from('pessoas')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (findErr) {
      console.error('❌ Erro ao buscar pessoa:', findErr);
      return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
    }

    // Se encontrou, retorna a pessoa existente
    if (found) {
      console.log('✅ Pessoa encontrada:', found.id);
      return NextResponse.json(found);
    }

    // Cria nova pessoa com os dados limpos
    const { data: created, error: insErr } = await admin
      .from('pessoas')
      .insert(dadosLimpos)
      .select()
      .single();

    if (insErr) {
      console.error('❌ Erro ao criar pessoa:', insErr);
      return NextResponse.json({ 
        error: 'Erro ao criar pessoa: ' + insErr.message 
      }, { status: 400 });
    }

    console.log('✅ Nova pessoa criada:', created.id);
    return NextResponse.json(created);

  } catch (error) {
    console.error('❌ Erro na API de pessoas:', error);
    return NextResponse.json({ 
      error: 'Erro interno do servidor' 
    }, { status: 500 });
  }
}
