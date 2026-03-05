
-- ELECTION MONITORING SYSTEM SCHEMA
-- Hierarchy: State -> LGA -> Ward -> Polling Unit

-- 1. Role enum
CREATE TYPE public.app_role AS ENUM ('pu_admin', 'ward_supervisor', 'lga_admin', 'auditor', 'super_admin');

-- 2. States table
CREATE TABLE public.states (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. LGAs table
CREATE TABLE public.lgas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  state_id UUID NOT NULL REFERENCES public.states(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(name, state_id)
);

-- 4. Wards table
CREATE TABLE public.wards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  lga_id UUID NOT NULL REFERENCES public.lgas(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(name, lga_id)
);

-- 5. Polling Units table
CREATE TABLE public.polling_units (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  ward_id UUID NOT NULL REFERENCES public.wards(id) ON DELETE CASCADE,
  registered_voters INT DEFAULT 0,
  latitude DECIMAL(10,7),
  longitude DECIMAL(10,7),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Parties table
CREATE TABLE public.parties (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  abbreviation TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  color TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  polling_unit_id UUID REFERENCES public.polling_units(id),
  ward_id UUID REFERENCES public.wards(id),
  lga_id UUID REFERENCES public.lgas(id),
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. User Roles table (separate from profiles)
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  assigned_polling_unit_id UUID REFERENCES public.polling_units(id),
  assigned_ward_id UUID REFERENCES public.wards(id),
  assigned_lga_id UUID REFERENCES public.lgas(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- 9. Elections table
CREATE TABLE public.elections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  election_type TEXT NOT NULL CHECK (election_type IN ('presidential', 'gubernatorial', 'senatorial', 'house_of_reps', 'state_assembly', 'local_government')),
  election_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 10. Votes table
CREATE TABLE public.votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  election_id UUID NOT NULL REFERENCES public.elections(id) ON DELETE CASCADE,
  polling_unit_id UUID NOT NULL REFERENCES public.polling_units(id) ON DELETE CASCADE,
  party_id UUID NOT NULL REFERENCES public.parties(id) ON DELETE CASCADE,
  votes_count INT NOT NULL CHECK (votes_count >= 0),
  submitted_by UUID NOT NULL REFERENCES auth.users(id),
  verified_by UUID REFERENCES auth.users(id),
  is_verified BOOLEAN DEFAULT false,
  photo_proof_url TEXT,
  accredited_voters INT DEFAULT 0,
  invalid_votes INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(election_id, polling_unit_id, party_id)
);

-- INDEXES
CREATE INDEX idx_lgas_state ON public.lgas(state_id);
CREATE INDEX idx_wards_lga ON public.wards(lga_id);
CREATE INDEX idx_polling_units_ward ON public.polling_units(ward_id);
CREATE INDEX idx_votes_election ON public.votes(election_id);
CREATE INDEX idx_votes_polling_unit ON public.votes(polling_unit_id);
CREATE INDEX idx_votes_party ON public.votes(party_id);
CREATE INDEX idx_user_roles_user ON public.user_roles(user_id);
CREATE INDEX idx_profiles_user ON public.profiles(user_id);

-- SECURITY DEFINER FUNCTION
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- ROW LEVEL SECURITY
ALTER TABLE public.states ENABLE ROW LEVEL SECURITY;
CREATE POLICY "States readable by authenticated" ON public.states FOR SELECT TO authenticated USING (true);
CREATE POLICY "Super admin manages states" ON public.states FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'super_admin'));

ALTER TABLE public.lgas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "LGAs readable by authenticated" ON public.lgas FOR SELECT TO authenticated USING (true);
CREATE POLICY "Super admin manages lgas" ON public.lgas FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'super_admin'));

ALTER TABLE public.wards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Wards readable by authenticated" ON public.wards FOR SELECT TO authenticated USING (true);
CREATE POLICY "Super admin manages wards" ON public.wards FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'super_admin'));

ALTER TABLE public.polling_units ENABLE ROW LEVEL SECURITY;
CREATE POLICY "PUs readable by authenticated" ON public.polling_units FOR SELECT TO authenticated USING (true);
CREATE POLICY "Super admin manages PUs" ON public.polling_units FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'super_admin'));

ALTER TABLE public.parties ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Parties readable by authenticated" ON public.parties FOR SELECT TO authenticated USING (true);
CREATE POLICY "Super admin manages parties" ON public.parties FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'super_admin'));

ALTER TABLE public.elections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Elections readable by authenticated" ON public.elections FOR SELECT TO authenticated USING (true);
CREATE POLICY "Super admin manages elections" ON public.elections FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'super_admin'));

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles viewable by authenticated" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Super admin views all roles" ON public.user_roles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Super admin manages roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'super_admin'));

ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated view votes" ON public.votes FOR SELECT TO authenticated USING (true);
CREATE POLICY "PU admins submit votes" ON public.votes FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'pu_admin') OR public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Supervisors update votes" ON public.votes FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'ward_supervisor') OR public.has_role(auth.uid(), 'lga_admin') OR public.has_role(auth.uid(), 'super_admin'));

-- TRIGGERS
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_votes_updated_at BEFORE UPDATE ON public.votes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- AUTO-CREATE PROFILE ON SIGNUP
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
