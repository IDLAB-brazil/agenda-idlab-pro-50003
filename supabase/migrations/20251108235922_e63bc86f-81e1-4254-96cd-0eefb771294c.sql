-- Remover políticas RLS antigas e criar novas sem autenticação
DROP POLICY IF EXISTS "Admins can view all appointments" ON public.appointments;
DROP POLICY IF EXISTS "Admins can update appointments" ON public.appointments;
DROP POLICY IF EXISTS "Admins can delete appointments" ON public.appointments;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;

-- Desabilitar RLS nas tabelas que não precisam mais
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;

-- Manter RLS na appointments apenas para separar leitura pública
DROP POLICY IF EXISTS "Anyone can view scheduled appointments" ON public.appointments;
DROP POLICY IF EXISTS "Anyone can create appointments" ON public.appointments;

-- Novas políticas simplificadas
CREATE POLICY "Public can create appointments"
  ON public.appointments FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public can view scheduled appointments"
  ON public.appointments FOR SELECT
  USING (true);

CREATE POLICY "Public can update appointments"
  ON public.appointments FOR UPDATE
  USING (true);

CREATE POLICY "Public can delete appointments"
  ON public.appointments FOR DELETE
  USING (true);

-- Criar tabela para configuração do admin (token secreto)
CREATE TABLE IF NOT EXISTS public.admin_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  access_token TEXT NOT NULL UNIQUE,
  google_calendar_refresh_token TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Inserir token inicial (você pode mudar depois)
INSERT INTO public.admin_config (access_token) 
VALUES ('idlab-admin-2024')
ON CONFLICT (access_token) DO NOTHING;

-- Desabilitar RLS na config
ALTER TABLE public.admin_config DISABLE ROW LEVEL SECURITY;