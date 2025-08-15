'use client';

import { useMemo, useState } from 'react';

export type Categoria = {
  id: string;
  nome: string;
};

export type Pergunta = {
  id: string;
  texto: string;
  categoria_id: string | null;
};

type Props = {
  /** Lista completa de perguntas ativas disponíveis para seleção */
  perguntas: Pergunta[];
  /** Lista de categorias para filtro */
  categorias: Categoria[];
  /** IDs já selecionados para este questionário (estado inicial) */
  preselectedIds: string[];
  /** URL do action que receberá POST com "pergunta_ids"[] */
  actionUrl: string;
};

export default function PerguntasSelector({
  perguntas,
  categorias,
  preselectedIds,
  actionUrl,
}: Props) {
  const [query, setQuery] = useState('');
  const [categoriaId, setCategoriaId] = useState<string>('');
  const [selected, setSelected] = useState<Set<string>>(new Set(preselectedIds));

  const normalizedQuery = query.trim().toLowerCase();

  const filtered = useMemo(() => {
    let base = perguntas;
    if (categoriaId) {
      base = base.filter((p) => p.categoria_id === categoriaId);
    }
    if (!normalizedQuery) return base;
    return base.filter((p) => p.texto.toLowerCase().includes(normalizedQuery));
  }, [perguntas, categoriaId, normalizedQuery]);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAllFiltered = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      for (const p of filtered) next.add(p.id);
      return next;
    });
  };

  const clearAllFiltered = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      for (const p of filtered) next.delete(p.id);
      return next;
    });
  };

  const total = perguntas.length;
  const totalFiltered = filtered.length;
  const totalSelected = selected.size;

  return (
    <form action={actionUrl} method="post" className="grid gap-3">
      <h2 className="text-lg font-semibold">Selecionar Perguntas</h2>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1 flex gap-2">
          <div className="flex-1">
            <input
              type="search"
              placeholder="Pesquisar pergunta…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-black/60"
              aria-label="Pesquisar pergunta"
            />
          </div>
          <div className="w-56">
            <select
              value={categoriaId}
              onChange={(e) => setCategoriaId(e.target.value)}
              className="w-full border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-black/60"
              aria-label="Filtrar por categoria"
            >
              <option value="">Todas as categorias</option>
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <button
            type="button"
            onClick={selectAllFiltered}
            className="border px-3 py-1 rounded hover:bg-gray-50"
            title="Selecionar todas as perguntas filtradas"
          >
            Selecionar filtradas
          </button>
          <button
            type="button"
            onClick={clearAllFiltered}
            className="border px-3 py-1 rounded hover:bg-gray-50"
            title="Limpar seleção das filtradas"
          >
            Limpar filtradas
          </button>
        </div>
      </div>

      <div className="text-xs text-gray-600">
        {totalSelected} selecionadas • {totalFiltered}/{total} exibidas
      </div>

      {/* Lista visual (controle dos checkboxes é client-side) */}
      <div className="grid gap-2 max-h-[520px] overflow-auto border rounded p-2">
        {filtered.map((p) => {
          const checked = selected.has(p.id);
          return (
            <label
              key={p.id}
              className="flex items-start gap-2 p-2 rounded hover:bg-gray-50 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggle(p.id)}
                className="mt-1"
              />
              <span className="select-none">{p.texto}</span>
            </label>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center text-gray-500 p-6">
            Nenhuma pergunta encontrada para esse filtro.
          </div>
        )}
      </div>

      {/* Inputs escondidos que efetivamente vão no POST (um por id selecionado) */}
      <div aria-hidden className="hidden">
        {[...selected].map((id) => (
          <input key={id} type="hidden" name="pergunta_ids" value={id} />
        ))}
      </div>

      <div>
        <button className="border px-4 py-2 rounded hover:bg-gray-50">Atualizar perguntas</button>
      </div>
    </form>
  );
}
