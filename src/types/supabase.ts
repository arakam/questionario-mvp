// Tipos para corrigir problemas de inferência do Supabase
export interface SupabaseError {
  message: string;
  code?: string;
  details?: string;
  hint?: string;
}

export interface SupabaseResponse<T> {
  data: T | null;
  error: SupabaseError | null;
}

// Tipo para erros de autenticação
export interface AuthError {
  message: string;
  status?: number;
  name?: string;
}

// Tipo para erros de banco de dados
export interface DatabaseError {
  message: string;
  code?: string;
  details?: string;
  hint?: string;
}
