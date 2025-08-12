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
    // Instagram não tem “share url” web; copiamos o texto e abrimos o site/app
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
        className="rounded border px-2 py-1 text-xs hover:bg-gray-50"
      >
        📋
      </button>
      {copied && <span className="text-[11px] text-green-700">Copiado!</span>}

      {/* Share nativo */}
      <button
        type="button"
        title="Compartilhar (share nativo)"
        onClick={shareNative}
        className="rounded border px-2 py-1 text-xs hover:bg-gray-50"
      >
        📤
      </button>

      {/* WhatsApp */}
      <button
        type="button"
        title="Compartilhar no WhatsApp"
        onClick={shareWhatsApp}
        className="rounded border px-2 py-1 text-xs hover:bg-gray-50"
      >
        🟢
      </button>

      {/* Instagram (copia texto e abre IG) */}
      <button
        type="button"
        title="Compartilhar no Instagram (copia o texto)"
        onClick={shareInstagram}
        className="rounded border px-2 py-1 text-xs hover:bg-gray-50"
      >
        📸
      </button>
      {copiedIg && <span className="text-[11px] text-purple-700">Texto copiado!</span>}

      {/* Email */}
      <button
        type="button"
        title="Compartilhar por e-mail"
        onClick={shareEmail}
        className="rounded border px-2 py-1 text-xs hover:bg-gray-50"
      >
        📧
      </button>
    </div>
  );
}
