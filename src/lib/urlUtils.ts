/**
 * Utilitários para gerenciar URLs de forma segura
 */

/**
 * Obtém a URL base do site de forma segura
 */
export function getBaseUrl(): string {
  // Em produção, usa a variável de ambiente ou detecta automaticamente
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }
  
  // Fallback para desenvolvimento
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3008';
  }
  
  // Em produção, tenta detectar automaticamente
  if (typeof window !== 'undefined') {
    // Cliente: usa a URL atual
    return window.location.origin;
  }
  
  // Servidor: usa a variável de ambiente ou fallback
  return process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}`
    : process.env.NEXT_PUBLIC_SITE_URL || 'https://inquiro.unityerp.app'; // Fallback para seu domínio
}

/**
 * Cria uma URL relativa segura para redirecionamento
 */
export function createSafeRedirectUrl(path: string, baseUrl?: string): string {
  const base = baseUrl || getBaseUrl();
  
  // Garante que o path comece com /
  const safePath = path.startsWith('/') ? path : `/${path}`;
  
  // Em desenvolvimento, usa localhost
  if (process.env.NODE_ENV === 'development') {
    return `http://localhost:3008${safePath}`;
  }
  
  // Em produção, usa a URL base
  return `${base}${safePath}`;
}

/**
 * Cria uma URL relativa para uso interno (sem localhost)
 */
export function createInternalUrl(path: string): string {
  // Sempre usa caminhos relativos para redirecionamentos internos
  return path.startsWith('/') ? path : `/${path}`;
}
