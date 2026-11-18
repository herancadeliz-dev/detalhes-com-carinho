CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text NOT NULL UNIQUE,
  CONSTRAINT normalized_username CHECK (username = lower(username) AND username ~ '^[a-z0-9][a-z0-9._-]{2,39}$')
);
GRANT SELECT ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read own account profile" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid());
CREATE OR REPLACE FUNCTION public.create_account_profile() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF new.raw_user_meta_data->>'username' IS NOT NULL THEN
    INSERT INTO public.profiles (id, username) VALUES (new.id, lower(new.raw_user_meta_data->>'username'));
  END IF;
  RETURN new;
END;
$$;
CREATE TRIGGER create_private_account_profile AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.create_account_profile();