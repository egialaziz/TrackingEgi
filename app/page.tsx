"use client";

import { useState } from "react";
import { Plus, X, Download, Search, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import ShipmentTableSupabase from "@/components/shipment-table-supabase";

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">Shipment Tracking</h1>
        <Button className="flex items-center gap-2">
          <Plus size={18} />
          Tambah Shipment
        </Button>
      </div>

      {/* Search + Filter */}
      <div className="flex gap-3">
        <div className="flex items-center border rounded-lg px-3">
          <Search size={16} className="mr-2 opacity-60" />
          <input
            placeholder="Cari shipment..."
            className="outline-none py-2 bg-transparent"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <select
          className="border rounded-lg px-3 bg-transparent"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">Semua Status</option>
          <option value="pending">Pending</option>
          <option value="on-delivery">On Delivery</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {/* Tabel */}
      <ShipmentTableSupabase
        searchQuery={searchQuery}
        statusFilter={statusFilter}
        onEdit={() => {}}
        openConfirmModal={() => {}}
      />
    </div>
  );
}
