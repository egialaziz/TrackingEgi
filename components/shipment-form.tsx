"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import type { Shipment } from "@/lib/supabase"

interface ShipmentFormProps {
  onSubmit: (data: Omit<Shipment, "id" | "created_at" | "updated_at">) => void
  initialData?: Shipment
}

export default function ShipmentForm({ onSubmit, initialData }: ShipmentFormProps) {
  const [formData, setFormData] = useState({
    deskripsi: "",
    qty: "",
    penerima: "",
    po: "",
    tanggal_kirim: "",
    branch: "",
    status: "pending" as const,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (initialData) {
      setFormData({
        deskripsi: initialData.deskripsi,
        qty: initialData.qty.toString(),
        penerima: initialData.penerima,
        po: initialData.po,
        tanggal_kirim: initialData.tanggal_kirim,
        branch: initialData.branch,
        status: initialData.status,
      })
    }
  }, [initialData])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.deskripsi.trim()) newErrors.deskripsi = "Deskripsi diperlukan"
    if (!formData.qty || Number.parseInt(formData.qty) <= 0) newErrors.qty = "Qty harus lebih dari 0"
    if (!formData.penerima.trim()) newErrors.penerima = "Penerima diperlukan"
    if (!formData.po.trim()) newErrors.po = "PO diperlukan"
    if (!formData.tanggal_kirim) newErrors.tanggal_kirim = "Tanggal Kirim diperlukan"
    if (!formData.branch.trim()) newErrors.branch = "Branch diperlukan"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    onSubmit({
      deskripsi: formData.deskripsi,
      qty: Number.parseInt(formData.qty),
      penerima: formData.penerima,
      po: formData.po,
      tanggal_kirim: formData.tanggal_kirim,
      branch: formData.branch,
      status: formData.status,
    })

    setFormData({
      deskripsi: "",
      qty: "",
      penerima: "",
      po: "",
      tanggal_kirim: "",
      branch: "",
      status: "pending",
    })
    setErrors({})
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-300 mb-2">Deskripsi</label>
          <input
            type="text"
            name="deskripsi"
            value={formData.deskripsi}
            onChange={handleChange}
            placeholder="Contoh: Produk A - Bahan Baku Berkualitas"
            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-orange-500 transition"
          />
          {errors.deskripsi && <p className="text-red-500 text-xs mt-1">{errors.deskripsi}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Qty</label>
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
          <label className="block text-sm font-medium text-slate-300 mb-2">Penerima</label>
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
          <label className="block text-sm font-medium text-slate-300 mb-2">PO</label>
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
          <label className="block text-sm font-medium text-slate-300 mb-2">Tanggal Kirim</label>
          <input
            type="date"
            name="tanggal_kirim"
            value={formData.tanggal_kirim}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-orange-500 transition"
          />
          {errors.tanggal_kirim && <p className="text-red-500 text-xs mt-1">{errors.tanggal_kirim}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Branch</label>
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

      <div className="flex gap-3 pt-2">
        <Button
          type="submit"
          className="flex-1 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white"
        >
          {initialData ? "Update Pengiriman" : "Tambah Pengiriman"}
        </Button>
      </div>
    </form>
  )
}
