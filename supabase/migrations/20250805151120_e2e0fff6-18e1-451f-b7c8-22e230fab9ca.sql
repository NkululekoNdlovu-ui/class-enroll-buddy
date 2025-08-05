-- Create students table
CREATE TABLE IF NOT EXISTS public.students (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  student_id TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  course TEXT,
  year_level TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create subjects table
CREATE TABLE IF NOT EXISTS public.subjects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  term1 NUMERIC DEFAULT 0,
  term2 NUMERIC DEFAULT 0,
  term3 NUMERIC DEFAULT 0,
  term4 NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create reminders table
CREATE TABLE IF NOT EXISTS public.reminders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('assignment', 'submission', 'exam')),
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_students_updated_at
  BEFORE UPDATE ON public.students
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subjects_updated_at
  BEFORE UPDATE ON public.subjects
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_reminders_updated_at
  BEFORE UPDATE ON public.reminders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();