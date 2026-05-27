export default function SliderField({ label, name, value, onChange, min, max, step = 1, unit = '', icon, hint }) {
  const pct = Math.round(((value - min) / (max - min)) * 100)

  return (
    <div className="space-y-3 rounded-3xl glass-soft p-4 sm:p-5 transition-transform duration-200 hover:-translate-y-0.5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0">
          {icon && (
            <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl bg-white/65 text-slate-700 shadow-sm">
              {icon}
            </span>
          )}
          <div>
            <label className="block text-sm font-semibold text-slate-800 leading-tight">
              {label}
            </label>
            {hint && <p className="mt-1 text-xs leading-relaxed text-slate-500">{hint}</p>}
          </div>
        </div>
        <span className="shrink-0 rounded-full bg-slate-950 px-3 py-1 text-sm font-semibold text-white shadow-sm">
          {value}{unit}
        </span>
      </div>

      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(name, parseFloat(e.target.value))}
        className="slider"
        style={{ '--val': `${pct}%` }}
      />

      <div className="flex justify-between px-0.5 text-[11px] font-medium text-slate-400">
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  )
}
