'use client';

import { useState } from 'react';

export default function DebugPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testLogin = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/debug-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      setResult({ status: response.status, data });
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setLoading(false);
    }
  };

  const testEnv = async () => {
    try {
      const response = await fetch('/api/test-env');
      const data = await response.json();
      setResult({ type: 'env', data });
    } catch (error) {
      setResult({ type: 'env', error: error instanceof Error ? error.message : 'Unknown error' });
    }
  };

  const testSession = async () => {
    try {
      const response = await fetch('/api/debug-session');
      const data = await response.json();
      setResult({ type: 'session', data });
    } catch (error) {
      setResult({ type: 'session', error: error instanceof Error ? error.message : 'Unknown error' });
    }
  };

  const testTables = async () => {
    try {
      const response = await fetch('/api/debug-tables');
      const data = await response.json();
      setResult({ type: 'tables', data });
    } catch (error) {
      setResult({ type: 'tables', error: error instanceof Error ? error.message : 'Unknown error' });
    }
  };

  const testSupabase = async () => {
    try {
      const response = await fetch('/api/debug-supabase');
      const data = await response.json();
      setResult({ type: 'supabase', data });
    } catch (error) {
      setResult({ type: 'supabase', error: error instanceof Error ? error.message : 'Unknown error' });
    }
  };

  const testLayout = async () => {
    try {
      const response = await fetch('/api/debug-layout');
      const data = await response.json();
      setResult({ type: 'layout', data });
    } catch (error) {
      setResult({ type: 'layout', error: error instanceof Error ? error.message : 'Unknown error' });
    }
  };

  const testRedirect = async () => {
    try {
      const response = await fetch('/api/debug-redirect?redirect=/admin');
      // Para redirecionamentos, vamos verificar o status
      setResult({ type: 'redirect', status: response.status, redirected: response.redirected });
    } catch (error) {
      setResult({ type: 'redirect', error: error instanceof Error ? error.message : 'Unknown error' });
    }
  };

  const testCookies = async () => {
    try {
      const response = await fetch('/api/debug-cookies');
      const data = await response.json();
      setResult({ type: 'cookies', data });
    } catch (error) {
      setResult({ type: 'cookies', error: error instanceof Error ? error.message : 'Unknown error' });
    }
  };

  const testProduction = async () => {
    try {
      const response = await fetch('/api/debug-production');
      const data = await response.json();
      setResult({ type: 'production', data });
    } catch (error) {
      setResult({ type: 'production', error: error instanceof Error ? error.message : 'Unknown error' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">🔍 Debug do Sistema</h1>
        
        <div className="grid md:grid-cols-2 gap-8">
          {/* Teste de Variáveis de Ambiente */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">🌍 Variáveis de Ambiente</h2>
            <button 
              onClick={testEnv}
              className="btn-primary w-full mb-4"
            >
              Testar Variáveis de Ambiente
            </button>
          </div>

          {/* Teste de Login */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">🔐 Teste de Login</h2>
            <div className="space-y-4">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
              />
              <input
                type="password"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
              />
              <button 
                onClick={testLogin}
                disabled={loading || !email || !password}
                className="btn-primary w-full disabled:opacity-50"
              >
                {loading ? 'Testando...' : 'Testar Login'}
              </button>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mt-8">
          {/* Teste de Sessão */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">👤 Teste de Sessão</h2>
            <button 
              onClick={testSession}
              className="btn-primary w-full mb-4"
            >
              Verificar Sessão Atual
            </button>
            <p className="text-xs text-gray-500">
              Testa se você está logado e é admin
            </p>
          </div>

          {/* Teste de Tabelas */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">🗄️ Teste de Tabelas</h2>
            <button 
              onClick={testTables}
              className="btn-primary w-full mb-4"
            >
              Verificar Estrutura do Banco
            </button>
            <p className="text-xs text-gray-500">
              Verifica se as tabelas necessárias existem
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mt-8">
          {/* Teste do Supabase */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">🔌 Teste do Supabase</h2>
            <button 
              onClick={testSupabase}
              className="btn-primary w-full mb-4"
            >
              Verificar Conexão
            </button>
            <p className="text-xs text-gray-500">
              Testa a conexão e configuração do Supabase
            </p>
          </div>

          {/* Teste do Layout */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">🏗️ Teste do Layout</h2>
            <button 
              onClick={testLayout}
              className="btn-primary w-full mb-4"
            >
              Verificar Layout Admin
            </button>
            <p className="text-xs text-xs text-gray-500">
              Simula a verificação do layout administrativo
            </p>
          </div>
        </div>

                 <div className="grid md:grid-cols-2 gap-8 mt-8">
           {/* Teste de Redirecionamento */}
           <div className="card">
             <h2 className="text-xl font-semibold mb-4">🔄 Teste de Redirecionamento</h2>
             <button 
               onClick={testRedirect}
               className="btn-primary w-full mb-4"
             >
               Testar Redirecionamento
             </button>
             <p className="text-xs text-gray-500">
               Testa se o redirecionamento está funcionando
             </p>
           </div>

           {/* Teste de Cookies */}
           <div className="card">
             <h2 className="text-xl font-semibold mb-4">🍪 Teste de Cookies</h2>
             <button 
               onClick={testCookies}
               className="btn-primary w-full mb-4"
             >
               Verificar Cookies
             </button>
             <p className="text-xs text-gray-500">
               Verifica os cookies de autenticação
             </p>
           </div>
         </div>

         <div className="grid md:grid-cols-2 gap-8 mt-8">
           {/* Teste de Produção */}
           <div className="card">
             <h2 className="text-xl font-semibold mb-4">🚀 Debug de Produção</h2>
             <button 
               onClick={testProduction}
               className="btn-primary w-full mb-4"
             >
               Debug Produção
             </button>
             <p className="text-xs text-gray-500">
               Debug específico para problemas de produção
             </p>
           </div>
         </div>

        {/* Resultados */}
        {result && (
          <div className="card mt-8">
            <h2 className="text-xl font-semibold mb-4">📊 Resultados</h2>
            <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-sm">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}

        {/* Instruções */}
        <div className="card mt-8">
          <h2 className="text-xl font-semibold mb-4">📋 Instruções de Debug</h2>
                     <ol className="list-decimal list-inside space-y-2 text-gray-700">
             <li><strong>🌍 Variáveis de Ambiente:</strong> Teste primeiro para verificar se o Supabase está configurado</li>
             <li><strong>🔌 Teste do Supabase:</strong> Verifique a conexão e configuração do banco de dados</li>
             <li><strong>🗄️ Estrutura do Banco:</strong> Verifique se a tabela <code>admins</code> existe e tem a estrutura correta</li>
             <li><strong>🔐 Teste de Login:</strong> Teste o login com suas credenciais válidas</li>
             <li><strong>👤 Verificar Sessão:</strong> Confirme se você está logado e é reconhecido como admin</li>
             <li><strong>🏗️ Teste do Layout:</strong> Simula exatamente o que acontece no layout administrativo</li>
             <li><strong>🔄 Teste de Redirecionamento:</strong> Verifica se o redirecionamento está funcionando</li>
             <li><strong>🍪 Teste de Cookies:</strong> Verifica os cookies de autenticação (CRÍTICO para o problema atual)</li>
             <li>Se houver erro de autenticação, verifique as credenciais</li>
             <li>Se houver erro de admin, verifique se o usuário está na tabela <code>admins</code></li>
             <li><strong>🚨 IMPORTANTE:</strong> Se a tabela <code>admins</code> não existir, execute o SQL do arquivo <code>CREATE_ADMINS_TABLE.sql</code></li>
           </ol>
          
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">🔧 Solução Rápida</h3>
            <p className="text-sm text-blue-700 mb-3">
              Se o teste de tabelas mostrar que a tabela <code>admins</code> não existe:
            </p>
            <ol className="list-decimal list-inside space-y-1 text-sm text-blue-700">
              <li>Acesse o <a href="https://supabase.com/dashboard" target="_blank" className="underline">Dashboard do Supabase</a></li>
              <li>Vá para <strong>SQL Editor</strong></li>
              <li>Cole e execute o conteúdo do arquivo <code>CREATE_ADMINS_TABLE.sql</code></li>
              <li>Teste novamente a página de debug</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
