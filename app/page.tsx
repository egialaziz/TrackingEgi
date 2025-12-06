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
