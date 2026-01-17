type Props = {
  text: string
  theme: string
  animation: string
}

export default function CaptionOverlay({ text, theme, animation }: Props) {
  const base = "text-3xl text-center mt-4"
  const themeClass =
    theme === "contrast"
      ? "font-extrabold text-yellow-400"
      : theme === "painting"
      ? "italic text-pink-300"
      : theme === "animated"
      ? "font-bold text-green-400"
      : "text-white"

  const animationClass =
    animation === "fade"
      ? "animate-fade"
      : animation === "pop"
      ? "animate-pulse"
      : animation === "slide"
      ? "animate-bounce"
      : ""

  return (
    <div className={`${base} ${themeClass} ${animationClass}`}>
      {text}
    </div>
  )
}
