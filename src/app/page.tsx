import { redirect } from 'next/navigation';
import { getSessionAndAdmin } from '@/lib/isAdmin';

export const dynamic = 'force-dynamic';

export default async function Home() {
  // Se já estiver logado e for admin → vai pro /admin
  // Caso contrário → vai para /admin/login
  const { isAdmin } = await getSessionAndAdmin();
  redirect(isAdmin ? '/admin' : '/admin/login');
}
