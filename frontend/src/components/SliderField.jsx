export default function SliderField({ label, name, value, onChange, min, max, step = 1, unit = '', icon }) {
  const pct = Math.round(((value - min) / (max - min)) * 100)

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium text-slate-600 flex items-center gap-1.5">
          {icon && <span>{icon}</span>}
          {label}
        </label>
        <span className="text-sm font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg min-w-[2.5rem] text-center">
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
      <div className="flex justify-between text-xs text-slate-300">
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  )
}
