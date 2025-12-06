"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

interface Shipment {
  id: number;
  name: string;
  origin: string;
  destination: string;
  status: string;
  created_at: string;
}

interface Props {
  searchQuery: string;
  statusFilter: string;
}

export default function ShipmentTableSupabase({
  searchQuery,
  statusFilter,
}: Props) {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    setLoading(true);

    let query = supabase.from("shipments").select("*").order("id", {
      ascending: false,
    });

    // Search filter
    if (searchQuery) {
      query = query.ilike("name", `%${searchQuery}%`);
    }

    // Status filter
    if (statusFilter) {
      query = query.eq("status", statusFilter);
    }

    const { data, error } = await query;

    if (!error && data) {
      setShipments(data);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, [searchQuery, statusFilter]);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="overflow-x-auto border rounded-md">
      <table className="w-full text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2">ID</th>
            <th className="p-2">Name</th>
            <th className="p-2">Origin</th>
            <th className="p-2">Destination</th>
            <th className="p-2">Status</th>
            <th className="p-2">Created</th>
          </tr>
        </thead>
        <tbody>
          {shipments.map((s) => (
            <tr key={s.id} className="border-t">
              <td className="p-2">{s.id}</td>
              <td className="p-2">{s.name}</td>
              <td className="p-2">{s.origin}</td>
              <td className="p-2">{s.destination}</td>
              <td className="p-2">{s.status}</td>
              <td className="p-2">{new Date(s.created_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
