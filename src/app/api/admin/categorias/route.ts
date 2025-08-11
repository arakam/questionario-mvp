import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdminOnly } from '@/lib/supabaseAdminOnly';
import { requireAdmin } from '@/lib/adminGuard';

export async function POST(req: NextRequest) {
  // Garante que está logado e é admin
  const guard = await requireAdmin(req);
  if (!guard.ok) return guard.res;

  // Lê FormData do <form method="post">
  const form = await req.formData();
  const nome = String(form.get('nome') ?? '');
  const descricao = form.get('descricao') ? String(form.get('descricao')) : null;

  if (!nome.trim()) {
    return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 });
  }

  // Escreve com Service Role
  const admin = supabaseAdminOnly();
  const { error } = await admin.from('categorias').insert({ nome, descricao });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  // Volta para a lista
  return NextResponse.redirect(new URL('/admin/categorias', req.url));
}
