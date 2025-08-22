'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import PerguntaEscala from '@/components/PerguntaEscala';
import PerguntaMultiplaEscolha from '@/components/PerguntaMultiplaEscolha';
import PerguntaTexto from '@/components/PerguntaTexto';
import { type CampoConfiguravel } from '@/components/ConfiguracaoCampos';

type Questionario = {
  id: string;
  nome: string;
  slug: string;
  campos_configuraveis?: CampoConfiguravel[];
};

type Pergunta = { 
  id: string; 
  texto: string; 
  peso: number; 
  categoria_id: string | null;
  tipo: string;
  opcoes: any;
  config_escala: any;
};

const fadeUp = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.25 } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.18 } },
};

const slideQuestion = {
  initial: { opacity: 0, x: 20, filter: 'blur(2px)' },
  animate: { opacity: 1, x: 0, filter: 'blur(0px)', transition: { duration: 0.28 } },
  exit: { opacity: 0, x: -20, filter: 'blur(2px)', transition: { duration: 0.22 } },
};

export default function Page() {
  // Slug (Next 15 params é Promise; no client usamos useParams)
  const params = useParams();
  const slug = useMemo(() => {
    const v = (params as Record<string, string | string[]>).slug;
    return Array.isArray(v) ? v[0] : (v as string);
  }, [params]);

  const [phase, setPhase] = useState<'carregando'|'dados'|'perguntas'|'fim'>('carregando');
  const [pessoa, setPessoa] = useState<any>(null);
  const [q, setQ] = useState<Questionario | null>(null);
  const [perguntas, setPerguntas] = useState<Pergunta[]>([]);
  const [fila, setFila] = useState<Pergunta[]>([]);
  const [idx, setIdx] = useState(0);
  const atual = fila[idx];
  const progresso = fila.length ? Math.round(((idx) / fila.length) * 100) : 0;

  // Campos padrão para validação
  const camposPadrao: CampoConfiguravel[] = [
    { id: 'nome', label: 'Nome', tipo: 'texto', obrigatorio: true, ordem: 1, placeholder: 'Digite seu nome completo' },
    { id: 'email', label: 'E-mail', tipo: 'email', obrigatorio: true, ordem: 2, placeholder: 'seu@email.com' },
    { id: 'telefone', label: 'Telefone', tipo: 'texto', obrigatorio: true, ordem: 3, placeholder: '(11) 99999-9999' },
    { id: 'cnpj', label: 'CNPJ', tipo: 'texto', obrigatorio: true, ordem: 4, placeholder: '00.000.000/0000-00' },
    { id: 'empresa', label: 'Empresa', tipo: 'texto', obrigatorio: false, ordem: 5, placeholder: 'Nome da empresa' },
    { id: 'qtd_funcionarios', label: 'Quantidade de funcionários', tipo: 'numero', obrigatorio: false, ordem: 6, placeholder: '0' },
    { id: 'ramo_atividade', label: 'Ramo de atividade', tipo: 'texto', obrigatorio: false, ordem: 7, placeholder: 'Ex: Tecnologia, Saúde, Educação' }
  ];

  // Campos configuráveis do questionário ou campos padrão
  const campos = q?.campos_configuraveis || camposPadrao;
  const camposOrdenados = [...campos].sort((a, b) => a.ordem - b.ordem);

  // Cria o objeto de validação dinamicamente
  const validationRules = useMemo(() => {
    const rules: any = {};
    camposOrdenados.forEach(campo => {
      if (campo.obrigatorio) {
        rules[campo.id] = { required: true };
      }
    });
    return rules;
  }, [camposOrdenados]);

  // useForm sempre é chamado, independente da fase
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm(validationRules);

  // Carrega questionário + perguntas
  useEffect(() => {
    if (!slug) return;
    const run = async () => {
      console.log('🔍 Carregando questionário:', slug);
      const r = await fetch(`/api/questionarios/${slug}`);
      const d = await r.json();
      console.log('📊 Dados recebidos:', d);
      
      if (d?.error || !d?.questionario) {
        console.log('❌ Erro ou questionário não encontrado:', d?.error);
        setPhase('fim');
        return;
      }
      
      setQ(d.questionario);
      // embaralha levemente para sensação dinâmica (mas estável por sessão):
      const base: Pergunta[] = (d.perguntas ?? []).slice();
      console.log('📝 Perguntas carregadas:', base);
      
      for (let i = base.length - 1; i > 0; i--) {
        const j = (i * 9301 + 49297) % 233280 % (i + 1); // pseudo "determinístico"
        [base[i], base[j]] = [base[j], base[i]];
      }
      setPerguntas(base);
      setPhase('dados');
    };
    run();
  }, [slug]);

  // Enter / teclas de atalho durante as perguntas
  useEffect(() => {
    if (phase !== 'perguntas') return;
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      const perguntaAtual = fila[idx];
      
      if (!perguntaAtual) return;
      
      // Atalhos específicos por tipo de pergunta
      switch (perguntaAtual.tipo) {
        case 'sim_nao':
          if (k === 'y' || k === 's') responder(true);
          if (k === 'n') responder(false);
          if (k === 'enter') responder(true);
          break;
        case 'escala':
          // Para escala, Enter confirma a resposta atual
          if (k === 'enter') {
            // Implementar confirmação da escala
          }
          break;
        case 'multipla_escolha_unica':
        case 'multipla_escolha_multipla':
          // Para múltipla escolha, Enter confirma a seleção
          if (k === 'enter') {
            // Implementar confirmação da seleção
          }
          break;
        case 'texto_curto':
        case 'texto_longo':
          // Para texto, Enter confirma o texto
          if (k === 'enter') {
            // Implementar confirmação do texto
          }
          break;
      }
      
      // Navegação geral
      if (k === 'backspace' || k === 'arrowleft') setIdx(prev => Math.max(0, prev - 1));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, idx, fila, pessoa, q]);

  const onSubmit = async (data: any) => {
    // Adicionar questionario_id aos dados pessoais
    const dadosComQuestionario = {
      ...data,
      questionario_id: q!.id
    };
    
    const res = await fetch('/api/pessoas/upsert', { 
      method: 'POST', 
      body: JSON.stringify(dadosComQuestionario) 
    });
    const p = await res.json();
    if (p?.error || !p?.id) {
      alert('Erro ao salvar seus dados.');
      return;
    }
    setPessoa(p);

    // Busca pendências (retomada)
    const pr = await fetch('/api/progresso', {
      method: 'POST',
      body: JSON.stringify({ pessoa_id: p.id, questionario_id: q!.id }),
    });
    const prog = await pr.json();

    const baseFila = Array.isArray(prog?.faltam) && prog.faltam.length
      ? perguntas.filter(per => prog.faltam.includes(per.id))
      : perguntas;

    setFila(baseFila);
    setIdx(0);
    setPhase('perguntas');
  };

  const responder = useCallback(async (resposta: any) => {
    const atualLocal = fila[idx];
    if (!atualLocal) return;

    console.log('🎯 Respondendo pergunta:', {
      id: atualLocal.id,
      tipo: atualLocal.tipo,
      texto: atualLocal.texto,
      resposta: resposta,
      tipoResposta: typeof resposta
    });

    // feedback tátil sutil (mobile)
    if ('vibrate' in navigator) try { (navigator as any).vibrate?.(10); } catch { /* noop */ }

    const dadosEnvio = {
      pessoa_id: pessoa.id,
      questionario_id: q!.id,
      pergunta_id: atualLocal.id,
      tipo_pergunta: atualLocal.tipo,
      resposta,
    };

    console.log('📤 Enviando dados para API:', dadosEnvio);

    try {
      const response = await fetch('/api/respostas', {
        method: 'POST',
        body: JSON.stringify(dadosEnvio),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Erro na API:', errorData);
        alert('Erro ao salvar resposta. Tente novamente.');
        return;
      }

      const result = await response.json();
      console.log('✅ Resposta salva com sucesso:', result);

      // transição para próxima
      setTimeout(() => {
        if (idx + 1 < fila.length) setIdx(idx + 1);
        else setPhase('fim');
      }, 60);
    } catch (error) {
      console.error('❌ Erro ao enviar resposta:', error);
      alert('Erro ao salvar resposta. Tente novamente.');
    }
  }, [fila, idx, pessoa, q]);

  // UI -----------------------------------------------------------------------------------------

  // Tela "Carregando"
  if (phase === 'carregando') {
    return (
      <div className="min-h-dvh grid place-items-center bg-gradient-to-b from-white to-gray-50">
        <motion.div {...fadeUp} className="text-sm text-gray-600">Carregando…</motion.div>
      </div>
    );
  }

  // Questionário não encontrado (ou finalizado sem dados)
  if (!q) {
    return (
      <div className="min-h-dvh grid place-items-center bg-gradient-to-b from-white to-gray-50 p-6">
        <motion.div {...fadeUp} className="max-w-lg text-center">
          <h1 className="text-2xl font-semibold">Ops…</h1>
          <p className="text-gray-600 mt-2">Questionário não encontrado.</p>
        </motion.div>
      </div>
    );
  }

  // Container comum
  const Shell: React.FC<{ children: React.ReactNode; header?: React.ReactNode; footer?: React.ReactNode }> = ({ children, header, footer }) => (
    <div className="min-h-dvh bg-gradient-to-b from-white to-gray-50">
      <div className="mx-auto max-w-2xl px-4 py-8 sm:py-10">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-semibold tracking-tight truncate">{q.nome}</h1>
              <p className="text-xs sm:text-sm text-gray-500 truncate">Responda em poucos cliques</p>
            </div>
            {header}
          </div>
          {/* Progress bar (só nas perguntas/fim) */}
          {(phase === 'perguntas' || phase === 'fim') && (
            <div className="mt-4 h-2 w-full bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-black"
                initial={{ width: 0 }}
                animate={{ width: `${progresso}%` }}
                transition={{ type: 'tween', duration: 0.25 }}
              />
            </div>
          )}
        </div>

        {/* Card */}
        <div className="rounded-2xl border bg-white shadow-sm p-5 sm:p-8">
          {children}
        </div>

        {/* Footer */}
        {footer && <div className="mt-6">{footer}</div>}
      </div>
    </div>
  );

  // Tela de dados pessoais (step 1)
  if (phase === 'dados') {
    const renderCampo = (campo: CampoConfiguravel) => {
      const baseClasses = "w-full border rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-black/60";
      const errorClasses = errors[campo.id as keyof typeof errors] ? "border-red-500" : "";
      
      switch (campo.tipo) {
        case 'email':
          return (
            <input
              type="email"
              className={`${baseClasses} ${errorClasses}`}
              placeholder={campo.placeholder}
              {...register(campo.id, { required: campo.obrigatorio })}
            />
          );
        case 'numero':
          return (
            <input
              type="number"
              className={`${baseClasses} ${errorClasses}`}
              placeholder={campo.placeholder}
              min={campo.validacao?.min}
              max={campo.validacao?.max}
              {...register(campo.id, {
                required: campo.obrigatorio,
                valueAsNumber: true
              })}
            />
          );
        case 'select':
          return (
            <select
              className={`${baseClasses} ${errorClasses}`}
              {...register(campo.id, { required: campo.obrigatorio })}
            >
              <option value="">Selecione uma opção</option>
              {campo.opcoes?.map((opcao: string, index: number) => (
                <option key={index} value={opcao}>{opcao}</option>
              ))}
            </select>
          );
        default:
          return (
            <input
              type="text"
              className={`${baseClasses} ${errorClasses}`}
              placeholder={campo.placeholder}
              minLength={campo.validacao?.minLength}
              maxLength={campo.validacao?.maxLength}
              {...register(campo.id, { required: campo.obrigatorio })}
            />
          );
      }
    };

    return (
      <Shell>
        <AnimatePresence mode="wait">
          <motion.form
            key="dados"
            {...fadeUp}
            className="grid gap-3 sm:gap-4"
            onSubmit={handleSubmit(onSubmit)}
          >
            {camposOrdenados.map((campo) => (
              <div key={campo.id} className="grid gap-1.5">
                <label className="text-sm text-gray-700">
                  {campo.label} {campo.obrigatorio && <span className="text-red-500">*</span>}
                </label>
                {renderCampo(campo)}
                {errors[campo.id as keyof typeof errors] && (
                  <div className="text-sm text-red-600">
                    Este campo é obrigatório.
                  </div>
                )}
              </div>
            ))}

            <div className="pt-1">
              <button
                disabled={isSubmitting}
                className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-black text-white px-5 py-3 hover:opacity-90 transition disabled:opacity-60"
              >
                {isSubmitting ? 'Enviando…' : 'Começar'}
              </button>
            </div>
          </motion.form>
        </AnimatePresence>
      </Shell>
    );
  }

  // Tela de perguntas (step 2)
  if (phase === 'perguntas') {
    return (
      <Shell
        header={
          <div className="text-xs sm:text-sm text-gray-500">
            {idx + 1} / {fila.length}
          </div>
        }
        footer={
          <p className="text-xs text-gray-500">
            Dica: use as teclas de atalho conforme o tipo de pergunta.
          </p>
        }
      >
        <div className="flex flex-col gap-6 sm:gap-8">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={atual?.id ?? 'last'} {...slideQuestion}>
              {/* Debug info */}
              {atual && (
                <div className="text-xs text-gray-500 mb-4 p-2 bg-gray-100 rounded">
                  <strong>Debug:</strong> ID: {atual.id} | Tipo: {atual.tipo || 'sim_nao'} | 
                  Opções: {atual.opcoes ? 'Sim' : 'Não'} | 
                  Escala: {atual.config_escala ? 'Sim' : 'Não'}
                </div>
              )}
              
              {/* Renderiza pergunta baseada no tipo */}
              {atual?.tipo === 'escala' && atual?.config_escala && (
                <PerguntaEscala
                  pergunta={atual}
                  onResponder={responder}
                />
              )}
              
              {(atual?.tipo === 'multipla_escolha_unica' || atual?.tipo === 'multipla_escolha_multipla') && atual?.opcoes && (
                <PerguntaMultiplaEscolha
                  pergunta={atual}
                  onResponder={responder}
                />
              )}
              
              {(atual?.tipo === 'texto_curto' || atual?.tipo === 'texto_longo') && (
                <PerguntaTexto
                  pergunta={atual}
                  onResponder={responder}
                />
              )}
              
              {/* Pergunta padrão Sim/Não ou fallback para tipos inválidos */}
              {(!atual?.tipo || 
                atual?.tipo === 'sim_nao' || 
                (atual?.tipo === 'escala' && !atual?.config_escala) ||
                ((atual?.tipo === 'multipla_escolha_unica' || atual?.tipo === 'multipla_escolha_multipla') && !atual?.opcoes)
              ) && (
                <>
                  <h2 className="text-xl sm:text-2xl leading-tight font-medium text-center">
                    {atual?.texto}
                  </h2>

                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                    <button
                      onClick={() => responder(true)}
                      className="group flex-1 rounded-2xl border px-4 py-4 sm:py-5 font-medium hover:shadow-md hover:-translate-y-0.5 transition-all"
                    >
                      <span className="inline-block mr-2">✅</span>
                      Sim
                      <span className="sr-only"> (atalho: Y/Enter)</span>
                    </button>
                    <button
                      onClick={() => responder(false)}
                      className="group flex-1 rounded-2xl border px-4 py-4 sm:py-5 font-medium hover:shadow-md hover:-translate-y-0.5 transition-all"
                    >
                      <span className="inline-block mr-2">❌</span>
                      Não
                      <span className="sr-only"> (atalho: N)</span>
                    </button>
                  </div>
                  
                  {/* Aviso se o tipo não foi configurado corretamente */}
                  {atual?.tipo && atual?.tipo !== 'sim_nao' && (
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        ⚠️ Esta pergunta está configurada como "{atual.tipo}" mas não tem as configurações necessárias. 
                        Exibindo como pergunta Sim/Não.
                      </p>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </Shell>
    );
  }

  // Tela final (step 3)
  return (
    <Shell>
      <AnimatePresence mode="wait">
        <motion.div key="fim" {...fadeUp} className="text-center py-6 sm:py-8">
          <div className="text-5xl mb-3">🎉</div>
          <h2 className="text-2xl font-semibold">Obrigado!</h2>
          <p className="text-gray-600 mt-2">Suas respostas foram registradas com sucesso.</p>
        </motion.div>
      </AnimatePresence>
    </Shell>
  );
}
