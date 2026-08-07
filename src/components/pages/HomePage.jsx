import { useEffect, useRef, useState } from 'react'
import Button from '../ui/Button'
import Card from '../ui/Card'
import PageHeader from '../ui/PageHeader'
import StatCard from '../ui/StatCard'
import DashboardLayout from '../layout/DashboardLayout'
import BetTable from '../BetTable'
import AddBetForm from '../forms/AddBetForm'
import { calculateBetProfit, mockBets } from '../../data/bets'
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

  const normalized = {
    id: String(rawBet.id || `BET-${Date.now()}-${Math.random().toString(16).slice(2)}`),
    date: rawBet.date || new Date().toISOString().split('T')[0],
    sport: rawBet.sport || 'Football',
    event: String(rawBet.event || '').trim(),
    market: String(rawBet.market || '').trim(),
    selection: String(rawBet.selection || '').trim(),
    bookmaker: String(rawBet.bookmaker || '').trim(),
    stake: Number(rawBet.stake) || 0,
    odds: Number(rawBet.odds) || 1,
    result: rawBet.result || 'Pending',
    profit: Number(rawBet.profit ?? calculateBetProfit(rawBet)),
    notes: String(rawBet.notes || '').trim(),
  }

  if (!normalized.event || !normalized.market || !normalized.selection || !normalized.bookmaker) {
    return null
  }

  return normalized
}

function getStoredBets() {
  if (typeof window === 'undefined') {
    return mockBets
  }

  try {
    const savedBets = localStorage.getItem(BETS_STORAGE_KEY)
    if (!savedBets) {
      return mockBets
    }

    const parsed = JSON.parse(savedBets)
    if (!Array.isArray(parsed)) {
      return mockBets
    }

    const normalized = parsed.map(normalizeBet).filter(Boolean)
    return normalized.length > 0 ? normalized : mockBets
  } catch (error) {
    console.error('Failed to load saved bets:', error)
    return mockBets
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

function HomePage() {
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
    const combinedText = [bet.event, bet.selection, bet.bookmaker, bet.market]
      .join(' ')
      .toLowerCase()
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
    }

    setBets((currentBets) => [betToAdd, ...currentBets])
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
    <DashboardLayout>
      <PageHeader
        eyebrow="Operations"
        title="Welcome back"
        description="Overview of your betting activity and upcoming opportunities."
        actions={
          <>
            <Button variant="secondary" size="sm">
              Filters
            </Button>
            <Button size="sm">Create report</Button>
          </>
        }
      />

      <section className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Staked" value={`£${totalStaked.toFixed(2)}`} change="All bets" tone="indigo" />
        <StatCard label="Total Profit" value={`£${totalProfit.toFixed(2)}`} change="Net" tone="warning" />
        <StatCard label="ROI" value={`${roi.toFixed(1)}%`} change="Profit / stake" tone="success" />
        <StatCard label="Average Stake" value={`£${averageStake.toFixed(2)}`} change="Per bet" tone="neutral" />
      </section>

      <section className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Average Odds" value={averageOdds.toFixed(2)} change="Decimal" tone="indigo" />
        <StatCard label="Win Rate" value={`${winRate.toFixed(1)}%`} change="Settled" tone="success" />
        <StatCard label="Winning Bets" value={String(winningBets)} change="Won" tone="success" />
        <StatCard label="Losing Bets" value={String(losingBets)} change="Lost" tone="warning" />
      </section>

      <section className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Pending Bets" value={String(pendingBets)} change="Open" tone="neutral" />
        <StatCard label="Best Sport" value={bestSport} change="Highest profit" tone="indigo" />
        <StatCard label="Worst Sport" value={worstSport} change="Lowest profit" tone="warning" />
        <StatCard label="Tracked Bets" value={String(filteredBets.length)} change="Visible" tone="neutral" />
      </section>

      <section className="mb-8">
        <ProfessionalAnalytics bets={filteredBets} />
      </section>

      <section className="mb-8 grid gap-4 xl:grid-cols-2">
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-[var(--text)]">Data Management</h2>
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
            <div
              className={[
                'mt-4 rounded-xl border px-3 py-2 text-sm',
                notification.type === 'success'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  : 'border-rose-200 bg-rose-50 text-rose-700',
              ].join(' ')}
            >
              {notification.text}
            </div>
          ) : null}
        </Card>

        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-[var(--text)]">Backup History</h2>
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
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => handleRestoreBackup(backup.id)}
                    disabled={processing.restore || processing.export || processing.import || processing.backup || processing.reset}
                  >
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
              <h2 className="text-xl font-semibold text-slate-900">Betting Records</h2>
              <p className="text-sm text-slate-500">Recent football bets tracked in the system.</p>
            </div>
            <span className="rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-medium text-indigo-700">
              {filteredBets.length} bets
            </span>
          </div>

          <Card className="mb-4 p-4">
            <div className="space-y-4">
              <label className="block text-sm font-medium text-slate-700">
                Search
                <input
                  id="bet-search"
                  type="text"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search event, selection, bookmaker or market"
                  aria-label="Search bets"
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </label>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block text-sm font-medium text-slate-700">
                  Sport
                  <select
                    value={sportFilter}
                    onChange={(event) => setSportFilter(event.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  >
                    {sports.map((sport) => (
                      <option key={sport} value={sport}>
                        {sport}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block text-sm font-medium text-slate-700">
                  Result
                  <select
                    value={resultFilter}
                    onChange={(event) => setResultFilter(event.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
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
        </div>
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Recent Activity</h2>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
              Placeholder
            </span>
          </div>
          <div className="space-y-4">
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
              No recent activity yet.
            </div>
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
              Upcoming insights will appear here.
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Upcoming Matches</h2>
            <span className="rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-medium text-indigo-700">
              Soon
            </span>
          </div>
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
              No games scheduled.
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
              Match listings will be added later.
            </div>
          </div>
        </Card>
      </section>
    </DashboardLayout>
  )
}

export default HomePage
