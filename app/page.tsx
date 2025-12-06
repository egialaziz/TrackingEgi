Skip to content
Egi's projects
Egi's projects

Hobby

tracking-egi

ELykeBPEh


Find…
F

Source
Output
app/page.tsx

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
tracking-egi – Deployment Source – Vercel
17:32:10
