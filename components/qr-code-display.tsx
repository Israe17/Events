import QRCode from "qrcode"

export async function QRCodeDisplay({ value, size = 280 }: { value: string; size?: number }) {
  const svg = await QRCode.toString(value, {
    type: "svg",
    width: size,
    margin: 2,
    color: { dark: "#ffffff", light: "#171717" },
  })

  return (
    <div
      className="rounded-2xl bg-neutral-900 p-4 flex items-center justify-center"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}
