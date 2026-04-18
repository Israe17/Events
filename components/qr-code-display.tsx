import QRCode from "qrcode"

export async function QRCodeDisplay({ value, size = 280 }: { value: string; size?: number }) {
  const svg = await QRCode.toString(value, {
    type: "svg",
    width: size,
    margin: 2,
    color: { dark: "#ffffff", light: "#0a0a0a" },
    errorCorrectionLevel: "M",
  })

  return (
    <div
      className="rounded-3xl border border-neutral-800 bg-neutral-950 p-5 flex items-center justify-center shadow-2xl"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}
