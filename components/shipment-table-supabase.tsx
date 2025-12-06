'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Trash2, Edit2, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ShipmentTableProps {
  searchQuery: string
  statusFilter: string
  onEdit: (shipment: any) => void
  openConfirmModal: (shipment: any) => void
}

export default function ShipmentTableSupabase({
  searchQuery,
  statusFilter,
  onEdit,
  openConfirmModal,
}: ShipmentTableProps) {
  const [shipments, setShipments] = useState<any[]>([])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const { data, error } = await supabase
      .from('shipments')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error) setShipments(data || [])
  }

  const filtered = shipments.filter((item) => {
    const matchSearch =
      item.tracking_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.destination?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchStatus =
      statusFilter === 'all' || item.status === statusFilter

    return matchSearch && matchStatus
  })

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-3 border">Tracking</th>
            <th className="p-3 border">Destination</th>
            <th className="p-3 border">Status</th>
            <th className="p-3 border">Action</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((shipment) => (
            <tr key={shipment.id} className="border">
              <td className="p-3 border">{shipment.tracking_number}</td>
              <td className="p-3 border">{shipment.destination}</td>
              <td className="p-3 border">
                <span className="flex items-center gap-1">
                  <CheckCircle2 size={16} /> {shipment.status}
                </span>
              </td>
              <td className="p-3 border">
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => onEdit(shipment)}>
                    <Edit2 size={16} />
                  </Button>

                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => openConfirmModal(shipment)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
