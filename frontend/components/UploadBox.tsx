type Props = {
  onUpload: (file: File) => void
}

export default function UploadBox({ onUpload }: Props) {
  return (
    <div className="border border-dashed p-6 rounded text-center">
      <input
        type="file"
        accept="video/*"
        onChange={(e) => {
          if (e.target.files) onUpload(e.target.files[0])
        }}
      />
    </div>
  )
}
