const similarity = require('string-similarity')

/* 
  IMPORTANT!

  The image or photo boundary will have different image pixel size after detection from
  one image to another. This is resulted by different image quality (SD, HD or FHD) when u
  take a picture / scanner.

  So, wordBounds variable will have different vertices value when using different image quality
  photo or scanner.

  Current text recognition algorithm is to compare text detected by google vision with the 
  predefined-words I have created in which exist text and its boundary. It compares
  text detected with the predefined-words text boundary. If it is the same, then push it
  to the wordCollection array.

  FIXME: this needs better text recognition algorithm

*/

async function documentTextRecognition(wordsDetection, predefinedWords) {
  const { wordBounds = [], wordsPerParagraph = [] } = wordsDetection
  const wordsCollection = []
  
  wordsPerParagraph.forEach((words = "", index) => {
    
    /* Variables for comparing similarity rating between paragraph and words combination */
    let wordsHighest = { text: "", rating: 0, bounds: [] }
    let wordsSimilarityRating = similarity.findBestMatch(words, predefinedWords)
    
    if (wordsSimilarityRating.bestMatch.rating < 0.5 && words.split(' ').length === 2) {
      return
    } else if (wordsSimilarityRating.bestMatch.rating >= 0.7) {
      wordsHighest.text = words
      wordsHighest.rating = wordsSimilarityRating.bestMatch.rating
    } else {
      let startIndex = 0
      let endIndex = 1
      let checkRate = 0
      let comparisonCounter = 1
      
      /* string or words comparison loop */
      while (true) {
        let wordCombine = ""

        /* //* START OF BLOCK
          This block exit the string or words comparison loop.
          comparisonCounter is variable to indicate that 
          words comparison is reach the initial state (words variable)
        */
        if (comparisonCounter === words.split(' ').length) {
          break
        }
        /* //* END OF BLOCK */

        /* //* START OF BLOCK
          This block is words' comparison selector based on startIndex & endIndex of words variable. It is using linear selection (index increase by 1) to create word combination. 
        */
        for (let i = startIndex; i <= endIndex; i++) {
          wordCombine += words.split(' ')[i] + " "
        }
        wordCombine = wordCombine.trim()
        /* //* END OF BLOCK */

        checkRate = similarity.findBestMatch(wordCombine, predefinedWords)

        if (checkRate.bestMatch.rating > wordsHighest.rating) {
          wordsHighest.text = wordCombine
          wordsHighest.rating = checkRate.bestMatch.rating
        }

        startIndex++
        endIndex++
        
        /* //* START OF BLOCK
          This block means words' comparison selector has reached end of words / strings / line. 
          So, add more selector to comparison (from 2 into 3 and so on)
        */
        if (wordCombine.includes('undefined')) {
          comparisonCounter++
          startIndex = 0
          endIndex = comparisonCounter 
        }
        /* //* END OF BLOCK */
      }
    }
    
    if (wordsHighest.rating >= 0.5 || wordsSimilarityRating.bestMatch.rating >= 0.5) {
      if (wordsHighest.rating < wordsSimilarityRating.bestMatch.rating) {
        wordsHighest = {
          text: words, 
          rating: wordsSimilarityRating.bestMatch.rating, 
        }
      }       
      
      wordsHighest.text.split(' ').forEach(word => {
        wordBounds.forEach(obj => {
          if (obj.text === word) wordsHighest.bounds.push(
            {
              word: word,
              vertices: obj.vertices
            }
            )
          })
        })
        
        wordsCollection.push(wordsHighest)
    }

    /* Uncomment below to see all words of paragraph */
    // console.log(words)

  })

  /* Uncomment below to see result of text recognition */
  // console.log(wordsCollection)

  /* Uncomment below to see all word boundary */
  wordBounds.forEach(word => {
    console.log(word)
  })
}
module.exports = documentTextRecognition