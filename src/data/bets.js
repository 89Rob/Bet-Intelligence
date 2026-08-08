export const betTemplate = {
  id: '',
  date: '',
  sport: 'Football',
  event: '',
  market: '',
  selection: '',
  bookmaker: '',
  stake: 0,
  betType: 'single',
  result: 'Pending',
  status: 'Pending',
  odds: '1/1',
  fractionalOdds: '1/1',
  decimalOdds: 2,
  returns: 0,
  profit: 0,
  cashOutAmount: 0,
  notes: '',
  selections: [],
  winStake: 0,
  placeStake: 0,
  ewTerms: '1/4',
  placesPaid: 3,
  finishingPosition: null,
  metadata: {},
}

export const BET_TYPE_OPTIONS = [
  { value: 'single', label: 'Single' },
  { value: 'double', label: 'Double' },
  { value: 'treble', label: 'Treble' },
  { value: 'four_fold', label: '4 Fold' },
  { value: 'five_fold', label: '5 Fold' },
  { value: 'six_fold', label: '6 Fold' },
  { value: 'seven_fold', label: '7 Fold' },
  { value: 'eight_fold', label: '8 Fold' },
  { value: 'nine_fold', label: '9 Fold' },
  { value: 'ten_fold', label: '10 Fold' },
  { value: 'accumulator', label: 'Accumulator' },
  { value: 'patent', label: 'Patent' },
  { value: 'trixie', label: 'Trixie' },
  { value: 'yankee', label: 'Yankee' },
  { value: 'canadian', label: 'Canadian' },
  { value: 'heinz', label: 'Heinz' },
  { value: 'super_heinz', label: 'Super Heinz' },
  { value: 'goliath', label: 'Goliath' },
  { value: 'lucky_15', label: 'Lucky 15' },
  { value: 'lucky_31', label: 'Lucky 31' },
  { value: 'lucky_63', label: 'Lucky 63' },
]

export function getRequiredSelectionCount(betType) {
  const countMap = {
    single: 1,
    double: 2,
    treble: 3,
    four_fold: 4,
    five_fold: 5,
    six_fold: 6,
    seven_fold: 7,
    eight_fold: 8,
    nine_fold: 9,
    ten_fold: 10,
    accumulator: 2,
    patent: 3,
    trixie: 3,
    yankee: 4,
    canadian: 5,
    heinz: 6,
    super_heinz: 7,
    goliath: 8,
    lucky_15: 4,
    lucky_31: 5,
    lucky_63: 6,
  }

  return countMap[betType] ?? 1
}

function getCombinationSizes(betType) {
  const sizeMap = {
    single: [1],
    double: [2],
    treble: [3],
    four_fold: [4],
    five_fold: [5],
    six_fold: [6],
    seven_fold: [7],
    eight_fold: [8],
    nine_fold: [9],
    ten_fold: [10],
    accumulator: [null],
    patent: [1, 2, 3],
    trixie: [2, 3],
    yankee: [2, 3, 4],
    canadian: [2, 3, 4, 5],
    heinz: [2, 3, 4, 5, 6],
    super_heinz: [2, 3, 4, 5, 6, 7],
    goliath: [2, 3, 4, 5, 6, 7, 8],
    lucky_15: [1, 2, 3, 4],
    lucky_31: [1, 2, 3, 4, 5],
    lucky_63: [1, 2, 3, 4, 5, 6],
  }

  return sizeMap[betType] ?? [1]
}

function getSubsetCombinations(items, size) {
  if (size === null || size === undefined) {
    return [items]
  }

  if (size <= 0 || size > items.length) {
    return []
  }

  const results = []

  const walk = (startIndex, currentSubset) => {
    if (currentSubset.length === size) {
      results.push([...currentSubset])
      return
    }

    for (let index = startIndex; index < items.length; index += 1) {
      currentSubset.push(items[index])
      walk(index + 1, currentSubset)
      currentSubset.pop()
    }
  }

  walk(0, [])
  return results
}

function totalCombinationCount(totalSelections, combinationSize) {
  if (combinationSize === null || combinationSize === undefined) {
    return 1
  }

  if (combinationSize <= 0 || combinationSize > totalSelections) {
    return 0
  }

  let combinations = 1
  for (let index = 0; index < combinationSize; index += 1) {
    combinations = (combinations * (totalSelections - index)) / (index + 1)
  }

  return Math.round(combinations)
}

function getTotalStakePerLine(stake, betType, totalSelections) {
  const sizes = getCombinationSizes(betType)
  const totalLines = sizes.reduce((count, size) => count + totalCombinationCount(totalSelections, size), 0)

  if (totalLines <= 0) {
    return Number(stake || 0)
  }

  return Number(stake || 0) / totalLines
}

export function calculateCombinationBetResult({ stake, selections, betType, result, cashOutAmount }) {
  const safeStake = Number(stake || 0)
  const validSelections = (selections || []).filter((selection) => selection && parseFractionalOdds(selection.odds || selection.fractionalOdds || selection.decimalOdds))

  if (!validSelections.length) {
    return { returns: 0, profit: 0 }
  }

  if (result === 'Cashed Out') {
    const cashOutValue = Number(cashOutAmount || 0)
    return {
      returns: Number(cashOutValue.toFixed(2)),
      profit: Number((cashOutValue - safeStake).toFixed(2)),
    }
  }

  if (result === 'Void' || result === 'Pending') {
    return { returns: 0, profit: 0 }
  }

  if (result === 'Lost') {
    return {
      returns: 0,
      profit: Number((-safeStake).toFixed(2)),
    }
  }

  const lineStake = getTotalStakePerLine(safeStake, betType, validSelections.length)
  const sizes = getCombinationSizes(betType)
  let returns = 0

  for (const size of sizes) {
    const combinations = getSubsetCombinations(validSelections, size)

    for (const subset of combinations) {
      const productOdds = subset.reduce((accumulator, selection) => {
        const decimalOdds = Number(parseFractionalOdds(selection.odds || selection.fractionalOdds || selection.decimalOdds) || selection.decimalOdds || 1)
        return accumulator * decimalOdds
      }, 1)

      returns += lineStake * productOdds
    }
  }

  return {
    returns: Number(returns.toFixed(2)),
    profit: Number((returns - safeStake).toFixed(2)),
  }
}

export function parseFractionalOdds(value) {
  if (value === null || value === undefined) {
    return null
  }

  const cleanValue = String(value).trim()
  if (!cleanValue) {
    return null
  }

  const fractionMatch = cleanValue.match(/^\s*(\d+)\s*\/\s*(\d+)\s*$/)
  if (fractionMatch) {
    const numerator = Number(fractionMatch[1])
    const denominator = Number(fractionMatch[2])

    if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator <= 0) {
      return null
    }

    return Number((1 + numerator / denominator).toFixed(4))
  }

  const decimalValue = Number(cleanValue)
  if (!Number.isFinite(decimalValue) || decimalValue <= 1) {
    return null
  }

  return Number(decimalValue.toFixed(4))
}

export function normalizeFractionalOdds(value) {
  if (value === null || value === undefined) {
    return '1/1'
  }

  const cleanValue = String(value).trim()
  if (!cleanValue) {
    return '1/1'
  }

  const fractionMatch = cleanValue.match(/^\s*(\d+)\s*\/\s*(\d+)\s*$/)
  if (fractionMatch) {
    const numerator = Number(fractionMatch[1])
    const denominator = Number(fractionMatch[2])

    if (denominator > 0) {
      return `${numerator}/${denominator}`
    }
  }

  const decimalValue = Number(cleanValue)
  if (!Number.isFinite(decimalValue) || decimalValue <= 1) {
    return '1/1'
  }

  return decimalToFractional(decimalValue)
}

export function decimalToFractional(decimalOdds) {
  const safeValue = Number(decimalOdds)
  if (!Number.isFinite(safeValue) || safeValue <= 1) {
    return '1/1'
  }

  const numerator = Math.round((safeValue - 1) * 1000)
  const denominator = 1000
  const gcd = greatestCommonDivisor(numerator, denominator)

  return `${Math.round(numerator / gcd)}/${Math.round(denominator / gcd)}`
}

function greatestCommonDivisor(a, b) {
  let x = Math.abs(a)
  let y = Math.abs(b)

  while (y) {
    const remainder = x % y
    x = y
    y = remainder
  }

  return x || 1
}

export function formatFractionalOdds(value) {
  if (typeof value === 'string') {
    const normalized = value.trim()
    if (!normalized) {
      return '1/1'
    }

    if (/^\d+\s*\/\s*\d+$/.test(normalized)) {
      return normalized.replace(/\s+/g, '')
    }
  }

  const decimalValue = Number(value)
  if (!Number.isFinite(decimalValue) || decimalValue <= 1) {
    return '1/1'
  }

  return decimalToFractional(decimalValue)
}

export function parseEwTerm(value) {
  if (value === null || value === undefined || value === '') {
    return 0.25
  }

  const term = String(value).trim()
  const fractionMatch = term.match(/^\s*(\d+)\s*\/\s*(\d+)\s*$/)
  if (fractionMatch) {
    const numerator = Number(fractionMatch[1])
    const denominator = Number(fractionMatch[2])
    if (Number.isFinite(numerator) && Number.isFinite(denominator) && denominator > 0) {
      return numerator / denominator
    }
  }

  const numericValue = Number(term)
  if (Number.isFinite(numericValue) && numericValue > 0) {
    return numericValue
  }

  return 0.25
}

export function calculateAccumulatorOdds(selections = []) {
  const validSelections = selections.filter((selection) => selection && parseFractionalOdds(selection.odds || selection.fractionalOdds || selection.decimalOdds))
  if (!validSelections.length) {
    return 1
  }

  return validSelections.reduce((accumulator, selection) => {
    const decimalOdds = parseFractionalOdds(selection.odds || selection.fractionalOdds || selection.decimalOdds)
    return accumulator * (decimalOdds || Number(selection.decimalOdds) || 1)
  }, 1)
}

function calculateCashOut({ stake, amount, result }) {
  const cashOutAmount = Number(amount || 0)
  const safeStake = Number(stake || 0)

  if (result === 'Cashed Out') {
    return {
      returns: Number(cashOutAmount.toFixed(2)),
      profit: Number((cashOutAmount - safeStake).toFixed(2)),
    }
  }

  return {
    returns: 0,
    profit: 0,
  }
}

export function calculateSingleBetResult({ stake, decimalOdds, result, cashOutAmount }) {
  const safeStake = Number(stake || 0)
  const safeDecimalOdds = Number(decimalOdds || 1)
  const returns = safeStake * safeDecimalOdds

  if (result === 'Cashed Out') {
    return calculateCashOut({ stake: safeStake, amount: cashOutAmount, result })
  }

  if (result === 'Won') {
    return {
      returns: Number(returns.toFixed(2)),
      profit: Number((returns - safeStake).toFixed(2)),
    }
  }

  if (result === 'Lost') {
    return {
      returns: 0,
      profit: Number((-safeStake).toFixed(2)),
    }
  }

  if (result === 'Void') {
    return { returns: 0, profit: 0 }
  }

  return { returns: 0, profit: 0 }
}

export function calculateAccumulatorResult({ stake, selections, result, cashOutAmount }) {
  const safeStake = Number(stake || 0)
  const combinedDecimalOdds = calculateAccumulatorOdds(selections)
  const returns = safeStake * combinedDecimalOdds

  if (result === 'Cashed Out') {
    return calculateCashOut({ stake: safeStake, amount: cashOutAmount, result })
  }

  if (result === 'Won') {
    return {
      returns: Number(returns.toFixed(2)),
      profit: Number((returns - safeStake).toFixed(2)),
    }
  }

  if (result === 'Lost') {
    return {
      returns: 0,
      profit: Number((-safeStake).toFixed(2)),
    }
  }

  return { returns: 0, profit: 0 }
}

export function calculateEachWayResult({ winStake, placeStake, winOdds, ewTerms, placesPaid, finishingPosition, result, cashOutAmount }) {
  const safeWinStake = Number(winStake || 0)
  const safePlaceStake = Number(placeStake || 0)
  const totalStake = safeWinStake + safePlaceStake
  const safeWinOdds = Number(parseFractionalOdds(winOdds) || 1)
  const ewFraction = parseEwTerm(ewTerms)
  const placeOdds = 1 + (safeWinOdds - 1) * ewFraction
  const position = Number(finishingPosition || 0)
  const paidPlaces = Number(placesPaid || 0)

  if (result === 'Cashed Out') {
    return calculateCashOut({ stake: totalStake, amount: cashOutAmount, result })
  }

  if (result === 'Won') {
    const placeWin = position > 0 && position <= paidPlaces ? safePlaceStake * placeOdds : 0
    const winReturns = safeWinStake * safeWinOdds
    const totalReturns = winReturns + placeWin
    return {
      returns: Number(totalReturns.toFixed(2)),
      profit: Number((totalReturns - totalStake).toFixed(2)),
    }
  }

  if (result === 'Lost') {
    return {
      returns: 0,
      profit: Number((-totalStake).toFixed(2)),
    }
  }

  if (result === 'Void') {
    return { returns: 0, profit: 0 }
  }

  return { returns: 0, profit: 0 }
}

export function calculateBetReturns({ stake, odds, result, decimalOdds, betType, selections, winStake, placeStake, ewTerms, placesPaid, finishingPosition, cashOutAmount }) {
  const safeStake = Number(stake || 0)

  if (['double', 'treble', 'four_fold', 'five_fold', 'six_fold', 'seven_fold', 'eight_fold', 'nine_fold', 'ten_fold', 'accumulator', 'patent', 'trixie', 'yankee', 'canadian', 'heinz', 'super_heinz', 'goliath', 'lucky_15', 'lucky_31', 'lucky_63'].includes(betType)) {
    return calculateCombinationBetResult({ stake: safeStake, selections, betType, result, cashOutAmount }).returns
  }

  if (betType === 'each_way') {
    return calculateEachWayResult({ winStake, placeStake, winOdds: odds, ewTerms, placesPaid, finishingPosition, result, cashOutAmount }).returns
  }

  const safeDecimalOdds = Number(decimalOdds || parseFractionalOdds(odds) || 1)
  return calculateSingleBetResult({ stake: safeStake, decimalOdds: safeDecimalOdds, result, cashOutAmount }).returns
}

export function calculateBetProfit({ stake, odds, result, decimalOdds, betType, selections, winStake, placeStake, ewTerms, placesPaid, finishingPosition, cashOutAmount }) {
  const safeStake = Number(stake || 0)

  if (['double', 'treble', 'four_fold', 'five_fold', 'six_fold', 'seven_fold', 'eight_fold', 'nine_fold', 'ten_fold', 'accumulator', 'patent', 'trixie', 'yankee', 'canadian', 'heinz', 'super_heinz', 'goliath', 'lucky_15', 'lucky_31', 'lucky_63'].includes(betType)) {
    return calculateCombinationBetResult({ stake: safeStake, selections, betType, result, cashOutAmount }).profit
  }

  if (betType === 'each_way') {
    return calculateEachWayResult({ winStake, placeStake, winOdds: odds, ewTerms, placesPaid, finishingPosition, result, cashOutAmount }).profit
  }

  const safeDecimalOdds = Number(decimalOdds || parseFractionalOdds(odds) || 1)
  return calculateSingleBetResult({ stake: safeStake, decimalOdds: safeDecimalOdds, result, cashOutAmount }).profit
}

export const mockBets = []
