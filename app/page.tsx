"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

interface ShipmentRow {
  id: number;
  awb: string;
  customer: string;
  destination: string;
  status: string;
  created_at: string;
}

export default function HomePage() {
  const [data, setData] = useState<ShipmentRow[]>([]);
  const [filtered, setFiltered] = useState<ShipmentRow[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Pagination
  const rowsPerPage = 10;
  const [page, setPage] = useState(1);
  const maxPage = Math.ceil(filtered.length / rowsPerPage);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    handleFilter();
  }, [search, data]);

  async function fetchData() {
    setLoading(true);
    const { data: rows, error } = await supabase
      .from("tracking")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      console.error(error);
      return;
    }

    setData(rows || []);
    setFiltered(rows || []);
    setLoading(false);
  }

  function handleFilter() {
    const s = search.toLowerCase();
    const result = data.filter(
      (row) =>
        row.awb.toLowerCase().includes(s) ||
        row.customer.toLowerCase().includes(s) ||
        row.destination.toLowerCase().includes(s) ||
        row.status.toLowerCase().includes(s)
    );
    setFiltered(result);
    setPage(1); // reset page
  }

  const paginated = filtered.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Shipment Tracking</h1>

      {/* Search */}
      <input
        className="border px-3 py-2 rounded w-full mb-4"
        placeholder="Search AWB, Customer, Destination..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Table */}
      <div className="border rounded overflow-hidden">
        <table className="w-full border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2">ID</th>
              <th className="border p-2">AWB</th>
              <th className="border p-2">Customer</th>
              <th className="border p-2">Destination</th>
              <th className="border p-2">Status</th>
              <th className="border p-2">Created</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center p-4">
                  Loading...
                </td>
              </tr>
            ) : paginated.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center p-4">
                  No data found
                </td>
              </tr>
            ) : (
              paginated.map((row) => (
                <tr key={row.id}>
                  <td className="border p-2">{row.id}</td>
                  <td className="border p-2">{row.awb}</td>
                  <td className="border p-2">{row.customer}</td>
                  <td className="border p-2">{row.destination}</td>
                  <td className="border p-2">{row.status}</td>
                  <td className="border p-2">
                    {new Date(row.created_at).toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!loading && filtered.length > 0 && (
        <div className="flex items-center justify-between mt-4">
          <button
            className="px-3 py-1 border rounded disabled:opacity-50"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            Prev
          </button>

          <span>
            Page {page} / {maxPage}
          </span>

          <button
            className="px-3 py-1 border rounded disabled:opacity-50"
            disabled={page === maxPage}
            onClick={() => setPage(page + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
