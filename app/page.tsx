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
    } catch (error) {
      console.error("Error confirming shipment:", error)
      alert("Gagal mengkonfirmasi pengiriman")
    }
  }

  const handleRejectShipment = async () => {
    await fetchShipments()
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingId(null)
    setEditingData(null)
  }

  /** -------------------------------
   *  FIX FILTER BIKIN ERROR!
   --------------------------------*/
  const safe = (v: any) => (v ? v.toString().toLowerCase() : "")

  const filteredShipments = shipments.filter((shipment) => {
    const matchesSearch =
      safe(shipment.deskripsi).includes(searchQuery.toLowerCase()) ||
      safe(shipment.penerima).includes(searchQuery.toLowerCase()) ||
      safe(shipment.po).includes(searchQuery.toLowerCase()) ||
      safe(shipment.branch).includes(searchQuery.toLowerCase())

    const matchesFilter = statusFilter === "all" || shipment.status === statusFilter
    return matchesSearch && matchesFilter
  })

  const stats = {
    total: shipments.length,
    pending: shipments.filter((s) => s.status === "pending").length,
    confirmed: shipments.filter((s) => s.status === "confirmed").length,
    rejected: shipments.filter((s) => s.status === "rejected").length,
    totalQty: shipments.reduce((sum, s) => sum + s.qty, 0),
  }

  /** -------------------------------
   *  TEMPLATE EXCEL
   --------------------------------*/
  const downloadTemplate = async () => {
    try {
      const XLSX = await import("xlsx")
      const templateData = [
        {
          Deskripsi: "Contoh: Produk A",
          Qty: 100,
          Penerima: "PT. Maju Jaya",
          PO: "PO-2025-001",
          "Tanggal Kirim": "2025-01-15",
          Branch: "Jakarta",
        },
      ]

      const ws = XLSX.utils.json_to_sheet(templateData)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, "Template")

      const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" })
      const blob = new Blob([buf], { type: "application/octet-stream" })

      const link = document.createElement("a")
      link.href = URL.createObjectURL(blob)
      link.download = "template-tracking.xlsx"
      link.click()
    } catch (e) {
      console.error(e)
      alert("Gagal download template")
    }
  }

  /** -------------------------------
   *  EXPORT EXCEL
   --------------------------------*/
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
        Status: s.status || "-",
        "Tgl Konfirmasi": s.confirmed_at || "-",
        "Konfirmasi Oleh": s.confirmed_by || "-",
        "No Resi": s.no_resi || "-",
      }))

      const ws = XLSX.utils.json_to_sheet(exportData)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, "Tracking")

      const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" })
      const blob = new Blob([buf], { type: "application/octet-stream" })

      const link = document.createElement("a")
      link.href = URL.createObjectURL(blob)
      link.download = "data-tracking.xlsx"
      link.click()
    } catch (e) {
      console.error(e)
      alert("Gagal export data")
    }
  }

  /** -------------------------------
   *  IMPORT EXCEL
   --------------------------------*/
  const handleImportExcel = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const XLSX = await import("xlsx")
      const reader = new FileReader()

      reader.onload = async (e) => {
        const workbook = XLSX.read(e.target?.result, { type: "binary" })
        const sheetName = workbook.SheetNames[0]
        const sheet = workbook.Sheets[sheetName]
        const rows = XLSX.utils.sheet_to_json(sheet)

        const parsed: ShipmentData[] = rows.map((row: any) => ({
          deskripsi: row["Deskripsi"] || "",
          qty: Number(row["Qty"]) || 0,
          penerima: row["Penerima"] || "",
          po: row["PO"] || "",
          tanggal_kirim: row["Tanggal Kirim"] || "",
          branch: row["Branch"] || "",
          status: "pending",
        }))

        const { error } = await supabase.from("tracking").insert(
          parsed.map((p) => ({
            ...p,
            created_at: new Date().toISOString(),
          })),
        )

        if (error) throw error
        fetchShipments()
        alert("Import berhasil!")
      }

      reader.readAsBinaryString(file)
    } catch (e) {
      console.error(e)
      alert("Gagal import file")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">

        {/* THE REST OF YOUR UI IS THE SAME */}

        <ShipmentTable
          shipments={filteredShipments}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onConfirm={handleConfirmShipment}
          onReject={handleRejectShipment}
        />

      </div>
    </div>
  )
}
