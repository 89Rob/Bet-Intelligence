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

  const totalOdds = bets.reduce((sum, bet) => sum + Number(bet.odds || 0), 0)
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
