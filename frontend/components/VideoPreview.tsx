export default function VideoPreview({ url }: { url: string }) {
  if (!url) return null

  return (
    <div className="mt-6">
      <h2 className="text-xl mb-2">Output Video</h2>
      <video
        key={url}               // 🔥 force reload
        src={url}
        controls
        className="w-full rounded bg-black"
      />
    </div>
  )
}
