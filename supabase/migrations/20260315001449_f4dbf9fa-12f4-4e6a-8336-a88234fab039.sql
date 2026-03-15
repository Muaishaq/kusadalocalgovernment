
-- Drop the overly permissive INSERT policy that bypasses ward check
DROP POLICY IF EXISTS "PU admins submit votes" ON public.votes;
