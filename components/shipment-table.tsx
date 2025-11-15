'use client'

import { useState } from 'react'
import { Edit2, Trash2, CheckCircle2, Circle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Shipment } from '@/app/page'

interface ShipmentTableProps {
  shipments: Shipment[]
  onEdit: (shipment: Shipment) => void
  onDelete: (id: string) => void
  onConfirm: (id: string, confirmedBy: string, noResi: string, isToUser: boolean) => void
  onReject: (id: string) => void
}

export default function ShipmentTable({
  shipments,
  onEdit,
  onDelete,
  onConfirm,
  onReject
}: ShipmentTableProps) {
  const [confirmModal, setConfirmModal] = useState<{ shipmentId: string } | null>(null)
  const [confirmedByName, setConfirmedByName] = useState('')
  const [noResi, setNoResi] = useState('')
  const [isToUser, setIsToUser] = useState(false) // added state to track "to user" option

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const handleConfirmClick = (shipmentId: string) => {
    setConfirmModal({ shipmentId })
    setConfirmedByName('')
    setNoResi('')
    setIsToUser(false)
  }

  const handleConfirmSubmit = () => {
    if (!confirmedByName.trim()) {
      alert('Nama pihak yang mengkonfirmasi harus diisi')
      return
    }
    if (!isToUser && !noResi.trim()) {
      alert('No Resi harus diisi atau pilih "Serah ke User"')
      return
    }
    if (confirmModal) {
      onConfirm(confirmModal.shipmentId, confirmedByName, noResi, isToUser)
      setConfirmModal(null)
      setConfirmedByName('')
      setNoResi('')
      setIsToUser(false)
    }
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700 bg-slate-700/50">
              <th className="px-4 py-3 text-left font-semibold text-slate-200">Deskripsi</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-200">Qty</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-200">Penerima</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-200">PO</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-200">Branch</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-200">Tgl Kirim</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-200">Status</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-200">Tgl Konfirmasi</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-200">Konfirmasi Oleh</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-200">No Resi</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-200">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {shipments.map((shipment, index) => (
              <tr
                key={shipment.id}
                className={`border-b border-slate-700 hover:bg-slate-700/30 transition ${
                  index % 2 === 0 ? 'bg-slate-800/30' : 'bg-slate-800/10'
                } ${shipment.status === 'confirmed' ? 'opacity-75' : ''}`}
              >
                <td className="px-4 py-3 text-slate-100 font-medium">{shipment.description}</td>
                <td className="px-4 py-3 text-slate-100">
                  <span className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded text-xs font-medium">
                    {shipment.qty}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-100">{shipment.penerima}</td>
                <td className="px-4 py-3 text-slate-100">
                  <span className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded text-xs font-medium">
                    {shipment.po}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-100">
                  <span className="bg-green-500/20 text-green-300 px-2 py-1 rounded text-xs font-medium">
                    {shipment.branch}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-100">{formatDate(shipment.tglKirim)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2 text-xs font-medium">
                    {shipment.status === 'confirmed' ? (
                      <>
                        <CheckCircle2 size={16} className="text-emerald-400" />
                        <span className="text-emerald-300 bg-emerald-500/20 px-2 py-1 rounded">
                          Dikonfirmasi
                        </span>
                      </>
                    ) : shipment.status === 'rejected' ? (
                      <>
                        <XCircle size={16} className="text-red-400" />
                        <span className="text-red-300 bg-red-500/20 px-2 py-1 rounded">
                          Ditolak
                        </span>
                      </>
                    ) : (
                      <>
                        <Circle size={16} className="text-slate-500" />
                        <span className="text-slate-300 bg-slate-600/20 px-2 py-1 rounded">
                          Pending
                        </span>
                      </>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-100">
                  {shipment.confirmedDate ? (
                    <span className="text-emerald-300 font-medium">
                      {formatDate(shipment.confirmedDate)}
                    </span>
                  ) : (
                    <span className="text-slate-500">-</span>
                  )}
                </td>
                <td className="px-4 py-3 text-slate-100">
                  {shipment.confirmedBy ? (
                    <span className="text-blue-300 font-medium">{shipment.confirmedBy}</span>
                  ) : (
                    <span className="text-slate-500">-</span>
                  )}
                </td>
                <td className="px-4 py-3 text-slate-100">
                  {shipment.noResi ? (
                    <span className="text-amber-300 font-medium bg-amber-500/20 px-2 py-1 rounded text-xs">
                      {shipment.noResi}
                    </span>
                  ) : (
                    <span className="text-slate-500">-</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    {shipment.status === 'pending' ? (
                      <>
                        <button
                          onClick={() => handleConfirmClick(shipment.id)}
                          className="p-2 text-emerald-400 hover:bg-emerald-500/20 rounded transition"
                          title="Konfirmasi"
                        >
                          <CheckCircle2 size={16} />
                        </button>
                        <button
                          onClick={() => onReject(shipment.id)}
                          className="p-2 text-red-400 hover:bg-red-500/20 rounded transition"
                          title="Tolak"
                        >
                          <XCircle size={16} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => onReject(shipment.id)}
                          className="p-2 text-orange-400 hover:bg-orange-500/20 rounded transition"
                          title="Kembalikan ke Pending"
                        >
                          <XCircle size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {confirmModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-white mb-4">Masukkan Data Konfirmasi</h3>
            <input
              type="text"
              value={confirmedByName}
              onChange={(e) => setConfirmedByName(e.target.value)}
              placeholder="Nama lengkap yang mengkonfirmasi..."
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-orange-500 transition mb-3"
              autoFocus
            />
            
            <div className="mb-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isToUser}
                  onChange={(e) => setIsToUser(e.target.checked)}
                  className="w-4 h-4 cursor-pointer"
                />
                <span className="text-white font-medium">Serah ke User (tanpa No Resi)</span>
              </label>
            </div>

            {!isToUser && (
              <input
                type="text"
                value={noResi}
                onChange={(e) => setNoResi(e.target.value)}
                placeholder="No Resi pengiriman..."
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-orange-500 transition mb-4"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleConfirmSubmit()
                  }
                }}
              />
            )}
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setConfirmModal(null)
                  setConfirmedByName('')
                  setNoResi('')
                  setIsToUser(false)
                }}
                className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmSubmit}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-lg font-medium transition"
              >
                Konfirmasi
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
