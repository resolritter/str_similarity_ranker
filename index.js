const { distance } = require("fastest-levenshtein")

const defaultLowest = Number.MAX_SAFE_INTEGER

const hashPoint = (i, j) => `${i},${j}`

const computeDistanceMatrix = function(leftSet, rightSet) {
  const ij = {}
  const ji = {}

  for (let i = 0; i < leftSet.length; ++i) {
    for (let j = 0; j < rightSet.length; ++j) {
      ij[hashPoint(i, j)] = distance(leftSet[i], rightSet[j])
      ji[hashPoint(j, i)] = distance(rightSet[j], leftSet[i])
    }
  }

  return { ij, ji }
}

const getNextExclusiveCombination = function(
  { ij, ji },
  leftSet,
  rightSet,
  historyLeft,
  historyRight,
) {
  const nextCombination = [defaultLowest]
  let distance

  nextI: for (let i = 0; i < leftSet.length; ++i) {
    for (const h of historyLeft) {
      if (h === i) {
        continue nextI
      }
    }
    nextJ: for (let j = 0; j < rightSet.length; ++j) {
      for (const h of historyRight) {
        if (h === j) {
          continue nextJ
        }
      }
      if (
        (distance = Math.min(ij[hashPoint(i, j)], ji[hashPoint(j, i)])) <
        nextCombination[0]
      ) {
        nextCombination[0] = distance
        nextCombination[1] = i
        nextCombination[2] = j
        break
      }
    }
  }

  return nextCombination
}

const getNextPoint = function(leftSet, rightSet, history) {
  for (let i = 0; i < leftSet.length; ++i) {
    for (let j = 0; j < rightSet.length; ++j) {
      if (!(hashPoint(i, j) in history)) {
        return [i, j]
      }
    }
  }
}

const runStartingFrom = function(matrixes, leftSet, rightSet, i, j) {
  let distances = []
  const historyLeft = []
  const historyRight = []
  const { ij, ji } = matrixes
  let nextPoint = [
    ij[hashPoint(i, j)] < ji[hashPoint(j, i)]
      ? ij[hashPoint(i, j)]
      : ji[hashPoint(j, i)],
  ]

  while (true) {
    distances.push(nextPoint[0])
    historyLeft.push(i)
    historyRight.push(j)

    nextPoint = getNextExclusiveCombination(
      matrixes,
      leftSet,
      rightSet,
      historyLeft,
      historyRight,
    )
    if (nextPoint[0] == defaultLowest) {
      break
    }

    i = nextPoint[1]
    j = nextPoint[2]
  }

  return { distances, historyLeft, historyRight }
}

const runSetPair = function(leftSet, rightSet) {
  if (leftSet.length > rightSet.length) {
    const tmp = leftSet
    leftSet = rightSet
    rightSet = tmp
  }

  const history = {}
  const matrixes = computeDistanceMatrix(leftSet, rightSet)
  while (true) {
    const nextPoint = getNextPoint(leftSet, rightSet, history)
    if (!nextPoint) {
      break
    }

    history[hashPoint(nextPoint[0], nextPoint[1])] = runStartingFrom(
      matrixes,
      leftSet,
      rightSet,
      nextPoint[0],
      nextPoint[1],
    )
  }
  return history
}

const compare = function(input, setsToCompareAgainst) {
  const matches = []
  for (let i = 0; i < setsToCompareAgainst.length; ++i) {
    const set = setsToCompareAgainst[i]
    const history = runSetPair(input, set)

    for (const value of Object.values(history)) {
      const { distances, historyRight, historyLeft } = value

      const partition = distances.reduce(function(acc, v) {
        return acc + v
      }, 0)

      let sequentialVariance = 0
      for (let i = 1; i < historyLeft.length; i++) {
        sequentialVariance += Math.abs(
          historyRight[i] -
            historyRight[i - 1] -
            (historyLeft[i] - historyLeft[i - 1]),
        )
      }

      matches.push({ i, sequentialVariance, partition, value })
    }
  }

  matches.sort(function(a, b) {
    if (a.partition < b.partition) {
      return -1
    } else if (b.partition < a.partition) {
      return 1
    }
    if (a.sequentialVariance < b.sequentialVariance) {
      return -1
    } else if (b.sequentialVariance < a.sequentialVariance) {
      return 1
    }

    return 0
  })

  const orderedResults = []
  const seen = new Map()
  for (const { i } of matches) {
    if (seen.has(i)) {
      continue
    }
    seen.set(i, 0)
    orderedResults.push(setsToCompareAgainst[i])
  }

  return orderedResults
}

module.exports = {
  compare,
}
