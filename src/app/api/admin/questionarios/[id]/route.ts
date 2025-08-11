import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdminOnly } from '@/lib/supabaseAdminOnly';
import { requireAdmin } from '@/lib/adminGuard';

export async function POST(req: NextRequest) {
  const guard = await requireAdmin(req);
  if (!guard.ok) return guard.res;

  const form = await req.formData();
  const nome = String(form.get('nome') ?? '');
  const slug = String(form.get('slug') ?? '');

  const admin = supabaseAdminOnly();
  const { error } = await admin.from('questionarios').insert({ nome, slug });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.redirect(new URL('/admin/questionarios', req.url));
}
