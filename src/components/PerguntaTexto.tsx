'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface PerguntaTextoProps {
  pergunta: {
    id: string;
    texto: string;
    tipo: string;
  };
  onResponder: (resposta: string) => void;
}

export default function PerguntaTexto({ pergunta, onResponder }: PerguntaTextoProps) {
  const [texto, setTexto] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isTextoLongo = pergunta.tipo === 'texto_longo';
  const maxLength = isTextoLongo ? 1000 : 200;
  const placeholder = isTextoLongo 
    ? 'Digite sua resposta detalhada aqui...'
    : 'Digite sua resposta aqui...';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (texto.trim()) {
      setIsSubmitting(true);
      onResponder(texto.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (texto.trim()) {
        setIsSubmitting(true);
        onResponder(texto.trim());
      }
    }
  };

  const caracteresRestantes = maxLength - texto.length;
  const isLimitReached = caracteresRestantes <= 0;

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h2 className="text-xl sm:text-2xl leading-tight font-medium mb-6">
          {pergunta.texto}
        </h2>

        {/* Instruções */}
        <div className="text-sm text-gray-600 mb-6">
          {isTextoLongo 
            ? 'Digite uma resposta detalhada:'
            : 'Digite uma resposta breve:'
          }
        </div>
        
        {/* Formulário de texto */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <textarea
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              rows={isTextoLongo ? 6 : 3}
              maxLength={maxLength}
              className={`
                w-full p-4 rounded-xl border-2 resize-none transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-black/60
                ${isLimitReached 
                  ? 'border-red-300 bg-red-50' 
                  : 'border-gray-200 bg-white hover:border-gray-300'
                }
              `}
            />
            
            {/* Contador de caracteres */}
            <div className={`
              absolute bottom-2 right-3 text-xs font-medium
              ${isLimitReached ? 'text-red-500' : 'text-gray-400'}
            `}>
              {caracteresRestantes}
            </div>
          </div>

          {/* Botão de envio */}
          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={!texto.trim() || isSubmitting}
            className={`
              px-8 py-4 rounded-2xl font-medium text-lg transition-all
              ${texto.trim() && !isSubmitting
                ? 'bg-black text-white hover:bg-gray-800 shadow-lg'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }
            `}
          >
            {isSubmitting ? 'Enviando...' : 'Enviar Resposta'}
          </motion.button>
        </form>

        {/* Dicas */}
        <div className="text-sm text-gray-500 mt-4 space-y-1">
          <div>
            {isTextoLongo 
              ? 'Use Shift+Enter para quebrar linha, Enter para enviar'
              : 'Pressione Enter para enviar rapidamente'
            }
          </div>
          <div>
            Máximo: {maxLength} caracteres
          </div>
        </div>
      </motion.div>
    </div>
  );
}
