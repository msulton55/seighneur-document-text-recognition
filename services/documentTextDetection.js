const vision = require('@google-cloud/vision');

/**  
  Function documentTextDetection() is the algorithm to detect all texts content from image.
  It passes the textImage (image file) argument from main() function.
  It does also remove any unnecessary symbols from target string / processed string.
  It uses Google Cloud Vision API to detect all texts. 
*/
async function documentTextDetection(textImage) {

  /* Creates a client and insert google vision service keyFilename */
  const client = new vision.ImageAnnotatorClient({
    projectId: "project-encle",
    keyFilename: "./seighneur-service-key-6ff1ec077ac2.json",
  })
  
  const wordRegex = /^[.* ]{3,}$|^(\d){1,}[\x29]$|^[.:*\x2A\x2D\x2C]+$/gmi /* This regex is to clean unnecessary string detect from image */
  const wordBounds = [] /* Results of word and bound detection will be saved here */
  const wordsPerParagraph = [] /* Results of all word per paragraph after detection will be saved here */

  const result = await client.textDetection(textImage)
  const document = result[0].fullTextAnnotation

  document.pages.forEach(page => {
    page.blocks.forEach(block => {
      block.paragraphs.forEach(paragraph => {
        let wordsCombine = "" /* Variables to save a paragraph */
        
        paragraph.words.forEach(word => {
        
          let wordCombine = "" /* Variables to save a sentence */
    
          word.symbols.forEach(symbol => {

            /* Remove these 3 symbols: dot (.), single quote ('), round bracket (()) and comma (,) */
            if (symbol.text.match(/^[.'(),]/gmi)) return
            
            /* Convert all text to lowercase and remove whitespace */
            wordCombine += symbol.text.toLowerCase().trim() 
            
          })

          /* Regex test first iteration to cleaning the string / sentence */
          if (wordRegex.test(wordCombine)) return

          /* Remove blank or number 2 from the sentence caused by regex.match() from previous */
          if (wordCombine === "" || wordCombine === "2") return
          
          wordsCombine += wordCombine + " "

          wordBounds.push({ text: wordCombine, ...word.boundingBox})
        })

        /* Regex test second iteration for better cleaning string */
        if (wordRegex.test(wordsCombine)) return

        wordsCombine += "\n"

        /* Remove string inside array that only contains newline (\n) */
        if (wordsCombine.includes('\n') && wordsCombine.split(' ').length === 1) return

        wordsPerParagraph.push(wordsCombine)
      })
    })
  })

  return { wordBounds: wordBounds, wordsPerParagraph: wordsPerParagraph } 

}
module.exports = documentTextDetection