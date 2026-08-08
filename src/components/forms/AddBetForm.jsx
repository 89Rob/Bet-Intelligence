import { useMemo, useState } from 'react'
import Button from '../ui/Button'
import Card from '../ui/Card'
import {
  BET_TYPE_OPTIONS,
  calculateAccumulatorOdds,
  calculateCombinationBetResult,
  calculateEachWayResult,
  getRequiredSelectionCount,
  normalizeFractionalOdds,
  parseFractionalOdds,
  parseEwTerm,
} from '../../data/bets'
ronSubmit }) {
  const [formData, setFormData] = useState(defaultForm)
  const [errors, setErrors] = useState({})

  const accumulatorOdds = useMemo(() => calculateAccumulatorOdds(formData.selections || []), [formData.selections])
  const eachWayPreview = useMemo(() => {
    const winStake = Number(formData.winStake || 0)
    const placeStake = Number(formData.placeStake || 0)
    const preview = calculateEachWayResult({
      winStake,
      placeStake,
      winOdds: formData.odds,
      ewTerms: formData.ewTerms,
      placesPaid: formData.placesPaid,
      finishingPosition: formData.finishingPosition,
      result: formData.result,
      cashOutAmount: Number(formData.cashOutAmount || 0),
    })
    return preview
  }, [formData.odds, formData.result, formData.ewTerms, formData.finishingPosition, formData.placesPaid, formData.placeStake, formData.winStake, formData.cashOutAmount])

  const handleChange = (event) => {
    const { name, value } = event.target

    if (name === 'betType') {
      const requiredCount = getRequiredSelectionCount(value)
      setFormData((current) => ({
        ...current,
        betType: value,
        selections: (current.selections || []).slice(0, requiredCount).concat(
          Array.from({ length: Math.max(requiredCount - (current.selections || []).length, 0) }, (_, index) => ({
            id: crypto?.randomUUID ? crypto.randomUUID() : `sel-${Date.now()}-${(current.selections || []).length + index + 1}`,
            event: '',
            market: '',
            selection: '',
            odds: '2/1',
          })),
        ),
      }))
      setErrors((current) => ({
        ...current,
        betType: '',
        selections: '',
      }))
      return
    }

    setFormData((current) => ({
      ...current,
      [name]: value,
    }))

    setErrors((current) => ({
      ...current,
      [name]: '',
    }))
  }

  const handleAccumulatorSelectionChange = (index, field, value) => {
    setFormData((current) => ({
      ...current,
      selections: (current.selections || []).map((selection, selectionIndex) =>
        selectionIndex === index ? { ...selection, [field]: value } : selection,
      ),
    }))
  }

  const addAccumulatorSelection = () => {
    setFormData((current) => ({
      ...current,
      selections: [
        ...(current.selections || []),
        {
          id: crypto?.randomUUID ? crypto.randomUUID() : `sel-${Date.now()}-${(current.selections || []).length + 1}`,
          event: '',
          market: '',
          selection: '',
          odds: '2/1',
        },
      ],
    }))
  }

  const removeAccumulatorSelection = (index) => {
    setFormData((current) => ({
      ...current,
      selections: (current.selections || []).filter((_, selectionIndex) => selectionIndex !== index),
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

    if (formData.betType === 'single') {
      const parsedOdds = parseFractionalOdds(formData.odds)
      if (!parsedOdds) {
        nextErrors.odds = 'Use a valid fractional odds format such as 1/2, 6/4, or 9/1.'
      }
    }

    if (formData.betType !== 'single' && formData.betType !== 'each_way') {
      const requiredSelectionCount = getRequiredSelectionCount(formData.betType)
      const validSelections = (formData.selections || []).filter((selection) => selection && selection.selection && selection.market && selection.event && parseFractionalOdds(selection.odds))
      if (validSelections.length < requiredSelectionCount) {
        nextErrors.selections = `Add at least ${requiredSelectionCount} valid selections for this bet type.`
      }
    }

    if (formData.betType === 'each_way') {
      const parsedOdds = parseFractionalOdds(formData.odds)
      if (!parsedOdds) {
        nextErrors.odds = 'Use a valid fractional odds format such as 1/2, 6/4, or 9/1.'
      }
      if (!formData.winStake || Number(formData.winStake) <= 0) nextErrors.winStake = 'Win stake must be greater than zero.'
      if (!formData.placeStake || Number(formData.placeStake) <= 0) nextErrors.placeStake = 'Place stake must be greater than zero.'
      if (Number(formData.placesPaid) <= 0) nextErrors.placesPaid = 'Places paid must be greater than zero.'
      if (parseEwTerm(formData.ewTerms) <= 0) nextErrors.ewTerms = 'EW terms must be valid.'
    }

    if (formData.result === 'Cashed Out' && (!formData.cashOutAmount || Number(formData.cashOutAmount) <= 0)) {
      nextErrors.cashOutAmount = 'Cash-out amount is required.'
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    const baseBet = {
      id: `BET-${Date.now()}`,
      date: formData.date,
      sport: formData.sport || 'Football',
      event: formData.event.trim(),
      market: formData.market.trim(),
      selection: formData.selection.trim(),
      bookmaker: formData.bookmaker.trim(),
      stake: Number(formData.stake || 0),
      betType: formData.betType,
      result: formData.result,
      status: formData.result,
      notes: formData.notes.trim(),
      cashOutAmount: Number(formData.cashOutAmount || 0),
      metadata: {},
      selections: getRequiredSelectionCount(formData.betType) > 1 ? (formData.selections || []).map((selection) => ({
        ...selection,
        odds: normalizeFractionalOdds(selection.odds || '1/1'),
        decimalOdds: Number(parseFractionalOdds(selection.odds || '1/1') || 1),
      })) : [],
      winStake: Number(formData.winStake || 0),
      placeStake: Number(formData.placeStake || 0),
      ewTerms: formData.ewTerms,
      placesPaid: Number(formData.placesPaid || 0),
      finishingPosition: Number(formData.finishingPosition || 0),
    }

    if (formData.betType === 'single') {
      const fractionalOdds = normalizeFractionalOdds(formData.odds)
      const decimalOdds = Number(parseFractionalOdds(formData.odds) || 1)
      const outcome = calculateCombinationBetResult({
        stake: Number(formData.stake || 0),
        selections: [{ odds: fractionalOdds, decimalOdds, event: formData.event.trim(), market: formData.market.trim(), selection: formData.selection.trim() }],
        betType: 'single',
        result: formData.result,
        cashOutAmount: Number(formData.cashOutAmount || 0),
      })

      onSubmit({
        ...baseBet,
        odds: fractionalOdds,
        fractionalOdds,
        decimalOdds,
        returns: outcome.returns,
        profit: outcome.profit,
      })
    }

    if (formData.betType !== 'single' && formData.betType !== 'each_way') {
      const accumulatorSelections = (formData.selections || []).map((selection) => ({
        ...selection,
        odds: normalizeFractionalOdds(selection.odds || '1/1'),
        decimalOdds: Number(parseFractionalOdds(selection.odds || '1/1') || 1),
      }))
      const combinedDecimalOdds = calculateAccumulatorOdds(accumulatorSelections)
      const outcome = calculateCombinationBetResult({
        stake: Number(formData.stake || 0),
        selections: accumulatorSelections,
        betType: formData.betType,
        result: formData.result,
        cashOutAmount: Number(formData.cashOutAmount || 0),
      })

      onSubmit({
        ...baseBet,
        odds: normalizeFractionalOdds(combinedDecimalOdds),
        fractionalOdds: normalizeFractionalOdds(combinedDecimalOdds),
        decimalOdds: combinedDecimalOdds,
        returns: outcome.returns,
        profit: outcome.profit,
        selections: accumulatorSelections,
      })
    }

    if (formData.betType === 'each_way') {
      const fractionalOdds = normalizeFractionalOdds(formData.odds)
      const decimalOdds = Number(parseFractionalOdds(formData.odds) || 1)
      const outcome = calculateEachWayResult({
        winStake: Number(formData.winStake || 0),
        placeStake: Number(formData.placeStake || 0),
        winOdds: fractionalOdds,
        ewTerms: formData.ewTerms,
        placesPaid: formData.placesPaid,
        finishingPosition: formData.finishingPosition,
        result: formData.result,
        cashOutAmount: Number(formData.cashOutAmount || 0),
      })

      onSubmit({
        ...baseBet,
        odds: fractionalOdds,
        fractionalOdds,
        decimalOdds,
        returns: outcome.returns,
        profit: outcome.profit,
        winStake: Number(formData.winStake || 0),
        placeStake: Number(formData.placeStake || 0),
      })
    }

    setFormData(defaultForm)
    setErrors({})
  }

  return (
    <Card id="add-bet-form" className="p-6 shadow-sm transition-shadow duration-200 hover:shadow-md">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-[var(--text)]">Add Bet</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">Record a new bet for tracking.</p>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit} aria-label="Add a new bet">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-1.5 text-sm font-medium text-[var(--text)]">
            Bet Type
            <select
              aria-label="Bet type"
              name="betType"
              value={formData.betType}
              onChange={handleChange}
              className="rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 py-2.5 text-[var(--text)] outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            >
              {BET_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1.5 text-sm font-medium text-[var(--text)]">
            Date
            <input
              aria-label="Bet date"
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 py-2.5 text-[var(--text)] outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </label>

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

          {getRequiredSelectionCount(formData.betType) <= 1 ? (
            <label className="flex flex-col gap-1.5 text-sm font-medium text-[var(--text)]">
              Fractional Odds
              <input
                aria-label="Fractional odds"
                type="text"
                name="odds"
                value={formData.odds}
                onChange={handleChange}
                placeholder="Example: 6/4"
                className="rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 py-2.5 text-[var(--text)] outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
              {errors.odds ? <span className="text-xs text-rose-600">{errors.odds}</span> : null}
            </label>
          ) : null}

          {formData.betType === 'each_way' ? (
            <>
              <label className="flex flex-col gap-1.5 text-sm font-medium text-[var(--text)]">
                Win Stake (£)
                <input
                  aria-label="Win stake"
                  type="number"
                  name="winStake"
                  min="0"
                  step="0.01"
                  value={formData.winStake}
                  onChange={handleChange}
                  className="rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 py-2.5 text-[var(--text)] outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
                {errors.winStake ? <span className="text-xs text-rose-600">{errors.winStake}</span> : null}
              </label>

              <label className="flex flex-col gap-1.5 text-sm font-medium text-[var(--text)]">
                Place Stake (£)
                <input
                  aria-label="Place stake"
                  type="number"
                  name="placeStake"
                  min="0"
                  step="0.01"
                  value={formData.placeStake}
                  onChange={handleChange}
                  className="rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 py-2.5 text-[var(--text)] outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
                {errors.placeStake ? <span className="text-xs text-rose-600">{errors.placeStake}</span> : null}
              </label>

              <label className="flex flex-col gap-1.5 text-sm font-medium text-[var(--text)]">
                EW Terms
                <input
                  aria-label="Each-way terms"
                  type="text"
                  name="ewTerms"
                  value={formData.ewTerms}
                  onChange={handleChange}
                  placeholder="1/4"
                  className="rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 py-2.5 text-[var(--text)] outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
                {errors.ewTerms ? <span className="text-xs text-rose-600">{errors.ewTerms}</span> : null}
              </label>

              <label className="flex flex-col gap-1.5 text-sm font-medium text-[var(--text)]">
                Places Paid
                <input
                  aria-label="Places paid"
                  type="number"
                  name="placesPaid"
                  min="1"
                  step="1"
                  value={formData.placesPaid}
                  onChange={handleChange}
                  className="rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 py-2.5 text-[var(--text)] outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
                {errors.placesPaid ? <span className="text-xs text-rose-600">{errors.placesPaid}</span> : null}
              </label>

              <label className="flex flex-col gap-1.5 text-sm font-medium text-[var(--text)]">
                Finishing Position
                <input
                  aria-label="Finishing position"
                  type="number"
                  name="finishingPosition"
                  min="1"
                  step="1"
                  value={formData.finishingPosition}
                  onChange={handleChange}
                  className="rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 py-2.5 text-[var(--text)] outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </label>
            </>
          ) : null}

          {getRequiredSelectionCount(formData.betType) > 1 ? (
            <div className="md:col-span-2 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
                  Selections ({(formData.selections || []).length} 
                  </h3>
                <Button type="button" variant="secondary" size="sm" onClick={addAccumulatorSelection}>Add selection</Button>
              </div>

              {(formData.selections || []).map((selection, index) => (
                <div key={selection.id} className="grid gap-3 rounded-2xl border border-[var(--border)] bg-[var(--panel-muted)] p-3 md:grid-cols-[1.2fr_1.1fr_1fr_0.9fr_auto]">
                  <input
                    aria-label={`Accumulator event ${index + 1}`}
                    value={selection.event}
                    onChange={(event) => handleAccumulatorSelectionChange(index, 'event', event.target.value)}
                    placeholder="Event"
                    className="rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 py-2.5 text-[var(--text)] outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                  <input
                    aria-label={`Accumulator market ${index + 1}`}
                    value={selection.market}
                    onChange={(event) => handleAccumulatorSelectionChange(index, 'market', event.target.value)}
                    placeholder="Market"
                    className="rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 py-2.5 text-[var(--text)] outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                  <input
                    aria-label={`Accumulator selection ${index + 1}`}
                    value={selection.selection}
                    onChange={(event) => handleAccumulatorSelectionChange(index, 'selection', event.target.value)}
                    placeholder="Selection"
                    className="rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 py-2.5 text-[var(--text)] outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                  <input
                    aria-label={`Accumulator odds ${index + 1}`}
                    value={selection.odds}
                    onChange={(event) => handleAccumulatorSelectionChange(index, 'odds', event.target.value)}
                    placeholder="6/4"
                    className="rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 py-2.5 text-[var(--text)] outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                  <Button type="button" variant="secondary" size="sm" onClick={() => removeAccumulatorSelection(index)} disabled={(formData.selections || []).length <= 2}>Remove</Button>
                </div>
              ))}

              {errors.selections ? <span className="text-xs text-rose-600">{errors.selections}</span> : null}
              <div className="rounded-xl border border-[var(--border)] bg-[var(--panel-muted)] p-3 text-sm text-[var(--muted)]">
                Combined odds: <span className="font-semibold text-[var(--text)]">{normalizeFractionalOdds(accumulatorOdds)}</span>
              </div>
            </div>
          ) : null}

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
              <option value="Cashed Out">Cashed Out</option>
            </select>
          </label>

          {formData.result === 'Cashed Out' ? (
            <label className="flex flex-col gap-1.5 text-sm font-medium text-[var(--text)] md:col-span-2">
              Cash Out Amount (£)
              <input
                aria-label="Cash out amount"
                type="number"
                name="cashOutAmount"
                min="0"
                step="0.01"
                value={formData.cashOutAmount}
                onChange={handleChange}
                className="rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 py-2.5 text-[var(--text)] outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
              {errors.cashOutAmount ? <span className="text-xs text-rose-600">{errors.cashOutAmount}</span> : null}
            </label>
          ) : null}
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel-muted)] p-3 text-sm text-[var(--muted)]">
          {getRequiredSelectionCount(formData.betType) > 1 ? (
            <>
              Combined odds: <span className="font-semibold text-[var(--text)]">{normalizeFractionalOdds(accumulatorOdds)}</span> •
              Returns: <span className="font-semibold text-[var(--text)]">£{(Number(formData.stake || 0) * accumulatorOdds).toFixed(2)}</span> •
              Profit: <span className="font-semibold text-[var(--text)]">£{(Number(formData.stake || 0) * accumulatorOdds - Number(formData.stake || 0)).toFixed(2)}</span>
            </>
          ) : formData.betType === 'each_way' ? (
            <>
              Preview: returns <span className="font-semibold text-[var(--text)]">£{eachWayPreview.returns.toFixed(2)}</span> • profit <span className="font-semibold text-[var(--text)]">£{eachWayPreview.profit.toFixed(2)}</span>
            </>
          ) : (
            <>
              Preview: returns <span className="font-semibold text-[var(--text)]">£{(Number(formData.stake || 0) * (Number(parseFractionalOdds(formData.odds) || 1))).toFixed(2)}</span> • profit <span className="font-semibold text-[var(--text)]">£{(Number(formData.stake || 0) * (Number(parseFractionalOdds(formData.odds) || 1)) - Number(formData.stake || 0)).toFixed(2)}</span>
            </>
          )}
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
