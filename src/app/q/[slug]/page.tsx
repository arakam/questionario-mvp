'use client';

import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';

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

export default function Page({ params }: { params: { slug: string } }) {
  const { register, handleSubmit, formState: { errors } } = useForm<PessoaForm>();
  const [phase, setPhase] = useState<'carregando'|'dados'|'perguntas'|'fim'>('carregando');
  const [pessoa, setPessoa] = useState<any>(null);
  const [q, setQ] = useState<any>(null);
  const [perguntas, setPerguntas] = useState<Pergunta[]>([]);
  const [fila, setFila] = useState<Pergunta[]>([]);
  const [idx, setIdx] = useState(0);

  // Carrega questionário e perguntas (catálogo)
  useEffect(() => {
    const run = async () => {
      const r = await fetch(`/api/questionarios/${params.slug}`);
      const d = await r.json();
      if (d.error) {
        setPhase('fim'); // ou exibir "não encontrado"
        return;
      }
      setQ(d.questionario);
      setPerguntas(d.perguntas ?? []);
      setPhase('dados');
    };
    run();
  }, [params.slug]);

  // Monta fila aleatória (default) ou filtra pelas pendentes após pegar pessoa
  const filaInicial = useMemo(() => perguntas, [perguntas]);

  const onSubmit = async (data: PessoaForm) => {
    const res = await fetch('/api/pessoas/upsert', { method:'POST', body: JSON.stringify(data) });
    const p = await res.json();
    if (p.error) {
      alert('Erro ao salvar seus dados.');
      return;
    }
    setPessoa(p);

    // Busca o que falta (retomada)
    const pr = await fetch('/api/progresso', {
      method: 'POST',
      body: JSON.stringify({ pessoa_id: p.id, questionario_id: q.id })
    });
    const prog = await pr.json();
    if (prog?.faltam && Array.isArray(prog.faltam) && prog.faltam.length > 0) {
      const rest = filaInicial.filter(per => prog.faltam.includes(per.id));
      setFila(rest);
    } else {
      setFila(filaInicial);
    }

    setIdx(0);
    setPhase('perguntas');
  };

  const responder = async (resposta: boolean) => {
    const atual = fila[idx];
    if (!atual) return;

    await fetch('/api/respostas', {
      method: 'POST',
      body: JSON.stringify({
        pessoa_id: pessoa.id,
        questionario_id: q.id,
        pergunta_id: atual.id,
        resposta
      })
    });

    if (idx + 1 < fila.length) setIdx(idx + 1);
    else setPhase('fim');
  };

  if (phase === 'carregando') return <div className="p-6">Carregando…</div>;
  if (!q) return <div className="p-6">Questionário não encontrado.</div>;

  if (phase === 'dados') return (
    <main className="max-w-xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">{q.nome}</h1>
      <p className="text-sm opacity-80">Preencha seus dados para iniciar.</p>

      <form className="grid gap-3" onSubmit={handleSubmit(onSubmit)}>
        <input placeholder="Nome *" className="border p-2 rounded" {...register('nome', { required: true })}/>
        <input placeholder="E-mail *" className="border p-2 rounded" {...register('email', { required: true })}/>
        <input placeholder="Telefone *" className="border p-2 rounded" {...register('telefone', { required: true })}/>
        <input placeholder="CNPJ *" className="border p-2 rounded" {...register('cnpj', { required: true })}/>
        <input placeholder="Empresa" className="border p-2 rounded" {...register('empresa')}/>
        <input type="number" placeholder="Qtde funcionários" className="border p-2 rounded" {...register('qtd_funcionarios', { valueAsNumber: true })}/>
        <input placeholder="Ramo de atividade" className="border p-2 rounded" {...register('ramo_atividade')}/>
        <button className="bg-black text-white p-2 rounded">Começar</button>

        {(errors.nome || errors.email || errors.telefone || errors.cnpj) && (
          <p className="text-red-600 text-sm">Preencha todos os campos obrigatórios.</p>
        )}
      </form>
    </main>
  );

  if (phase === 'perguntas') {
    const atual = fila[idx];
    return (
      <main className="max-w-xl mx-auto p-6 space-y-6">
        <div className="text-sm">Pergunta {idx + 1} de {fila.length}</div>
        <h2 className="text-xl font-medium">{atual?.texto}</h2>
        <div className="flex gap-3">
          <button onClick={() => responder(true)} className="border p-2 rounded">Sim</button>
          <button onClick={() => responder(false)} className="border p-2 rounded">Não</button>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-xl mx-auto p-6 space-y-2">
      <h2 className="text-2xl font-semibold">Obrigado!</h2>
      <p className="opacity-80">Suas respostas foram registradas.</p>
    </main>
  );
}
