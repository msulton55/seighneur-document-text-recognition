/**  
  The lobby of the program.
  Its purpose is to initialize and prepare the resource.
*/
(async function main() {
  /* Declare import resources */
  const textDetection = require("./services/text-detection");
  const textFiltering = require("./services/text-filtering");



  /* Declare variable resources */
  let IMG_SRC = "";



  /* Receive input arguments from command line */
  process.argv.forEach((val, index, array) => {
    if (index === 2) IMG_SRC = val 
  })



  /* //* All algorithm steps declare here */
  const resultDetection = await textDetection(IMG_SRC);
  const resultFiltering = await textFiltering(resultDetection);
})();
