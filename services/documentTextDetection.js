const vision = require('@google-cloud/vision');

/**  
  Detect all texts content from image.
  @param {String} stringLocation string location of image file
  @return {Object} wordBounds containing string and corresponding coordinates
  @return {String} wordBounds.text text content
  @return {Array} wordBounds.vertices 4 coordinates location of the text
*/
async function documentTextDetection(stringLocation) {

  /* Creates a client and insert google vision service keyFilename */
  const client = new vision.ImageAnnotatorClient({
    projectId: "project-encle",
    keyFilename: "./seighneur-service-key-6ff1ec077ac2.json",
  })
  
  const wordRegex = /^[.* ]{3,}$|^(\d){1,}[\x29]$|^[.:*\x2A\x2D\x2C]+$/gmi /* Primary word regex to clean up unnecessary symbol from detected text */
  const wordBounds = [] /* Results of word and bound detection will be saved here */
  const wordsPerParagraph = [] /* Results of all word per paragraph after detection will be saved here */

  const result = await client.textDetection(stringLocation)
  const document = result[0].fullTextAnnotation

  document.pages.forEach(page => {
    page.blocks.forEach(block => {
      block.paragraphs.forEach(paragraph => {
        let wordsCombine = "" /* Variables to save a paragraph */
        
        paragraph.words.forEach(word => {
        
          let wordCombine = "" /* Variables to save a sentence */
    
          word.symbols.forEach(symbol => {

            /* Remove these 7 symbols: hyphen (-), colon (:), slash (/), dot (.), single quote ('), double quote ("), round bracket (()) and comma (,) */
            if (symbol.text.match(/^[.'"(),:/-]/gmi)) return
            
            /* Convert all text to lowercase and remove whitespace */
            wordCombine += symbol.text.toLowerCase().trim() 
            
          })

          /* Regex test first iteration to cleaning the string or sentence */
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