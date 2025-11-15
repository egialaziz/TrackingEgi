'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import type { Shipment } from '@/app/page'

interface ShipmentFormProps {
  onSubmit: (data: Omit<Shipment, 'id'>) => void
  initialData?: Shipment
}

export default function ShipmentForm({ onSubmit, initialData }: ShipmentFormProps) {
  const [formData, setFormData] = useState({
    description: '',
    qty: '',
    penerima: '',
    po: '',
    tglKirim: '',
    branch: '',
    status: 'pending' as const,
    confirmedBy: '',
    noResi: ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (initialData) {
      setFormData({
        description: initialData.description,
        qty: initialData.qty.toString(),
        penerima: initialData.penerima,
        po: initialData.po,
        tglKirim: initialData.tglKirim,
        branch: initialData.branch,
        status: initialData.status,
        confirmedBy: initialData.confirmedBy || '',
        noResi: initialData.noResi || ''
      })
    }
  }, [initialData])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.description.trim()) newErrors.description = 'Deskripsi diperlukan'
    if (!formData.qty || parseInt(formData.qty) <= 0) newErrors.qty = 'Qty harus lebih dari 0'
    if (!formData.penerima.trim()) newErrors.penerima = 'Penerima diperlukan'
    if (!formData.po.trim()) newErrors.po = 'PO diperlukan'
    if (!formData.tglKirim) newErrors.tglKirim = 'Tanggal Kirim diperlukan'
    if (!formData.branch.trim()) newErrors.branch = 'Branch diperlukan'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    onSubmit({
      description: formData.description,
      qty: parseInt(formData.qty),
      penerima: formData.penerima,
      po: formData.po,
      tglKirim: formData.tglKirim,
      branch: formData.branch,
      status: formData.status,
      confirmedBy: formData.confirmedBy || undefined,
      noResi: formData.noResi || undefined
    })

    setFormData({
      description: '',
      qty: '',
      penerima: '',
      po: '',
      tglKirim: '',
      branch: '',
      status: 'pending',
      confirmedBy: '',
      noResi: ''
    })
    setErrors({})
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Deskripsi
          </label>
          <input
            type="text"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Contoh: Produk A - Bahan Baku Berkualitas"
            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-orange-500 transition"
          />
          {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Qty
          </label>
          <input
            type="number"
            name="qty"
            value={formData.qty}
            onChange={handleChange}
            placeholder="Jumlah barang"
            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-orange-500 transition"
          />
          {errors.qty && <p className="text-red-500 text-xs mt-1">{errors.qty}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Penerima
          </label>
          <input
            type="text"
            name="penerima"
            value={formData.penerima}
            onChange={handleChange}
            placeholder="Nama penerima/perusahaan"
            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-orange-500 transition"
          />
          {errors.penerima && <p className="text-red-500 text-xs mt-1">{errors.penerima}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            PO
          </label>
          <input
            type="text"
            name="po"
            value={formData.po}
            onChange={handleChange}
            placeholder="Contoh: PO-2025-001"
            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-orange-500 transition"
          />
          {errors.po && <p className="text-red-500 text-xs mt-1">{errors.po}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Tanggal Kirim
          </label>
          <input
            type="date"
            name="tglKirim"
            value={formData.tglKirim}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-orange-500 transition"
          />
          {errors.tglKirim && <p className="text-red-500 text-xs mt-1">{errors.tglKirim}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Branch
          </label>
          <input
            type="text"
            name="branch"
            value={formData.branch}
            onChange={handleChange}
            placeholder="Contoh: Jakarta, Surabaya"
            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-orange-500 transition"
          />
          {errors.branch && <p className="text-red-500 text-xs mt-1">{errors.branch}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Nama Pihak yang Mengkonfirmasi (Opsional)
        </label>
        <input
          type="text"
          name="confirmedBy"
          value={formData.confirmedBy}
          onChange={handleChange}
          placeholder="Nama orang yang mengkonfirmasi pengiriman"
          className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-orange-500 transition"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          No Resi (Opsional)
        </label>
        <input
          type="text"
          name="noResi"
          value={formData.noResi}
          onChange={handleChange}
          placeholder="Nomor resi pengiriman"
          className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-orange-500 transition"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Status
        </label>
        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-orange-500 transition"
        >
          <option value="pending">Pending</option>
          <option value="confirmed">Dikonfirmasi</option>
          <option value="rejected">Ditolak</option>
        </select>
      </div>

      <div className="flex gap-3 pt-2">
        <Button
          type="submit"
          className="flex-1 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white"
        >
          {initialData ? 'Update Pengiriman' : 'Tambah Pengiriman'}
        </Button>
      </div>
    </form>
  )
}
