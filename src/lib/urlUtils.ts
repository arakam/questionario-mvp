/**
 * Utilitários para gerenciar URLs de forma segura
 */

/**
 * Obtém a URL base do site de forma segura
 */
export function getBaseUrl(): string {
  // No cliente, sempre usa window.location.origin
  if (typeof window !== 'undefined') {
    const origin = window.location.origin;
    console.log('🔍 getBaseUrl: Cliente, usando window.location.origin:', origin);
    return origin;
  }
  
  // No servidor, prioriza variáveis de ambiente
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL.trim();
    console.log('🔍 getBaseUrl: Servidor, usando NEXT_PUBLIC_SITE_URL:', siteUrl);
    
    // Valida se a URL não contém localhost
    if (siteUrl.includes('localhost')) {
      console.warn('⚠️ getBaseUrl: NEXT_PUBLIC_SITE_URL contém localhost, usando fallback seguro');
      return 'https://inquiro.unityerp.app';
    }
    
    return siteUrl;
  }
  
  // Fallback para desenvolvimento
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 getBaseUrl: Servidor development, usando localhost:3008');
    return 'http://localhost:3008';
  }
  
  // Fallback para produção - NUNCA deve chegar aqui se NEXT_PUBLIC_SITE_URL estiver configurado
  const fallbackUrl = 'https://inquiro.unityerp.app';
  console.log('🔍 getBaseUrl: Servidor produção, usando fallback:', fallbackUrl);
  console.warn('⚠️ getBaseUrl: Usando fallback - verifique se NEXT_PUBLIC_SITE_URL está configurado');
  return fallbackUrl;
}

/**
 * Cria uma URL relativa segura para redirecionamento
 */
export function createSafeRedirectUrl(path: string, baseUrl?: string): string {
  const base = baseUrl || getBaseUrl();
  
  // Garante que o path comece com /
  const safePath = path.startsWith('/') ? path : `/${path}`;
  
  // No cliente, sempre usa caminhos relativos para evitar problemas
  if (typeof window !== 'undefined') {
    console.log('🔍 createSafeRedirectUrl: Cliente, usando caminho relativo:', safePath);
    return safePath;
  }
  
  // No servidor, constrói URL completa
  const fullUrl = `${base}${safePath}`;
  console.log('🔍 createSafeRedirectUrl: Servidor, construindo URL completa:', fullUrl);
  
  // Valida se a URL final não contém localhost
  if (fullUrl.includes('localhost')) {
    console.error('❌ createSafeRedirectUrl: URL final contém localhost:', fullUrl);
    throw new Error('URL de redirecionamento contém localhost - configuração incorreta');
  }
  
  return fullUrl;
}

/**
 * Cria uma URL relativa para uso interno (sem localhost)
 */
export function createInternalUrl(path: string): string {
  // Sempre usa caminhos relativos para redirecionamentos internos
  return path.startsWith('/') ? path : `/${path}`;
}
