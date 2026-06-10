import { useState } from 'react'
import { Activity, Briefcase, Bug, Coffee, Dumbbell, Laptop, Moon, User, Users } from 'lucide-react'
import SliderField from './SliderField'

const DEFAULTS = {
  age: 28,
  experience_years: 5,
  daily_work_hours: 8,
  sleep_hours: 7,
  caffeine_intake: 2,
  bugs_per_day: 5,
  meetings_per_day: 3,
  screen_time: 8,
  exercise_hours: 1,
}

function Section({ title, description, children }) {
  return (
    <section className="px-5 py-6 sm:px-8 sm:py-8 border-t border-white/45 first:border-t-0">
      <div className="mb-5 flex flex-col gap-1">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-500">
          {title}
        </p>
        {description && <p className="text-sm leading-relaxed text-slate-600">{description}</p>}
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
      className={`glass-panel overflow-hidden transition-all duration-500 ${loading ? 'scale-[0.99] opacity-80' : 'opacity-100'}`}
    >
      <div className="px-5 pt-5 sm:px-8 sm:pt-8">
        <div className="glass-soft rounded-3xl p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#007aff] text-white shadow-lg shadow-blue-500/20">
              <Activity size={19} />
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-900">Private educational self-check</p>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">
                Fill this using your average daily routine from the last 1–2 weeks. The app does not ask for your name and the prediction is for educational ML demonstration only.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Section title="Work Patterns" description="Average daily workload and coding activity.">
        <SliderField icon={<Briefcase size={16} />} label="Daily work hours" name="daily_work_hours" value={form.daily_work_hours} onChange={set} min={1} max={24} step={0.5} unit=" h" hint="Total focused work or study hours." />
        <SliderField icon={<Users size={16} />} label="Meetings per day" name="meetings_per_day" value={form.meetings_per_day} onChange={set} min={0} max={15} unit=" mtg" hint="Scheduled calls, syncs, or discussions." />
        <SliderField icon={<Bug size={16} />} label="Bugs handled per day" name="bugs_per_day" value={form.bugs_per_day} onChange={set} min={0} max={30} hint="Issues fixed, reviewed, or debugged." />
      </Section>

      <Section title="Health & Lifestyle" description="Sleep, screen exposure, caffeine, and recovery habits.">
        <SliderField icon={<Moon size={16} />} label="Sleep hours" name="sleep_hours" value={form.sleep_hours} onChange={set} min={3} max={24} step={0.5} unit=" h" hint="Average sleep duration per day." />
        <SliderField icon={<Laptop size={16} />} label="Total screen time" name="screen_time" value={form.screen_time} onChange={set} min={1} max={24} step={0.5} unit=" h" hint="Work and non-work screen exposure." />
        <SliderField icon={<Coffee size={16} />} label="Caffeine cups per day" name="caffeine_intake" value={form.caffeine_intake} onChange={set} min={0} max={10} unit=" cups" hint="Coffee, tea, or energy drink equivalent." />
        <SliderField icon={<Dumbbell size={16} />} label="Exercise hours" name="exercise_hours" value={form.exercise_hours} onChange={set} min={0} max={24} step={0.5} unit=" h" hint="Physical activity or intentional recovery." />
      </Section>

      <Section title="About You" description="Basic demographic context used by the trained model.">
        <SliderField icon={<User size={16} />} label="Age" name="age" value={form.age} onChange={set} min={18} max={65} unit=" yrs" hint="Used only as model input, not identity." />
        <SliderField icon={<Briefcase size={16} />} label="Years of experience" name="experience_years" value={form.experience_years} onChange={set} min={0} max={40} unit=" yrs" hint="Approximate professional or project experience." />
      </Section>

      <div className="px-5 pb-6 sm:px-8 sm:pb-8">
        <button
          type="submit"
          disabled={loading}
          className="group flex w-full items-center justify-center gap-2 rounded-full bg-slate-950 px-6 py-4 text-sm font-semibold text-white shadow-2xl shadow-slate-950/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-black active:translate-y-0 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? (
            <>
              <span className="apple-spinner" />
              Analyzing your pattern...
            </>
          ) : (
            'Analyze Burnout Risk'
          )}
        </button>
      </div>
    </form>
  )
}
