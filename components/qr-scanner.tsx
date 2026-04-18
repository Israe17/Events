"use client"

import { useEffect, useRef, useState } from "react"
import { Camera, CheckCircle2, XCircle, Loader2, ScanLine, RefreshCw } from "lucide-react"

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
  const [scanCount, setScanCount] = useState(0)

  function startScanner() {
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
                body: JSON.stringify({ qr_token: result.data, event_id: eventId, scanned_by: userId }),
              })
              const data = await res.json()
              setResult(data)
              if (data.success) setScanCount((c) => c + 1)
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
      } catch {
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

  function stop() {
    setActive(false)
    setResult(null)
  }

  if (!active) {
    return (
      <div className="fade-in flex flex-col items-center gap-6 py-10">
        <div className="relative">
          <div className="pointer-events-none absolute -inset-6 rounded-[32px] bg-violet-600/20 blur-2xl animate-pulse" />
          <div className="relative flex h-28 w-28 items-center justify-center rounded-[28px] bg-gradient-to-br from-violet-500 via-violet-600 to-fuchsia-600 shadow-2xl shadow-violet-900/50">
            <ScanLine size={48} className="text-white" />
          </div>
        </div>

        <div className="text-center">
          <p className="text-lg font-bold text-neutral-50">Escáner de check-in</p>
          <p className="mt-1 text-sm text-neutral-500">
            Activa la cámara para escanear códigos QR
          </p>
        </div>

        <button
          onClick={startScanner}
          className="btn-brand flex items-center gap-2 rounded-2xl px-8 py-4 text-sm font-semibold text-white"
        >
          <Camera size={16} />
          Activar cámara
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Scan counter */}
      {scanCount > 0 && (
        <div className="flex items-center justify-center gap-2 rounded-full bg-green-600/15 border border-green-600/30 px-4 py-1.5 text-xs font-semibold text-green-300">
          <span className="h-1.5 w-1.5 rounded-full bg-green-400 pulse-live" />
          {scanCount} check-in{scanCount !== 1 ? "s" : ""} realizado{scanCount !== 1 ? "s" : ""}
        </div>
      )}

      {/* Camera viewfinder */}
      <div className="relative aspect-square overflow-hidden rounded-3xl border border-neutral-800 bg-black shadow-2xl">
        <video ref={videoRef} className="h-full w-full object-cover" />

        {/* Corner markers for visual flair */}
        <div className="pointer-events-none absolute inset-6">
          <CornerMarker position="top-left" />
          <CornerMarker position="top-right" />
          <CornerMarker position="bottom-left" />
          <CornerMarker position="bottom-right" />
        </div>

        {/* Scanning overlay */}
        {scanning && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-3">
              <Loader2 size={36} className="animate-spin text-violet-400" />
              <p className="text-sm font-medium text-neutral-300">Procesando...</p>
            </div>
          </div>
        )}

        {/* Result overlay */}
        {result && (
          <div
            className={`absolute inset-0 flex flex-col items-center justify-center gap-4 backdrop-blur-md scale-in ${
              result.success ? "bg-green-950/80" : "bg-red-950/80"
            }`}
          >
            {result.success ? (
              <div className="relative">
                <div className="absolute inset-0 animate-ping rounded-full bg-green-500/30" />
                <CheckCircle2 size={72} className="relative text-green-400" />
              </div>
            ) : (
              <XCircle size={72} className="text-red-400" />
            )}

            <div className="text-center px-6">
              <p className={`text-xl font-bold ${result.success ? "text-green-200" : "text-red-200"}`}>
                {result.message}
              </p>
              {result.success && result.remaining_entries !== undefined && (
                <p className="mt-1 text-sm text-neutral-400">
                  {result.remaining_entries} entrada{result.remaining_entries !== 1 ? "s" : ""} restante{result.remaining_entries !== 1 ? "s" : ""}
                </p>
              )}
            </div>

            <button
              onClick={reset}
              className="flex items-center gap-2 rounded-xl bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20 active:scale-95"
            >
              <RefreshCw size={14} />
              Escanear otro
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="rounded-2xl border border-red-800/40 bg-red-950/30 p-4 text-center text-sm text-red-300">
          {error}
        </div>
      )}

      <button
        onClick={stop}
        className="w-full rounded-xl border border-neutral-800 py-3 text-sm font-medium text-neutral-400 transition hover:bg-neutral-900/50 hover:text-neutral-200 active:scale-95"
      >
        Detener cámara
      </button>
    </div>
  )
}

function CornerMarker({
  position,
}: {
  position: "top-left" | "top-right" | "bottom-left" | "bottom-right"
}) {
  const pos = {
    "top-left":     "top-0 left-0 border-l-2 border-t-2 rounded-tl-xl",
    "top-right":    "top-0 right-0 border-r-2 border-t-2 rounded-tr-xl",
    "bottom-left":  "bottom-0 left-0 border-l-2 border-b-2 rounded-bl-xl",
    "bottom-right": "bottom-0 right-0 border-r-2 border-b-2 rounded-br-xl",
  }[position]

  return <div className={`absolute h-8 w-8 border-violet-400/80 ${pos}`} />
}
