import { useState } from 'react'
import PredictionForm from './components/PredictionForm'
import ResultsPanel from './components/ResultsPanel'

export default function App() {
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

  const handleSubmit = async (formData) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (!res.ok) throw new Error('Cannot reach the server. Make sure the backend is running.')
      const data = await res.json()
      setResults(data)
      setTimeout(() => document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' }), 100)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setResults(null)
    setError(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/50 font-sans">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14">

        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-5xl font-extrabold text-slate-800 mb-3 tracking-tight">
            BurnoutCheck
          </h1>
          <p className="text-slate-500 text-base max-w-sm mx-auto leading-relaxed">
            A data driven look at your daily patterns to help you predict burnout risk and understand your work life balance.
          </p>
        </header>

        <PredictionForm onSubmit={handleSubmit} loading={loading} />

        {error && (
          <div className="mt-5 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-sm text-center">
            {error}
          </div>
        )}

        {results && (
          <div id="results" className="mt-12">
            <ResultsPanel results={results} onReset={handleReset} />
          </div>
        )}

      </div>
    </div>
  )
}
