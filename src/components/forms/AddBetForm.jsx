import { useState } from 'react'
import Button from '../ui/Button'
import Card from '../ui/Card'

const defaultForm = {
  date: new Date().toISOString().split('T')[0],
  sport: 'Football',
  event: '',
  market: '',
  selection: '',
  bookmaker: '',
  stake: '25',
  odds: '2.00',
  result: 'Pending',
  notes: '',
}

function AddBetForm({ onSubmit }) {
  const [formData, setFormData] = useState(defaultForm)
  const [errors, setErrors] = useState({})

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((current) => ({
      ...current,
      [name]: value,
    }))

    setErrors((current) => ({
      ...current,
      [name]: '',
    }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    const nextErrors = {}

    if (!formData.event.trim()) nextErrors.event = 'Event is required.'
    if (!formData.market.trim()) nextErrors.market = 'Market is required.'
    if (!formData.selection.trim()) nextErrors.selection = 'Selection is required.'
    if (!formData.bookmaker.trim()) nextErrors.bookmaker = 'Bookmaker is required.'
    if (!formData.stake || Number(formData.stake) <= 0) nextErrors.stake = 'Stake must be greater than zero.'
    if (!formData.odds || Number(formData.odds) <= 1) nextErrors.odds = 'Odds must be greater than 1.00.'

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    const bet = {
      id: `BET-${Date.now()}`,
      date: formData.date,
      sport: formData.sport || 'Football',
      event: formData.event.trim(),
      market: formData.market.trim(),
      selection: formData.selection.trim(),
      bookmaker: formData.bookmaker.trim(),
      stake: Number(formData.stake),
      odds: Number(formData.odds),
      result: formData.result,
      notes: formData.notes.trim(),
    }

    onSubmit(bet)
    setFormData(defaultForm)
    setErrors({})
  }

  return (
    <Card id="add-bet-form" className="p-6 shadow-sm transition-shadow duration-200 hover:shadow-md">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-[var(--text)]">Add Bet</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">Record a new football bet for tracking.</p>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit} aria-label="Add a new bet">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-1.5 text-sm font-medium text-[var(--text)]">
            Date
            <input
            aria-label="Bet date"
              onChange={handleChange}
              className="rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 py-2.5 text-[var(--text)] outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm font-medium text-[var(--text)]">
            Sport
            <input
              aria-label="Sport"
              type="text"
              name="sport"
              value={formData.sport}
              onChange={handleChange}
              className="rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 py-2.5 text-[var(--text)] outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-1.5 text-sm font-medium text-[var(--text)] md:col-span-2">
            Event
            <input
              aria-label="Event name"
              type="text"
              name="event"
              value={formData.event}
              onChange={handleChange}
              placeholder="Arsenal vs Chelsea"
              className="rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 py-2.5 text-[var(--text)] outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
            {errors.event ? <span className="text-xs text-rose-600">{errors.event}</span> : null}
          </label>

          <label className="flex flex-col gap-1.5 text-sm font-medium text-[var(--text)]">
            Market
            <input
              aria-label="Market"
              type="text"
              name="market"
              value={formData.market}
              onChange={handleChange}
              placeholder="Match Result"
              className="rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 py-2.5 text-[var(--text)] outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
            {errors.market ? <span className="text-xs text-rose-600">{errors.market}</span> : null}
          </label>

          <label className="flex flex-col gap-1.5 text-sm font-medium text-[var(--text)]">
            Selection
            <input
              aria-label="Selection"
              type="text"
              name="selection"
              value={formData.selection}
              onChange={handleChange}
              placeholder="Arsenal"
              className="rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 py-2.5 text-[var(--text)] outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
            {errors.selection ? <span className="text-xs text-rose-600">{errors.selection}</span> : null}
          </label>

          <label className="flex flex-col gap-1.5 text-sm font-medium text-[var(--text)]">
            Bookmaker
            <input
              aria-label="Bookmaker"
              type="text"
              name="bookmaker"
              value={formData.bookmaker}
              onChange={handleChange}
              placeholder="Bet365"
              className="rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 py-2.5 text-[var(--text)] outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
            {errors.bookmaker ? <span className="text-xs text-rose-600">{errors.bookmaker}</span> : null}
          </label>

          <label className="flex flex-col gap-1.5 text-sm font-medium text-[var(--text)]">
            Stake (£)
            <input
              aria-label="Stake in pounds"
              type="number"
              name="stake"
              min="0"
              step="0.01"
              value={formData.stake}
              onChange={handleChange}
              className="rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 py-2.5 text-[var(--text)] outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
            {errors.stake ? <span className="text-xs text-rose-600">{errors.stake}</span> : null}
          </label>

          <label className="flex flex-col gap-1.5 text-sm font-medium text-[var(--text)]">
            Odds
            <input
              aria-label="Odds"
              type="number"
              name="odds"
              min="1"
              step="0.01"
              value={formData.odds}
              onChange={handleChange}
              className="rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 py-2.5 text-[var(--text)] outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
            {errors.odds ? <span className="text-xs text-rose-600">{errors.odds}</span> : null}
          </label>

          <label className="flex flex-col gap-1.5 text-sm font-medium text-[var(--text)] md:col-span-2">
            Result
            <select
              aria-label="Bet result"
              name="result"
              value={formData.result}
              onChange={handleChange}
              className="rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 py-2.5 text-[var(--text)] outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            >
              <option value="Won">Won</option>
              <option value="Lost">Lost</option>
              <option value="Void">Void</option>
              <option value="Pending">Pending</option>
            </select>
          </label>
        </div>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-[var(--text)]">
          Notes
          <textarea
            aria-label="Notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows="3"
            placeholder="Add any useful context about the selection"
            className="rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 py-2.5 text-[var(--text)] outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
        </label>

        <div className="flex justify-end">
          <Button type="submit" className="shadow-lg shadow-indigo-500/20 transition hover:-translate-y-0.5">
            Save Bet
          </Button>
        </div>
      </form>
    </Card>
  )
}

export default AddBetForm
