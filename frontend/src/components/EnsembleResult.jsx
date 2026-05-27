import { AlertTriangle, CheckCircle2, Clock3, Coffee, Dumbbell, Gauge, Laptop, Moon, RefreshCw, Sparkles } from 'lucide-react'

const LEVEL = {
  Low: {
    color: 'text-teal-700',
    soft: 'bg-teal-500/12 text-teal-800 border-teal-400/20',
    bar: 'bg-teal-500',
    glow: 'shadow-teal-500/30',
    ring: '#14b8a6',
    ringLight: '#99f6e4',
    gradientFrom: '#0d9488',
    gradientTo: '#5eead4',
    title: 'Low Burnout Risk',
    message: 'Your input pattern looks relatively balanced based on the trained dataset.',
    guidance: 'Keep maintaining healthy sleep, recovery, and workload boundaries.',
    story: {
      eyebrow: 'Balanced rhythm detected',
      verdict: 'Your routine reads like a clean, stable workday.',
      tone: 'The model sees enough recovery signals to keep the risk low.',
      accent: 'Recovery is doing its job.',
    },
    bullets: [
      'The final model found stronger similarity with low-risk patterns.',
      'The probability distribution is still shown so the result stays transparent.',
      'Use this as a reflective signal, not as a clinical conclusion.',
    ],
  },
  Medium: {
    color: 'text-amber-700',
    soft: 'bg-amber-500/12 text-amber-900 border-amber-400/20',
    bar: 'bg-amber-400',
    glow: 'shadow-amber-500/30',
    ring: '#f59e0b',
    ringLight: '#fde68a',
    gradientFrom: '#d97706',
    gradientTo: '#fcd34d',
    title: 'Medium Burnout Risk',
    message: 'Some warning signs appear in your daily pattern.',
    guidance: 'Consider reviewing workload, screen time, sleep, and recovery habits.',
    story: {
      eyebrow: 'Mixed signals detected',
      verdict: 'Your day looks productive, but recovery may be getting squeezed.',
      tone: 'The data points sit between balanced and overloaded patterns.',
      accent: 'Small habit shifts could move the needle.',
    },
    bullets: [
      'The model detected a mixed pattern between balanced and higher-risk routines.',
      'Medium confidence can indicate that several factors are close to a decision boundary.',
      'Small improvements in rest, workload, or recovery may meaningfully change the result.',
    ],
  },
  High: {
    color: 'text-rose-700',
    soft: 'bg-rose-500/12 text-rose-900 border-rose-400/20',
    bar: 'bg-rose-500',
    glow: 'shadow-rose-500/30',
    ring: '#f43f5e',
    ringLight: '#fda4af',
    gradientFrom: '#e11d48',
    gradientTo: '#fb7185',
    title: 'High Burnout Risk',
    message: 'Several indicators are similar to high burnout-risk patterns in the dataset.',
    guidance: 'Take a deep breath. Consider reviewing your task load, recovery time, and support system.',
    story: {
      eyebrow: 'Pressure pattern detected',
      verdict: 'Your inputs tell a heavier story: high output, limited recovery.',
      tone: 'The model links this pattern with higher burnout-risk records.',
      accent: 'This is a signal to slow the load, not ignore it.',
    },
    bullets: [
      'The final model found strong similarity with high-risk records in the dataset.',
      'Higher risk usually reflects a combined pattern, not one isolated input.',
      'This is an educational alert to reflect on workload and recovery, not a diagnosis.',
    ],
  },
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

function formatValue(value, unit = '') {
  if (value === undefined || value === null || value === '') return '-'
  return `${value}${unit}`
}

function getWorkloadLabel(input) {
  const workHours = Number(input?.daily_work_hours || 0)
  const meetings = Number(input?.meetings_per_day || 0)
  const bugs = Number(input?.bugs_per_day || 0)

  if (workHours >= 10 || meetings >= 7 || bugs >= 12) return 'heavy workload'
  if (workHours >= 8 || meetings >= 4 || bugs >= 6) return 'active workload'
  return 'light workload'
}

function getRecoveryLabel(input) {
  const sleep = Number(input?.sleep_hours || 0)
  const exercise = Number(input?.exercise_hours || 0)

  if (sleep >= 7 && exercise >= 1) return 'solid recovery'
  if (sleep >= 6) return 'okay recovery'
  return 'low recovery'
}

function getLifestyleLabel(input) {
  const screen = Number(input?.screen_time || 0)
  const caffeine = Number(input?.caffeine_intake || 0)

  if (screen >= 10 || caffeine >= 4) return 'high stimulation'
  if (screen >= 7 || caffeine >= 2) return 'moderate stimulation'
  return 'calm stimulation'
}

function buildStory(input, prediction) {
  if (!input) return null

  const workload = getWorkloadLabel(input)
  const recovery = getRecoveryLabel(input)
  const lifestyle = getLifestyleLabel(input)

  const templates = {
    Low: `You logged ${formatValue(input.daily_work_hours, 'h')} work, ${formatValue(input.sleep_hours, 'h')} sleep, and ${formatValue(input.exercise_hours, 'h')} exercise. That gives the model a ${workload} + ${recovery} profile.`,
    Medium: `You logged ${formatValue(input.daily_work_hours, 'h')} work, ${formatValue(input.screen_time, 'h')} screen time, and ${formatValue(input.sleep_hours, 'h')} sleep. The model sees ${workload}, ${lifestyle}, and recovery that may need tuning.`,
    High: `You logged ${formatValue(input.daily_work_hours, 'h')} work, ${formatValue(input.screen_time, 'h')} screen time, ${formatValue(input.caffeine_intake, ' cups')} caffeine, and ${formatValue(input.sleep_hours, 'h')} sleep. That combination looks closer to overload patterns.`,
  }

  return templates[prediction] || templates.Low
}

function SignalPill({ label, value, icon: Icon }) {
  return (
    <div className="group rounded-2xl bg-white/55 p-3 ring-1 ring-white/65 transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/70">
      <Icon size={15} className="mb-1 text-slate-500 transition-transform duration-200 group-hover:scale-110" />
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-800">{value}</p>
    </div>
  )
}

// SVG Arc Confidence Ring
function ConfidenceRing({ confidence, cfg, latencyText }) {
  const size = 192
  const strokeWidth = 13
  const radius = (size - strokeWidth) / 2
  const cx = size / 2
  const cy = size / 2
  const circumference = 2 * Math.PI * radius
  const pct = clamp(confidence, 0, 100) / 100
  const dashOffset = circumference * (1 - pct)
  const gradId = `conf-grad-${cfg.ring.replace('#', '')}`
  const glowId = `conf-glow-${cfg.ring.replace('#', '')}`

  return (
    <div className="relative flex flex-col items-center justify-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="absolute inset-0 -rotate-90"
          style={{ filter: `drop-shadow(0 0 8px ${cfg.ring}66) drop-shadow(0 0 18px ${cfg.ring}33)` }}
        >
          <defs>
            <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={cfg.gradientFrom} />
              <stop offset="100%" stopColor={cfg.gradientTo} />
            </linearGradient>
            <filter id={glowId}>
              <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Track (background ring) */}
          <circle
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.35)"
            strokeWidth={strokeWidth}
          />

          {/* Progress arc */}
          <circle
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke={`url(#${gradId})`}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            filter={`url(#${glowId})`}
            style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.4,0,0.2,1)' }}
          />

        </svg>

        {/* Inner card */}
        <div
          className="absolute inset-0 m-4 rounded-full flex flex-col items-center justify-center text-center"
          style={{
            background: 'rgba(255,255,255,0.82)',
            backdropFilter: 'blur(12px)',
            boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.9), 0 4px 20px rgba(0,0,0,0.06)',
          }}
        >
          <p
            className="text-[10px] font-bold uppercase tracking-[0.25em] mb-0.5"
            style={{ color: cfg.gradientFrom, opacity: 0.85 }}
          >
            Confidence
          </p>
          <p className={`text-4xl font-extrabold leading-none ${cfg.color}`}>
            {confidence}<span className="text-2xl font-bold">%</span>
          </p>
          <div
            className="mt-2 h-px w-10 rounded-full opacity-30"
            style={{ background: cfg.ring }}
          />
          <p className="mt-1.5 text-[11px] font-medium text-slate-400">
            Latency {latencyText}
          </p>
        </div>
      </div>
    </div>
  )
}

export default function EnsembleResult({ data, meta, inputSnapshot, onReset }) {
  if (!data) return null

  const cfg = LEVEL[data.prediction] || LEVEL.Low
  const latencyText = meta?.latency_ms !== undefined ? `${meta.latency_ms} ms` : 'Not measured'
  const confidence = clamp(Number(data.confidence || 0), 0, 100)
  const storyText = buildStory(inputSnapshot, data.prediction)

  return (
    <div className="glass-panel relative overflow-hidden p-5 sm:p-8 transition-all duration-500 animate-[fadeIn_0.35s_ease-out]">
      <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-white/90 to-transparent" />
      <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full opacity-20 blur-3xl" style={{ background: cfg.ring }} />

      <div className="relative grid gap-8 lg:grid-cols-[1fr_220px] lg:items-center">
        <div>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/55 px-3 py-1.5 text-xs font-semibold text-slate-700 ring-1 ring-white/60">
            <Sparkles size={14} />
            Main Prediction · Soft Voting Ensemble
          </div>
          <h2 className={`text-4xl font-bold tracking-tight sm:text-5xl ${cfg.color}`}>
            {cfg.title}
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600">
            {cfg.message} Final confidence reflects agreement across multiple classical ML models.
          </p>

          {storyText && (
            <div className="relative mt-5 overflow-hidden rounded-[2rem] border border-white/60 bg-white/50 p-5 shadow-2xl shadow-slate-900/10 backdrop-blur-xl">
              <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/90 to-transparent" />
              <div className="pointer-events-none absolute -bottom-16 -right-16 h-36 w-36 rounded-full opacity-20 blur-2xl" style={{ background: cfg.ring }} />

              <div className="relative mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-slate-400">
                    Input Story
                  </p>
                  <p className={`mt-1 text-sm font-semibold ${cfg.color}`}>
                    {cfg.story.eyebrow}
                  </p>
                </div>

                <span className={`rounded-full border px-3 py-1 text-xs font-bold ${cfg.soft}`}>
                  {data.prediction} verdict
                </span>
              </div>

              <p className="relative text-base font-semibold leading-relaxed text-slate-900">
                {cfg.story.verdict}
              </p>

              <p className="relative mt-2 text-sm leading-relaxed text-slate-600">
                {storyText}
              </p>

              <div className="relative mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
                <SignalPill label="Work" value={formatValue(inputSnapshot.daily_work_hours, 'h')} icon={Clock3} />
                <SignalPill label="Sleep" value={formatValue(inputSnapshot.sleep_hours, 'h')} icon={Moon} />
                <SignalPill label="Screen" value={formatValue(inputSnapshot.screen_time, 'h')} icon={Laptop} />
                <SignalPill label="Exercise" value={formatValue(inputSnapshot.exercise_hours, 'h')} icon={Dumbbell} />
                <SignalPill label="Caffeine" value={formatValue(inputSnapshot.caffeine_intake, ' cups')} icon={Coffee} />
              </div>

              <div className="relative mt-4 flex flex-col gap-2 rounded-2xl bg-slate-950/[0.03] p-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs font-semibold leading-relaxed text-slate-600">
                  {cfg.story.accent}
                </p>
                <p className="text-xs leading-relaxed text-slate-500">
                  {cfg.story.tone}
                </p>
              </div>
            </div>
          )}

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-3xl bg-white/45 p-4 ring-1 ring-white/55">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">Interpretation</p>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">{cfg.message}</p>
            </div>
            <div className="rounded-3xl bg-white/45 p-4 ring-1 ring-white/55">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">Supportive next step</p>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">{cfg.guidance}</p>
            </div>
          </div>
        </div>

        {/* ── Polished SVG confidence ring ── */}
        <div className="mx-auto flex flex-col items-center justify-center">
          <ConfidenceRing confidence={confidence} cfg={cfg} latencyText={latencyText} />
        </div>
      </div>

      <div className="relative mt-8 space-y-3">
        {['Low', 'Medium', 'High'].map(label => {
          const val = data.probabilities?.[label] ?? 0
          return (
            <div key={label} className="grid grid-cols-[64px_1fr_48px] items-center gap-3">
              <span className="text-xs font-semibold text-slate-500">{label}</span>
              <div className="h-2.5 overflow-hidden rounded-full bg-slate-500/25 ring-1 ring-white/60">
                <div
                  className={`h-full ${LEVEL[label].bar} rounded-full transition-all duration-700`}
                  style={{ width: `${val}%` }}
                />
              </div>
              <span className="text-right text-xs font-semibold text-slate-600">{val}%</span>
            </div>
          )
        })}
      </div>

      <div className="relative mt-8 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-3xl bg-white/42 p-5 ring-1 ring-white/55">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800">
            <Gauge size={17} />
            Why this output is interpretable
          </div>
          <ul className="space-y-2 text-sm leading-relaxed text-slate-600">
            {cfg.bullets.map(item => (
              <li key={item} className="flex gap-2">
                <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-slate-500" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className={`rounded-3xl border p-5 ${cfg.soft}`}>
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <AlertTriangle size={17} />
            Responsible AI note
          </div>
          <p className="text-sm leading-relaxed">
            This tool is for educational Machine Learning demonstration only. It should not be used as a medical or psychological diagnosis, and the result depends on dataset quality and model limitations.
          </p>
        </div>
      </div>

      <button
        onClick={onReset}
        className="relative mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-white/58 px-5 py-3 text-sm font-semibold text-slate-800 ring-1 ring-white/65 transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/75 active:scale-[0.98]"
      >
        <RefreshCw size={15} />
        Reset Assessment
      </button>
    </div>
  )
}
