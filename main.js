/**  
  function main() is the main / lobby of the program.
  Its purpose is to initialize and prepare the resource.
*/
(async function main() {
  /* //* Declare import resources */
  const fs = require("fs");
  const csv = require("csv-parser");
  const readline = require("readline");
  const fuzzyString = require("fuzzyset")();
  const spellChecker = require("./services/spellChecker");
  const highlightText = require("./services/highlightText");
  const RESERVED_WORDS = require("./resources/data/reserved_words_v1.1.json");
  const documentTextDetection = require("./services/documentTextDetection");
  const documentTextRecognition = require("./services/documentTextRecognition");



  /* //* Declare variable resources */
  const IMG_DST = "OUT.png";
  const IMG_SRC = "./resources/data/img/ajb_1_1_fotokopi_lurus.jpg";
  const DICTIONARY_SRC = "./resources/data/bahasa_dictionary.txt";
  const RECOGNITION_DATA_TRAIN = [];
  const RECOGNITION_DATA_TRAIN_SRC = "./resources/data/ajb_prediction_train.csv";



  /* //* Adding lists of word's dictionary into fuzzyString database */
  const readInterface = readline.createInterface({
    input: fs.createReadStream(DICTIONARY_SRC),
    crlfDelay: Infinity
  });

  for await (const line of readInterface) {
    fuzzyString.add(line);
  }



  /* //* Adding lists of data train into data array */
  fs.createReadStream(RECOGNITION_DATA_TRAIN_SRC)
    .pipe(csv())
    .on("data", data => RECOGNITION_DATA_TRAIN.push(data));



  /* //* All algorithm steps declare here */
  const wordsDetection = await documentTextDetection(IMG_SRC);
  // const spellCheckedResult = await spellChecker(wordsDetection, fuzzyString, IMG_SRC.split("/")[4], "fotokopi", "1989");
  // const wordsRecognition = await documentTextRecognition(spellCheckedResult, RECOGNITION_DATA_TRAIN, RESERVED_WORDS, );
  // await highlightText(IMG_SRC, IMG_DST, wordsDetection)
})();
