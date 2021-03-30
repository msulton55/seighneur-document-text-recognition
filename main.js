(async function main() {
  const documentTextDetection = require('./documentTextDetection')
  const highlightText = require('./highlightText')
  
  const IMG_SRC = './resources/Data gambar sertifikat/sertifikat ajb 1.jpeg'
  const IMG_DST = 'OUT.png'

  const result_bounds = await documentTextDetection(IMG_SRC)
  await highlightText(IMG_SRC, IMG_DST, result_bounds)

})();