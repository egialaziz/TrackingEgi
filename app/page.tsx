'use client'

import { useState } from 'react'
import ShipmentTableSupabase from '@/components/shipment-table-supabase'

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Shipment Tracking</h1>

      <div className="flex gap-3 mb-6">
        <input
          className="border px-3 py-2 rounded w-full"
          placeholder="Search tracking number / destination..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <select
          className="border px-3 py-2 rounded"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="on_delivery">On Delivery</option>
          <option value="delivered">Delivered</option>
        </select>
      </div>

      <ShipmentTableSupabase
        searchQuery={searchQuery}
        statusFilter={statusFilter}
        onEdit={() => {}}
        openConfirmModal={() => {}}
      />
    </div>
  )
}
