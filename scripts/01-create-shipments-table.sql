-- Create shipments table with all required columns
CREATE TABLE IF NOT EXISTS public.shipments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  description TEXT NOT NULL,
  qty INTEGER NOT NULL DEFAULT 0,
  penerima TEXT NOT NULL,
  po TEXT NOT NULL,
  tgl_kirim TEXT NOT NULL,
  branch TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'rejected')),
  confirmed_date TEXT,
  confirmed_by TEXT,
  no_resi TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all authenticated users to access
CREATE POLICY "Allow all users to access shipments" ON public.shipments
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_shipments_status ON public.shipments(status);
CREATE INDEX IF NOT EXISTS idx_shipments_created_at ON public.shipments(created_at DESC);
