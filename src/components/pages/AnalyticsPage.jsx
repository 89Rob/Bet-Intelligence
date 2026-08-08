import ProfessionalAnalytics from '../analytics/ProfessionalAnalytics'
import Card from '../ui/Card'
import PageHeader from '../ui/PageHeader'
import { useEffect, useState } from 'react'

const BETS_STORAGE_KEY = 'bet-intelligence-bets'

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
    return Array.isArray(parsed) ? parsed : []
  } catch (error) {
    console.error('Failed to load analytics data:', error)
    return []
  }
}

function AnalyticsPage() {
  const [bets, setBets] = useState(() => getStoredBets())

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const sync = () => {
      setBets(getStoredBets())
    }

    window.addEventListener('storage', sync)
    window.addEventListener('bet-data-updated', sync)
    return () => {
      window.removeEventListener('storage', sync)
      window.removeEventListener('bet-data-updated', sync)
    }
  }, [])

  return (
    <>
      <PageHeader
        eyebrow="Performance"
        title="Analytics"
        description="Review profit trends, bankroll movement, and the strongest segments of your betting portfolio."
      />

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <Card className="p-5">
          <p className="text-sm text-[var(--muted)]">Visible bets</p>
          <p className="mt-3 text-3xl font-semibold text-[var(--text)]">0</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-[var(--muted)]">Profit tracked</p>
          <p className="mt-3 text-3xl font-semibold text-[var(--text)]">£0.00</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-[var(--muted)]">Latest snapshot</p>
          <p className="mt-3 text-base font-semibold text-[var(--text)]">No data yet</p>
        </Card>
      </div>

      <Card className="p-8 text-center">
        <h2 className="text-xl font-semibold text-[var(--text)]">No betting data available yet.</h2>
        <p className="mt-2 text-sm text-[var(--muted)]">Add your first bet to begin tracking profit, ROI, and trends.</p>
      </Card>
    </>
  )
}

export default AnalyticsPage
