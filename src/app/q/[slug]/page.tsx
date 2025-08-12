'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

type PessoaForm = {
  nome: string;
  email: string;
  telefone: string;
  cnpj: string;
  empresa?: string;
  qtd_funcionarios?: number;
  ramo_atividade?: string;
};

type Pergunta = { id: string; texto: string; peso: number; categoria_id: string | null };

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

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<PessoaForm>();

  const [phase, setPhase] = useState<'carregando'|'dados'|'perguntas'|'fim'>('carregando');
  const [pessoa, setPessoa] = useState<any>(null);
  const [q, setQ] = useState<any>(null);
  const [perguntas, setPerguntas] = useState<Pergunta[]>([]);
  const [fila, setFila] = useState<Pergunta[]>([]);
  const [idx, setIdx] = useState(0);
  const atual = fila[idx];
  const progresso = fila.length ? Math.round(((idx) / fila.length) * 100) : 0;

  // Carrega questionário + perguntas
  useEffect(() => {
    if (!slug) return;
    const run = async () => {
      const r = await fetch(`/api/questionarios/${slug}`);
      const d = await r.json();
      if (d?.error || !d?.questionario) {
        setPhase('fim');
        return;
      }
      setQ(d.questionario);
      // embaralha levemente para sensação dinâmica (mas estável por sessão):
      const base: Pergunta[] = (d.perguntas ?? []).slice();
      for (let i = base.length - 1; i > 0; i--) {
        const j = (i * 9301 + 49297) % 233280 % (i + 1); // pseudo “determinístico”
        [base[i], base[j]] = [base[j], base[i]];
      }
      setPerguntas(base);
      setPhase('dados');
    };
    run();
  }, [slug]);

  // Enter / teclas de atalho (Y/N) durante as perguntas
  useEffect(() => {
    if (phase !== 'perguntas') return;
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === 'y' || k === 's') responder(true);
      if (k === 'n') responder(false);
      if (k === 'enter') responder(true);
      if (k === 'backspace' || k === 'arrowleft') setIdx(prev => Math.max(0, prev - 1));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, idx, fila, pessoa, q]);

  const onSubmit = async (data: PessoaForm) => {
    const res = await fetch('/api/pessoas/upsert', { method: 'POST', body: JSON.stringify(data) });
    const p = await res.json();
    if (p?.error || !p?.id) {
      alert('Erro ao salvar seus dados.');
      return;
    }
    setPessoa(p);

    // Busca pendências (retomada)
    const pr = await fetch('/api/progresso', {
      method: 'POST',
      body: JSON.stringify({ pessoa_id: p.id, questionario_id: q.id }),
    });
    const prog = await pr.json();

    const baseFila = Array.isArray(prog?.faltam) && prog.faltam.length
      ? perguntas.filter(per => prog.faltam.includes(per.id))
      : perguntas;

    setFila(baseFila);
    setIdx(0);
    setPhase('perguntas');
  };

  const responder = useCallback(async (resposta: boolean) => {
    const atualLocal = fila[idx];
    if (!atualLocal) return;

    // feedback tátil sutil (mobile)
    if ('vibrate' in navigator) try { (navigator as any).vibrate?.(10); } catch { /* noop */ }

    await fetch('/api/respostas', {
      method: 'POST',
      body: JSON.stringify({
        pessoa_id: pessoa.id,
        questionario_id: q.id,
        pergunta_id: atualLocal.id,
        resposta,
      }),
    });

    // transição para próxima
    setTimeout(() => {
      if (idx + 1 < fila.length) setIdx(idx + 1);
      else setPhase('fim');
    }, 60);
  }, [fila, idx, pessoa, q]);

  // UI -----------------------------------------------------------------------------------------

  // Tela “Carregando”
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
    return (
      <Shell>
        <AnimatePresence mode="wait">
          <motion.form
            key="dados"
            {...fadeUp}
            className="grid gap-3 sm:gap-4"
            onSubmit={handleSubmit(onSubmit)}
          >
            <div className="grid gap-1.5">
              <label className="text-sm text-gray-700">Nome <span className="text-red-500">*</span></label>
              <input className="border rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-black/60" {...register('nome', { required: true })}/>
            </div>
            <div className="grid gap-1.5 sm:grid-cols-2 sm:gap-4">
              <div className="grid gap-1.5">
                <label className="text-sm text-gray-700">E-mail <span className="text-red-500">*</span></label>
                <input type="email" className="border rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-black/60" {...register('email', { required: true })}/>
              </div>
              <div className="grid gap-1.5">
                <label className="text-sm text-gray-700">Telefone <span className="text-red-500">*</span></label>
                <input className="border rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-black/60" {...register('telefone', { required: true })}/>
              </div>
            </div>
            <div className="grid gap-1.5 sm:grid-cols-2 sm:gap-4">
              <div className="grid gap-1.5">
                <label className="text-sm text-gray-700">CNPJ <span className="text-red-500">*</span></label>
                <input className="border rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-black/60" {...register('cnpj', { required: true })}/>
              </div>
              <div className="grid gap-1.5">
                <label className="text-sm text-gray-700">Empresa</label>
                <input className="border rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-black/60" {...register('empresa')}/>
              </div>
            </div>
            <div className="grid gap-1.5 sm:grid-cols-2 sm:gap-4">
              <div className="grid gap-1.5">
                <label className="text-sm text-gray-700">Qtd. funcionários</label>
                <input type="number" className="border rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-black/60" {...register('qtd_funcionarios', { valueAsNumber: true })}/>
              </div>
              <div className="grid gap-1.5">
                <label className="text-sm text-gray-700">Ramo de atividade</label>
                <input className="border rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-black/60" {...register('ramo_atividade')}/>
              </div>
            </div>

            {(errors.nome || errors.email || errors.telefone || errors.cnpj) && (
              <div className="text-sm text-red-600">Preencha os campos obrigatórios.</div>
            )}

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
            Dica: use as teclas <span className="font-medium">Y</span>/<span className="font-medium">N</span> (ou Enter) para responder rápido.
          </p>
        }
      >
        <div className="flex flex-col gap-6 sm:gap-8">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={atual?.id ?? 'last'} {...slideQuestion}>
              <h2 className="text-xl sm:text-2xl leading-tight font-medium">
                {atual?.texto}
              </h2>
            </motion.div>
          </AnimatePresence>

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
