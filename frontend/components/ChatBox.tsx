type Props = {
  onSend: (text: string) => void
}

export default function ChatBox({ onSend }: Props) {
  return (
    <div className="mt-6 space-y-2">
      <input
        type="text"
        placeholder="Try: make captions bold and yellow"
        className="w-full p-2 text-black"
        onKeyDown={e => {
          if (e.key === "Enter") onSend(e.currentTarget.value)
        }}
      />
    </div>
  )
}
