const fs = require('fs')
const path = require('path')

/**  
  Function spellChecker() is the algorithm to fix any mispelled word or typos word.

  There are 2 main process: n-gram per character & n-gram per words.

  N-gram per character will check any mispelled character from a word. N-gram per words
  will check any mispelled and misconfiguration of word and combine with other word.

  This spellChecker uses statistical approach and use fuzzystring.js (a.k.a levinstain distance)
  to compare between strings. 
  
  // IMPROVEMENT: the approachment can be upgraded using machine learning. More specific is using NLP, word embedding (needs more research about this)
*/
async function spellChecker(wordsDetection, fuzzyString) {
  const { wordBounds = [], wordsPerParagraph = [] } = wordsDetection
  


  /* Uncomment below to write output all wordBounds result from google text detection */
  fs.writeFile(    
    path.resolve(__dirname, './out/spell-checking/result_text_detection.json'), 
    JSON.stringify(wordBounds),
    { flag: 'w' },
    err => {
      if (err) return console.error(err)
    }
  )



  /*  n-gram per character from wordBounds */
  wordBounds.map(word => {

    if (word.text.length <= 3) return
    
    let combinator = ""
    let highest = { suggestion: "", rating: 0 }
    let collection = []
    let nIndex = 0
    
    for (let i = nIndex; i < word.text.length; i++) {
      combinator += word.text[i]

      const checkSpellFuzzy = fuzzyString.get(combinator)

      if (checkSpellFuzzy !== null) {
        if (highest.rating <= checkSpellFuzzy[0][0]) {
          highest = { suggestion: checkSpellFuzzy[0][1], rating: checkSpellFuzzy[0][0] }
        }
      }

      if (i === word.text.length - 1) {
        collection.push(highest)
        nIndex++
        i = nIndex - 1
        combinator = ""
      }
    }

    /* Removes exact suggestion and rating from suggestion collection */
    collection = collection.filter((text, index) => 
      text.suggestion !== collection[index + 1]?.suggestion 
    )

    /* Removes word suggestion that has significant difference word's length from target word */
    collection = collection.filter(text => text.suggestion.length > word.text.length - 10)

    word.alternatives = [ ...collection ]

    return word

  })



  /* Uncomment below to write output all wordBounds after n-gram per character spell checking */
  fs.writeFile(
    path.resolve(__dirname, './out/spell-checking/result_ngram_character.json'), 
    JSON.stringify(wordBounds),
    { flag: 'w' },
    err => {
      if (err) return console.error(err)
    }
  )



  /*  n-gram per word from wordBounds */
  wordBounds.map((word, index) => {
    let gramLimit = 6
    let combinator = ""
    let gramLength = 0
    let startIndex = index
    let endIndex = index + 2

    for (let i = startIndex; i < endIndex; i++) {
      if (wordBounds[i]?.text) {
        combinator += wordBounds[i]?.text + " "
      } else {
        return
      }

      if (i === endIndex - 1) {
        combinator = combinator.trim()
        gramLength = combinator.split(" ").length

        let checkSpellFuzzy = fuzzyString.get(combinator)

        checkSpellFuzzy = checkSpellFuzzy?.filter(suggestion => suggestion[0] > 0.5 ) || []

        if (checkSpellFuzzy.length !== 0) {
          if (word?.alternatives?.some(text => text.suggestion === checkSpellFuzzy[0][1])) {
            return
          } else {
            word.alternatives = word?.alternatives || []
            word.alternatives.push({ suggestion: checkSpellFuzzy[0][1], rating: checkSpellFuzzy[0][0] })
          }
        }

        endIndex++
        i = startIndex - 1
        combinator = ""

      }

      if (gramLength === gramLimit) return
    }

    return word
  })


  
  /* Uncomment below to write output all wordBounds after n-gram per character spell checking */
  fs.writeFile(
    path.resolve(__dirname, './out/spell-checking/result_ngram_words.json'), 
    JSON.stringify(wordBounds),
    { flag: 'w' },
    err => {
      if (err) return console.error(err)
    }
  )  
}
module.exports = spellChecker