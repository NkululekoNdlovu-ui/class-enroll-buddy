-- Create user roles enum and table
CREATE TYPE public.user_role AS ENUM ('student', 'admin');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role user_role NOT NULL DEFAULT 'student',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role user_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own roles"
ON public.user_roles
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Update existing policies to allow admin access
DROP POLICY IF EXISTS "Students can view their own subjects" ON public.subjects;
DROP POLICY IF EXISTS "Students can view their own reminders" ON public.reminders;
DROP POLICY IF EXISTS "Users can view their own student profile" ON public.students;

-- New policies allowing admin access
CREATE POLICY "Students can view their own subjects or admins can view all"
ON public.subjects
FOR SELECT
USING (
  student_id IN (
    SELECT students.id
    FROM students
    WHERE students.user_id = auth.uid()
  )
  OR public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Students can view their own reminders or admins can view all"
ON public.reminders
FOR SELECT
USING (
  student_id IN (
    SELECT students.id
    FROM students
    WHERE students.user_id = auth.uid()
  )
  OR public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Users can view their own student profile or admins can view all"
ON public.students
FOR SELECT
USING (
  auth.uid() = user_id
  OR public.has_role(auth.uid(), 'admin')
);