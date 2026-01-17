type Props = {
  url: string
}

export default function VideoPreview({ url }: Props) {
  return (
    <div className="mt-6">
      <h2 className="text-xl mb-2">Output Video</h2>
      <video src={url} controls className="w-full rounded-lg" />
    </div>
  )
}
