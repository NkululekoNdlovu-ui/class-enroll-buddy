-- Add course and year_level columns to students table
ALTER TABLE public.students 
ADD COLUMN course TEXT,
ADD COLUMN year_level TEXT;