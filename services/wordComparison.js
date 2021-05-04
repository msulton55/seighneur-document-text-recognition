function wordComparison(stringCheck = "", suggestion = "") {
  let sameWordCounter = 0

  for (let i = 0; i < stringCheck.length; i++) {
    try {
      if (stringCheck[i] === suggestion[i]) {
        sameWordCounter++
      }
    } catch (error) {
      return 
    }
  }

  return sameWordCounter
}

function wordsComparison(stringCheck = "", stringCollection = []) {
  let highestWord = {}
  let highestComparisonValue = 0

  stringCollection.forEach(obj => {
    const wordComparisonValue = wordComparison(stringCheck, obj.suggestion)
    
    if (highestComparisonValue < wordComparisonValue) {
      highestWord = obj
      highestComparisonValue = wordComparisonValue
    } else {
      return
    }
  })

  return highestWord
}

module.exports = { wordComparison, wordsComparison }