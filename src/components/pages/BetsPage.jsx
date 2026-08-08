import { useEffect, useRef, useState } from 'react'
import Button from '../ui/Button'
import Card from '../ui/Card'
import PageHeader from '../ui/PageHeader'
import BetTable from '../BetTable'
import AddBetForm from '../forms/AddBetForm'
import {
  calculateBetProfit,
  formatFractionalOdds,
  normalizeFractionalOdds,
  parseFractionalOdds,
} from '../../data/bets'
import {
  calculateAverageOdds,
  calculateAverageStake,
  calculateLosingBets,
  calculatePendingBets,
  calculateRoi,
  calculateSportPerformance,
  calculateTotalProfit,
  calculateTotalStaked,
  calculateWinRate,
  calculateWinningBets,
} from '../../lib/analytics'

const BETS_STORAGE_KEY = 'bet-intelligence-bets'
const BACKUPS_STORAGE_KEY = 'bet-intelligence-backups'

function normalizeBet(rawBet) {
  if (!rawBet || typeof rawBet !== 'object') {
    return null
  }

  const originalFractionalOdds = typeof rawBet.fractionalOdds === 'string'
    ? rawBet.fractionalOdds
    : typeof rawBet.odds === 'string'
      ? rawBet.odds
      : null

  const oddsSource = originalFractionalOdds ?? rawBet.decimalOdds ?? rawBet.odds ?? '1/1'
  const fractionalOdds = normalizeFractionalOdds(oddsSource)
  const parsedDecimalOdds = Number(rawBet.decimalOdds ?? parseFractionalOdds(fractionalOdds) ?? Number(rawBet.odds) ?? 1)
  const decimalOdds = Number.isFinite(parsedDecimalOdds) && parsedDecimalOdds > 0 ? parsedDecimalOdds : 1
  const stake = Number(rawBet.stake) || 0

  const normalized = {
    id: String(rawBet.id || `BET-${Date.now()}-${Math.random().toString(16).slice(2)}`),
    date: rawBet.date || new Date().toISOString().split('T')[0],
    sport: rawBet.sport || 'Football',
    event: String(rawBet.event || '').trim(),
    market: String(rawBet.market || '').trim(),
    selection: String(rawBet.selection || '').trim(),
    bookmaker: String(rawBet.bookmaker || '').trim(),
    stake,
    betType: rawBet.betType || 'single',
    odds: fractionalOdds,
    fractionalOdds,
    decimalOdds,
    returns: Number(rawBet.returns ?? (stake * decimalOdds).toFixed(2)),
    result: rawBet.result || 'Pending',
    status: rawBet.status || rawBet.result || 'Pending',
    profit: Number(rawBet.profit ?? calculateBetProfit({
      ...rawBet,
      stake,
      odds: fractionalOdds,
      decimalOdds,
      betType: rawBet.betType || 'single',
      selections: Array.isArray(rawBet.selections) ? rawBet.selections : [],
      winStake: Number(rawBet.winStake || 0),
      placeStake: Number(rawBet.placeStake || 0),
      ewTerms: rawBet.ewTerms || '1/4',
      placesPaid: Number(rawBet.placesPaid || 0),
      finishingPosition: Number(rawBet.finishingPosition || 0),
      cashOutAmount: Number(rawBet.cashOutAmount || 0),
    })),
    notes: String(rawBet.notes || '').trim(),
    cashOutAmount: Number(rawBet.cashOutAmount || 0),
    selections: Array.isArray(rawBet.selections) ? rawBet.selections.map((selection) => ({
      ...selection,
      odds: normalizeFractionalOdds(selection.odds || '1/1'),
      decimalOdds: Number(parseFractionalOdds(selection.odds || '1/1') || 1),
    })) : [],
    winStake: Number(rawBet.winStake || 0),
    placeStake: Number(rawBet.placeStake || 0),
    ewTerms: rawBet.ewTerms || '1/4',
    placesPaid: Number(rawBet.placesPaid || 0),
    finishingPosition: Number(rawBet.finishingPosition || 0),
    metadata: rawBet.metadata || {},
  }

  if (!normalized.event || !normalized.market || !normalized.selection || !normalized.bookmaker) {
    return null
  }

  return normalized
}

function getStoredBets() {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const savedBets = localStorage.getItem(BETS_STORAGE_KEY)
    if (!savedBets) {
      return []
    }

    const parsed = JSON.parse(savedBets)
    if (!Array.isArray(parsed)) {
      return []
    }

    const normalized = parsed.map(normalizeBet).filter(Boolean)
    return normalized.length > 0 ? normalized : []
  } catch (error) {
    console.error('Failed to load saved bets:', error)
    return []
  }
}

function getStoredBackups() {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const rawBackups = localStorage.getItem(BACKUPS_STORAGE_KEY)
    if (!rawBackups) {
      return []
    }

    const parsed = JSON.parse(rawBackups)
    return Array.isArray(parsed) ? parsed : []
  } catch (error) {
    console.error('Failed to load backups:', error)
    return []
  }
}

function formatBackupDate(value) {
  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function BetsPage() {
  const [bets, setBets] = useState(() => getStoredBets())
  const [backups, setBackups] = useState(() => getStoredBackups())
  const [searchTerm, setSearchTerm] = useState('')
  const [sportFilter, setSportFilter] = useState('All')
  const [resultFilter, setResultFilter] = useState('All')
  const [notification, setNotification] = useState({ type: '', text: '' })
  const [processing, setProcessing] = useState({
    export: false,
    import: false,
    backup: false,
    restore: false,
    reset: false,
  })
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(BETS_STORAGE_KEY, JSON.stringify(bets))
    }
  }, [bets])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(BACKUPS_STORAGE_KEY, JSON.stringify(backups))
    }
  }, [backups])

  useEffect(() => {
    if (!notification.text) {
      return undefined
    }

    const timer = window.setTimeout(() => {
      setNotification({ type: '', text: '' })
    }, 3000)

    return () => window.clearTimeout(timer)
  }, [notification])

  const sports = ['All', ...new Set(bets.map((bet) => bet.sport).filter(Boolean))]

  const filteredBets = bets.filter((bet) => {
    const combinedText = [bet.event, bet.selection, bet.bookmaker, bet.market].join(' ').toLowerCase()
    const matchesSearch = !searchTerm || combinedText.includes(searchTerm.toLowerCase())
    const matchesSport = sportFilter === 'All' || bet.sport === sportFilter
    const matchesResult = resultFilter === 'All' || bet.result === resultFilter

    return matchesSearch && matchesSport && matchesResult
  })

  const totalStaked = calculateTotalStaked(filteredBets)
  const totalProfit = calculateTotalProfit(filteredBets)
  const roi = calculateRoi(totalProfit, totalStaked)
  const averageStake = calculateAverageStake(totalStaked, filteredBets.length)
  const averageOdds = calculateAverageOdds(filteredBets)
  const winRate = calculateWinRate(filteredBets)
  const winningBets = calculateWinningBets(filteredBets)
  const losingBets = calculateLosingBets(filteredBets)
  const pendingBets = calculatePendingBets(filteredBets)
  const { best: bestSport, worst: worstSport } = calculateSportPerformance(filteredBets)

  const showNotification = (type, text) => {
    setNotification({ type, text })
  }

  const handleAddBet = (newBet) => {
    const betToAdd = {
      ...newBet,
      profit: calculateBetProfit(newBet),
      returns: Number(newBet.returns ?? calculateBetProfit(newBet) + Number(newBet.stake || 0)),
    }

    setBets((currentBets) => [betToAdd, ...currentBets])
    window.dispatchEvent(new CustomEvent('bet-data-updated'))
    showNotification('success', 'Bet saved successfully.')
  }

  const handleExportBets = () => {
    setProcessing((current) => ({ ...current, export: true }))

    try {
      const payload = {
        exportedAt: new Date().toISOString(),
        bets,
      }

      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `bet-intelligence-export-${new Date().toISOString().replace(/[:.]/g, '-')}.json`
      link.click()
      URL.revokeObjectURL(url)

      showNotification('success', 'Bets exported successfully.')
    } catch (error) {
      console.error('Export failed:', error)
      showNotification('error', 'Export failed. Please try again.')
    } finally {
      setProcessing((current) => ({ ...current, export: false }))
    }
  }

  const handleImportBets = (event) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    setProcessing((current) => ({ ...current, import: true }))

    const reader = new FileReader()
    reader.onload = () => {
      try {
        const rawContent = reader.result
        if (typeof rawContent !== 'string') {
          throw new Error('The selected file could not be read.')
        }

        const parsed = JSON.parse(rawContent)
        const importedBets = Array.isArray(parsed?.bets) ? parsed.bets : Array.isArray(parsed) ? parsed : null

        if (!importedBets) {
          throw new Error('Invalid import file format.')
        }

        const normalized = importedBets.map(normalizeBet).filter(Boolean)
        if (normalized.length === 0) {
          throw new Error('No valid bets found in the import file.')
        }

        setBets(normalized)
        showNotification('success', 'Bets imported successfully.')
      } catch (error) {
        console.error('Import failed:', error)
        showNotification('error', error.message || 'Import failed. Please choose a valid JSON export.')
      } finally {
        setProcessing((current) => ({ ...current, import: false }))
        event.target.value = ''
      }
    }

    reader.onerror = () => {
      setProcessing((current) => ({ ...current, import: false }))
      event.target.value = ''
      showNotification('error', 'Unable to read the selected file.')
    }

    reader.readAsText(file)
  }

  const handleCreateBackup = () => {
    setProcessing((current) => ({ ...current, backup: true }))

    try {
      const backupEntry = {
        id: Date.now(),
        createdAt: new Date().toISOString(),
        bets,
      }

      setBackups((currentBackups) => [backupEntry, ...currentBackups])
      showNotification('success', 'Backup created successfully.')
    } catch (error) {
      console.error('Backup failed:', error)
      showNotification('error', 'Backup creation failed.')
    } finally {
      setProcessing((current) => ({ ...current, backup: false }))
    }
  }

  const handleRestoreBackup = (backupId) => {
    const selectedBackup = backups.find((backup) => backup.id === backupId)
    if (!selectedBackup) {
      showNotification('error', 'Backup not found.')
      return
    }

    setProcessing((current) => ({ ...current, restore: true }))

    try {
      const restoredBets = (Array.isArray(selectedBackup.bets) ? selectedBackup.bets : [])
        .map(normalizeBet)
        .filter(Boolean)

      if (restoredBets.length === 0) {
        throw new Error('This backup does not contain valid bets.')
      }

      setBets(restoredBets)
      showNotification('success', 'Backup restored successfully.')
    } catch (error) {
      console.error('Restore failed:', error)
      showNotification('error', error.message || 'Backup restore failed.')
    } finally {
      setProcessing((current) => ({ ...current, restore: false }))
    }
  }

  const handleClearAllBets = () => {
    const confirmed = window.confirm('Clear all bets and stored data? This action cannot be undone.')
    if (!confirmed) {
      return
    }

    setProcessing((current) => ({ ...current, reset: true }))

    try {
      setBets([])
      setBackups([])
      localStorage.removeItem(BETS_STORAGE_KEY)
      localStorage.removeItem(BACKUPS_STORAGE_KEY)
      showNotification('success', 'All bets and saved data were cleared.')
    } catch (error) {
      console.error('Reset failed:', error)
      showNotification('error', 'Reset failed. Please try again.')
    } finally {
      setProcessing((current) => ({ ...current, reset: false }))
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Ledger"
        title="Bet management"
        description="Track, search, import, and manage the records driving your portfolio."
      />

      <section className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="p-5">
          <p className="text-sm text-[var(--muted)]">Staked</p>
          <p className="mt-3 text-2xl font-semibold text-[var(--text)]">£0.00</p>
          <p className="mt-1 text-xs text-[var(--muted)]">Across 0 visible bets</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-[var(--muted)]">Profit</p>
          <p className="mt-3 text-2xl font-semibold text-[var(--text)]">£0.00</p>
          <p className="mt-1 text-xs text-[var(--muted)]">Net result</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-[var(--muted)]">ROI</p>
          <p className="mt-3 text-2xl font-semibold text-[var(--text)]">0%</p>
          <p className="mt-1 text-xs text-[var(--muted)]">Profit / stake</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-[var(--muted)]">Win rate</p>
          <p className="mt-3 text-2xl font-semibold text-[var(--text)]">0%</p>
          <p className="mt-1 text-xs text-[var(--muted)]">0 wins / 0 losses</p>
        </Card>
      </section>

      <section className="mb-8 grid gap-4 xl:grid-cols-2">
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-[var(--text)]">Data management</h2>
              <p className="text-sm text-[var(--muted)]">Export, import, backup, and reset your betting data.</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button type="button" size="sm" onClick={handleExportBets} disabled={processing.export || processing.import || processing.backup || processing.restore || processing.reset}>
              {processing.export ? 'Exporting...' : 'Export Bets'}
            </Button>
            <Button type="button" variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()} disabled={processing.export || processing.import || processing.backup || processing.restore || processing.reset}>
              {processing.import ? 'Importing...' : 'Import Bets'}
            </Button>
            <Button type="button" variant="secondary" size="sm" onClick={handleCreateBackup} disabled={processing.export || processing.import || processing.backup || processing.restore || processing.reset}>
              {processing.backup ? 'Creating Backup...' : 'Create Backup'}
            </Button>
            <Button type="button" variant="secondary" size="sm" onClick={handleClearAllBets} disabled={processing.export || processing.import || processing.backup || processing.restore || processing.reset}>
              {processing.reset ? 'Clearing...' : 'Clear All Bets'}
            </Button>
            <input ref={fileInputRef} type="file" accept=".json,application/json" className="hidden" onChange={handleImportBets} />
          </div>

          {notification.text ? (
            <div className={['mt-4 rounded-xl border px-3 py-2 text-sm', notification.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-rose-200 bg-rose-50 text-rose-700'].join(' ')}>
              {notification.text}
            </div>
          ) : null}
        </Card>

        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-[var(--text)]">Backup history</h2>
              <p className="text-sm text-[var(--muted)]">Restore a previous saved state.</p>
            </div>
          </div>

          {backups.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--panel-muted)] p-4 text-sm text-[var(--muted)]">
              No backups created yet.
            </div>
          ) : (
            <div className="space-y-3">
              {backups.map((backup) => (
                <div key={backup.id} className="flex items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--panel-muted)] p-3">
                  <div>
                    <p className="text-sm font-medium text-[var(--text)]">{formatBackupDate(backup.createdAt)}</p>
                    <p className="text-xs text-[var(--muted)]">{Array.isArray(backup.bets) ? backup.bets.length : 0} saved bets</p>
                  </div>
                  <Button type="button" size="sm" variant="secondary" onClick={() => handleRestoreBackup(backup.id)} disabled={processing.restore || processing.export || processing.import || processing.backup || processing.reset}>
                    {processing.restore ? 'Restoring...' : 'Restore'}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[1.1fr_1.4fr]">
        <AddBetForm onSubmit={handleAddBet} />

        <div>
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-[var(--text)]">Betting records</h2>
              <p className="text-sm text-[var(--muted)]">Search and filter the full ledger.</p>
            </div>
            <span className="rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-medium text-indigo-700">
              0 bets
            </span>
          </div>

          {filteredBets.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-lg font-semibold text-[var(--text)]">No bets added yet.</p>
              <Button
                type="button"
                className="mt-4"
                onClick={() => {
                  const addBetForm = document.getElementById('add-bet-form')
                  if (addBetForm) {
                    addBetForm.scrollIntoView({ behavior: 'smooth', block: 'start' })
                  }
                }}
              >
                Add your first bet
              </Button>
            </Card>
          ) : (
            <>
              <Card className="mb-4 p-4">
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-[var(--text)]">
                    Search
                    <input
                      id="bet-search"
                      type="text"
                      value={searchTerm}
                      onChange={(event) => setSearchTerm(event.target.value)}
                      placeholder="Search event, selection, bookmaker or market"
                      aria-label="Search bets"
                      className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--panel)] px-3 py-2 text-[var(--text)] outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    />
                  </label>

                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="block text-sm font-medium text-[var(--text)]">
                      Sport
                      <select
                        value={sportFilter}
                        onChange={(event) => setSportFilter(event.target.value)}
                        className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--panel)] px-3 py-2 text-[var(--text)] outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                      >
                        {sports.map((sport) => (
                          <option key={sport} value={sport}>
                            {sport}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="block text-sm font-medium text-[var(--text)]">
                      Result
                      <select
                        value={resultFilter}
                        onChange={(event) => setResultFilter(event.target.value)}
                        className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--panel)] px-3 py-2 text-[var(--text)] outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                      >
                        <option value="All">All</option>
                        <option value="Won">Won</option>
                        <option value="Lost">Lost</option>
                        <option value="Pending">Pending</option>
                        <option value="Void">Void</option>
                      </select>
                    </label>
                  </div>
                </div>
              </Card>

              <BetTable bets={filteredBets} />
            </>
          )}
        </div>
      </section>

      <section className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <Card className="p-5">
          <p className="text-sm text-[var(--muted)]">Average stake</p>
          <p className="mt-3 text-2xl font-semibold text-[var(--text)]">£{averageStake.toFixed(2)}</p>
          <p className="mt-1 text-xs text-[var(--muted)]">Per bet</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-[var(--muted)]">Average odds</p>
          <p className="mt-3 text-2xl font-semibold text-[var(--text)]">{formatFractionalOdds(averageOdds)}</p>
          <p className="mt-1 text-xs text-[var(--muted)]">Fractional</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-[var(--muted)]">Best sport</p>
          <p className="mt-3 text-2xl font-semibold text-[var(--text)]">{bestSport}</p>
          <p className="mt-1 text-xs text-[var(--muted)]">Highest return</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-[var(--muted)]">Open bets</p>
          <p className="mt-3 text-2xl font-semibold text-[var(--text)]">{pendingBets}</p>
          <p className="mt-1 text-xs text-[var(--muted)]">Awaiting settlement</p>
        </Card>
      </section>
    </>
  )
}

export default BetsPage
