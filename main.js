(async function main() {
  const fs = require('fs')
  const readline = require('readline')
  const highlightText = require('./highlightText')
  const documentTextDetection = require('./documentTextDetection')
  const documentTextRecognition = require('./documentTextRecognition')
  
  const IMG_SRC = './resources/data/img/ajb_1_1_fotokopi_lurus.jpg'
  const IMG_DST = 'OUT.png'
  const PREDEFINED_WORDS = []

  const readInterface = readline.createInterface({
    input: fs.createReadStream('./resources/data/predefined-words-v1.txt'),
    crlfDelay: Infinity,
  })

  for await (const line of readInterface) {
    PREDEFINED_WORDS.push(line)
  }

  const wordsDetection = await documentTextDetection(IMG_SRC)
  const wordResult = documentTextRecognition(wordsDetection, PREDEFINED_WORDS)
  // await highlightText(IMG_SRC, IMG_DST, wordsDetection)

})();