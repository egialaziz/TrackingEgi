"use client";

import { useState } from "react";
import ShipmentTableSupabase from "@/components/shipment-table-supabase";

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Shipment List</h1>

      {/* Search */}
      <input
        type="text"
        placeholder="Search..."
        className="border p-2 w-full rounded"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      {/* Status Filter */}
      <select
        className="border p-2 rounded"
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
      >
        <option value="">All Status</option>
        <option value="Pending">Pending</option>
        <option value="On Process">On Process</option>
        <option value="Completed">Completed</option>
      </select>

      <ShipmentTableSupabase
        searchQuery={searchQuery}
        statusFilter={statusFilter}
      />
    </div>
  );
}
