import { THEMES, ANIMATIONS, VIDEO_MODES } from "../themes"

type Options = {
  theme: string
  animation: string
  mode: string
}

type Props = {
  options: Options
  setOptions: (o: Options) => void
}

export default function OptionsPanel({ options, setOptions }: Props) {
  return (
    <div className="space-y-4">
      <div>
        <label>Theme</label>
        <select
          className="block w-full text-black"
          value={options.theme}
          onChange={e => setOptions({ ...options, theme: e.target.value })}
        >
          {THEMES.map(t => (
            <option key={t.id} value={t.id}>{t.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label>Caption Animation</label>
        <select
          className="block w-full text-black"
          value={options.animation}
          onChange={e => setOptions({ ...options, animation: e.target.value })}
        >
          {ANIMATIONS.map(a => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
      </div>

      <div>
        <label>Video Mode</label>
        <select
          className="block w-full text-black"
          value={options.mode}
          onChange={e => setOptions({ ...options, mode: e.target.value })}
        >
          {VIDEO_MODES.map(v => (
            <option key={v} value={v}>{v}</option>
          ))}
        </select>
      </div>
    </div>
  )
}
