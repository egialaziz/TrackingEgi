"use client"

import { useState, useEffect } from "react"
import { Plus, Download, Search, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"

export interface Shipment {
  id: string
  deskripsi: string
  qty: number
  penerima: string
  po: string
  tanggal_kirim: string
  branch: string
  created_at: string
}

export interface ShipmentData
  extends Omit<Shipment, "id" | "created_at"> {}

export default function Page() {
  const [shipments, setShipments] = useState<Shipment[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingData, setEditingData] = useState<Shipment | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    fetchShipments()
  }, [])

  const fetchShipments = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("tracking")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) throw error
      setShipments(data || [])
    } catch (error) {
      console.error("Error fetching shipments:", error)
      alert("Gagal mengambil data pengiriman")
    } finally {
      setLoading(false)
    }
  }

  const handleAddShipment = async (data: ShipmentData) => {
    try {
      if (editingId) {
        const { error } = await supabase
          .from("tracking")
          .update({
            ...data,
          })
          .eq("id", editingId)

        if (error) throw error

        setEditingId(null)
        setEditingData(null)
      } else {
        const { error } = await supabase
          .from("tracking")
          .insert([
            { ...data, created_at: new Date().toISOString() }
          ])

        if (error) throw error
      }

      setShowForm(false)
      await fetchShipments()
    } catch (error) {
      console.error("Error saving shipment:", error)
      alert("Gagal menyimpan data pengiriman")
    }
  }

  const handleEdit = (shipment: Shipment) => {
    setEditingId(shipment.id)
    setEditingData(shipment)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus data ini?")) return
    try {
      const { error } = await supabase.from("tracking").delete().eq("id", id)
      if (error) throw error
      await fetchShipments()
    } catch (error) {
      console.error("Error deleting shipment:", error)
      alert("Gagal menghapus data")
    }
  }

  const filteredShipments = shipments.filter((s) => {
    const q = searchQuery.toLowerCase()
    return (
      s.deskripsi.toLowerCase().includes(q) ||
      s.penerima.toLowerCase().includes(q) ||
      s.po.toLowerCase().includes(q) ||
      s.branch.toLowerCase().includes(q)
    )
  })

  const downloadTemplate = async () => {
    try {
      const XLSX = await import("xlsx")
      const templateData = [
        {
          Deskripsi: "Contoh Barang",
          Qty: 10,
          Penerima: "PT Contoh",
          PO: "PO-2025-001",
          "Tanggal Kirim": "2025-01-10",
          Branch: "Jakarta",
        }
      ]

      const ws = XLSX.utils.json_to_sheet(templateData)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, "Template")

      const excelBuffer = XLSX.write(wb, { type: "array", bookType: "xlsx" })
      const blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      })

      const a = document.createElement("a")
      a.href = URL.createObjectURL(blob)
      a.download = "template-tracking.xlsx"
      a.click()
    } catch (error) {
      console.error(error)
      alert("Gagal download template")
    }
  }

  const handleImportExcel = async (event: any) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const XLSX = await import("xlsx")
      const reader = new FileReader()

      reader.onload = async (e) => {
        const data = e.target?.result
        const workbook = XLSX.read(data, { type: "binary" })
        const sheet = workbook.SheetNames[0]
        const content = XLSX.utils.sheet_to_json(workbook.Sheets[sheet]) as any[]

        const items = content.map((row) => ({
          deskripsi: row["Deskripsi"],
          qty: row["Qty"],
          penerima: row["Penerima"],
          po: row["PO"],
          tanggal_kirim: row["Tanggal Kirim"],
          branch: row["Branch"],
          created_at: new Date().toISOString(),
        }))

        const { error } = await supabase.from("tracking").insert(items)
        if (error) throw error

        await fetchShipments()
        alert("Import berhasil")
      }

      reader.readAsBinaryString(file)
    } catch (error) {
      console.error(error)
      alert("Gagal import Excel")
    }
  }

  const downloadExcel = async () => {
    try {
      const XLSX = await import("xlsx")

      const exportData = filteredShipments.map((s) => ({
        Deskripsi: s.deskripsi,
        Qty: s.qty,
        Penerima: s.penerima,
        PO: s.po,
        "Tanggal Kirim": s.tanggal_kirim,
        Branch: s.branch,
        "Created At": s.created_at,
      }))

      const ws = XLSX.utils.json_to_sheet(exportData)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, "Tracking")

      const excelBuffer = XLSX.write(wb, { type: "array", bookType: "xlsx" })
      const blob = new Blob([excelBuffer])

      const a = document.createElement("a")
      a.href = URL.createObjectURL(blob)
      a.download = "tracking.xlsx"
      a.click()
    } catch (error) {
      console.error(error)
      alert("Gagal export Excel")
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-6xl mx-auto">

        <h1 className="text-3xl font-bold text-white mb-6">
          Tracking Pengiriman
        </h1>

        {/* BUTTON PANEL */}
        <div className="flex flex-wrap gap-3 mb-6">
          <Button onClick={() => setShowForm(true)}>
            <Plus /> Tambah
          </Button>

          <Button variant="outline" onClick={downloadTemplate}>
            <Download /> Template
          </Button>

          <label>
            <Button variant="outline">
              <Upload /> Import
            </Button>
            <input
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={handleImportExcel}
            />
          </label>

          <Button variant="outline" onClick={downloadExcel}>
            <Download /> Export
          </Button>
        </div>

        {/* SEARCH BAR */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Cari berdasarkan deskripsi, penerima, PO, branch..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-800 text-white rounded-lg border border-slate-700"
          />
        </div>

        {/* TABLE */}
        <Card className="bg-slate-800 p-4 border-slate-700">
          {loading ? (
            <p className="text-slate-300 text-center">Loading...</p>
          ) : (
            <table className="w-full text-white">
              <thead className="text-slate-300">
                <tr>
                  <th>Deskripsi</th>
                  <th>Qty</th>
                  <th>Penerima</th>
                  <th>PO</th>
                  <th>Tanggal Kirim</th>
                  <th>Branch</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredShipments.map((s) => (
                  <tr key={s.id} className="border-t border-slate-700">
                    <td>{s.deskripsi}</td>
                    <td>{s.qty}</td>
                    <td>{s.penerima}</td>
                    <td>{s.po}</td>
                    <td>{s.tanggal_kirim}</td>
                    <td>{s.branch}</td>
                    <td className="space-x-2">
                      <Button
                        size="sm"
                        onClick={() => handleEdit(s)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(s.id)}
                      >
                        Hapus
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>

        {/* FORM */}
        {showForm && (
          <Card className="bg-slate-800 p-6 border-slate-700 mt-6">
            <h2 className="text-xl text-white font-bold mb-4">
              {editingId ? "Edit Pengiriman" : "Tambah Pengiriman"}
            </h2>

            <ShipmentForm
              onSubmit={handleAddShipment}
              initialData={editingData || undefined}
            />

            <div className="mt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowForm(false)
                  setEditingId(null)
                  setEditingData(null)
                }}
              >
                Tutup
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
