export function calculateTotalStaked(bets) {
  return bets.reduce((sum, bet) => sum + Number(bet.stake || 0), 0)
}

export function calculateTotalProfit(bets) {
  return bets.reduce((sum, bet) => sum + Number(bet.profit || 0), 0)
}

export function calculateRoi(totalProfit, totalStaked) {
  if (!totalStaked) {
    return 0
  }

  return (totalProfit / totalStaked) * 100
}

export function calculateAverageStake(totalStaked, count) {
  if (!count) {
    return 0
  }

  return totalStaked / count
}

export function calculateAverageOdds(bets) {
  if (!bets.length) {
    return 0
  }

  const totalOdds = bets.reduce((sum, bet) => sum + Number(bet.decimalOdds ?? bet.odds ?? 0), 0)
  return totalOdds / bets.length
}

export function calculateWinRate(bets) {
  const settledBets = bets.filter((bet) => bet.result === 'Won' || bet.result === 'Lost')

  if (!settledBets.length) {
    return 0
  }

  const wins = bets.filter((bet) => bet.result === 'Won').length
  return (wins / settledBets.length) * 100
}

export function calculateWinningBets(bets) {
  return bets.filter((bet) => bet.result === 'Won').length
}

export function calculateLosingBets(bets) {
  return bets.filter((bet) => bet.result === 'Lost').length
}

export function calculatePendingBets(bets) {
  return bets.filter((bet) => bet.result === 'Pending').length
}

export function calculateAverageProfitPerBet(bets) {
  if (!bets.length) {
    return 0
  }

  return calculateTotalProfit(bets) / bets.length
}

export function calculateLargestWin(bets) {
  const wins = bets.filter((bet) => bet.result === 'Won').map((bet) => Number(bet.profit || 0))
  if (!wins.length) {
    return 0
  }

  return Math.max(...wins)
}

export function calculateLargestLoss(bets) {
  const losses = bets.filter((bet) => bet.result === 'Lost').map((bet) => Number(bet.profit || 0))
  if (!losses.length) {
    return 0
  }

  return Math.min(...losses)
}

export function calculateBestWinningStreak(bets) {
  let best = 0
  let current = 0

  bets.forEach((bet) => {
    if (bet.result === 'Won') {
      current += 1
      best = Math.max(best, current)
    } else {
      current = 0
    }
  })

  return best
}

export function calculateWorstLosingStreak(bets) {
  let worst = 0
  let current = 0

  bets.forEach((bet) => {
    if (bet.result === 'Lost') {
      current += 1
      worst = Math.max(worst, current)
    } else {
      current = 0
    }
  })

  return worst
}

export function calculateProfitOverTime(bets) {
  const ordered = [...bets].sort((a, b) => new Date(a.date) - new Date(b.date))
  let cumulative = 0

  return ordered.map((bet) => {
    cumulative += Number(bet.profit || 0)
    return {
      date: bet.date,
      profit: Number(bet.profit || 0),
      cumulative,
    }
  })
}

export function calculateMonthlyProfitSummary(bets) {
  const monthMap = new Map()

  bets.forEach((bet) => {
    const date = new Date(bet.date)
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    const label = date.toLocaleString('en-GB', { month: 'short', year: '2-digit' })

    if (!monthMap.has(key)) {
      monthMap.set(key, { label, total: 0 })
    }

    monthMap.get(key).total += Number(bet.profit || 0)
  })

  return [...monthMap.entries()].map(([key, value]) => ({
    key,
    label: value.label,
    total: value.total,
  }))
}

export function calculateProfitBySport(bets) {
  const grouped = bets.reduce((acc, bet) => {
    const key = bet.sport || 'Unknown'

    if (!acc[key]) {
      acc[key] = 0
    }

    acc[key] += Number(bet.profit || 0)
    return acc
  }, {})

  return Object.entries(grouped)
    .map(([sport, total]) => ({ sport, total }))
    .sort((a, b) => b.total - a.total)
}

export function calculateRecentForm(bets) {
  return [...bets]
    .slice(0, 10)
    .map((bet) => ({
      result: bet.result,
      event: bet.event,
    }))
}

export function calculateSportPerformance(bets) {
  const grouped = bets.reduce((acc, bet) => {
    const key = bet.sport || 'Unknown'

    if (!acc[key]) {
      acc[key] = 0
    }

    acc[key] += Number(bet.profit || 0)
    return acc
  }, {})

  const entries = Object.entries(grouped)
  if (!entries.length) {
    return { best: 'N/A', worst: 'N/A' }
  }

  const sortedByProfit = [...entries].sort((a, b) => b[1] - a[1])
  const sortedByWorst = [...entries].sort((a, b) => a[1] - b[1])

  return {
    best: sortedByProfit[0][0],
    worst: sortedByWorst[0][0],
  }
}

export function calculatePerformanceInsights(bets) {
  if (!bets.length) {
    return [
      'No bets are currently visible in the filtered view.',
      'Use the filters to broaden the selection and review the dataset.',
    ]
  }

  const totalProfit = calculateTotalProfit(bets)
  const totalStaked = calculateTotalStaked(bets)
  const winRate = calculateWinRate(bets)
  const bestSport = calculateProfitBySport(bets)[0]

  const insights = []

  if (totalProfit >= 0) {
    insights.push(`Your filtered results are up £${totalProfit.toFixed(2)} overall.`)
  } else {
    insights.push(`Your filtered results are down £${Math.abs(totalProfit).toFixed(2)} overall.`)
  }

  insights.push(`ROI sits at ${calculateRoi(totalProfit, totalStaked).toFixed(1)}% across £${totalStaked.toFixed(2)} staked.`)
  insights.push(`Win rate is ${winRate.toFixed(1)}% with ${calculateWinningBets(bets)} wins from the current set.`)

  if (bestSport) {
    insights.push(`${bestSport.sport} is the strongest sport in the current view with £${bestSport.total.toFixed(2)} in profit.`)
  }

  return insights
}
