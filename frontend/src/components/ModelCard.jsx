const LEVEL = {
  Low:    { color: 'text-emerald-600', badge: 'bg-emerald-50 text-emerald-700 border-emerald-100', bar: 'bg-emerald-400' },
  Medium: { color: 'text-amber-600',   badge: 'bg-amber-50 text-amber-700 border-amber-100',       bar: 'bg-amber-400'   },
  High:   { color: 'text-rose-600',    badge: 'bg-rose-50 text-rose-700 border-rose-100',           bar: 'bg-rose-400'    },
}

export default function ModelCard({ name, data }) {
  const cfg = LEVEL[data.prediction]

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs text-slate-400 mb-0.5">Model</p>
          <p className="font-semibold text-slate-700 text-sm leading-tight">{name}</p>
        </div>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg border ${cfg.badge}`}>
          {data.prediction}
        </span>
      </div>

      <div className="mb-4">
        <p className="text-xs text-slate-400 mb-0.5">Confidence</p>
        <span className={`text-2xl font-bold ${cfg.color}`}>{data.confidence}%</span>
      </div>

      <div className="space-y-2">
        {['Low', 'Medium', 'High'].map(label => {
          const val = data.probabilities[label]
          return (
            <div key={label} className="flex items-center gap-2">
              <span className="text-xs text-slate-400 w-12">{label}</span>
              <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full ${LEVEL[label].bar} rounded-full transition-all duration-700`}
                  style={{ width: `${val}%` }}
                />
              </div>
              <span className="text-xs text-slate-500 w-8 text-right">{val}%</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
