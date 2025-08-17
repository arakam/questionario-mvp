'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

type Categoria = { id: string; nome: string };

interface CategoryFilterProps {
  categorias: Categoria[];
  categoriaId?: string;
}

export default function CategoryFilter({ categorias, categoriaId }: CategoryFilterProps) {
  const router = useRouter();

  const handleCategoryChange = (value: string) => {
    if (value) {
      router.push(`/admin/perguntas?categoria=${value}`);
    } else {
      router.push('/admin/perguntas');
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-gray-700">Filtrar por categoria:</label>
        <select
          value={categoriaId ?? ''}
          onChange={(e) => handleCategoryChange(e.target.value)}
          className="select-field min-w-[200px]"
        >
          <option value="">Todas as categorias</option>
          {categorias.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nome}
            </option>
          ))}
        </select>
      </div>
      
      {categoriaId && (
        <Link 
          href="/admin/perguntas" 
          className="btn-secondary text-sm px-3 py-2"
        >
          🗑️ Limpar filtro
        </Link>
      )}
    </div>
  );
}
