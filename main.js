/**  
  The lobby of the program.
  Its purpose is to initialize and prepare the resource.
*/
(async function main() {
  /* Declare import resources */
  const fs = require("fs");
  const csv = require("csv-parser");
  const readline = require("readline");
  const fuzzyString = require("fuzzyset")();
  const spellChecker = require("./services/spell-checker");
  const textDetection = require("./services/text-detection");
  const textFiltering = require("./services/text-filtering");
  const highlightText = require("./services/text-highlighter");
  const RESERVED_WORDS = require("./resources/data/reserved_words_v1.1.json");
  const documentTextRecognition = require("./services/named-entity-recognition");



  /* Declare variable resources */
  let IMG_DST = "";
  let IMG_SRC = "";
  let IMG_PAPER_TYPE = "";
  let IMG_DOCUMENT_VERSION = "";
  let DICTIONARY_SRC = "./resources/data/bahasa_dictionary.txt";
  let RECOGNITION_DATA_TRAIN = [];
  let RECOGNITION_DATA_TRAIN_SRC = "./resources/data/ajb_prediction_train.csv";



  /* Adding lists of word's dictionary into fuzzyString database */
  const readInterface = readline.createInterface({
    input: fs.createReadStream(DICTIONARY_SRC),
    crlfDelay: Infinity
  });

  for await (const line of readInterface) {
    fuzzyString.add(line);
  }



  /* Adding lists of data train into data array */
  fs.createReadStream(RECOGNITION_DATA_TRAIN_SRC)
    .pipe(csv())
    .on("data", data => RECOGNITION_DATA_TRAIN.push(data));



  /* Receive input arguments from command line */
  process.argv.forEach((val, index, array) => {
    if (index === 2) IMG_SRC = val 
    else if (index > 2) {
      if (val === '-o' || val === '--out') IMG_DST = array[index + 1]
      if (val === '-t' || val === '--type') IMG_PAPER_TYPE = array[index + 1]
      if (val === '-v' || val === '--version') IMG_DOCUMENT_VERSION = array[index + 1]
    }
  })



  /* //* All algorithm steps declare here */
  const resultDetection = await textDetection(IMG_SRC);
  const resultFiltering = await textFiltering(resultDetection);
  const resultSpellChecked = await spellChecker(resultFiltering);
  // const resultSpellChecked = await spellChecker(resultFiltering, fuzzyString, IMG_SRC.split("/")[4], "fotokopi", "1989");
  // const wordsRecognition = await documentTextRecognition(spellCheckedResult, RECOGNITION_DATA_TRAIN, RESERVED_WORDS, );
  // await highlightText(IMG_SRC, IMG_DST, resultDetection)
})();
