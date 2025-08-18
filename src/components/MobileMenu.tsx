'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Menu Toggle Button */}
      <div className="lg:hidden fixed top-20 left-4 z-50">
        <button 
          onClick={toggleMenu}
          className="p-3 bg-white rounded-lg shadow-md border border-gray-200 hover:bg-gray-50 transition-colors"
          aria-label="Abrir menu"
        >
          <span className="text-gray-600 text-lg">
            {isOpen ? '✕' : '☰'}
          </span>
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={closeMenu}
        />
      )}

      {/* Mobile Sidebar */}
      <aside className={`lg:hidden fixed top-0 left-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="p-4">
          {/* Header do menu mobile */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900">Menu</h2>
            <button 
              onClick={closeMenu}
              className="p-2 text-gray-500 hover:text-gray-700"
              aria-label="Fechar menu"
            >
              ✕
            </button>
          </div>

          {/* Navegação */}
          <nav className="space-y-3">
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider px-2 mb-3">
                Gerenciamento
              </h3>
            </div>
            
            <Link 
              href="/admin" 
              className="mobile-nav-item" 
              prefetch={false}
              onClick={closeMenu}
            >
              <span className="mr-3">📊</span>
              Dashboard
            </Link>
            
            <Link 
              href="/admin/categorias" 
              className="mobile-nav-item" 
              prefetch={false}
              onClick={closeMenu}
            >
              <span className="mr-3">🏷️</span>
              Categorias
            </Link>
            
            <Link 
              href="/admin/perguntas" 
              className="mobile-nav-item" 
              prefetch={false}
              onClick={closeMenu}
            >
              <span className="mr-3">❓</span>
              Perguntas
            </Link>
            
            <Link 
              href="/admin/questionarios" 
              className="mobile-nav-item" 
              prefetch={false}
              onClick={closeMenu}
            >
              <span className="mr-3">📋</span>
              Questionários
            </Link>
            
            <Link 
              href="/admin/respostas" 
              className="mobile-nav-item" 
              prefetch={false}
              onClick={closeMenu}
            >
              <span className="mr-3">📈</span>
              Respostas
            </Link>
          </nav>

          {/* Botão de logout no menu mobile */}
          <div className="mt-8 pt-4 border-t border-gray-200">
            <Link 
              href="/admin/logout" 
              className="mobile-nav-item text-red-600 hover:text-red-700" 
              prefetch={false}
              onClick={closeMenu}
            >
              <span className="mr-3">🚪</span>
              Sair
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}
