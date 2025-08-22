import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase';

const schema = z.object({
  pessoa_id: z.string().uuid(),
  questionario_id: z.string().uuid(),
  pergunta_id: z.string().uuid(),
  tipo_pergunta: z.enum(['sim_nao', 'multipla_escolha_unica', 'multipla_escolha_multipla', 'escala', 'texto_curto', 'texto_longo']),
  resposta: z.union([
    z.boolean(), // para sim_nao
    z.number(),  // para escala
    z.string(),  // para texto_curto, texto_longo, multipla_escolha_unica
    z.array(z.string()) // para multipla_escolha_multipla
  ])
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  console.log('📥 Dados recebidos na API de respostas:', body);
  
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    console.error('❌ Erro de validação:', parsed.error.format());
    return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
  }

  const admin = supabaseAdmin();
  const { pessoa_id, questionario_id, pergunta_id, tipo_pergunta, resposta } = parsed.data;
  
  console.log('✅ Dados validados:', { pessoa_id, questionario_id, pergunta_id, tipo_pergunta, resposta });
  console.log('🔍 Tipo da resposta:', typeof resposta);
  console.log('🔍 Valor da resposta:', resposta);

  // Preparar dados para inserção baseado no tipo
  let dadosResposta: any = {
    pessoa_id,
    questionario_id,
    pergunta_id,
    tipo_pergunta
  };

  // Mapear resposta para o campo correto baseado no tipo
  // IMPORTANTE: O campo 'resposta' deve sempre ter um valor válido para evitar constraint NOT NULL
  switch (tipo_pergunta) {
    case 'sim_nao':
      dadosResposta.resposta = resposta as boolean;
      console.log('📝 Mapeando resposta sim_nao:', dadosResposta.resposta);
      break;
      
    case 'escala':
      // Para escala, salva em resposta_escala E também em resposta (como string para compatibilidade)
      dadosResposta.resposta = (resposta as number).toString(); // Converte para string para evitar constraint
      dadosResposta.resposta_escala = resposta as number;
      console.log('📝 Mapeando resposta escala:', dadosResposta.resposta_escala);
      console.log('📝 Resposta principal (string):', dadosResposta.resposta);
      break;
      
    case 'texto_curto':
    case 'texto_longo':
      // Para texto, salva em resposta_texto E também em resposta
      dadosResposta.resposta = resposta as string;
      dadosResposta.resposta_texto = resposta as string;
      console.log('📝 Mapeando resposta texto:', dadosResposta.resposta_texto);
      console.log('📝 Resposta principal:', dadosResposta.resposta);
      break;
      
    case 'multipla_escolha_unica':
      // Para múltipla escolha única, salva em resposta_multipla E também em resposta
      dadosResposta.resposta = resposta as string;
      dadosResposta.resposta_multipla = [resposta as string];
      console.log('📝 Mapeando resposta múltipla única:', dadosResposta.resposta_multipla);
      console.log('📝 Resposta principal:', dadosResposta.resposta);
      break;
      
    case 'multipla_escolha_multipla':
      // Para múltipla escolha múltipla, salva em resposta_multipla E também em resposta (JSON string)
      dadosResposta.resposta = JSON.stringify(resposta as string[]);
      dadosResposta.resposta_multipla = resposta as string[];
      console.log('📝 Mapeando resposta múltipla múltipla:', dadosResposta.resposta_multipla);
      console.log('📝 Resposta principal (JSON string):', dadosResposta.resposta);
      break;
  }

  console.log('🚀 Dados finais para inserção:', dadosResposta);

  // upsert com unique(pessoa_id, questionario_id, pergunta_id)
  const { data, error } = await admin
    .from('respostas')
    .upsert(dadosResposta, { onConflict: 'pessoa_id,questionario_id,pergunta_id' })
    .select()
    .single();

  if (error) {
    console.error('❌ Erro ao salvar no banco:', error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  
  console.log('✅ Resposta salva com sucesso:', data);
  return NextResponse.json(data);
}
