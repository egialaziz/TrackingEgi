'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Trash2, Edit2, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Shipment {
  id: string
  description: string
  qty: number
  penerima: string
  po: string
  branch: string
  tglKirim: string
  status: string
}

interface ShipmentTableProps {
  searchQuery: string
  statusFilter: string
  onEdit: (shipment: Shipment) => void
  openConfirmModal: (shipment: Shipment) => void
}

export default function ShipmentTableSupabase({
  searchQuery,
  statusFilter,
  onEdit,
  openConfirmModal
}: ShipmentTableProps) {

  const supabase = createClientComponentClient()
  const [shipments, setShipments] = useState<Shipment[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch data dari Supabase
  const fetchShipments = async () => {
    setLoading(true)

    let query = supabase.from('shipments').select('*').order('created_at', { ascending: false })

    if (statusFilter !== 'all') {
      query = query.eq('status', statusFilter)
    }

    const { data, error } = await query

    if (!error && data) setShipments(data as Shipment[])
    setLoading(false)
  }

  // Load saat mount / filter berubah
  useEffect(() => { fetchShipments() }, [statusFilter])

  // Realtime
  useEffect(() => {
    const channel = supabase
      .channel('shipments-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'shipments' },
        () => fetchShipments()
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  // Delete
  const handleDelete = async (id: string) => {
    await supabase.from('shipments').delete().eq('id', id)
  }

  // Search
  const filtered = shipments.filter((item) => {
    const q = searchQuery.toLowerCase()
    return (
      item.description?.toLowerCase().includes(q) ||
      item.penerima?.toLowerCase().includes(q) ||
      item.po?.toLowerCase().includes(q) ||
      item.branch?.toLowerCase().includes(q)
    )
  })

  return (
    <div className="overflow-x-auto">
      {loading ? (
        <p className="text-slate-400 text-center py-4">Loading...</p>
      ) : filtered.length === 0 ? (
        <p className="text-slate-400 text-center py-4">Tidak ada data ditemukan</p>
      ) : (
        <table className="w-full text-sm text-slate-300">
          <thead>
            <tr className="border-b border-slate-800">
              <th className="py-3 px-2 text-left">Deskripsi</th>
              <th className="py-3 px-2 text-left">Qty</th>
              <th className="py-3 px-2 text-left">Penerima</th>
              <th className="py-3 px-2 text-left">PO</th>
              <th className="py-3 px-2 text-left">Branch</th>
              <th className="py-3 px-2 text-left">Status</th>
              <th className="py-3 px-2 text-center">Aksi</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((item) => (
              <tr key={item.id} className="border-b border-slate-900 hover:bg-slate-700/20">
                <td className="py-3 px-2">{item.description}</td>
                <td className="py-3 px-2">{item.qty}</td>
                <td className="py-3 px-2">{item.penerima}</td>
                <td className="py-3 px-2">{item.po}</td>
                <td className="py-3 px-2">{item.branch}</td>
                <td className="py-3 px-2">
                  {item.status === 'pending' && <span className="text-yellow-400">Pending</span>}
                  {item.status === 'confirmed' && <span className="text-green-400">Confirmed</span>}
                  {item.status === 'rejected' && <span className="text-red-400">Rejected</span>}
                </td>

                <td className="py-3 px-2 flex gap-3 justify-center">
                  {item.status === 'pending' && (
                    <button
                      onClick={() => openConfirmModal(item)}
                      className="text-green-400 hover:text-green-300"
                    >
                      <CheckCircle2 size={18} />
                    </button>
                  )}

                  <button
                    onClick={() => onEdit(item)}
                    className="text-blue-400 hover:text-blue-300"
                  >
                    <Edit2 size={18} />
                  </button>

                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
