// QR via free API — no package needed
export default function QRCode({ url, size = 200 }) {
  const src = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(url)}&bgcolor=F7F3EA&color=1C1814&margin=10`
  return (
    <img
      src={src}
      alt="QR code"
      width={size}
      height={size}
      style={{ borderRadius: 12, display: 'block', margin: '0 auto' }}
    />
  )
}
