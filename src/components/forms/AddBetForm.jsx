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

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((current) => ({
      ...current,
      [name]: value,
    }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    if (!formData.event || !formData.market || !formData.selection || !formData.bookmaker) {
      return
    }

    const bet = {
      id: `BET-${Date.now()}`,
      date: formData.date,
      sport: formData.sport || 'Football',
      event: formData.event,
      market: formData.market,
      selection: formData.selection,
      bookmaker: formData.bookmaker,
      stake: Number(formData.stake),
      odds: Number(formData.odds),
      result: formData.result,
      notes: formData.notes,
    }

    onSubmit(bet)
    setFormData(defaultForm)
  }

  return (
    <Card className="p-6">
      <div className="mb-5">
        <h2 className="text-xl font-semibold text-slate-900">Add Bet</h2>
        <p className="mt-1 text-sm text-slate-500">Record a new football bet for tracking.</p>
      </div>

      <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          Date
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          Sport
          <input
            type="text"
            name="sport"
            value={formData.sport}
            onChange={handleChange}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700 md:col-span-2">
          Event
          <input
            type="text"
            name="event"
            value={formData.event}
            onChange={handleChange}
            placeholder="Arsenal vs Chelsea"
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          Market
          <input
            type="text"
            name="market"
            value={formData.market}
            onChange={handleChange}
            placeholder="Match Result"
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          Selection
          <input
            type="text"
            name="selection"
            value={formData.selection}
            onChange={handleChange}
            placeholder="Arsenal"
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          Bookmaker
          <input
            type="text"
            name="bookmaker"
            value={formData.bookmaker}
            onChange={handleChange}
            placeholder="Bet365"
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          Stake (£)
          <input
            type="number"
            name="stake"
            min="0"
            step="0.01"
            value={formData.stake}
            onChange={handleChange}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          Odds
          <input
            type="number"
            name="odds"
            min="1"
            step="0.01"
            value={formData.odds}
            onChange={handleChange}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          Result
          <select
            name="result"
            value={formData.result}
            onChange={handleChange}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          >
            <option value="Won">Won</option>
            <option value="Lost">Lost</option>
            <option value="Void">Void</option>
            <option value="Pending">Pending</option>
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700 md:col-span-2">
          Notes
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows="3"
            placeholder="Add any useful context about the selection"
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
        </label>

        <div className="md:col-span-2 flex justify-end">
          <Button type="submit">Save Bet</Button>
        </div>
      </form>
    </Card>
  )
}

export default AddBetForm
