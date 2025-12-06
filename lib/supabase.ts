import { createBrowserClient } from "@supabase/ssr"

const supabaseUrl = "https://fmbewdzmymnvhydvdcqw.supabase.co"

export const createClient = () => {
  return createBrowserClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_KEY || "")
}

export const supabase = createClient()

export type Shipment = {
  id: string
  deskripsi: string
  qty: number
  penerima: string
  po: string
  tanggal_kirim: string
  branch: string
  status?: "pending" | "confirmed" | "rejected"
  confirmed_at?: string
  confirmed_by?: string
  no_resi?: string
  created_at: string
  updated_at?: string
}
