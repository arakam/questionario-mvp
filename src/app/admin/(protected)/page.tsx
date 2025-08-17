import Link from 'next/link';
import { createSupabaseServer } from '@/lib/supabaseServer';

// Força o uso do Node.js runtime para evitar problemas com Edge Runtime
export const runtime = 'nodejs';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const supabase = await createSupabaseServer();

  // Busca estatísticas
  const [
    { count: categoriasCount },
    { count: perguntasCount },
    { count: questionariosCount },
    { count: respostasCount }
  ] = await Promise.all([
    supabase.from('categorias').select('*', { count: 'exact', head: true }),
    supabase.from('perguntas').select('*', { count: 'exact', head: true }),
    supabase.from('questionarios').select('*', { count: 'exact', head: true }),
    supabase.from('respostas').select('*', { count: 'exact', head: true })
  ]);

  const stats = [
    {
      title: 'Categorias',
      value: categoriasCount || 0,
      icon: '🏷️',
      color: 'text-primary-blue',
      bgColor: 'bg-blue-50',
      href: '/admin/categorias'
    },
    {
      title: 'Perguntas',
      value: perguntasCount || 0,
      icon: '❓',
      color: 'text-primary-orange',
      bgColor: 'bg-orange-50',
      href: '/admin/perguntas'
    },
    {
      title: 'Questionários',
      value: questionariosCount || 0,
      icon: '📋',
      color: 'text-accent-blue',
      bgColor: 'bg-blue-50',
      href: '/admin/questionarios'
    },
    {
      title: 'Respostas',
      value: respostasCount || 0,
      icon: '📈',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      href: '/admin/respostas'
    }
  ];

  const quickActions = [
    {
      title: 'Nova Categoria',
      description: 'Criar uma nova categoria para organizar perguntas',
      icon: '🏷️',
      href: '/admin/categorias/nova',
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Nova Pergunta',
      description: 'Adicionar uma nova pergunta ao Inquiro',
      icon: '❓',
      href: '/admin/perguntas/nova',
      color: 'from-orange-500 to-orange-600'
    },
    {
      title: 'Novo Questionário',
      description: 'Criar um novo questionário personalizado',
      icon: '📋',
      href: '/admin/questionarios/novo',
      color: 'from-purple-500 to-purple-600'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          🎉 Bem-vindo ao Inquiro
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Gerencie seus questionários, categorias e perguntas de forma simples e eficiente com o Inquiro
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Link key={stat.title} href={stat.href} className="group">
            <div className="card-hover text-center group-hover:scale-105 transition-transform duration-200">
              <div className={`w-16 h-16 ${stat.bgColor} rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200`}>
                <span className="text-2xl">{stat.icon}</span>
              </div>
              <div className={`text-3xl font-bold ${stat.color} mb-2`}>
                {stat.value}
              </div>
              <div className="text-gray-600 font-medium">
                {stat.title}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          🚀 Ações Rápidas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quickActions.map((action) => (
            <Link key={action.title} href={action.href} className="group">
              <div className="card-hover h-full group-hover:scale-105 transition-transform duration-200">
                <div className={`w-12 h-12 bg-gradient-to-r ${action.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200`}>
                  <span className="text-xl text-white">{action.icon}</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {action.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {action.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          📊 Visão Geral do Inquiro
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Sistema de Perguntas do Inquiro
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total de perguntas:</span>
                <span className="font-semibold text-gray-900">{perguntasCount || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Categorias disponíveis:</span>
                <span className="font-semibold text-gray-900">{categoriasCount || 0}</span>
              </div>
            </div>
          </div>
          
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Questionários e Respostas
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Questionários criados:</span>
                <span className="font-semibold text-gray-900">{questionariosCount || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total de respostas:</span>
                <span className="font-semibold text-gray-900">{respostasCount || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
