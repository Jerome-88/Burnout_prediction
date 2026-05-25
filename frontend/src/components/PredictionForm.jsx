import { useState } from 'react'
import SliderField from './SliderField'

const DEFAULTS = {
  age:              28,
  experience_years:  5,
  daily_work_hours:  8,
  sleep_hours:       7,
  caffeine_intake:   2,
  bugs_per_day:      5,
  commits_per_day:   6,
  meetings_per_day:  3,
  screen_time:       8,
  exercise_hours:    1,
}

function Section({ title, children }) {
  return (
    <section className="p-6 sm:p-8 border-b border-slate-50 last:border-0">
      <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-6">
        {title}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-7">
        {children}
      </div>
    </section>
  )
}

export default function PredictionForm({ onSubmit, loading }) {
  const [form, setForm] = useState(DEFAULTS)
  const set = (name, value) => setForm(p => ({ ...p, [name]: value }))

  return (
    <form
      onSubmit={e => { e.preventDefault(); onSubmit(form) }}
      className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden"
    >
      <Section title="Work Patterns">
        <SliderField label="Daily Work Hours"   name="daily_work_hours"  value={form.daily_work_hours}  onChange={set} min={1}  max={24} step={0.5} unit="h"    />
        <SliderField label="Meetings per Day"   name="meetings_per_day"  value={form.meetings_per_day}  onChange={set} min={0}  max={15}            unit=" mtg"  />
        <SliderField label="Bugs per Day"       name="bugs_per_day"      value={form.bugs_per_day}      onChange={set} min={0}  max={30}                         />
        <SliderField label="Commits per Day"    name="commits_per_day"   value={form.commits_per_day}   onChange={set} min={0}  max={40}                         />
      </Section>

      <Section title="Health & Lifestyle">
        <SliderField label="Sleep Hours"        name="sleep_hours"       value={form.sleep_hours}       onChange={set} min={3}  max={24} step={0.5} unit="h"    />
        <SliderField label="Screen Time"        name="screen_time"       value={form.screen_time}       onChange={set} min={1}  max={24} step={0.5} unit="h"    />
        <SliderField label="Caffeine Intake"    name="caffeine_intake"   value={form.caffeine_intake}   onChange={set} min={0}  max={10}            unit=" cups" />
        <SliderField label="Exercise Hours"     name="exercise_hours"    value={form.exercise_hours}    onChange={set} min={0}  max={24}  step={0.5} unit="h"    />
      </Section>

      <Section title="About You">
        <SliderField label="Age"                name="age"               value={form.age}               onChange={set} min={18} max={65}            unit=" yrs"  />
        <SliderField label="Years of Experience" name="experience_years" value={form.experience_years}  onChange={set} min={0}  max={40}            unit=" yrs"  />
      </Section>

      <div className="px-6 sm:px-8 pb-8">
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:bg-indigo-300 text-white font-semibold py-3.5 rounded-2xl transition-colors duration-150 flex items-center justify-center gap-2 text-sm"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Analyzing...
            </>
          ) : (
            'Analyze'
          )}
        </button>
      </div>
    </form>
  )
}
