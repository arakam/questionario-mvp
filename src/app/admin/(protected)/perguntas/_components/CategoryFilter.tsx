'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';

type Cat = { id: string; nome: string };

export default function CategoryFilter({
  categorias,
  selectedId,
  basePath,
}: {
  categorias: Cat[];
  selectedId?: string;
  basePath: string; // use sempre caminho relativo ex.: "/admin/perguntas"
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value;
    const params = new URLSearchParams(searchParams?.toString());
    if (value === 'todas') params.delete('cat');
    else params.set('cat', value);

    // Atualiza sem rolar a página; transição suave controlada por AnimatedFade
    startTransition(() => {
      router.replace(
        params.toString() ? `${basePath}?${params.toString()}` : basePath,
        { scroll: false }
      );
    });
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
      <div className="flex flex-col">
        <label htmlFor="cat" className="text-sm font-medium">
          Filtrar por categoria
        </label>
        <select
          id="cat"
          name="cat"
          onChange={onChange}
          defaultValue={selectedId ?? 'todas'}
          disabled={isPending}
          className={`mt-1 w-full rounded-md border px-3 py-2 text-sm transition
            ${isPending ? 'opacity-60 cursor-wait' : ''}`}
        >
          <option value="todas">Todas</option>
          {categorias.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nome}
            </option>
          ))}
        </select>
      </div>

      {/* Indicador sutil de carregamento */}
      <div
        className={`text-xs text-gray-500 h-6 flex items-center transition-opacity ${
          isPending ? 'opacity-100' : 'opacity-0'
        }`}
        aria-live="polite"
      >
        Atualizando…
      </div>
    </div>
  );
}
