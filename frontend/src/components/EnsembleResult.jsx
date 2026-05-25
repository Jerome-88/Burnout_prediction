import { useEffect, useRef, useMemo } from 'react'

const LEVEL = {
  Low: {
    color:   'text-emerald-700',
    bg:      'bg-emerald-50',
    border:  'border-emerald-200',
    bar:     'bg-emerald-500',
    dot:     'bg-emerald-400',
    message: "Your patterns suggest a healthy work-life balance. Keep maintaining these habits.",
  },
  Medium: {
    color:   'text-amber-700',
    bg:      'bg-amber-50',
    border:  'border-amber-200',
    bar:     'bg-amber-400',
    dot:     'bg-amber-400',
    message: "Some warning signs detected. Consider reviewing your workload and daily routine.",
  },
  High: {
    color:   'text-rose-700',
    bg:      'bg-rose-50',
    border:  'border-rose-200',
    bar:     'bg-rose-500',
    dot:     'bg-rose-400',
    message: "High burnout indicators found. Prioritizing rest and recovery is important right now.",
  },
}

const LOW_POOL = [
  { postid: '15979454016311964961', ratio: '0.658635', song: '/low1.mp3'    },
  { postid: '14223536015423111051', ratio: '1',        song: '/low2.mp3'    },
]

const MEDIUM_POOL = [
  { postid: '5176744716422677112',  ratio: '1.58599',  song: '/medium1.mp3' },
  { postid: '4570998493364427214',  ratio: '1.55',     song: '/medium2.mp3' },
]

const HIGH_POOL = [
  { postid: '27276389',             ratio: '1',        song: '/high1.mp3'   },
  { postid: '3603719653969248043',  ratio: '1.63816',  song: '/high2.mp3'   },
]

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)] }

function TenorEmbed({ postid, ratio }) {
  const containerRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const div = document.createElement('div')
    div.className             = 'tenor-gif-embed'
    div.dataset.postid        = postid
    div.dataset.shareMethod   = 'host'
    div.dataset.aspectRatio   = ratio
    div.dataset.width         = '100%'
    container.appendChild(div)

    if (window.renderTenorEmbeds) {
      window.renderTenorEmbeds()
    } else {
      const script = document.createElement('script')
      script.src   = 'https://tenor.com/embed.js'
      script.async = true
      document.body.appendChild(script)
    }

    return () => { if (container.contains(div)) container.removeChild(div) }
  }, [postid, ratio])

  return <div ref={containerRef} className="rounded-xl overflow-hidden" />
}

export default function EnsembleResult({ data, onReset }) {
  const cfg      = LEVEL[data.prediction]
  const audioRef = useRef(null)

  const { postid, ratio, song } = useMemo(() => {
    const pool = data.prediction === 'Medium' ? MEDIUM_POOL
               : data.prediction === 'High'   ? HIGH_POOL
               : LOW_POOL
    return pick(pool)
  }, [data.prediction])

  useEffect(() => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null }
    const audio    = new Audio(song)
    audio.volume   = 0.5
    audio.loop     = true
    audioRef.current = audio
    audio.play().catch(() => {})
    return () => { audio.pause(); audioRef.current = null }
  }, [song])

  const replay = () => {
    if (!audioRef.current) return
    audioRef.current.currentTime = 0
    audioRef.current.play().catch(() => {})
  }

  return (
    <div className={`rounded-3xl border-2 ${cfg.border} ${cfg.bg} p-8`}>
      <div className="flex items-start justify-between mb-5">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1.5">
            Your Assessment
          </p>
          <div className="flex items-center gap-2.5">
            <h2 className={`text-3xl font-bold ${cfg.color}`}>
              {data.prediction} Risk
            </h2>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-400 mb-1">Confidence</p>
          <p className={`text-2xl font-bold ${cfg.color}`}>{data.confidence}%</p>
        </div>
      </div>

      <p className="text-slate-600 text-sm leading-relaxed mb-4">{cfg.message}</p>

      {/* Now playing */}
      <button
        onClick={replay}
        className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-slate-600 transition-colors mb-6"
      >
        <span className="text-base">♪</span>
        <span>{song.replace('/', '').replace('.mp3', '')}</span>
        <span className="text-slate-300">· click to replay</span>
      </button>

      {/* GIF */}
      <div className="mb-6 max-w-xs mx-auto">
        <TenorEmbed postid={postid} ratio={ratio} />
      </div>

      {/* Probability bars */}
      <div className="space-y-3">
        {['Low', 'Medium', 'High'].map(label => {
          const val = data.probabilities[label]
          return (
            <div key={label} className="flex items-center gap-3">
              <span className="text-xs font-medium text-slate-500 w-14">{label}</span>
              <div className="flex-1 h-2 bg-white/70 rounded-full overflow-hidden">
                <div
                  className={`h-full ${LEVEL[label].bar} rounded-full transition-all duration-700`}
                  style={{ width: `${val}%` }}
                />
              </div>
              <span className="text-xs font-semibold text-slate-600 w-10 text-right">{val}%</span>
            </div>
          )
        })}
      </div>

      <p className="text-xs text-slate-400 mt-5">
        Soft-voting ensemble of 5 prediction models
      </p>

      <button
        onClick={onReset}
        className="mt-5 w-full py-2.5 rounded-2xl bg-slate-100 text-sm font-medium text-slate-700 hover:bg-slate-200 hover:text-slate-900 transition-colors"
      >
        New Prediction
      </button>
    </div>
  )
}
