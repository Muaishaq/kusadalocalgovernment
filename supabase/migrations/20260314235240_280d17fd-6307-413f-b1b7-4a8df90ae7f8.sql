-- Create storage bucket for vote proof images
INSERT INTO storage.buckets (id, name, public)
VALUES ('vote-proofs', 'vote-proofs', true)
ON CONFLICT (id) DO NOTHING;

-- RLS: Authenticated users can upload proofs
CREATE POLICY "Authenticated users upload proofs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'vote-proofs');

-- RLS: Anyone authenticated can view proofs
CREATE POLICY "Authenticated users view proofs"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'vote-proofs');

-- RLS: Only super_admin can delete proofs
CREATE POLICY "Super admin deletes proofs"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'vote-proofs' AND public.has_role(auth.uid(), 'super_admin'));