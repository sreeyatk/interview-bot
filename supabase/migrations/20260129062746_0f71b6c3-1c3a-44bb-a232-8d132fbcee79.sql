-- Create storage bucket for interview recordings
INSERT INTO storage.buckets (id, name, public)
VALUES ('interview-recordings', 'interview-recordings', false);

-- Create RLS policies for the interview recordings bucket
CREATE POLICY "Anyone can upload recordings"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'interview-recordings');

CREATE POLICY "Anyone can read recordings"
ON storage.objects FOR SELECT
USING (bucket_id = 'interview-recordings');

-- Create table to store interview recording metadata
CREATE TABLE public.interview_recordings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  candidate_name TEXT NOT NULL,
  category TEXT NOT NULL,
  video_url TEXT,
  analysis_result JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on the table
ALTER TABLE public.interview_recordings ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert recordings (no auth required for interview candidates)
CREATE POLICY "Anyone can insert recordings"
ON public.interview_recordings FOR INSERT
WITH CHECK (true);

-- Allow anyone to read recordings (for company verification later)
CREATE POLICY "Anyone can read recordings"
ON public.interview_recordings FOR SELECT
USING (true);

-- Allow updates
CREATE POLICY "Anyone can update recordings"
ON public.interview_recordings FOR UPDATE
USING (true);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_interview_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_interview_recordings_updated_at
BEFORE UPDATE ON public.interview_recordings
FOR EACH ROW
EXECUTE FUNCTION public.update_interview_updated_at();