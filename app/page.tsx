'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Plus, X, Download, Search, Upload } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import ShipmentForm from '@/components/shipment-form'
import ShipmentTableSupabase from '@/components/shipment-table-supabase'

export default function Page() {

  const supabase = createClientComponentClient()

  const [showForm, setShowForm] = useState(false)
  const [editingData, setEditingData] = useState<any>(null)

  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const [stats, setStats] = useState({
    total: 0,
    totalQty: 0,
    uniquePO: 0,
    uniqueReceiver: 0,
    uniqueBranch: 0,
    confirmed: 0
  })

  const [confirmationModal, setConfirmationModal] = useState<any>(null)

  // --- FETCH STATISTIK ---
  const fetchStats = async () => {
    const { data } = await supabase.from('shipments').select('*')

    if (!data) return

    setStats({
      total: data.length,
      totalQty: data.reduce((s, i) => s + i.qty, 0),
      uniquePO: new Set(data.map(i => i.po)).size,
      uniqueReceiver: new Set(data.map(i => i.penerima)).size,
      uniqueBranch: new Set(data.map(i => i.branch)).size,
      confirmed: data.filter(i => i.status === 'confirmed').length
    })
  }

  // update realtime
  useEffect(() => {
    fetchStats()

    const channel = supabase
      .channel('shipments-stats')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'shipments' }, () => {
        fetchStats()
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [])

  // --- SUBMIT ADD / EDIT ---
  const handleSave = async (data: any) => {
    if (editingData) {
      await supabase.from('shipments').update(data).eq('id', editingData.id)
    } else {
      await supabase.from('shipments').insert(data)
    }
    setShowForm(false)
    setEditingData(null)
  }

  const handleEdit = (shipment: any) => {
    setEditingData(shipment)
    setShowForm(true)
  }

  // --- KONFIRMASI ---
  const confirmShipment = async (id: string, confirmedBy: string, noResi: string, toUser: boolean) => {
    const today = new Date().toISOString().split('T')[0]

    const { data } = await supabase.from('shipments').update({
      status: 'confirmed',
      confirmedDate: today,
      confirmedBy,
      noResi: toUser ? 'Serah ke User' : noResi
    }).eq('id', id).select().single()

    setConfirmationModal({ shipmentId: id, shipmentInfo: data })
  }

  // --- REJECT ---
  const rejectShipment = async (id: string) => {
    await supabase.from('shipments').update({
      status: 'rejected',
      confirmedDate: null,
      confirmedBy: null,
      noResi: null
    }).eq('id', id)
  }

  // --- EXPORT EXCEL ---
  const exportToExcel = async () => {
    try {
      const XLSX = await import('xlsx')

      const { data } = await supabase.from('shipments').select('*')

      if (!data) return alert('Tidak ada data.')

      const headers = [
        'Deskripsi', 'Qty', 'Penerima', 'PO', 'Branch',
        'Tgl Kirim', 'Status', 'Tgl Konfirmasi', 'Konfirmasi Oleh', 'No Resi'
      ]

      const rows = data.map(x => [
        x.description, x.qty, x.penerima, x.po, x.branch,
        x.tglKirim,
        x.status,
        x.confirmedDate || '',
        x.confirmedBy || '',
        x.noResi || ''
      ])

      const wb = XLSX.utils.book_new()
      const ws = XLSX.utils.aoa_to_sheet([headers, ...rows])
      XLSX.utils.book_append_sheet(wb, ws, 'Pengiriman')

      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
      const blob = new Blob([wbout])

      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = 'pengiriman.xlsx'
      link.click()
    } catch (err) {
      console.error(err)
      alert('Export gagal.')
    }
  }

  // --- TEMPLATE ---
  const downloadTemplate = async () => {
    const XLSX = await import('xlsx')

    const headers = ['Deskripsi', 'Qty', 'Penerima', 'PO', 'Tanggal Kirim', 'Branch']
    const sample = [
      ['Produk A', 10, 'PT Contoh', 'PO-01', '2025-01-01', 'Jakarta']
    ]

    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.aoa_to_sheet([headers, ...sample])
    XLSX.utils.book_append_sheet(wb, ws, 'Template')

    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([wbout])

    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'template-pengiriman.xlsx'
    link.click()
  }

  // --- IMPORT EXCEL ---
  const handleImportExcel = async (e: any) => {
    const file = e.target.files?.[0]
    if (!file) return

    const XLSX = await import('xlsx')

    const data = await file.arrayBuffer()
    const workbook = XLSX.read(data)
    const sheet = workbook.SheetNames[0]
    const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheet])

    const formatted = rows.map((r: any) => ({
      description: r['Deskripsi'] || '',
      qty: r['Qty'] || 0,
      penerima: r['Penerima'] || '',
      po: r['PO'] || '',
      tglKirim: r['Tanggal Kirim'] || new Date().toISOString().split('T')[0],
      branch: r['Branch'] || '',
      status: 'pending'
    }))

    await supabase.from('shipments').insert(formatted)
    alert(`Berhasil import ${formatted.length} data`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">

      {/* TITLE */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">📦</span>
          </div>
          Tracking Pengiriman
        </h1>
        <p className="text-slate-400">Kelola dan pantau semua pengiriman Anda</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* MAIN CONTENT */}
        <div className="lg:col-span-2">

          {/* FORM */}
          {showForm && (
            <Card className="bg-slate-800/50 border-slate-700 p-6 mb-6">
              <div className="flex justify-between mb-4">
                <h3 className="text-white font-semibold">
                  {editingData ? 'Edit Pengiriman' : 'Tambah Pengiriman'}
                </h3>
                <button onClick={() => { setShowForm(false); setEditingData(null) }}>
                  <X className="text-slate-400 hover:text-white" />
                </button>
              </div>

              <ShipmentForm
                initialData={editingData || undefined}
                onSubmit={handleSave}
              />
            </Card>
          )}

          {/* TABLE CARD */}
          <Card className="bg-slate-800/50 border-slate-700 p-6">

            {/* HEADER */}
            <div className="flex justify-between mb-6">
              <h2 className="text-xl text-white font-semibold">Daftar Pengiriman</h2>
              {!showForm && (
                <Button
                  onClick={() => setShowForm(true)}
                  className="bg-gradient-to-r from-orange-500 to-red-600 text-white"
                >
                  <Plus size={18} /> Tambah Pengiriman
                </Button>
              )}
            </div>

            {/* SEARCH + FILTER */}
            <div className="flex flex-col gap-4 mb-6">

              <div className="relative">
                <Search className="absolute left-3 top-3 text-slate-400" size={18} />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari deskripsi, penerima, PO..."
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg pl-10 pr-4 py-2 text-white"
                />
              </div>

              <div className="flex gap-2 flex-wrap">

                {['all', 'pending', 'confirmed', 'rejected'].map(st => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-4 py-2 rounded-lg transition font-medium ${
                      statusFilter === st
                        ? 'bg-orange-500 text-white'
                        : 'bg-slate-700 text-slate-300'
                    }`}
                  >
                    {st === 'all' ? 'Semua'
                      : st === 'pending' ? 'Pending'
                      : st === 'confirmed' ? 'Dikonfirmasi'
                      : 'Ditolak'}
                  </button>
                ))}

                <div className="ml-auto flex gap-2">

                  {/* IMPORT */}
                  <label className="px-4 py-2 bg-blue-600 text-white rounded-lg flex gap-2 items-center cursor-pointer">
                    <Upload size={18} /> Import Excel
                    <input type="file" className="hidden" accept=".xlsx" onChange={handleImportExcel} />
                  </label>

                  {/* TEMPLATE */}
                  <button
                    onClick={downloadTemplate}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg flex gap-2 items-center"
                  >
                    <Download size={18} /> Template
                  </button>

                  {/* EXPORT */}
                  <button
                    onClick={exportToExcel}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg flex gap-2 items-center"
                  >
                    <Download size={18} /> Export Excel
                  </button>

                </div>
              </div>
            </div>

            {/* TABLE */}
            <ShipmentTableSupabase
              searchQuery={searchQuery}
              statusFilter={statusFilter}
              onEdit={handleEdit}
              openConfirmModal={(shipment: any) =>
                setConfirmationModal({ shipmentId: shipment.id, shipmentInfo: shipment })
              }
              onReject={rejectShipment}
            />

          </Card>
        </div>

        {/* STATISTICS SIDEBAR */}
        <div className="space-y-4">
          <Card className="p-6 bg-slate-800/50 border-slate-700">
            <div className="text-slate-400 text-sm">Total Pengiriman</div>
            <div className="text-3xl text-white font-bold">{stats.total}</div>
          </Card>

          <Card className="p-6 bg-slate-800/50 border-slate-700">
            <div className="text-slate-400 text-sm">Total Qty</div>
            <div className="text-3xl text-orange-500 font-bold">{stats.totalQty}</div>
          </Card>

          <Card className="p-6 bg-slate-800/50 border-slate-700">
            <div className="text-slate-400 text-sm">PO Terdaftar</div>
            <div className="text-3xl text-blue-400 font-bold">{stats.uniquePO}</div>
          </Card>

          <Card className="p-6 bg-slate-800/50 border-slate-700">
            <div className="text-slate-400 text-sm">Penerima Unik</div>
            <div className="text-3xl text-purple-400 font-bold">{stats.uniqueReceiver}</div>
          </Card>

          <Card className="p-6 bg-slate-800/50 border-slate-700">
            <div className="text-slate-400 text-sm">Cabang Unik</div>
            <div className="text-3xl text-green-400 font-bold">{stats.uniqueBranch}</div>
          </Card>

          <Card className="p-6 bg-slate-800/50 border-slate-700">
            <div className="text-slate-400 text-sm">Dikonfirmasi</div>
            <div className="text-3xl text-emerald-400 font-bold">{stats.confirmed}</div>
          </Card>
        </div>
      </div>

      {/* MODAL KONFIRMASI */}
      {confirmationModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center p-4 z-50">
          <Card className="bg-slate-800 p-6 max-w-md w-full">
            <h2 className="text-xl text-white font-bold mb-4">Pengiriman Dikonfirmasi</h2>

            <div className="bg-slate-700/50 p-4 rounded-lg space-y-3">
              <p className="flex justify-between">
                <span className="text-slate-400">Deskripsi:</span>
                <span className="text-white">{confirmationModal.shipmentInfo.description}</span>
              </p>

              <p className="flex justify-between">
                <span className="text-slate-400">PO:</span>
                <span className="text-white">{confirmationModal.shipmentInfo.po}</span>
              </p>

              <p className="flex justify-between">
                <span className="text-slate-400">Penerima:</span>
                <span className="text-white">{confirmationModal.shipmentInfo.penerima}</span>
              </p>

              <p className="border-t border-slate-600 pt-3">
                <span className="text-slate-400 block">Tanggal Konfirmasi:</span>
                <span className="text-emerald-400 text-xl font-bold">
                  {new Date(confirmationModal.shipmentInfo.confirmedDate)
                    .toLocaleDateString('id-ID')}
                </span>
              </p>

              <p className="border-t border-slate-600 pt-3">
                <span className="text-slate-400 block">Dikonfirmasi Oleh:</span>
                <span className="text-blue-400 text-lg font-bold">
                  {confirmationModal.shipmentInfo.confirmedBy}
                </span>
              </p>

              <p className="border-t border-slate-600 pt-3">
                <span className="text-slate-400 block">No Resi:</span>
                <span className="text-amber-400 text-lg font-bold">
                  {confirmationModal.shipmentInfo.noResi}
                </span>
              </p>
            </div>

            <Button
              onClick={() => setConfirmationModal(null)}
              className="mt-6 w-full bg-emerald-600 text-white"
            >
              Tutup
            </Button>
          </Card>
        </div>
      )}
    </div>
  )
}
