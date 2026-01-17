import { THEMES, ANIMATIONS, VIDEO_MODES } from "../themes"

type Props = {
  options: {
    theme: string
    animation: string
    mode: string
  }
  setOptions: (o: any) => void
}

export default function OptionsPanel({ options, setOptions }: Props) {
  return (
    <div style={{ marginTop: 20 }}>
      <div>
        <label>Theme</label>
        <select
          value={options.theme}
          onChange={e =>
            setOptions({ ...options, theme: e.target.value })
          }
          style={{ display: "block", color: "black" }}
        >
          {THEMES.map(t => (
            <option key={t.id} value={t.id}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginTop: 10 }}>
        <label>Caption Animation</label>
        <select
          value={options.animation}
          onChange={e =>
            setOptions({ ...options, animation: e.target.value })
          }
          style={{ display: "block", color: "black" }}
        >
          {ANIMATIONS.map(a => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
      </div>

      <div style={{ marginTop: 10 }}>
        <label>Video Mode</label>
        <select
          value={options.mode}
          onChange={e =>
            setOptions({ ...options, mode: e.target.value })
          }
          style={{ display: "block", color: "black" }}
        >
          {VIDEO_MODES.map(v => (
            <option key={v} value={v}>{v}</option>
          ))}
        </select>
      </div>
    </div>
  )
}
