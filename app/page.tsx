'use client'

import { useState } from 'react'
import { Plus, Trash2, Edit2, X, Download, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import ShipmentForm from '@/components/shipment-form'
import ShipmentTable from '@/components/shipment-table'

export interface Shipment {
  id: string
  description: string
  qty: number
  penerima: string
  po: string
  tglKirim: string
  branch: string
  status: 'pending' | 'confirmed' | 'rejected'
  confirmedDate?: string
  confirmedBy?: string
  noResi?: string
}

export default function Page() {
  const [shipments, setShipments] = useState<Shipment[]>([
    {
      id: '1',
      description: 'Produk A - Bahan Baku',
      qty: 100,
      penerima: 'PT. Maju Jaya',
      po: 'PO-2025-001',
      tglKirim: '2025-01-15',
      branch: 'Jakarta',
      status: 'pending'
    },
    {
      id: '2',
      description: 'Produk B - Material Pendukung',
      qty: 50,
      penerima: 'PT. Mitra Baik',
      po: 'PO-2025-002',
      tglKirim: '2025-01-16',
      branch: 'Surabaya',
      status: 'confirmed',
      confirmedDate: '2025-01-16',
      confirmedBy: 'Budi Santoso',
      noResi: 'RSI-2025-00001'
    }
  ])

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingData, setEditingData] = useState<Shipment | null>(null)
  const [confirmationModal, setConfirmationModal] = useState<{ shipmentId: string; shipmentInfo: any } | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'confirmed' | 'rejected'>('all')

  const handleAddShipment = (data: Omit<Shipment, 'id'>) => {
    if (editingId) {
      setShipments(shipments.map(item =>
        item.id === editingId ? { ...data, id: editingId } : item
      ))
      setEditingId(null)
    } else {
      const newShipment: Shipment = {
        ...data,
        id: Date.now().toString()
      }
      setShipments([newShipment, ...shipments])
    }
    setShowForm(false)
    setEditingData(null)
  }

  const handleEdit = (shipment: Shipment) => {
    setEditingData(shipment)
    setEditingId(shipment.id)
    setShowForm(true)
  }

  const handleDelete = (id: string) => {
    setShipments(shipments.filter(item => item.id !== id))
  }

  const handleConfirmShipment = (shipmentId: string, confirmedBy: string, noResi: string, toUser: boolean) => {
    const shipment = shipments.find(item => item.id === shipmentId)
    if (shipment && shipment.status === 'pending') {
      const today = new Date().toISOString().split('T')[0]
      const updatedShipment = {
        ...shipment,
        status: 'confirmed' as const,
        confirmedDate: today,
        confirmedBy: confirmedBy,
        noResi: toUser ? 'Serah ke User' : noResi
      }
      setShipments(shipments.map(item =>
        item.id === shipmentId ? updatedShipment : item
      ))
      setConfirmationModal({ shipmentId, shipmentInfo: updatedShipment })
    }
  }

  const handleRejectShipment = (shipmentId: string) => {
    setShipments(shipments.map(item =>
      item.id === shipmentId ? { ...item, status: 'rejected' as const, confirmedDate: undefined, confirmedBy: undefined, noResi: undefined } : item
    ))
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingId(null)
    setEditingData(null)
  }

  const filteredShipments = shipments.filter(shipment => {
    const matchesSearch = 
      shipment.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shipment.penerima.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shipment.po.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shipment.branch.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || shipment.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const exportToExcel = () => {
    const headers = ['Deskripsi', 'Qty', 'Penerima', 'PO', 'Branch', 'Tgl Kirim', 'Status', 'Tgl Konfirmasi', 'Konfirmasi Oleh', 'No Resi']
    
    const rows = filteredShipments.map(shipment => [
      shipment.description,
      shipment.qty,
      shipment.penerima,
      shipment.po,
      shipment.branch,
      shipment.tglKirim,
      shipment.status === 'confirmed' ? 'Dikonfirmasi' : shipment.status === 'rejected' ? 'Ditolak' : 'Pending',
      shipment.confirmedDate || '-',
      shipment.confirmedBy || '-',
      shipment.noResi || '-'
    ])

    let csv = headers.join('\t') + '\n'
    rows.forEach(row => {
      csv += row.join('\t') + '\n'
    })

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    
    link.setAttribute('href', url)
    link.setAttribute('download', `pengiriman-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">📦</span>
          </div>
          Tracking Pengiriman Egi
        </h1>
        <p className="text-slate-400">Kelola dan pantau semua pengiriman Egi</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {showForm && (
            <Card className="border-slate-700 bg-slate-800/50 backdrop-blur mb-6">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-white text-lg">
                    {editingId ? 'Edit Pengiriman' : 'Tambah Pengiriman Baru'}
                  </h3>
                  <button
                    onClick={handleCloseForm}
                    className="text-slate-400 hover:text-white transition"
                  >
                    <X size={20} />
                  </button>
                </div>
                <ShipmentForm
                  onSubmit={handleAddShipment}
                  initialData={editingData || undefined}
                />
              </div>
            </Card>
          )}

          <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">Daftar Pengiriman</h2>
                {!showForm && (
                  <Button
                    onClick={() => setShowForm(true)}
                    className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white gap-2"
                  >
                    <Plus size={20} />
                    Tambah Pengiriman
                  </Button>
                )}
              </div>

              <div className="flex flex-col gap-4 mb-6">
                <div className="relative">
                  <Search size={18} className="absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Cari Deskripsi, Penerima, PO, atau Branch..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-orange-500 transition"
                  />
                </div>
                
                <div className="flex gap-2 flex-wrap">
                  {(['all', 'pending', 'confirmed', 'rejected'] as const).map(status => (
                    <button
                      key={status}
                      onClick={() => setStatusFilter(status)}
                      className={`px-4 py-2 rounded-lg font-medium transition ${
                        statusFilter === status
                          ? 'bg-orange-500 text-white'
                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      {status === 'all' ? 'Semua' : status === 'pending' ? 'Pending' : status === 'confirmed' ? 'Dikonfirmasi' : 'Ditolak'}
                    </button>
                  ))}
                  
                  <button
                    onClick={exportToExcel}
                    className="ml-auto px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg font-medium transition flex items-center gap-2"
                  >
                    <Download size={18} />
                    Export Excel
                  </button>
                </div>
              </div>

              {filteredShipments.length > 0 ? (
                <ShipmentTable
                  shipments={filteredShipments}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onConfirm={handleConfirmShipment}
                  onReject={handleRejectShipment}
                />
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📭</div>
                  <p className="text-slate-400">Belum ada data pengiriman</p>
                  <p className="text-slate-500 text-sm mt-2">
                    Klik tombol "Tambah Pengiriman" untuk memulai
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Statistics Sidebar */}
        <div className="space-y-4">
          <Card className="border-slate-700 bg-slate-800/50 backdrop-blur p-6">
            <div className="text-slate-400 text-sm font-medium mb-2">Total Pengiriman</div>
            <div className="text-3xl font-bold text-white">{shipments.length}</div>
          </Card>

          <Card className="border-slate-700 bg-slate-800/50 backdrop-blur p-6">
            <div className="text-slate-400 text-sm font-medium mb-2">Total Qty</div>
            <div className="text-3xl font-bold text-orange-500">
              {shipments.reduce((sum, item) => sum + item.qty, 0)}
            </div>
          </Card>

          <Card className="border-slate-700 bg-slate-800/50 backdrop-blur p-6">
            <div className="text-slate-400 text-sm font-medium mb-2">PO Terdaftar</div>
            <div className="text-3xl font-bold text-blue-400">
              {new Set(shipments.map(item => item.po)).size}
            </div>
          </Card>

          <Card className="border-slate-700 bg-slate-800/50 backdrop-blur p-6">
            <div className="text-slate-400 text-sm font-medium mb-2">Penerima Unik</div>
            <div className="text-3xl font-bold text-purple-400">
              {new Set(shipments.map(item => item.penerima)).size}
            </div>
          </Card>

          <Card className="border-slate-700 bg-slate-800/50 backdrop-blur p-6">
            <div className="text-slate-400 text-sm font-medium mb-2">Cabang Unik</div>
            <div className="text-3xl font-bold text-green-400">
              {new Set(shipments.map(item => item.branch)).size}
            </div>
          </Card>

          <Card className="border-slate-700 bg-slate-800/50 backdrop-blur p-6">
            <div className="text-slate-400 text-sm font-medium mb-2">Dikonfirmasi</div>
            <div className="text-3xl font-bold text-emerald-400">
              {shipments.filter(item => item.status === 'confirmed').length}
            </div>
          </Card>
        </div>
      </div>

      {confirmationModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="border-slate-700 bg-slate-800 max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">✓</span>
                </div>
                <h2 className="text-xl font-bold text-white">Pengiriman Dikonfirmasi</h2>
              </div>
              
              <div className="bg-slate-700/50 rounded-lg p-4 mb-6 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Deskripsi:</span>
                  <span className="text-white font-semibold">{confirmationModal.shipmentInfo.description}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">PO:</span>
                  <span className="text-white font-semibold">{confirmationModal.shipmentInfo.po}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Penerima:</span>
                  <span className="text-white font-semibold">{confirmationModal.shipmentInfo.penerima}</span>
                </div>
                <div className="border-t border-slate-600 pt-3">
                  <span className="text-slate-400">Tanggal Konfirmasi:</span>
                  <div className="text-2xl font-bold text-emerald-400 mt-2">
                    {new Date(confirmationModal.shipmentInfo.confirmedDate).toLocaleDateString('id-ID', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>
                <div className="border-t border-slate-600 pt-3">
                  <span className="text-slate-400">Dikonfirmasi Oleh:</span>
                  <div className="text-lg font-bold text-blue-400 mt-2">
                    {confirmationModal.shipmentInfo.confirmedBy || '-'}
                  </div>
                </div>
                <div className="border-t border-slate-600 pt-3">
                  <span className="text-slate-400">No Resi:</span>
                  <div className="text-lg font-bold text-amber-400 mt-2">
                    {confirmationModal.shipmentInfo.noResi || '-'}
                  </div>
                </div>
              </div>

              <Button
                onClick={() => setConfirmationModal(null)}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white"
              >
                Tutup
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
