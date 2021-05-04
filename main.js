/* 
  function main() is the main / lobby of the program.
  Its purpose is to initialize and prepare the resource.
*/
(async function main() {
  /* Declare import resources */
  const fs = require('fs')
  const readline = require('readline')
  const fuzzyString = require('fuzzyset')()
  const highlightText = require('./services/highlightText')
  const documentTextDetection = require('./services/documentTextDetection')
  const spellChecker = require('./services/spellChecker')
  
  /* Declare main() variable resources */
  const DICTIONARY_SRC = './resources/data/bahasa-dictionary.txt'
  const IMG_DST = 'OUT.png'
  const IMG_SRC = './resources/data/img/ajb_1_1_fotokopi_lurus.jpg'

  const readInterface = readline.createInterface({
    input: fs.createReadStream(DICTIONARY_SRC),
    crlfDelay: Infinity,
  })

  /* Adding lists of word's dictionary into fuzzyString database */
  for await (const line of readInterface) {
    fuzzyString.add(line)
  }
  
  /* All algorithm steps declare here */
  const wordsDetection = await documentTextDetection(IMG_SRC)
  const spellCheckedResult = await spellChecker(wordsDetection, fuzzyString)
  // TODO: sekarang fokus ke word prediction dari hasil spell check dengan NLP (lakukan riset lagi)
  // await highlightText(IMG_SRC, IMG_DST, wordsDetection)
})();