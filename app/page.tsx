"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Plus, Download, Search, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import ShipmentForm from "@/components/shipment-form"
import ShipmentTable from "@/components/shipment-table"
import { supabase, type Shipment } from "@/lib/supabase"

export interface ShipmentData extends Omit<Shipment, "id" | "created_at" | "updated_at"> {}

export default function Page() {
  const [shipments, setShipments] = useState<Shipment[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingData, setEditingData] = useState<Shipment | null>(null)
  const [confirmationModal, setConfirmationModal] = useState<{ shipmentId: string; shipmentInfo: any } | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "confirmed" | "rejected">("all")

  useEffect(() => {
    fetchShipments()
  }, [])

  const fetchShipments = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase.from("tracking").select("*").order("created_at", { ascending: false })

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
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingId)

        if (error) throw error
        setEditingId(null)
        setEditingData(null)
      } else {
        const { error } = await supabase.from("tracking").insert([
          {
            ...data,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
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
    setEditingData(shipment)
    setEditingId(shipment.id)
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
      alert("Gagal menghapus data pengiriman")
    }
  }

  const handleConfirmShipment = async (shipmentId: string, confirmedBy: string, noResi: string, toUser: boolean) => {
    try {
      const updatedShipment = shipments.find((s) => s.id === shipmentId)
      if (updatedShipment) {
        const today = new Date().toISOString().split("T")[0]
        setConfirmationModal({
          shipmentId,
          shipmentInfo: {
            ...updatedShipment,
            confirmed_at: today,
            confirmed_by: confirmedBy,
            no_resi: toUser ? "Serah ke User" : noResi,
          },
        })
      }
      // TODO: Once columns are added to database, enable the database update:
      // const { error } = await supabase
      //   .from("tracking")
      //   .update({
      //     status: "confirmed",
      //     confirmed_at: today,
      //     confirmed_by: confirmedBy,
      //     no_resi: toUser ? "Serah ke User" : noResi,
      //     updated_at: new Date().toISOString(),
      //   })
      //   .eq("id", shipmentId)
      // if (error) throw error
      // await fetchShipments()
    } catch (error) {
      console.error("Error confirming shipment:", error)
      alert("Gagal mengkonfirmasi pengiriman")
    }
  }

  const handleRejectShipment = async (shipmentId: string) => {
    try {
      await fetchShipments()
    } catch (error) {
      console.error("Error rejecting shipment:", error)
      alert("Gagal menolak pengiriman")
    }
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingId(null)
    setEditingData(null)
  }

  const filteredShipments = shipments.filter((shipment) => {
    const matchesSearch =
      shipment.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shipment.penerima.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shipment.po.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shipment.branch.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesFilter = statusFilter === "all" || shipment.status === statusFilter

    return matchesSearch && matchesFilter
  })

  const stats = {
    total: shipments.length,
    pending: shipments.filter((s) => s.status === "pending").length,
    confirmed: shipments.filter((s) => s.status === "confirmed").length,
    rejected: shipments.filter((s) => s.status === "rejected").length,
    totalQty: shipments.reduce((sum, s) => sum + s.qty, 0),
    uniquePO: new Set(shipments.map((s) => s.po)).size,
    uniqueReceiver: new Set(shipments.map((s) => s.penerima)).size,
  }

  const downloadTemplate = async () => {
    try {
      const XLSX = await import("xlsx")
      const templateData = [
        {
          Deskripsi: "Contoh: Produk A - Bahan Baku",
          Qty: 100,
          Penerima: "PT. Maju Jaya",
          PO: "PO-2025-001",
          "Tanggal Kirim": "2025-01-15",
          Branch: "Jakarta",
        },
      ]

      const ws = XLSX.utils.json_to_sheet(templateData)
      ws["!cols"] = [{ wch: 30 }, { wch: 10 }, { wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 15 }]
      ws["!freeze"] = { xSplit: 0, ySplit: 1 }

      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, "Template")

      const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" })
      const data = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      })

      const link = document.createElement("a")
      link.href = URL.createObjectURL(data)
      link.download = `template-pengiriman-${new Date().getTime()}.xlsx`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(link.href)
    } catch (error) {
      console.error("Error downloading template:", error)
      alert("Gagal mendownload template")
    }
  }

  const downloadExcel = async () => {
    try {
      const XLSX = await import("xlsx")
      const exportData = filteredShipments.map((shipment) => ({
        Deskripsi: shipment.description,
        Qty: shipment.qty,
        Penerima: shipment.penerima,
        PO: shipment.po,
        "Tanggal Kirim": shipment.tglKirim,
        Branch: shipment.branch,
        Status:
          shipment.status === "confirmed" ? "Dikonfirmasi" : shipment.status === "rejected" ? "Ditolak" : "Pending",
        "Tgl Konfirmasi": shipment.confirmed_at || "-",
        "Konfirmasi Oleh": shipment.confirmed_by || "-",
        "No Resi": shipment.no_resi || "-",
      }))

      const ws = XLSX.utils.json_to_sheet(exportData)
      ws["!cols"] = [
        { wch: 30 },
        { wch: 10 },
        { wch: 20 },
        { wch: 15 },
        { wch: 15 },
        { wch: 15 },
        { wch: 12 },
        { wch: 15 },
        { wch: 20 },
        { wch: 20 },
      ]

      const headerStyle = {
        fill: { fgColor: { rgb: "FFFF7F00" } },
        font: { bold: true, color: { rgb: "FF000000" } },
      }

      for (let i = 0; i < 10; i++) {
        const cell = ws[XLSX.utils.encode_col(i) + "1"]
        if (cell) cell.s = headerStyle
      }

      ws["!freeze"] = { xSplit: 0, ySplit: 1 }

      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, "Pengiriman")

      const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" })
      const data = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      })

      const link = document.createElement("a")
      link.href = URL.createObjectURL(data)
      link.download = `data-pengiriman-${new Date().getTime()}.xlsx`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(link.href)
    } catch (error) {
      console.error("Error downloading Excel:", error)
      alert("Gagal mendownload file Excel")
    }
  }

  const handleImportExcel = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const XLSX = await import("xlsx")
      const reader = new FileReader()

      reader.onload = async (e) => {
        try {
          const data = e.target?.result
          const workbook = XLSX.read(data, { type: "binary" })
          const sheetName = workbook.SheetNames[0]
          const worksheet = workbook.Sheets[sheetName]
          const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[]

          const newShipments: ShipmentData[] = jsonData
            .filter((row) => row["Deskripsi"] && row["Qty"])
            .map((row) => ({
              deskripsi: row["Deskripsi"]?.toString() || "",
              qty: Number.parseInt(row["Qty"]) || 0,
              penerima: row["Penerima"]?.toString() || "",
              po: row["PO"]?.toString() || "",
              tanggal_kirim: row["Tanggal Kirim"]?.toString() || new Date().toISOString().split("T")[0],
              branch: row["Branch"]?.toString() || "",
              status: "pending" as const,
            }))

          if (newShipments.length > 0) {
            const { error } = await supabase.from("tracking").insert(
              newShipments.map((s) => ({
                ...s,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              })),
            )

            if (error) throw error
            await fetchShipments()
            alert(`Berhasil import ${newShipments.length} data pengiriman`)
          } else {
            alert("Tidak ada data valid untuk diimport")
          }
        } catch (error) {
          console.error("Error processing Excel:", error)
          alert("Gagal memproses file Excel")
        }
      }

      reader.readAsBinaryString(file)
    } catch (error) {
      console.error("Error importing Excel:", error)
      alert("Gagal mengimport file Excel")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Purchase Order Management</h1>
          <p className="text-slate-400">Kelola pengiriman dan konfirmasi pesanan dengan mudah</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-slate-800/40 border-slate-700 p-6">
            <p className="text-slate-400 text-sm mb-2">Total Pengiriman</p>
            <p className="text-3xl font-bold text-white">{stats.total}</p>
          </Card>
          <Card className="bg-slate-800/40 border-slate-700 p-6">
            <p className="text-slate-400 text-sm mb-2">Pending</p>
            <p className="text-3xl font-bold text-yellow-400">{stats.pending}</p>
          </Card>
          <Card className="bg-slate-800/40 border-slate-700 p-6">
            <p className="text-slate-400 text-sm mb-2">Dikonfirmasi</p>
            <p className="text-3xl font-bold text-emerald-400">{stats.confirmed}</p>
          </Card>
          <Card className="bg-slate-800/40 border-slate-700 p-6">
            <p className="text-slate-400 text-sm mb-2">Total Qty</p>
            <p className="text-3xl font-bold text-blue-400">{stats.totalQty}</p>
          </Card>
        </div>

        {showForm && (
          <Card className="bg-slate-800/40 border-slate-700 p-6 mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">
                {editingId ? "Edit Pengiriman" : "Tambah Pengiriman Baru"}
              </h2>
              <button onClick={handleCloseForm} className="text-slate-400 hover:text-white transition">
                ✕
              </button>
            </div>
            <ShipmentForm onSubmit={handleAddShipment} initialData={editingData || undefined} />
          </Card>
        )}

        <div className="mb-6 space-y-4">
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white gap-2"
            >
              <Plus size={20} />
              Tambah Pengiriman
            </Button>
            <Button
              onClick={downloadTemplate}
              variant="outline"
              className="text-slate-300 border-slate-600 hover:bg-slate-700 gap-2 bg-transparent"
            >
              <Download size={20} />
              Template
            </Button>
            <label className="cursor-pointer">
              <Button
                asChild
                variant="outline"
                className="text-slate-300 border-slate-600 hover:bg-slate-700 gap-2 bg-transparent"
              >
                <span>
                  <Upload size={20} />
                  Import Excel
                </span>
              </Button>
              <input type="file" accept=".xlsx,.xls" onChange={handleImportExcel} className="hidden" />
            </label>
            <Button
              onClick={downloadExcel}
              variant="outline"
              className="text-slate-300 border-slate-600 hover:bg-slate-700 gap-2 bg-transparent"
            >
              <Download size={20} />
              Export Excel
            </Button>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" size={18} />
              <input
                type="text"
                placeholder="Cari berdasarkan deskripsi, penerima, PO, atau branch..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-orange-500 transition"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {(["all", "pending", "confirmed", "rejected"] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    statusFilter === status
                      ? "bg-gradient-to-r from-orange-500 to-red-600 text-white"
                      : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                  }`}
                >
                  {status === "all"
                    ? "Semua"
                    : status === "pending"
                      ? "Pending"
                      : status === "confirmed"
                        ? "Dikonfirmasi"
                        : "Ditolak"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <Card className="bg-slate-800/40 border-slate-700 p-8 text-center">
            <p className="text-slate-300">Memuat data...</p>
          </Card>
        ) : (
          <Card className="bg-slate-800/40 border-slate-700 overflow-hidden">
            <ShipmentTable
              shipments={filteredShipments}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onConfirm={handleConfirmShipment}
              onReject={handleRejectShipment}
            />
          </Card>
        )}

        {confirmationModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="bg-slate-800 border-slate-700 max-w-md w-full">
              <div className="p-6">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-white mb-2">Pengiriman Dikonfirmasi</h2>
                  <p className="text-slate-400 text-sm mb-4">
                    Tanggal Konfirmasi:{" "}
                    <span className="font-semibold text-emerald-300">
                      {confirmationModal.shipmentInfo?.confirmed_at}
                    </span>
                  </p>
                  <p className="text-slate-400 text-sm mb-2">
                    Dikonfirmasi oleh:{" "}
                    <span className="font-semibold text-blue-300">{confirmationModal.shipmentInfo?.confirmed_by}</span>
                  </p>
                  <p className="text-slate-400 text-sm">
                    No Resi:{" "}
                    <span className="font-semibold text-amber-300">{confirmationModal.shipmentInfo?.no_resi}</span>
                  </p>
                </div>
                <button
                  onClick={() => setConfirmationModal(null)}
                  className="w-full px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white rounded-lg font-medium transition"
                >
                  Tutup
                </button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
