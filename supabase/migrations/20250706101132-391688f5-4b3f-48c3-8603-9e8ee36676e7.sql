
-- Add username field to profiles table
ALTER TABLE public.profiles 
ADD COLUMN username TEXT;

-- Add unique constraint for username
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_username_unique UNIQUE (username);

-- Add card_template field to store selected card design
ALTER TABLE public.profiles 
ADD COLUMN card_template TEXT DEFAULT 'pink';
