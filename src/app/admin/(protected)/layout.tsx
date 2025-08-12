import Link from 'next/link';
import { createSupabaseServer } from '@/lib/supabaseServer';

export default async function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen grid grid-cols-[240px_1fr]">
      <aside className="border-r p-4 space-y-3">
        <div className="font-semibold">Admin</div>
        <nav className="grid gap-2 text-sm">
          <Link href="/admin">Dashboard</Link>
          <Link href="/admin/categorias">Categorias</Link>
          <Link href="/admin/perguntas">Perguntas</Link>
          <Link href="/admin/questionarios">Questionários</Link>
          <Link href="/admin/importar">Importar</Link>
          <Link href="/admin/respostas">Respostas</Link>
        </nav>
        <form action="/admin/logout" method="post" className="pt-4">
          {user && <button className="text-xs underline">Sair ({user.email})</button>}
        </form>
      </aside>
      <main className="p-6">{children}</main>
    </div>
  );
}
