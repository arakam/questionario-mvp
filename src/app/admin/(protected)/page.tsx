import { getSessionAndAdmin } from '@/lib/isAdmin';

export default async function AdminHome() {
  const { user, isAdmin } = await getSessionAndAdmin();
  if (!isAdmin) return <div className="p-6 text-red-600">Acesso negado. Seu e-mail não está autorizado.</div>;

  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <p className="opacity-80 text-sm">Bem-vindo, {user?.email}</p>
      <ul className="list-disc pl-5">
        <li>Gerencie Categorias, Perguntas e Questionários pelo menu à esquerda.</li>
      </ul>
    </div>
  );
}
