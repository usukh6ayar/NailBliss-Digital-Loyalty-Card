
-- Create user roles enum
CREATE TYPE public.user_role AS ENUM ('customer', 'staff');

-- Create profiles table for additional user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  role public.user_role NOT NULL DEFAULT 'customer',
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create loyalty cards table
CREATE TABLE public.loyalty_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  points INTEGER NOT NULL DEFAULT 0,
  total_visits INTEGER NOT NULL DEFAULT 0,
  last_visit TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(customer_id)
);

-- Create visits table to track each point added
CREATE TABLE public.visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  staff_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  points_added INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'first_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'last_name', ''),
    COALESCE((NEW.raw_user_meta_data ->> 'role')::public.user_role, 'customer')
  );
  
  -- Create loyalty card for customers
  IF COALESCE((NEW.raw_user_meta_data ->> 'role')::public.user_role, 'customer') = 'customer' THEN
    INSERT INTO public.loyalty_cards (customer_id)
    VALUES (NEW.id);
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to check user role (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS public.user_role
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT role FROM public.profiles WHERE id = user_id;
$$;

-- Function to add points to loyalty card
CREATE OR REPLACE FUNCTION public.add_loyalty_point(
  p_customer_id UUID,
  p_staff_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_points INTEGER;
BEGIN
  -- Check if staff user is making the request
  IF public.get_user_role(auth.uid()) != 'staff' THEN
    RAISE EXCEPTION 'Unauthorized: Only staff can add points';
  END IF;
  
  -- Get current points
  SELECT points INTO current_points 
  FROM public.loyalty_cards 
  WHERE customer_id = p_customer_id;
  
  IF current_points IS NULL THEN
    RAISE EXCEPTION 'Customer loyalty card not found';
  END IF;
  
  -- Add visit record
  INSERT INTO public.visits (customer_id, staff_id, points_added)
  VALUES (p_customer_id, p_staff_id, 1);
  
  -- Update loyalty card
  IF current_points >= 4 THEN
    -- Reset to 0 when reaching 5 points (reward claimed)
    UPDATE public.loyalty_cards 
    SET points = 0, 
        total_visits = total_visits + 1,
        last_visit = NOW(),
        updated_at = NOW()
    WHERE customer_id = p_customer_id;
  ELSE
    -- Add point
    UPDATE public.loyalty_cards 
    SET points = points + 1, 
        total_visits = total_visits + 1,
        last_visit = NOW(),
        updated_at = NOW()
    WHERE customer_id = p_customer_id;
  END IF;
  
  RETURN TRUE;
END;
$$;

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visits ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Staff can view customer profiles" 
  ON public.profiles FOR SELECT 
  USING (public.get_user_role(auth.uid()) = 'staff' AND role = 'customer');

-- RLS Policies for loyalty_cards
CREATE POLICY "Customers can view their own loyalty card" 
  ON public.loyalty_cards FOR SELECT 
  USING (auth.uid() = customer_id);

CREATE POLICY "Staff can view all loyalty cards" 
  ON public.loyalty_cards FOR SELECT 
  USING (public.get_user_role(auth.uid()) = 'staff');

CREATE POLICY "Staff can update loyalty cards" 
  ON public.loyalty_cards FOR UPDATE 
  USING (public.get_user_role(auth.uid()) = 'staff');

-- RLS Policies for visits
CREATE POLICY "Customers can view their own visits" 
  ON public.visits FOR SELECT 
  USING (auth.uid() = customer_id);

CREATE POLICY "Staff can view all visits" 
  ON public.visits FOR SELECT 
  USING (public.get_user_role(auth.uid()) = 'staff');

CREATE POLICY "Staff can insert visits" 
  ON public.visits FOR INSERT 
  WITH CHECK (public.get_user_role(auth.uid()) = 'staff');
