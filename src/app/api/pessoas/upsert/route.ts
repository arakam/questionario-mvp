import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    console.log('📥 Dados recebidos:', body);
    
    // Validação básica - deve ter pelo menos nome e questionario_id
    if (!body.nome || !body.questionario_id) {
      console.log('❌ Validação básica falhou:', { nome: !!body.nome, questionario_id: !!body.questionario_id });
      return NextResponse.json({ 
        error: 'Nome e questionario_id são obrigatórios' 
      }, { status: 400 });
    }

    // Buscar configuração do questionário para validações específicas
    const admin = supabaseAdmin();
    const { data: questionario, error: qErr } = await admin
      .from('questionarios')
      .select('campos_configuraveis')
      .eq('id', body.questionario_id)
      .single();

    if (qErr) {
      console.error('❌ Erro ao buscar configuração do questionário:', qErr);
      return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
    }

    // Verificar qual campo é obrigatório baseado na configuração
    const camposConfig = questionario?.campos_configuraveis || [];
    const campoVerificacao = camposConfig.find((campo: any) => campo.campoVerificacao);
    
    console.log('🔧 Configuração do questionário:', {
      camposConfig,
      campoVerificacao,
      body: { nome: !!body.nome, email: !!body.email, telefone: !!body.telefone }
    });
    
    // Se telefone é o campo de verificação, ele é obrigatório
    if (campoVerificacao && campoVerificacao.tipo === 'telefone' && !body.telefone) {
      console.log('❌ Telefone obrigatório (campo de verificação):', { campoVerificacao, telefone: !!body.telefone });
      return NextResponse.json({ 
        error: 'Telefone é obrigatório para este questionário (campo de verificação)' 
      }, { status: 400 });
    }
    
    // Se email é o campo de verificação, ele é obrigatório
    if (campoVerificacao && campoVerificacao.tipo === 'email' && !body.email) {
      console.log('❌ Email obrigatório (campo de verificação):', { campoVerificacao, email: !!body.email });
      return NextResponse.json({ 
        error: 'Email é obrigatório para este questionário (campo de verificação)' 
      }, { status: 400 });
    }
    
    // Se não há campo de verificação configurado, permitir telefone ou email
    if (!campoVerificacao && !body.email && !body.telefone) {
      console.log('❌ Nenhum campo de identificação fornecido:', { campoVerificacao, email: !!body.email, telefone: !!body.telefone });
      return NextResponse.json({ 
        error: 'É necessário fornecer email ou telefone para este questionário' 
      }, { status: 400 });
    }
    
    // Validação de email apenas se ele foi fornecido
    if (body.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(body.email)) {
        return NextResponse.json({ 
          error: 'Formato de email inválido' 
        }, { status: 400 });
      }
    }



    // Limpar dados vazios para evitar problemas com constraints
    const dadosLimpos: any = {
      nome: body.nome.trim(),
      questionario_id: body.questionario_id
    };

    // Adicionar email apenas se fornecido
    if (body.email && body.email.trim()) {
      dadosLimpos.email = body.email.trim().toLowerCase();
    }

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

    const { questionario_id } = dadosLimpos;

    // Usar as variáveis já definidas acima
    let campoValor: string;
    let campoNome: string;
    
    if (campoVerificacao && campoVerificacao.tipo === 'telefone' && dadosLimpos.telefone) {
      // Usar telefone como campo de verificação
      campoValor = dadosLimpos.telefone;
      campoNome = 'telefone';
      console.log('🔍 Usando telefone como campo de verificação:', campoValor);
    } else if (campoVerificacao && campoVerificacao.tipo === 'email' && dadosLimpos.email) {
      // Usar email como campo de verificação
      campoValor = dadosLimpos.email;
      campoNome = 'email';
      console.log('🔍 Usando email como campo de verificação:', campoValor);
    } else if (dadosLimpos.email) {
      // Fallback para email se disponível
      campoValor = dadosLimpos.email;
      campoNome = 'email';
      console.log('🔍 Usando email como campo de verificação (fallback):', campoValor);
    } else if (dadosLimpos.telefone) {
      // Fallback para telefone se disponível
      campoValor = dadosLimpos.telefone;
      campoNome = 'telefone';
      console.log('🔍 Usando telefone como campo de verificação (fallback):', campoValor);
    } else {
      // Último fallback - usar nome (não ideal, mas funcional)
      campoValor = dadosLimpos.nome;
      campoNome = 'nome';
      console.log('🔍 Usando nome como campo de verificação (fallback):', campoValor);
    }

    // Buscar por campo de verificação + questionario_id
    const { data: found, error: findErr } = await admin
      .from('pessoas')
      .select('*')
      .eq(campoNome, campoValor)
      .eq('questionario_id', questionario_id)
      .maybeSingle();

    if (findErr) {
      console.error('❌ Erro ao buscar pessoa:', findErr);
      return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
    }

    // Se encontrou, retorna a pessoa existente para este questionário
    if (found) {
      console.log(`✅ Pessoa encontrada para este questionário usando ${campoNome}:`, found.id);
      return NextResponse.json(found);
    }

    // Se não encontrou, cria nova pessoa para este questionário
    console.log(`🆕 Criando nova pessoa para este questionário (verificação por ${campoNome})...`);
    
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

    console.log(`✅ Nova pessoa criada para este questionário (verificação por ${campoNome}):`, created.id);
    return NextResponse.json(created);

  } catch (error) {
    console.error('❌ Erro na API de pessoas:', error);
    return NextResponse.json({ 
      error: 'Erro interno do servidor' 
    }, { status: 500 });
  }
}
