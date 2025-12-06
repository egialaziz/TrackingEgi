'use client'

import { useState } from 'react'
import ShipmentTableSupabase from '@/components/shipment-table-supabase'
import { Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  // Modal management
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editData, setEditData] = useState<any | null>(null)
  const [confirmationModal, setConfirmationModal] = useState<any | null>(null)

  const openCreateForm = () => {
    setEditData(null)
    setIsFormOpen(true)
  }

  const handleEdit = (shipment: any) => {
    setEditData(shipment)
    setIsFormOpen(true)
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <h1 className="text-2xl font-semibold mb-6">Tracking System</h1>

      {/* Search + Filter + Button */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search..."
            className="bg-slate-800 pl-8 pr-3 py-2 rounded text-sm w-60 border border-slate-700"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <select
          className="bg-slate-800 border border-slate-700 px-3 py-2 rounded text-sm"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">Semua Status</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="rejected">Rejected</option>
        </select>

        <Button onClick={openCreateForm} className="flex items-center gap-2">
          <Plus size={16} /> Tambah Data
        </Button>
      </div>

      {/* TABLE */}
      <ShipmentTableSupabase
        searchQuery={searchQuery}
        statusFilter={statusFilter}
        onEdit={handleEdit}
        openConfirmModal={(shipment) =>
          setConfirmationModal({ shipmentId: shipment.id, shipmentInfo: shipment })
        }
      />

      {/* Modal - saya tidak include komponennya */}
      {isFormOpen && (
        <div className="text-slate-300 mt-4">Form modal tampil di sini…</div>
      )}

      {confirmationModal && (
        <div className="text-slate-300 mt-4">Confirm modal tampil di sini…</div>
      )}
    </div>
  )
}
