const LEVEL = {
  Low: { color: 'text-teal-700', badge: 'bg-teal-500/12 text-teal-800 border-teal-400/20', bar: 'bg-teal-500' },
  Medium: { color: 'text-amber-700', badge: 'bg-amber-500/12 text-amber-900 border-amber-400/20', bar: 'bg-amber-400' },
  High: { color: 'text-rose-700', badge: 'bg-rose-500/12 text-rose-900 border-rose-400/20', bar: 'bg-rose-500' },
}

export default function ModelCard({ name, data }) {
  if (!data) return null
  const cfg = LEVEL[data.prediction] || LEVEL.Low

  return (
    <div className="rounded-3xl bg-white/48 p-5 shadow-xl shadow-slate-900/5 ring-1 ring-white/60 transition-all duration-200 hover:-translate-y-1 hover:bg-white/58">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="mb-1 text-xs font-medium text-slate-400">Model</p>
          <p className="text-sm font-semibold leading-tight text-slate-800">{name}</p>
        </div>
        <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${cfg.badge}`}>
          {data.prediction}
        </span>
      </div>

      <div className="mb-5">
        <p className="mb-1 text-xs font-medium text-slate-400">Confidence</p>
        <span className={`text-3xl font-bold tracking-tight ${cfg.color}`}>{data.confidence}%</span>
      </div>

      <div className="space-y-2.5">
        {['Low', 'Medium', 'High'].map(label => {
          const val = data.probabilities?.[label] ?? 0
          return (
            <div key={label} className="grid grid-cols-[52px_1fr_38px] items-center gap-2">
              <span className="text-xs font-medium text-slate-400">{label}</span>
              <div className="h-1.5 overflow-hidden rounded-full bg-slate-500/25 ring-1 ring-white/60">
                <div
                  className={`h-full ${LEVEL[label].bar} rounded-full transition-all duration-700`}
                  style={{ width: `${val}%` }}
                />
              </div>
              <span className="text-right text-xs text-slate-500">{val}%</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
