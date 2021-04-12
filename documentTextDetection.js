const vision = require('@google-cloud/vision');

async function documentTextDetection(textImage) {

  /* Creates a client and insert google vision service keyFilename */
  const client = new vision.ImageAnnotatorClient({
    projectId: "project-encle",
    keyFilename: "./seighneur-service-key-6ff1ec077ac2.json",
  })
  
  const wordBounds = [] /* Results of word and bound detection will be saved here */
  const wordsPerParagraph = [] /* Results of all word per paragraph after detection will be saved here */
  const wordRegex = /^[.* ]{3,}$|^(\d){1,}[\x29]$/gmi
  const result = await client.textDetection(textImage)
  const document = result[0].fullTextAnnotation

  document.pages.forEach(page => {
    page.blocks.forEach(block => {
      block.paragraphs.forEach(paragraph => {
        let wordsCombine = ""
        
        paragraph.words.forEach(word => {
        
          let wordCombine = ""
    
          word.symbols.forEach(symbol => {
            
            /* Convert all text to lowercase */
            wordCombine += symbol.text.toLowerCase().trim() 
            
          })
          
          /* Regex test first iteration*/
          if (wordRegex.test(wordCombine)) return
          

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