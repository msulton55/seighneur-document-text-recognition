const fs = require("fs");
const path = require("path");
const vision = require('@google-cloud/vision');

/**  
  Detect all texts content from image.
  @param {String} IMG_SRC string location of image file
  @return {Object} wordBounds containing string and corresponding coordinates
  @return {String} wordBounds.text text content
  @return {Array} wordBounds.vertices 4 coordinates location of the text
*/
async function TextDetection(IMG_SRC) {

  /* Creates a client and insert google vision service keyFilename */
  const client = new vision.ImageAnnotatorClient({
    projectId: "project-encle",
    keyFilename: "./seighneur-service-key-6ff1ec077ac2.json",
  })
  
  

  const wordBounds = [] /* Results of word and bound detection will be saved here */
  const result = await client.textDetection(IMG_SRC) /* Results of Google Vision OCR */
  const document = result[0].fullTextAnnotation


  /* Google Vision OCR document result consists of 5 parts : document, page, block, paragraph and word */
  document.pages.forEach(page => {
    page.blocks.forEach(block => {
      block.paragraphs.forEach(paragraph => {
        paragraph.words.forEach(word => {
        
          let wordCombine = "" /* Variables to save a sentence */
    
          /* This is a character per word loop */
          word.symbols.forEach(symbol => {

            /* Convert all text to lowercase and remove whitespace */
            wordCombine += symbol.text.toLowerCase().trim() 
            
          })

          wordBounds.push({ text: wordCombine, ...word.boundingBox})
        })
      })
    })
  })



  // let wordsCombine = ""
  // wordBounds.forEach(word => {
  //   wordsCombine += word.text + " "
  // })
  // wordsCombine = wordsCombine.trim()
  // console.log("############ FILENAME -> " + IMG_SRC.split("/")[4] + "#################\n")
  // console.log("### FULL TEXT (GOOGLE VISION TEXT DETECTION) ###\n")
  // console.log(wordsCombine + "\n\n")



  /* Uncomment below to write output all wordBounds result from google text detection */
  fs.writeFile(
    path.resolve(__dirname, '../out/result_text_detection.json'),
    JSON.stringify(wordBounds),
    { flag: 'w' },
    err => {
      if (err) return console.error(err)
    }
  )



  return wordBounds 
}
module.exports = TextDetection