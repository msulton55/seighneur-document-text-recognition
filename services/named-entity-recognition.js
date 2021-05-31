const natural = require('natural')
const stemmerId = require('natural/lib/natural/stemmers/indonesian/stemmer_id')

async function documentTextRecognition(wordBounds = [], DATA_TRAIN = [], RESERVED_WORDS = []) {

  const classifier = new natural.BayesClassifier(stemmerId)
  let pagePosition = 0
  let pagePositionChecker = 0
  let collections = []
  let processedWord = []



  /* Uncomment below to write all words into one full sentence on console */
  let wordsCombine = ""
  wordBounds.forEach(word => {
    wordsCombine += (word.alternatives === "" ? word.text : word.alternatives) + " "
  })
  wordsCombine = wordsCombine.trim()
  console.log("### FULL TEXT (AFTER SPELL CHECKING) ###\n")
  console.log(wordsCombine + "\n\n")
  /* END OF SECTION */


  
  wordBounds.forEach((word, wordIndex) => {
    let wordsBuilt = 0            /* The number of wordsBuilt */
    let wordsCombine = ""         /* Concatination of word in wordBounds */
    let excludeWords = []         /* The lists of words musnt include in wordsCombine */

    let firstWord = word.alternatives === "" ? word.text : word.alternatives 

    if (word.index >= 155 && word.index < 167) {
      const tempValue = natural.LevenshteinDistanceSearch("penjual", firstWord)
      if (tempValue.substring === "penjual") firstWord = tempValue.substring
    }
    else if (word.index >= 195 && word.index < 209) {
      const tempValue = natural.LevenshteinDistanceSearch("pembeli", firstWord)
      if (tempValue.substring === "pembeli") firstWord = tempValue.substring
    }
    
    /* Check for page identification */
    if (pagePositionChecker === 0) {
      
      if (natural.DiceCoefficient(firstWord, "akta") >= 0.75) {
        pagePosition = 1
        pagePositionChecker = 1
      } 
      
      if (natural.DiceCoefficient(firstWord, "para") >= 0.75) {
        pagePosition = 2
        pagePositionChecker = 1
      }
      if (natural.DiceCoefficient(firstWord, "sebagaimana") >= 0.75) {
        pagePosition = 3
        pagePositionChecker = 1
      }
      
    }

    RESERVED_WORDS.forEach(label => {
      let similarity = 0

      label.initialWord.forEach(word => {
        similarity = natural.DiceCoefficient(firstWord, word)

        /* This conditional is to check whether firstWord is included in RESERVED_WORDS and in the correct pagePosition. If yes, then proceed */
        if (!processedWord.includes(firstWord) && label.pagePosition.includes(pagePosition) && similarity >= 0.75) {
          wordsBuilt = label.wordsBuilt
          excludeWords = label?.excludeWords
          processedWord.push(firstWord)
        }
      })
    })

    /* If firstWord is included in RESERVED_WORDS, then proceed */
    if (wordsBuilt !== 0) {

      if (firstWord === "penjual" || firstWord === "pembeli") {
        let checkIndex = wordIndex
        while (true) {
          const checkWord = (wordBounds[checkIndex].alternatives === "" ? wordBounds[checkIndex].text : wordBounds[checkIndex].alternatives)

          if ((firstWord === "penjual" && (checkWord === 'akta' || checkWord === 'disebutkan')) || (firstWord === "pembeli" && (checkWord === 'penjual' || (checkIndex < 189 && checkWord === 'selaku')))) {
            wordsBuilt = wordIndex - checkIndex
            break
          }
          checkIndex--
        }

        for (let i = wordIndex; i > wordIndex - wordsBuilt; i--) {
          wordsCombine = (wordBounds[i].alternatives === "" ? wordBounds[i].text : wordBounds[i].alternatives) + " " + wordsCombine
        }
      } else {
        for (let i = wordIndex; i < wordIndex + wordsBuilt; i++) {
          wordsCombine += (wordBounds[i].alternatives === "" ? wordBounds[i].text : wordBounds[i].alternatives) + " "
        }
      }
      wordsCombine = wordsCombine.trim()

      collections.push(wordsCombine)

    }
  })


  // /* The contents of training data is added to natural library here */
  // DATA_TRAIN.forEach(data => {
  //   classifier.addDocument(data.data, data.classification)
  // })

  // /* Train the data */
  // classifier.train()

  // /* Text recognition starts here */
  // classifier.save('./out/recognition/ajb_prediction.json', (err, classifier) => {
  //   if (err) console.error(err)
  // })
}
module.exports = documentTextRecognition