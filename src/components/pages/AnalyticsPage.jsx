import ProfessionalAnalytics from '../analytics/ProfessionalAnalytics'
import Card from '../ui/Card'
import PageHeader from '../ui/PageHeader'
import { useEffect, useState } from 'react'
import { mockBets } from '../../data/bets'

const BETS_STORAGE_KEY = 'bet-intelligence-bets'

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
    return Array.isArray(parsed) ? parsed : mockBets
  } catch (error) {
    console.error('Failed to load analytics data:', error)
    return mockBets
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
    return () => window.removeEventListener('storage', sync)
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
          <p className="mt-3 text-3xl font-semibold text-[var(--text)]">{bets.length}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-[var(--muted)]">Profit tracked</p>
          <p className="mt-3 text-3xl font-semibold text-[var(--text)]">£{bets.reduce((sum, bet) => sum + Number(bet.profit || 0), 0).toFixed(2)}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-[var(--muted)]">Latest snapshot</p>
          <p className="mt-3 text-base font-semibold text-[var(--text)]">Live portfolio view</p>
        </Card>
      </div>

      <ProfessionalAnalytics bets={bets} />
    </>
  )
}

export default AnalyticsPage
