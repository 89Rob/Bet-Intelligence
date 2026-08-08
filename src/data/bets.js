export const betTemplate = {
  id: '',
  date: '',
  sport: 'Football',
  event: '',
  market: '',
  selection: '',
  bookmaker: '',
  stake: 0,
  odds: 1.0,
  result: 'Pending',
  profit: 0,
  notes: '',
}

export function calculateBetProfit({ stake, odds, result }) {
  if (result === 'Won') {
    return Number((stake * (odds - 1)).toFixed(2))
  }

  if (result === 'Lost') {
    return Number((-stake).toFixed(2))
  }

  return 0
}

export const mockBets = []
