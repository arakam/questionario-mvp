'use client';

import { useCallback, useMemo, useState } from 'react';

type Props = {
  slug: string;
  nome: string; // nome do questionário
};

export default function ShareButtons({ slug, nome }: Props) {
  const [copied, setCopied] = useState(false);
  const [copiedIg, setCopiedIg] = useState(false);

  const url = useMemo(() => {
    if (typeof window === 'undefined') return `/q/${slug}`;
    return new URL(`/q/${slug}`, window.location.origin).toString();
  }, [slug]);

  const textoPadrao = useMemo(
    () => `${nome} – responda o questionário: ${url}`,
    [nome, url]
  );

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // fallback: abre prompt
      window.prompt('Copie o link:', url);
    }
  }, [url]);

  const shareNative = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: nome,
          text: `${nome} – responda o questionário`,
          url,
        });
      } catch {
        // usuário cancelou; tudo bem
      }
    } else {
      // fallback: tenta abrir o WhatsApp Web
      const w = `https://wa.me/?text=${encodeURIComponent(textoPadrao)}`;
      window.open(w, '_blank', 'noopener,noreferrer');
    }
  }, [nome, url, textoPadrao]);

  const shareWhatsApp = useCallback(() => {
    const w = `https://wa.me/?text=${encodeURIComponent(textoPadrao)}`;
    window.open(w, '_blank', 'noopener,noreferrer');
  }, [textoPadrao]);

  const shareEmail = useCallback(() => {
    const subject = encodeURIComponent(`Convite: ${nome}`);
    const body = encodeURIComponent(textoPadrao);
    const mailto = `mailto:?subject=${subject}&body=${body}`;
    window.location.href = mailto;
  }, [nome, textoPadrao]);

  const shareInstagram = useCallback(async () => {
    // Instagram não tem "share url" web; copiamos o texto e abrimos o site/app
    try {
      await navigator.clipboard.writeText(textoPadrao);
      setCopiedIg(true);
      setTimeout(() => setCopiedIg(false), 1500);
    } catch {
      window.prompt('Copie e cole no Instagram:', textoPadrao);
    }
    // abre Instagram (o usuário pode colar no DM/caption)
    window.open('https://www.instagram.com/', '_blank', 'noopener,noreferrer');
  }, [textoPadrao]);

  return (
    <div className="flex items-center gap-2">
      {/* Copiar link */}
      <button
        type="button"
        title="Copiar link"
        onClick={copy}
        className="group relative"
      >
        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white hover:from-blue-600 hover:to-blue-700 transition-all duration-200 hover:scale-110 shadow-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </div>
        {copied && (
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-green-600 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
            Copiado! ✓
          </div>
        )}
      </button>

      {/* Share nativo */}
      <button
        type="button"
        title="Compartilhar (share nativo)"
        onClick={shareNative}
        className="w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center text-white hover:from-green-600 hover:to-green-700 transition-all duration-200 hover:scale-110 shadow-sm"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
        </svg>
      </button>

      {/* WhatsApp */}
      <button
        type="button"
        title="Compartilhar no WhatsApp"
        onClick={shareWhatsApp}
        className="w-8 h-8 bg-gradient-to-r from-green-400 to-green-500 rounded-lg flex items-center justify-center text-white hover:from-green-500 hover:to-green-600 transition-all duration-200 hover:scale-110 shadow-sm"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
        </svg>
      </button>

      {/* Instagram */}
      <button
        type="button"
        title="Compartilhar no Instagram (copia o texto)"
        onClick={shareInstagram}
        className="group relative"
      >
        <div className="w-8 h-8 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 rounded-lg flex items-center justify-center text-white hover:from-purple-600 hover:via-pink-600 hover:to-orange-600 transition-all duration-200 hover:scale-110 shadow-sm">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
          </svg>
        </div>
        {copiedIg && (
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-purple-600 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
            Texto copiado! ✓
          </div>
        )}
      </button>

      {/* Email */}
      <button
        type="button"
        title="Compartilhar por e-mail"
        onClick={shareEmail}
        className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center text-white hover:from-blue-700 hover:to-blue-800 transition-all duration-200 hover:scale-110 shadow-sm"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      </button>
    </div>
  );
}
