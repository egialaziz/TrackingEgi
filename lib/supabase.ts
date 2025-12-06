import { createBrowserClient } from "@supabase/ssr";

export const createClient = () => {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://fmbewdzmymnvhydvdcqw.supabase.co";

  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

  if (!supabaseUrl || !supabaseAnonKey) {
    // Hindari crash saat prerender
    console.warn("⚠️ Supabase env missing — running in fallback mode");
    return null as any;
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
};

export const supabase = typeof window !== "undefined" ? createClient() : null;

export type Shipment = {
  id: string;
  deskripsi: string;
  qty: number;
  penerima: string;
  po: string;
  tanggal_kirim: string;
  branch: string;
  status?: "pending" | "confirmed" | "rejected";
  confirmed_at?: string;
  confirmed_by?: string;
  no_resi?: string;
  created_at: string;
  updated_at?: string;
};
