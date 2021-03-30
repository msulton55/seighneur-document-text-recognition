const vision = require('@google-cloud/vision');
const similarity = require('string-similarity');

const predefinedWords = [
  "nama",
  "umur",
  "pekerjaan",
  "kewarganegaraan",
  "alamat",
  "daerah tingkat i / wilayah daerah tingkat ii / wilayah kecamatan / wilayah desa / kelurahan",
  "luas tanah",
  "persil nomor kohir nomor blok",
  "harga rp"
]

async function documentTextDetection(textImage) {

  // Creates a client
  const client = new vision.ImageAnnotatorClient({
    projectId: "project-encle",
    keyFilename: "./seighneur-service-key-6ff1ec077ac2.json",
  })
  
  const bounds = []
  const result = await client.textDetection(textImage) 
  const document = result[0].fullTextAnnotation

  document.pages.forEach(page => {
    page.blocks.forEach(block => {
      let iterator = 0
      // let prevOpeningWord = []
      for (iterator; iterator < block.paragraphs.length; iterator++) {
        let wordsCombine = ""
        let similarityRating = null
        block.paragraphs[iterator].words.forEach(word => {
          let wordCombine = ""
          word.symbols.forEach(symbol => {
            
            /* Convert all text to lowercase */
            wordCombine += symbol.text.toLowerCase().trim() 
            
          })
          // if (prevOpeningWord.includes(wordCombine)) return
          wordsCombine += wordCombine + " "
          similarityRating = similarity.findBestMatch(wordsCombine, predefinedWords)
          if (similarityRating.bestMatch.rating >= 0.5)
            bounds.push(word.boundingBox)
        })
        // if (similarityRating.bestMatch.rating < 0.5) {
        //   iterator--
        //   let stringChecker = wordsCombine.split(' ')[0]
        //   if (stringChecker === "") return
        //   prevOpeningWord.push(stringChecker)
        // } 
        wordsCombine += "\n"
        console.log(similarityRating.bestMatch.rating)
        console.log(wordsCombine)
      }
    })
  })

  return bounds

}
module.exports = documentTextDetection