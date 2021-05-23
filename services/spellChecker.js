const fs = require("fs");
const path = require("path");
const natural = require("natural");

/**  
  Fix any mispelled word or typos word.

  There are 4 main process: n-gram per character, n-gram per words, general cleaning suggestion & pattern based cleaning suggestion.
  @param {Object} wordsDetection contains wordBounds and wordPerParagraph
  @param {FuzzySet} fuzzyString fuzzy string similarity library
  @param {String} IMG_SRC name of the image file
  @param {String} paperType asli or fotokopi
  @param {String} patternVersion 1989, 1990 & 2008

  // IMPROVEMENT: the approachment can be upgraded using machine learning. More specific is using NLP, word embedding (needs more research about this)
*/
async function spellChecker(wordsDetection, fuzzyString, IMG_SRC, paperType, patternVersion) {
  const { wordBounds = [] } = wordsDetection;
  let similarityValue = 0;
  let specialIndex = 0;



  switch (paperType) {
    case "asli":
      similarityValue = 0.6;
      specialIndex = 125;
      break;
    case "fotokopi":
      similarityValue = 0.75;
      specialIndex = 90;
      break;
    default:
      break;
  }



  /* Uncomment below to write output all wordBounds result from google text detection */
  fs.writeFile(
    path.resolve(__dirname, '../out/spell-checking/result_text_detection.json'),
    JSON.stringify(wordBounds),
    { flag: 'w' },
    err => {
      if (err) return console.error(err)
    }
  )

  let wordsCombine = ""
  wordBounds.forEach(word => {
    wordsCombine += word.text + " "
  })
  wordsCombine = wordsCombine.trim()
  console.log("############ FILENAME -> " + IMG_SRC + "#################\n")
  console.log("### FULL TEXT (GOOGLE VISION TEXT DETECTION) ###\n")
  console.log(wordsCombine + "\n\n")



  /* //* STEP 1 : n-gram per character from wordBounds */
  wordBounds.map(word => {
    if (word.text.length <= 3) return;

    let combinator = "";
    let highest = { suggestion: "", rating: 0 };
    let collection = [];
    let nIndex = 0;

    for (let i = nIndex; i < word.text.length; i++) {
      combinator += word.text[i];

      const checkSpellFuzzy = fuzzyString.get(combinator);

      if (checkSpellFuzzy !== null) {
        if (highest.rating <= checkSpellFuzzy[0][0]) {
          highest = { suggestion: checkSpellFuzzy[0][1], rating: checkSpellFuzzy[0][0] };
        }
      }

      if (i === word.text.length - 1) {
        collection.push(highest);
        nIndex++;
        i = nIndex - 1;
        combinator = "";
      }
    }

    /* Removes exact suggestion and rating from suggestion collection */
    collection = collection.filter((text, index) => text.suggestion !== collection[index + 1]?.suggestion);

    /* Removes word suggestion that has significant difference word's length from target word */
    collection = collection.filter(text => text.suggestion.length > word.text.length - 10);

    word.alternatives = [...collection];

    return word;
  });



  /* Uncomment below to write output all wordBounds after n-gram per character spell checking */
  fs.writeFile(
    path.resolve(__dirname, '../out/spell-checking/result_ngram_character.json'),
    JSON.stringify(wordBounds),
    { flag: 'w' },
    err => {
      if (err) return console.error(err)
    }
  )



  /* //* STEP 2 : n-gram per word from wordBounds */
  wordBounds.map((word, index) => {
    let gramLimit = 6;
    let combinator = "";
    let gramLength = 0;
    let startIndex = index;
    let endIndex = index + 2;

    for (let i = startIndex; i < endIndex; i++) {
      if (wordBounds[i]?.text) {
        combinator += wordBounds[i]?.text + " ";
      } else {
        return;
      }

      if (i === endIndex - 1) {
        combinator = combinator.trim();
        gramLength = combinator.split(" ").length;

        let checkSpellFuzzy = fuzzyString.get(combinator);

        checkSpellFuzzy = checkSpellFuzzy?.filter(suggestion => suggestion[0] > 0.5) || [];

        if (checkSpellFuzzy.length !== 0) {
          if (word?.alternatives?.some(text => text.suggestion === checkSpellFuzzy[0][1])) {
            return;
          } else {
            word.alternatives = word?.alternatives || [];
            word.alternatives.push({ suggestion: checkSpellFuzzy[0][1], rating: checkSpellFuzzy[0][0] });
          }
        }

        endIndex++;
        i = startIndex - 1;
        combinator = "";
      }

      if (gramLength === gramLimit) return;
    }

    return word;
  });



  /* Uncomment below to write output all wordBounds after n-gram per word spell checking */
  fs.writeFile(path.resolve(__dirname, "../out/spell-checking/result_ngram_words.json"), JSON.stringify(wordBounds), { flag: "w" }, err => {
    if (err) return console.error(err);
  });



  /* //* STEP 3 : Cleaning up unrelated lists of word suggestion */
  let suggestionCorpus = []; /* Main array to store the result of cleaning */
  let newSuggestionCorpus = []; /* Secondary array to backup the main array */
  let removeStartIndex = null; /* This variable is used on line 178 */
  let removeEndIndex = null;

  wordBounds.forEach((word, index) => {
    let wordsCombine = "";

    for (let i = index; wordBounds.length - index > 5 ? i < index + 5 : i < index + (wordBounds.length - index); i++) {
      wordsCombine += wordBounds[i].text + " ";

      const similarity = fuzzyString.get(wordsCombine.trim());
      const numberCheck = wordsCombine.trim().split(" ")[0].split("/")[0];

      if (
        similarity !== null &&
        Number.isNaN(Number(numberCheck)) &&
        index !== suggestionCorpus[suggestionCorpus.length - 1]?.removeIndex &&
        ((wordsCombine.trim().length >= 3 && similarity[0][0] >= similarityValue) ||
          (similarity.length === 1 && similarity[0][0] >= 0.5 && wordsCombine.trim().length <= similarity[0][1].length) ||
          (index >= specialIndex && wordsCombine.trim().length >= 3 && similarity[0][0] >= 0.4))
      ) {
        suggestionCorpus.push({
          index: index,
          removeIndex: i !== index ? i : null,
          original: wordsCombine.trim().split(" "),
          suggestion: similarity[0][1]
        });
        return;
      }
    }
  });

  suggestionCorpus.forEach((text, index) => {
    if (text.removeIndex !== null) {
      removeStartIndex = text.index;
      removeEndIndex = text.removeIndex;
    }

    if (text.index > removeStartIndex && text.index <= removeEndIndex) return;

    newSuggestionCorpus.push(text);
  });

  suggestionCorpus = [];

  newSuggestionCorpus.forEach((suggestion, suggestionIndex) => {
    const vertices = [];

    if (suggestion.removeIndex === null) {
      suggestionCorpus.push({
        index: suggestion.index,
        removeIndex: suggestion.removeIndex,
        text: suggestion.original.toString().split(",").join(""),
        vertices: [wordBounds[suggestion.index].vertices],
        alternatives: suggestion.suggestion
      });
    } else {
      for (let i = suggestion.index; i <= suggestion.removeIndex; i++) {
        vertices.push(wordBounds[i].vertices);
      }
      suggestionCorpus.push({
        index: suggestion.index,
        removeIndex: suggestion.removeIndex,
        text: suggestion.original.toString().split(",").join(""),
        vertices: vertices,
        alternatives: suggestion.suggestion
      });
    }
  });

  newSuggestionCorpus = []

  suggestionCorpus.forEach((suggestion, suggestionIndex) => {
    try {
      const currentIndex = suggestion.index
      const nextIndex = suggestionCorpus[suggestionIndex + 1].index
      const removeIndex = suggestion.removeIndex
  
      if (nextIndex - currentIndex !== 1) {
        for (let i = currentIndex + 1; i <  nextIndex; i++) {
          if (removeIndex === null || (removeIndex !== null && (i > removeIndex)))
          newSuggestionCorpus.push({
            index: i,
            text: wordBounds[i].text,
            vertices: [wordBounds[i].vertices],
            alternatives: ""
          })
        }
      }
    } catch (error) {
      return
    }
  })

  suggestionCorpus.map(obj => {
    delete obj.removeIndex
    return obj
  })
  suggestionCorpus = [...suggestionCorpus, ...newSuggestionCorpus]
  suggestionCorpus.sort((a, b) => a.index > b.index ? 1 : -1)



  /* //* STEP 4 : Cleaning up word suggestion that unrelate based on patternVersion */
  let mode = false
  let counter = 0
  suggestionCorpus.map(suggestion => {
    if (patternVersion === "1989") {

      if (paperType === "fotokopi") {
        if (suggestion.alternatives === "pekerjaan") mode = false
    
        if (mode === true) {
          suggestion.alternatives = suggestion.text
        }
    
        if (suggestion.index >= 90 && counter === 0 && suggestion.alternatives === "penjual") {
          mode = true
          counter = 1
        } 
      } else if (paperType === "asli") {
        if (suggestion.alternatives === "tahun") mode = false
    
        if (mode === true) {
          suggestion.alternatives = suggestion.text
        }
    
        if (suggestion.index >= 90 && counter === 0 && suggestion.alternatives === "nama") {
          mode = true
          counter = 1
        } 

      }
  
    } else if (patternVersion === "1990") {
    
      if (suggestion.alternatives === "selaku") mode = false
  
      if (mode === true) {
        suggestion.alternatives = suggestion.text
      }
  
      if (suggestion.index >= 90 && counter === 0 && suggestion.alternatives === "nama") {
        mode = true
        counter = 1
      } 
  
    } else if (patternVersion === "2008") {
    
      if (suggestion.alternatives === "warga" || suggestion.alternatives === "kurang" || suggestion.alternatives === "disebut") mode = false
  
      if (mode === true) {
        suggestion.alternatives = suggestion.text
      }
  
      if (suggestion.index >= 90 && (suggestion.alternatives === "tuan" || suggestion.alternatives === "lahir" || suggestion.alternatives === "persil" || suggestion.alternatives === "selaku")) {
        mode = true
      } 
  
      
    }
    return suggestion

  })



  /* Uncomment below to write output all wordBounds final */
  fs.writeFile(path.resolve(__dirname, "../out/spell-checking/result_final.json"), JSON.stringify(suggestionCorpus), { flag: "w" }, err => {
    if (err) return console.error(err);
  });

  

  return suggestionCorpus;
}
module.exports = spellChecker;
