"use client"

import { useEffect, useRef, useState } from "react"
import { Camera, CheckCircle2, XCircle, Loader2 } from "lucide-react"

type ScanResult = {
  success: boolean
  message: string
  used_entries?: number
  max_entries?: number
  remaining_entries?: number
}

export function QRScanner({ eventId, userId }: { eventId: string; userId: string }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const scannerRef = useRef<unknown>(null)
  const [active, setActive] = useState(false)
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState<ScanResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function startScanner() {
    setError(null)
    setResult(null)
    setActive(true)
  }

  useEffect(() => {
    if (!active || !videoRef.current) return

    let stopped = false
    let QrScanner: any

    async function init() {
      try {
        const mod = await import("qr-scanner")
        QrScanner = mod.default

        scannerRef.current = new QrScanner(
          videoRef.current!,
          async (result: { data: string }) => {
            if (scanning || stopped) return
            setScanning(true)

            try {
              const res = await fetch(`/api/checkin`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  qr_token: result.data,
                  event_id: eventId,
                  scanned_by: userId,
                }),
              })
              const data = await res.json()
              setResult(data)
            } catch {
              setResult({ success: false, message: "Error de red" })
            } finally {
              setScanning(false)
            }
          },
          {
            preferredCamera: "environment",
            highlightScanRegion: true,
            highlightCodeOutline: true,
          }
        )
        if (!stopped) await (scannerRef.current as any).start()
      } catch (e: any) {
        setError("No se pudo acceder a la cámara")
        setActive(false)
      }
    }

    init()

    return () => {
      stopped = true
      if (scannerRef.current) (scannerRef.current as any).destroy()
    }
  }, [active, eventId, userId, scanning])

  function reset() {
    setResult(null)
    setScanning(false)
  }

  if (!active) {
    return (
      <div className="flex flex-col items-center gap-6 py-10">
        <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-violet-600/20">
          <Camera size={40} className="text-violet-400" />
        </div>
        <div className="text-center">
          <p className="font-semibold text-neutral-200">Escáner de check-in</p>
          <p className="mt-1 text-sm text-neutral-500">Activa la cámara para escanear códigos QR</p>
        </div>
        <button
          onClick={startScanner}
          className="rounded-2xl bg-violet-600 px-8 py-4 font-semibold text-white transition hover:bg-violet-500 active:scale-95"
        >
          Activar cámara
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Camera viewfinder */}
      <div className="relative overflow-hidden rounded-2xl bg-black aspect-square">
        <video ref={videoRef} className="h-full w-full object-cover" />
        {scanning && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <Loader2 size={32} className="animate-spin text-violet-400" />
          </div>
        )}
      </div>

      {/* Result overlay */}
      {result && (
        <div
          className={`rounded-2xl border p-5 text-center ${
            result.success
              ? "border-green-700 bg-green-900/20"
              : "border-red-700 bg-red-900/20"
          }`}
        >
          {result.success ? (
            <CheckCircle2 size={32} className="mx-auto mb-2 text-green-400" />
          ) : (
            <XCircle size={32} className="mx-auto mb-2 text-red-400" />
          )}
          <p className={`font-semibold ${result.success ? "text-green-300" : "text-red-300"}`}>
            {result.message}
          </p>
          {result.success && result.remaining_entries !== undefined && (
            <p className="mt-1 text-sm text-neutral-400">
              Entradas restantes: {result.remaining_entries}
            </p>
          )}
          <button
            onClick={reset}
            className="mt-4 rounded-xl bg-neutral-800 px-6 py-2.5 text-sm font-semibold text-neutral-200 transition hover:bg-neutral-700"
          >
            Escanear otro
          </button>
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-red-700 bg-red-900/20 p-4 text-center">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      <button
        onClick={() => {
          setActive(false)
          setResult(null)
        }}
        className="w-full rounded-xl border border-neutral-700 py-3 text-sm text-neutral-400 transition hover:text-neutral-200"
      >
        Detener cámara
      </button>
    </div>
  )
}
