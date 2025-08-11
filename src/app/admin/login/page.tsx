export default function LoginPage() {
  return (
    <main className="max-w-sm mx-auto p-6">
      <h1 className="text-xl font-semibold mb-4">Entrar</h1>
      <form action="/admin/login/action" method="post" className="grid gap-3">
        <input name="email" className="border p-2 rounded" placeholder="E-mail" required />
        <input name="password" className="border p-2 rounded" placeholder="Senha" type="password" required />
        <input type="hidden" name="redirect" value="/admin" />
        <button className="bg-black text-white p-2 rounded">Entrar</button>
      </form>
    </main>
  );
}
