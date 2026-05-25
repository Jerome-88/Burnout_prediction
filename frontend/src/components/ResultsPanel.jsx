import EnsembleResult from './EnsembleResult'
import ModelCard from './ModelCard'

const MODEL_ORDER = ['Logistic Regression', 'SVM', 'Random Forest', 'Naive Bayes', 'KNN']

export default function ResultsPanel({ results, onReset }) {
  const models = MODEL_ORDER.filter(n => results[n])

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-slate-700">Assessment Results</h2>

      <EnsembleResult data={results['Ensemble']} onReset={onReset} />

      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">
          Model Breakdown
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {models.map(name => (
            <ModelCard key={name} name={name} data={results[name]} />
          ))}
        </div>
      </div>
    </div>
  )
}
