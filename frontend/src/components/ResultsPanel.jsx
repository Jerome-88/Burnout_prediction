import EnsembleResult from './EnsembleResult'
import ModelCard from './ModelCard'

const MODEL_ORDER = ['Logistic Regression', 'SVM', 'Random Forest', 'Naive Bayes', 'KNN']

export default function ResultsPanel({ results, inputSnapshot, onReset }) {
  const meta = results?._meta || {}
  const mainResult = results['Final Model'] || results['Soft Voting Ensemble'] || results['Logistic Regression']
  const models = MODEL_ORDER.filter(n => results[n])

  return (
    <div className="space-y-8">
      <div className="text-center">
        <p className="text-xs font-bold uppercase tracking-[0.28em] text-slate-500">Assessment Results</p>
        <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">Your BurnoutCheck dashboard</h2>
        <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-slate-600">
          The main result uses the final soft-voting model. Individual model predictions are shown below for transparency.
        </p>
      </div>

      <EnsembleResult data={mainResult} meta={meta} inputSnapshot={inputSnapshot} onReset={onReset} />

      <div>
        <p className="mb-4 text-xs font-bold uppercase tracking-[0.26em] text-slate-500">
          Model Breakdown
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {models.map(name => (
            <ModelCard key={name} name={name} data={results[name]} />
          ))}
        </div>
      </div>
    </div>
  )
}
