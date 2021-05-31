const fs = require("fs");
const path = require("path");

/**  
  Remove symbols from text.
*/
async function TextFiltering(wordBounds) {

  const CHAR_REGEX = /^[*.$'";()|\?,:/-]$/gmi
  const TEXT_REGEX = /^[1)]{2,}$|^[2)]{2,}$|^[3)]{2,}$|^[4)]{2,}$|^[5)]{2,}$/gmi



  wordBounds.map(entity => {
    let filtered = ""

    if (entity.text.match(TEXT_REGEX)) entity.text = ""

    entity.text.split("").forEach(char => {
      if (char.match(CHAR_REGEX)) return 
      filtered += char
    })

    entity.text = filtered

    return entity
  })



  wordBounds = wordBounds.filter(entity => entity.text !== "")



  let wordsCombine = ""
  wordBounds.forEach(entity => {
    wordsCombine += entity.text + " "
  })
  wordsCombine = wordsCombine.trim()
  console.log("### FULL TEXT (TEXT FILTERING) ###\n")
  console.log(wordsCombine + "\n\n")



  /* Uncomment below to write output all wordBounds result from text filtering */
  fs.writeFile(
    path.resolve(__dirname, '../out/result_text_filtering.json'),
    JSON.stringify(wordBounds),
    { flag: 'w' },
    err => {
      if (err) return console.error(err)
    }
  )



  return wordBounds
}
module.exports = TextFiltering
