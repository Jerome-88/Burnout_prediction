import { useMemo, useState } from 'react'
import PredictionForm from './components/PredictionForm'
import ResultsPanel from './components/ResultsPanel'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

function getMainResult(results) {
  if (!results) return null
  return results['Final Model'] || results['Soft Voting Ensemble'] || results['Logistic Regression'] || null
}

function getBackgroundClass(prediction) {
  if (prediction === 'High') return 'mesh-background mesh-background--high'
  if (prediction === 'Medium') return 'mesh-background mesh-background--medium'
  if (prediction === 'Low') return 'mesh-background mesh-background--low'
  return 'mesh-background'
}

export default function App() {
  const [results, setResults] = useState(null)
  const [inputSnapshot, setInputSnapshot] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const mainResult = useMemo(() => getMainResult(results), [results])
  const backgroundClass = getBackgroundClass(mainResult?.prediction)

  const handleSubmit = async (formData) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE_URL}/api/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const payload = await res.json().catch(() => null)
      if (!res.ok) {
        const detail = payload?.detail
        const message = Array.isArray(detail)
          ? detail.map(item => `${item.loc?.slice(-1)[0] || 'field'}: ${item.msg}`).join(', ')
          : detail || 'Cannot reach the server. Make sure the backend is running.'
        throw new Error(message)
      }

      setResults(payload)
      setInputSnapshot(formData)
      setTimeout(() => document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' }), 100)
    } catch (e) {
      setError(e.message || 'Something went wrong while requesting the prediction.')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setResults(null)
    setInputSnapshot(null)
    setError(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="relative min-h-screen overflow-hidden font-sans text-slate-950">
      <div className={backgroundClass} />
      <div className="pointer-events-none fixed inset-0 z-[-1] bg-[linear-gradient(to_bottom,rgba(255,255,255,0.30),rgba(255,255,255,0.74))]" />

      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
        <header className="mx-auto mb-10 max-w-3xl text-center sm:mb-12">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/48 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-700 shadow-lg shadow-slate-900/5 ring-1 ring-white/70">
            <span className="h-2 w-2 rounded-full bg-[#007aff] shadow-[0_0_16px_rgba(0,122,255,0.55)]" />
            Classical ML · Burnout Risk Predictor
          </div>
          <h1 className="text-5xl font-bold tracking-[-0.055em] text-slate-950 sm:text-7xl">
            BurnoutCheck
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-slate-700 sm:text-lg">
            A calm, privacy-conscious educational app that estimates burnout risk from daily work and lifestyle patterns using classical Machine Learning.
          </p>
        </header>

        <div className={`transition-all duration-500 ${results ? 'opacity-95' : 'opacity-100'}`}>
          <PredictionForm onSubmit={handleSubmit} loading={loading} />
        </div>

        {error && (
          <div className="mt-5 rounded-3xl border border-rose-300/30 bg-white/55 p-4 text-center text-sm font-medium text-rose-700 shadow-xl shadow-rose-900/5 backdrop-blur-xl">
            {error}
          </div>
        )}

        {results && (
          <div id="results" className="mt-12 animate-[fadeIn_0.35s_ease-out]">
            <ResultsPanel results={results} inputSnapshot={inputSnapshot} onReset={handleReset} />
          </div>
        )}
      </main>
    </div>
  )
}
