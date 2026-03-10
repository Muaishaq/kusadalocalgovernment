
-- Function to get assigned ward ID for a PU admin
CREATE OR REPLACE FUNCTION public.get_assigned_ward_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT assigned_ward_id
  FROM public.user_roles
  WHERE user_id = _user_id
    AND role = 'pu_admin'
  LIMIT 1
$$;

-- RLS policy: PU admins can only insert votes for polling units in their assigned ward
CREATE POLICY "PU admins submit votes for assigned ward only"
ON public.votes
FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'pu_admin'::app_role)
  AND polling_unit_id IN (
    SELECT id FROM public.polling_units
    WHERE ward_id = public.get_assigned_ward_id(auth.uid())
  )
);
